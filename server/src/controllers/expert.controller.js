const User = require('../models/User');
const Consultation = require('../models/Consultation');
const DiseaseCase = require('../models/DiseaseCase');
const CropAdvice = require('../models/CropAdvice');
const Notification = require('../models/Notification');
const News = require('../models/News');
const Scheme = require('../models/Scheme');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { hashPassword, comparePassword } = require('../utils/hashPassword');

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — create a notification (non-blocking)
// ─────────────────────────────────────────────────────────────────────────────
const notify = async ({ recipient = null, type, title, message, link = null }) => {
  try {
    await Notification.create({ recipient, type, title, message, link });
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// GET /api/expert/dashboard
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const expertId = req.user.id;

    const [
      totalRequests,
      pendingRequests,
      activeConsultations,
      completedConsultations,
      rejectedConsultations,
      totalDiseaseCases,
      pendingDiseaseCases,
      diagnosedCases,
      totalCropAdvice,
      uniqueFarmers,
      unreadNotifications,
      recentRequests,
      recentDiseaseCases,
    ] = await Promise.all([
      Consultation.countDocuments({ expert: expertId }),
      Consultation.countDocuments({ expert: expertId, status: 'pending' }),
      Consultation.countDocuments({ expert: expertId, status: 'accepted' }),
      Consultation.countDocuments({ expert: expertId, status: 'completed' }),
      Consultation.countDocuments({ expert: expertId, status: 'rejected' }),
      DiseaseCase.countDocuments({ expert: expertId }),
      DiseaseCase.countDocuments({ expert: expertId, status: { $in: ['pending', 'under_review'] } }),
      DiseaseCase.countDocuments({ expert: expertId, status: 'diagnosed' }),
      CropAdvice.countDocuments({ expert: expertId }),
      // Unique farmers this expert has interacted with
      Consultation.distinct('farmer', { expert: expertId }).then((ids) => ids.length),
      Notification.countDocuments({ recipient: expertId, isRead: false }),
      // Recent 5 consultation requests
      Consultation.find({ expert: expertId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('farmer', 'name email loginId')
        .select('cropName problemTitle status priority createdAt farmer')
        .lean(),
      // Recent 5 disease cases
      DiseaseCase.find({ expert: expertId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('farmer', 'name email loginId')
        .select('cropName symptoms status createdAt farmer')
        .lean(),
    ]);

    // Also count pending unassigned consultations/disease cases (no expert yet)
    const [newUnassignedConsultations, newUnassignedDiseaseCases] = await Promise.all([
      Consultation.countDocuments({ expert: null, status: 'pending' }),
      DiseaseCase.countDocuments({ expert: null, status: 'pending' }),
    ]);

    return sendSuccess(res, 200, 'Dashboard stats fetched.', {
      stats: {
        totalRequests,
        pendingRequests,
        activeConsultations,
        completedConsultations,
        rejectedConsultations,
        totalDiseaseCases,
        pendingDiseaseCases,
        diagnosedCases,
        totalCropAdvice,
        uniqueFarmers,
        unreadNotifications,
        newUnassignedConsultations,
        newUnassignedDiseaseCases,
      },
      recentRequests,
      recentDiseaseCases,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return sendError(res, 500, 'Failed to load dashboard.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// GET /api/expert/profile
// ─────────────────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const expert = await User.findById(req.user.id).select('-__v -password').lean();
    if (!expert) return sendError(res, 404, 'Expert not found.');
    return sendSuccess(res, 200, 'Profile fetched.', { expert });
  } catch (err) {
    console.error('getProfile error:', err);
    return sendError(res, 500, 'Failed to fetch profile.');
  }
};

// PATCH /api/expert/profile
// Body: { name, mobile, bio, languages, expertInfo: { specialization, qualifications, experience, organization } }
const updateProfile = async (req, res) => {
  try {
    const { name, mobile, bio, languages } = req.body;
    const updates = {};

    if (name && name.trim()) updates.name = name.trim();
    if (mobile && mobile.trim()) updates.mobile = mobile.trim();
    if (bio !== undefined) updates['expertInfo.bio'] = bio ? bio.trim() : null;
    if (languages !== undefined) updates['expertInfo.languages'] = languages ? languages.trim() : null;

    // Allow updating non-verification professional info
    const { expertInfo } = req.body;
    if (expertInfo) {
      if (expertInfo.organization !== undefined)
        updates['expertInfo.organization'] = expertInfo.organization ? expertInfo.organization.trim() : null;
      // Specialization / qualifications / experience changes are allowed
      // but flagged in the front-end that they may require admin re-review
      if (expertInfo.specialization !== undefined)
        updates['expertInfo.specialization'] = expertInfo.specialization ? expertInfo.specialization.trim() : null;
      if (expertInfo.qualifications !== undefined)
        updates['expertInfo.qualifications'] = expertInfo.qualifications ? expertInfo.qualifications.trim() : null;
      if (expertInfo.experience !== undefined)
        updates['expertInfo.experience'] = expertInfo.experience ? expertInfo.experience.trim() : null;
    }

    if (Object.keys(updates).length === 0)
      return sendError(res, 400, 'No valid fields to update.');

    const expert = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-__v -password');

    return sendSuccess(res, 200, 'Profile updated.', { expert });
  } catch (err) {
    console.error('updateProfile error:', err);
    return sendError(res, 500, 'Failed to update profile.');
  }
};

// PATCH /api/expert/profile/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return sendError(res, 400, 'Current and new password are required.');
    if (newPassword.length < 8)
      return sendError(res, 400, 'New password must be at least 8 characters.');

    const expert = await User.findById(req.user.id).select('+password');
    if (!expert) return sendError(res, 404, 'Expert not found.');

    const isMatch = await comparePassword(currentPassword, expert.password);
    if (!isMatch) return sendError(res, 401, 'Current password is incorrect.');

    expert.password = await hashPassword(newPassword);
    await expert.save();

    return sendSuccess(res, 200, 'Password changed successfully.');
  } catch (err) {
    console.error('changePassword error:', err);
    return sendError(res, 500, 'Failed to change password.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTATION REQUESTS
// Expert sees ALL pending (unassigned) requests + their own
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/expert/consultation-requests?status=pending&page=1&limit=15
const getConsultationRequests = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 15 } = req.query;
    const expertId = req.user.id;

    // Show unassigned pending requests + requests already assigned to this expert
    let filter;
    if (status === 'pending') {
      filter = {
        $or: [
          { expert: null, status: 'pending' },
          { expert: expertId, status: 'pending' },
        ],
      };
    } else if (status === 'all') {
      filter = {
        $or: [{ expert: null, status: 'pending' }, { expert: expertId }],
      };
    } else {
      filter = { expert: expertId, status };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [requests, total] = await Promise.all([
      Consultation.find(filter)
        .populate('farmer', 'name email mobile loginId')
        .select('-__v -expertResponse')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Consultation.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Consultation requests fetched.', {
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getConsultationRequests error:', err);
    return sendError(res, 500, 'Failed to fetch consultation requests.');
  }
};

// GET /api/expert/consultation-requests/:id
const getConsultationRequestById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('farmer', 'name email mobile loginId expertInfo')
      .populate('expert', 'name email loginId')
      .select('-__v')
      .lean();

    if (!consultation) return sendError(res, 404, 'Consultation request not found.');

    // Allow if unassigned pending OR belongs to this expert
    const expertId = req.user.id;
    const isOwner = consultation.expert && consultation.expert._id.toString() === expertId;
    const isUnassigned = !consultation.expert && consultation.status === 'pending';

    if (!isOwner && !isUnassigned)
      return sendError(res, 403, 'You are not authorized to view this consultation.');

    return sendSuccess(res, 200, 'Consultation request fetched.', { consultation });
  } catch (err) {
    console.error('getConsultationRequestById error:', err);
    return sendError(res, 500, 'Failed to fetch consultation request.');
  }
};

// PATCH /api/expert/consultation-requests/:id/accept
const acceptConsultation = async (req, res) => {
  try {
        // Atomic claim: only one expert can take a pending, unassigned (or own) case
    const consultation = await Consultation.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'pending',
        $or: [{ expert: null }, { expert: req.user.id }],
      },
      { expert: req.user.id, status: 'accepted', acceptedAt: new Date() },
      { new: true }
    ).populate('farmer', 'name');

    if (!consultation) {
      const existing = await Consultation.findById(req.params.id).select('status expert').lean();
      if (!existing) return sendError(res, 404, 'Consultation not found.');
      if (existing.status === 'pending')
        return sendError(res, 403, 'This consultation is assigned to another expert.');
      return sendError(res, 400, existing.expert && String(existing.expert) !== req.user.id
        ? 'This consultation has already been taken by another expert.'
        : `Cannot accept a consultation with status "${existing.status}".`);
    }

    // Notify farmer
    await notify({
      recipient: consultation.farmer._id,
      type: 'consultation_accepted',
      title: 'Consultation Request Accepted',
      message: `Your consultation request "${consultation.problemTitle}" has been accepted by an expert. They will review your case soon.`,
      link: `/farmer/consultation?case=${consultation._id}`,
    });

    return sendSuccess(res, 200, 'Consultation accepted successfully.', {
      consultationId: consultation._id,
      status: consultation.status,
    });
  } catch (err) {
    console.error('acceptConsultation error:', err);
    return sendError(res, 500, 'Failed to accept consultation.');
  }
};

// PATCH /api/expert/consultation-requests/:id/reject
// Body: { reason }
const rejectConsultation = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 5)
      return sendError(res, 400, 'A rejection reason of at least 5 characters is required.');

    const consultation = await Consultation.findById(req.params.id).populate('farmer', 'name');
    if (!consultation) return sendError(res, 404, 'Consultation not found.');
    if (consultation.status !== 'pending')
      return sendError(res, 400, `Cannot reject a consultation with status "${consultation.status}".`);

    consultation.expert = req.user.id;
    consultation.status = 'rejected';
    consultation.rejectionReason = reason.trim();
    await consultation.save();

    await notify({
      recipient: consultation.farmer._id,
      type: 'consultation_rejected',
      title: 'Consultation Request Rejected',
      message: `Your consultation request "${consultation.problemTitle}" could not be accepted. Reason: ${reason.trim()}`,
      link: `/farmer/consultation?case=${consultation._id}`,
    });

    return sendSuccess(res, 200, 'Consultation rejected.', {
      consultationId: consultation._id,
      status: consultation.status,
    });
  } catch (err) {
    console.error('rejectConsultation error:', err);
    return sendError(res, 500, 'Failed to reject consultation.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MY CONSULTATIONS
// GET /api/expert/consultations?status=accepted&page=1&limit=15
// ─────────────────────────────────────────────────────────────────────────────
const getMyConsultations = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const filter = { expert: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [consultations, total] = await Promise.all([
      Consultation.find(filter)
        .populate('farmer', 'name email loginId mobile')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Consultation.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Consultations fetched.', {
      consultations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getMyConsultations error:', err);
    return sendError(res, 500, 'Failed to fetch consultations.');
  }
};

// GET /api/expert/consultations/:id
const getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      expert: req.user.id,
    })
      .populate('farmer', 'name email mobile loginId')
      .select('-__v')
      .lean();

    if (!consultation) return sendError(res, 404, 'Consultation not found.');
    return sendSuccess(res, 200, 'Consultation fetched.', { consultation });
  } catch (err) {
    console.error('getConsultationById error:', err);
    return sendError(res, 500, 'Failed to fetch consultation.');
  }
};

// PATCH /api/expert/consultations/:id/complete
// Body: { diagnosis, advice, recommendedActions, precautions, followUp }
const completeConsultation = async (req, res) => {
  try {
    const { diagnosis, advice, recommendedActions, precautions, followUp } = req.body;
    if (!advice || !advice.trim())
      return sendError(res, 400, 'Expert advice is required to complete a consultation.');

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      expert: req.user.id,
    }).populate('farmer', 'name');

    if (!consultation) return sendError(res, 404, 'Consultation not found.');
    if (consultation.status !== 'accepted')
      return sendError(res, 400, `Can only complete an accepted consultation (current: ${consultation.status}).`);

    consultation.status = 'completed';
    consultation.completedAt = new Date();
    consultation.expertResponse = {
      diagnosis: diagnosis ? diagnosis.trim() : null,
      advice: advice.trim(),
      recommendedActions: recommendedActions ? recommendedActions.trim() : null,
      precautions: precautions ? precautions.trim() : null,
      followUp: followUp ? followUp.trim() : null,
      respondedAt: new Date(),
    };
    await consultation.save();

    await notify({
      recipient: consultation.farmer._id,
      type: 'consultation_completed',
      title: 'Expert Advice Ready',
      message: `Your consultation "${consultation.problemTitle}" has been answered by the expert. View the advice now.`,
      link: `/farmer/consultations/${consultation._id}`,
    });

    return sendSuccess(res, 200, 'Consultation completed successfully.', {
      consultationId: consultation._id,
      status: consultation.status,
    });
  } catch (err) {
    console.error('completeConsultation error:', err);
    return sendError(res, 500, 'Failed to complete consultation.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MY FARMERS
// Farmers who have had consultations with this expert
// GET /api/expert/farmers?search=raj&page=1&limit=15
// ─────────────────────────────────────────────────────────────────────────────
const getMyFarmers = async (req, res) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const expertId = req.user.id;

    // Get distinct farmer IDs from consultations and disease cases
    const [consultationFarmerIds, diseaseFarmerIds] = await Promise.all([
      Consultation.distinct('farmer', { expert: expertId }),
      DiseaseCase.distinct('farmer', { expert: expertId }),
    ]);

    // Merge and deduplicate
    const allFarmerIds = [
      ...new Set([
        ...consultationFarmerIds.map(String),
        ...diseaseFarmerIds.map(String),
      ]),
    ];

    const userFilter = { _id: { $in: allFarmerIds } };
    if (search) {
      const regex = new RegExp(search, 'i');
      userFilter.$or = [{ name: regex }, { email: regex }, { loginId: regex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [farmers, total] = await Promise.all([
      User.find(userFilter)
        .select('name email mobile loginId status createdAt')
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(userFilter),
    ]);

    // Attach consultation/disease counts per farmer
    const farmerIds = farmers.map((f) => f._id);
    const [consultCounts, diseaseCounts] = await Promise.all([
      Consultation.aggregate([
        { $match: { expert: require('mongoose').Types.ObjectId.createFromHexString(expertId), farmer: { $in: farmerIds } } },
        { $group: { _id: '$farmer', total: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      ]),
      DiseaseCase.aggregate([
        { $match: { expert: require('mongoose').Types.ObjectId.createFromHexString(expertId), farmer: { $in: farmerIds } } },
        { $group: { _id: '$farmer', total: { $sum: 1 } } },
      ]),
    ]);

    const consultMap = Object.fromEntries(consultCounts.map((c) => [String(c._id), c]));
    const diseaseMap = Object.fromEntries(diseaseCounts.map((d) => [String(d._id), d]));

    const enriched = farmers.map((f) => ({
      ...f,
      consultations: consultMap[String(f._id)] || { total: 0, active: 0, completed: 0 },
      diseaseCases: diseaseMap[String(f._id)]?.total || 0,
    }));

    return sendSuccess(res, 200, 'Farmers fetched.', {
      farmers: enriched,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getMyFarmers error:', err);
    return sendError(res, 500, 'Failed to fetch farmers.');
  }
};

// GET /api/expert/farmers/:id
const getFarmerDetails = async (req, res) => {
  try {
    const expertId = req.user.id;
    const farmerId = req.params.id;

    // Verify this expert has actually interacted with this farmer
    const [hasConsultation, hasDiseaseCase] = await Promise.all([
      Consultation.exists({ expert: expertId, farmer: farmerId }),
      DiseaseCase.exists({ expert: expertId, farmer: farmerId }),
    ]);

    if (!hasConsultation && !hasDiseaseCase)
      return sendError(res, 403, 'You do not have permission to view this farmer\'s details.');

    const farmer = await User.findById(farmerId).select('name email mobile loginId status createdAt expertInfo').lean();
    if (!farmer) return sendError(res, 404, 'Farmer not found.');

    // Consultation and disease history for context
    const [consultations, diseaseCases, cropAdvice] = await Promise.all([
      Consultation.find({ expert: expertId, farmer: farmerId })
        .select('cropName problemTitle status createdAt completedAt')
        .sort({ createdAt: -1 })
        .lean(),
      DiseaseCase.find({ expert: expertId, farmer: farmerId })
        .select('cropName symptoms status createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      CropAdvice.find({ expert: expertId, farmer: farmerId })
        .select('cropName recommendedActions createdAt')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return sendSuccess(res, 200, 'Farmer details fetched.', {
      farmer,
      consultations,
      diseaseCases,
      cropAdvice,
    });
  } catch (err) {
    console.error('getFarmerDetails error:', err);
    return sendError(res, 500, 'Failed to fetch farmer details.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DISEASE CASES
// GET /api/expert/disease-cases?status=pending&page=1&limit=15
// ─────────────────────────────────────────────────────────────────────────────
const getDiseaseCases = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const expertId = req.user.id;

    let filter;
    if (status === 'pending' || !status) {
      // Show unassigned pending + own cases
      filter = {
        $or: [
          { expert: null, status: 'pending' },
          { expert: expertId },
        ],
      };
    } else {
      filter = { expert: expertId, status };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cases, total] = await Promise.all([
      DiseaseCase.find(filter)
        .populate('farmer', 'name email loginId mobile')
        .select('-__v -expertAdvice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      DiseaseCase.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Disease cases fetched.', {
      cases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getDiseaseCases error:', err);
    return sendError(res, 500, 'Failed to fetch disease cases.');
  }
};

// GET /api/expert/disease-cases/:id
const getDiseaseCaseById = async (req, res) => {
  try {
    const expertId = req.user.id;
    const diseaseCase = await DiseaseCase.findById(req.params.id)
      .populate('farmer', 'name email mobile loginId')
      .populate('expert', 'name email loginId')
      .select('-__v')
      .lean();

    if (!diseaseCase) return sendError(res, 404, 'Disease case not found.');

    const isOwner = diseaseCase.expert && diseaseCase.expert._id.toString() === expertId;
    const isUnassigned = !diseaseCase.expert && diseaseCase.status === 'pending';

    if (!isOwner && !isUnassigned)
      return sendError(res, 403, 'You are not authorized to view this case.');

    return sendSuccess(res, 200, 'Disease case fetched.', { diseaseCase });
  } catch (err) {
    console.error('getDiseaseCaseById error:', err);
    return sendError(res, 500, 'Failed to fetch disease case.');
  }
};

// PATCH /api/expert/disease-cases/:id
// Body: { status, possibleDisease, diagnosis, treatment, precautions, followUp }
const updateDiseaseCase = async (req, res) => {
  try {
    const { status, possibleDisease, diagnosis, treatment, precautions, followUp } = req.body;
    const expertId = req.user.id;

    const diseaseCase = await DiseaseCase.findById(req.params.id).populate('farmer', 'name');
    if (!diseaseCase) return sendError(res, 404, 'Disease case not found.');

    // Assign this expert if unassigned
    if (!diseaseCase.expert) {
      diseaseCase.expert = expertId;
    } else if (diseaseCase.expert.toString() !== expertId) {
      return sendError(res, 403, 'This case belongs to another expert.');
    }

    const allowedStatuses = ['under_review', 'diagnosed', 'closed'];
    if (status && allowedStatuses.includes(status)) diseaseCase.status = status;

    if (possibleDisease !== undefined) diseaseCase.expertAdvice.possibleDisease = possibleDisease ? possibleDisease.trim() : null;
    if (diagnosis !== undefined) diseaseCase.expertAdvice.diagnosis = diagnosis ? diagnosis.trim() : null;
    if (treatment !== undefined) diseaseCase.expertAdvice.treatment = treatment ? treatment.trim() : null;
    if (precautions !== undefined) diseaseCase.expertAdvice.precautions = precautions ? precautions.trim() : null;
    if (followUp !== undefined) diseaseCase.expertAdvice.followUp = followUp ? followUp.trim() : null;
    if (diagnosis || treatment) diseaseCase.expertAdvice.advisedAt = new Date();

    await diseaseCase.save();

    if (status === 'diagnosed') {
      await notify({
        recipient: diseaseCase.farmer._id,
        type: 'disease_case_updated',
        title: 'Disease Case Diagnosed',
        message: `An expert has provided a diagnosis for your disease case on "${diseaseCase.cropName}". View the advice now.`,
        link: `/farmer/disease/${diseaseCase._id}`,
      });
    }

    return sendSuccess(res, 200, 'Disease case updated.', {
      caseId: diseaseCase._id,
      status: diseaseCase.status,
    });
  } catch (err) {
    console.error('updateDiseaseCase error:', err);
    return sendError(res, 500, 'Failed to update disease case.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CROP ADVICE
// GET /api/expert/crop-advice?page=1&limit=15
// ─────────────────────────────────────────────────────────────────────────────
const getCropAdviceList = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [adviceList, total] = await Promise.all([
      CropAdvice.find({ expert: req.user.id })
        .populate('farmer', 'name email loginId')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CropAdvice.countDocuments({ expert: req.user.id }),
    ]);

    return sendSuccess(res, 200, 'Crop advice fetched.', {
      adviceList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getCropAdviceList error:', err);
    return sendError(res, 500, 'Failed to fetch crop advice.');
  }
};

// GET /api/expert/crop-advice/:id
const getCropAdviceById = async (req, res) => {
  try {
    const advice = await CropAdvice.findOne({ _id: req.params.id, expert: req.user.id })
      .populate('farmer', 'name email loginId mobile')
      .select('-__v')
      .lean();
    if (!advice) return sendError(res, 404, 'Crop advice not found.');
    return sendSuccess(res, 200, 'Crop advice fetched.', { advice });
  } catch (err) {
    console.error('getCropAdviceById error:', err);
    return sendError(res, 500, 'Failed to fetch crop advice.');
  }
};

// POST /api/expert/crop-advice
const submitCropAdvice = async (req, res) => {
  try {
    const {
      farmerId, cropName, growthStage, soilInfo, weatherConditions, observedProblem,
      recommendedActions, irrigationAdvice, nutrientAdvice, pestPrecautions,
      harvestAdvice, additionalNotes, consultationId, diseaseCaseId,
    } = req.body;

    if (!farmerId || !cropName || !recommendedActions)
      return sendError(res, 400, 'Farmer, crop name, and recommended actions are required.');

    const advice = await CropAdvice.create({
      expert: req.user.id,
      farmer: farmerId,
      cropName: cropName.trim(),
      growthStage: growthStage || null,
      soilInfo: soilInfo || null,
      weatherConditions: weatherConditions || null,
      observedProblem: observedProblem || null,
      recommendedActions: recommendedActions.trim(),
      irrigationAdvice: irrigationAdvice || null,
      nutrientAdvice: nutrientAdvice || null,
      pestPrecautions: pestPrecautions || null,
      harvestAdvice: harvestAdvice || null,
      additionalNotes: additionalNotes || null,
      consultation: consultationId || null,
      diseaseCase: diseaseCaseId || null,
    });

    await notify({
      recipient: farmerId,
      type: 'crop_advice_submitted',
      title: 'New Crop Advice from Expert',
      message: `An expert has submitted crop advice for your "${cropName}" crop. View the recommendations now.`,
      link: `/farmer/crop-advice/${advice._id}`,
    });

    return sendSuccess(res, 201, 'Crop advice submitted.', { advice });
  } catch (err) {
    console.error('submitCropAdvice error:', err);
    return sendError(res, 500, 'Failed to submit crop advice.');
  }
};

// PATCH /api/expert/crop-advice/:id
const updateCropAdvice = async (req, res) => {
  try {
    const advice = await CropAdvice.findOne({ _id: req.params.id, expert: req.user.id });
    if (!advice) return sendError(res, 404, 'Crop advice not found.');

    const fields = [
      'cropName', 'growthStage', 'soilInfo', 'weatherConditions', 'observedProblem',
      'recommendedActions', 'irrigationAdvice', 'nutrientAdvice',
      'pestPrecautions', 'harvestAdvice', 'additionalNotes',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) advice[f] = req.body[f] ? req.body[f].trim() : null;
    });

    await advice.save();
    return sendSuccess(res, 200, 'Crop advice updated.', { advice });
  } catch (err) {
    console.error('updateCropAdvice error:', err);
    return sendError(res, 500, 'Failed to update crop advice.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// GET /api/expert/notifications?page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const expertId = req.user.id;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: expertId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v')
        .lean(),
      Notification.countDocuments({ recipient: expertId }),
      Notification.countDocuments({ recipient: expertId, isRead: false }),
    ]);

    return sendSuccess(res, 200, 'Notifications fetched.', {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    return sendError(res, 500, 'Failed to fetch notifications.');
  }
};

// PATCH /api/expert/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notif) return sendError(res, 404, 'Notification not found.');
    notif.isRead = true;
    notif.readAt = new Date();
    await notif.save();
    return sendSuccess(res, 200, 'Notification marked as read.');
  } catch (err) {
    return sendError(res, 500, 'Failed to mark notification.');
  }
};

// PATCH /api/expert/notifications/read-all
const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return sendSuccess(res, 200, 'All notifications marked as read.');
  } catch (err) {
    return sendError(res, 500, 'Failed to mark notifications.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE RESOURCES
// Reuses existing News + Scheme content (no duplicate system)
// GET /api/expert/knowledge?type=news|scheme&page=1&limit=12
// ─────────────────────────────────────────────────────────────────────────────
const getKnowledgeResources = async (req, res) => {
  try {
    const { type, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (type === 'scheme') {
      const [schemes, total] = await Promise.all([
        Scheme.find({ status: 'published' })
          .select('name description eligibility benefits officialLink category targetAudience createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Scheme.countDocuments({ status: 'published' }),
      ]);
      return sendSuccess(res, 200, 'Schemes fetched.', {
        resources: schemes,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      });
    }

    // Default: news articles
    const [news, total] = await Promise.all([
      News.find({ status: 'published' })
        .select('title category summary description image source publishedDate createdAt')
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      News.countDocuments({ status: 'published' }),
    ]);

    return sendSuccess(res, 200, 'News articles fetched.', {
      resources: news,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('getKnowledgeResources error:', err);
    return sendError(res, 500, 'Failed to fetch knowledge resources.');
  }
};

module.exports = {
  getDashboardStats,
  getProfile,
  updateProfile,
  changePassword,
  getConsultationRequests,
  getConsultationRequestById,
  acceptConsultation,
  rejectConsultation,
  getMyConsultations,
  getConsultationById,
  completeConsultation,
  getMyFarmers,
  getFarmerDetails,
  getDiseaseCases,
  getDiseaseCaseById,
  updateDiseaseCase,
  getCropAdviceList,
  getCropAdviceById,
  submitCropAdvice,
  updateCropAdvice,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getKnowledgeResources,
};
