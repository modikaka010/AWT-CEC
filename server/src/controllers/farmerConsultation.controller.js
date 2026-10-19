// Farmer consultation request handlers.
const fs = require('fs');
const mongoose = require('mongoose');

const Consultation = require('../models/Consultation');
const Farm = require('../models/Farm');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const STATUSES = ['pending', 'accepted', 'completed', 'rejected', 'cancelled'];
const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = Consultation.CATEGORIES;
const CROP_STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting / Grain filling', 'Harvest', 'Post-harvest'];

// What a farmer may see about the expert who took the case (no email / loginId)
const EXPERT_PUBLIC = 'name expertInfo.specialization expertInfo.qualifications expertInfo.organization';

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const imageUrl = (file) => `/uploads/consultations/${file.filename}`;

// Verify the real file signature (extension/mimetype can be spoofed)
const looksLikeImage = (filePath) => {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);
    const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const png = buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const webp = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
    return jpeg || png || webp;
  } catch {
    return false;
  }
};

const removeFiles = (files = []) => files.forEach((f) => fs.unlink(f.path, () => {}));

const notify = async (docs) => {
  try {
    if (docs.length) await Notification.insertMany(docs);
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

// Case belonging to this farmer, or null — other farmers' cases get a 404, never a 403
const findOwned = (id, req) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return Consultation.findOne({ _id: id, farmer: req.user.id });
};

// GET /api/farmer/consultations?status=&page=&limit=
const getMyConsultations = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const { status } = req.query;

    const filter = { farmer: req.user.id };
    if (status && status !== 'all') {
      if (!STATUSES.includes(status)) return sendError(res, 400, 'Invalid status filter.');
      filter.status = status;
    }

    const [consultations, total, grouped] = await Promise.all([
      Consultation.find(filter)
        .populate('expert', EXPERT_PUBLIC)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Consultation.countDocuments(filter),
      Consultation.aggregate([
        { $match: { farmer: new mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: '$status', n: { $sum: 1 } } },
      ]),
    ]);

    const counts = { all: 0 };
    STATUSES.forEach((s) => (counts[s] = 0));
    grouped.forEach((g) => {
      counts[g._id] = g.n;
      counts.all += g.n;
    });

    return sendSuccess(res, 200, 'Consultations fetched.', {
      consultations,
      counts,
      options: { categories: CATEGORIES, priorities: PRIORITIES, cropStages: CROP_STAGES },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    console.error('farmer getMyConsultations error:', err);
    return sendError(res, 500, 'Failed to fetch your consultations.');
  }
};

// GET /api/farmer/consultations/:id
const getConsultationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return sendError(res, 404, 'Consultation not found.');
    const consultation = await Consultation.findOne({ _id: req.params.id, farmer: req.user.id })
      .populate('expert', EXPERT_PUBLIC)
      .select('-__v')
      .lean();
    if (!consultation) return sendError(res, 404, 'Consultation not found.');
    return sendSuccess(res, 200, 'Consultation fetched.', { consultation });
  } catch (err) {
    console.error('farmer getConsultationById error:', err);
    return sendError(res, 500, 'Failed to fetch consultation.');
  }
};

// POST /api/farmer/consultations  (multipart/form-data, images in field "images")
const createConsultation = async (req, res) => {
  const files = req.files || [];
  try {
    const cropName = str(req.body.cropName, 150);
    const problemTitle = str(req.body.problemTitle, 300);
    const description = str(req.body.description, 3000);
    const symptoms = str(req.body.symptoms, 2000);
    const cropStage = str(req.body.cropStage, 60);
    const priority = req.body.priority || 'medium';
    const category = req.body.category || 'other';

    const errors = {};
    if (!cropName) errors.cropName = 'Crop name is required.';
    if (problemTitle.length < 5) errors.problemTitle = 'Give the problem a short title (at least 5 characters).';
    if (description.length < 20) errors.description = 'Please describe the problem in at least 20 characters.';
    if (!PRIORITIES.includes(priority)) errors.priority = 'Invalid priority.';
    if (!CATEGORIES.includes(category)) errors.category = 'Invalid category.';
    if (cropStage && !CROP_STAGES.includes(cropStage)) errors.cropStage = 'Invalid crop stage.';

    // Optional farm — must belong to this farmer
    let farm = null;
    if (req.body.farm) {
      if (!mongoose.isValidObjectId(req.body.farm)) {
        errors.farm = 'Invalid farm.';
      } else {
        farm = await Farm.findOne({ _id: req.body.farm, farmer: req.user.id });
        if (!farm) errors.farm = 'Selected farm was not found.';
      }
    }

    if (files.some((f) => !looksLikeImage(f.path))) errors.images = 'One or more files are not valid images.';

    if (Object.keys(errors).length) {
      removeFiles(files);
      return res.status(400).json({ success: false, message: Object.values(errors)[0], errors });
    }

    // Cap open cases so one account can't flood the experts' queue
    const open = await Consultation.countDocuments({ farmer: req.user.id, status: { $in: ['pending', 'accepted'] } });
    if (open >= 10) {
      removeFiles(files);
      return sendError(res, 400, 'You already have 10 open consultations. Wait for an answer or cancel one first.');
    }

    const farmLocation = farm
      ? [farm.name, farm.location?.village, farm.location?.district, farm.location?.state].filter(Boolean).join(', ')
      : null;

    const consultation = await Consultation.create({
      farmer: req.user.id,          // always the token user — never from the body
      farm: farm ? farm._id : null,
      farmLocation,
      cropName, problemTitle, description, symptoms, cropStage, category, priority,
      images: files.map(imageUrl),
    });

    // Tell every active expert there is a new case in the pool (non-blocking)
    const experts = await User.find({ role: 'expert', status: 'active' }).select('_id').limit(500).lean();
    notify(
      experts.map((e) => ({
        recipient: e._id,
        type: 'consultation_request',
        title: 'New Consultation Request',
        message: `New ${priority}-priority case: "${problemTitle}" (${cropName}).`,
        link: `/expert/requests/${consultation._id}`,
      }))
    );

    return sendSuccess(res, 201, 'Your question has been sent to our experts.', { consultation });
  } catch (err) {
    removeFiles(files);
    if (err.name === 'ValidationError') return sendError(res, 400, Object.values(err.errors)[0].message);
    console.error('farmer createConsultation error:', err);
    return sendError(res, 500, 'Failed to submit consultation.');
  }
};

// PATCH /api/farmer/consultations/:id/cancel   Body: { reason? }
const cancelConsultation = async (req, res) => {
  try {
    const consultation = await findOwned(req.params.id, req);
    if (!consultation) return sendError(res, 404, 'Consultation not found.');
    if (!['pending', 'accepted'].includes(consultation.status)) {
      return sendError(res, 400, `A ${consultation.status} consultation cannot be cancelled.`);
    }

    const hadExpert = consultation.expert;
    consultation.status = 'cancelled';
    consultation.cancelledAt = new Date();
    consultation.cancellationReason = str(req.body?.reason, 500) || null;
    await consultation.save();

    if (hadExpert) {
      notify([{
        recipient: hadExpert,
        type: 'consultation_cancelled',
        title: 'Consultation Cancelled',
        message: `The farmer cancelled "${consultation.problemTitle}".`,
        link: `/expert/consultations/${consultation._id}`,
      }]);
    }

    return sendSuccess(res, 200, 'Consultation cancelled.', { consultation });
  } catch (err) {
    console.error('farmer cancelConsultation error:', err);
    return sendError(res, 500, 'Failed to cancel consultation.');
  }
};

module.exports = { getMyConsultations, getConsultationById, createConsultation, cancelConsultation };