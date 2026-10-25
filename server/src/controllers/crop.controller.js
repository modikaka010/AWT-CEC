const mongoose = require('mongoose');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const { STAGES, SEASONS, HEALTH, YIELD_UNITS } = Crop.OPTIONS;
const MAX_CROPS_PER_FARMER = 200;
const DAY = 24 * 60 * 60 * 1000;

// Fields a client may set when creating / editing. `currentStage` & `stageHistory` are NOT
// editable via PUT — lifecycle changes go through PATCH /:id/stage so history stays consistent.
const EDITABLE = ['farm', 'name', 'variety', 'season', 'area', 'sowingDate', 'expectedHarvestDate', 'health', 'irrigationCycle', 'notes'];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const blank = (v) => v === undefined || v === null || v === '';

const parseDate = (v, label) => {
  const d = new Date(v);
  if (typeof v !== 'string' && typeof v !== 'number' || Number.isNaN(d.getTime())) return { error: `${label} must be a valid date.` };
  const y = d.getUTCFullYear();
  if (y < 2000 || y > 2100) return { error: `${label} is out of range.` };
  return { date: d };
};

const handleError = (res, err, fallback) => {
  if (err.name === 'ValidationError') return sendError(res, 400, Object.values(err.errors).map((e) => e.message).join(', '));
  if (err.name === 'CastError') return sendError(res, 400, 'Invalid value supplied.');
  console.error(fallback, err);
  return sendError(res, 500, fallback);
};

/** Validate + normalise editable fields. `required` = creating (all mandatory fields must be present). */
const sanitize = (body, { required }) => {
  if (!isObj(body)) return { error: 'Request body must be a JSON object.' };
  const data = {};
  for (const k of EDITABLE) if (body[k] !== undefined) data[k] = body[k];

  for (const k of ['name', 'variety', 'irrigationCycle', 'notes', 'season', 'health']) {
    if (k in data) {
      if (typeof data[k] !== 'string') return { error: `${k} must be text.` };
      data[k] = data[k].trim();
    }
  }
  if ('season' in data && !SEASONS.includes(data.season)) return { error: 'Invalid season.' };
  if ('health' in data && !HEALTH.includes(data.health)) return { error: 'Invalid health status.' };

  if ('farm' in data && (typeof data.farm !== 'string' || !mongoose.isValidObjectId(data.farm))) {
    return { error: 'Select a valid farm.' };
  }
  if ('area' in data) {
    const n = Number(data.area);
    if (blank(data.area) || !Number.isFinite(n)) return { error: 'Area must be a number.' };
    data.area = n;
  }
  for (const [k, label] of [['sowingDate', 'Sowing date'], ['expectedHarvestDate', 'Expected harvest date']]) {
    if (!(k in data)) continue;
    const { date, error } = parseDate(data[k], label);
    if (error) return { error };
    data[k] = date;
  }

  if (required) {
    for (const [k, label] of [['farm', 'Farm'], ['name', 'Crop name'], ['season', 'Season'], ['area', 'Area'], ['sowingDate', 'Sowing date'], ['expectedHarvestDate', 'Expected harvest date']]) {
      if (blank(data[k])) return { error: `${label} is required.` };
    }
  }
  return { data };
};

/** Load the farmer's own farm; null if it doesn't exist or belongs to someone else. */
const findOwnFarm = (farmerId, farmId) =>
  mongoose.isValidObjectId(farmId) ? Farm.findOne({ _id: farmId, farmer: farmerId }) : null;

/** Ensure area of all growing crops on the farm stays within its cultivated area. */
const checkAreaFits = async (farm, area, excludeId) => {
  const growing = await Crop.find({ farm: farm._id, currentStage: { $ne: 'Harvested' } });
  const used = growing
    .filter((c) => String(c._id) !== String(excludeId))
    .reduce((sum, c) => sum + c.area, 0);
  const left = Math.max(0, +(farm.cultivatedArea - used).toFixed(2));
  if (area > left + 1e-9) {
    return `Only ${left} ${farm.areaUnit} of cultivated area is free on "${farm.name}" (${farm.cultivatedArea} ${farm.areaUnit} in total).`;
  }
  return null;
};

const findOwnedCrop = async (req, res) => {
  const { id } = req.params;
  const crop = mongoose.isValidObjectId(id) ? await Crop.findOne({ _id: id, farmer: req.user.id }) : null;
  if (!crop) {
    sendError(res, 404, 'Crop not found.'); // same answer for "missing" and "someone else's"
    return null;
  }
  return crop;
};

/** crop → JSON with `farm` replaced by { _id, name, areaUnit } */
const present = (crop, farmMap) => {
  const json = crop.toJSON();
  const f = farmMap.get(String(crop.farm));
  json.farm = f ? { _id: f._id, name: f.name, areaUnit: f.areaUnit } : { _id: crop.farm, name: 'Unknown farm', areaUnit: '' };
  return json;
};

// GET /api/farmer/crops?farm=<id>
const getCrops = async (req, res) => {
  try {
    const filter = { farmer: req.user.id };
    if (req.query.farm) {
      if (!mongoose.isValidObjectId(req.query.farm)) return sendError(res, 400, 'Invalid farm filter.');
      filter.farm = req.query.farm;
    }
    const [crops, farms] = await Promise.all([
      Crop.find(filter).sort({ createdAt: -1 }),
      Farm.find({ farmer: req.user.id }),
    ]);
    const farmMap = new Map(farms.map((f) => [String(f._id), f]));
    return sendSuccess(res, 200, 'Crops fetched.', {
      crops: crops.map((c) => present(c, farmMap)),
      count: crops.length,
      options: Crop.OPTIONS,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch crops.');
  }
};

// GET /api/farmer/crops/:id
const getCropById = async (req, res) => {
  try {
    const crop = await findOwnedCrop(req, res);
    if (!crop) return;
    const farm = await Farm.findOne({ _id: crop.farm, farmer: req.user.id });
    return sendSuccess(res, 200, 'Crop fetched.', { crop: present(crop, new Map(farm ? [[String(farm._id), farm]] : [])) });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch crop.');
  }
};

// POST /api/farmer/crops
const createCrop = async (req, res) => {
  try {
    const { data, error } = sanitize(req.body, { required: true });
    if (error) return sendError(res, 400, error);

    // optional starting stage (e.g. adding a crop that is already growing)
    let startStage = STAGES[0];
    if (req.body.currentStage !== undefined) {
      if (!STAGES.includes(req.body.currentStage) || req.body.currentStage === 'Harvested') {
        return sendError(res, 400, 'Starting stage must be a valid, un-harvested lifecycle stage.');
      }
      startStage = req.body.currentStage;
    }

    const farm = await findOwnFarm(req.user.id, data.farm);
    if (!farm) return sendError(res, 400, 'Select one of your own farms.');

    if ((await Crop.countDocuments({ farmer: req.user.id })) >= MAX_CROPS_PER_FARMER) {
      return sendError(res, 400, `You can track at most ${MAX_CROPS_PER_FARMER} crops.`);
    }
    const areaProblem = await checkAreaFits(farm, data.area);
    if (areaProblem) return sendError(res, 400, areaProblem);

    const crop = await Crop.create({
      ...data,
      farmer: req.user.id,
      currentStage: startStage,
      stageHistory: [{ stage: startStage, date: new Date(), notes: 'Crop added' }],
    });
    return sendSuccess(res, 201, 'Crop added successfully.', { crop: present(crop, new Map([[String(farm._id), farm]])) });
  } catch (err) {
    return handleError(res, err, 'Failed to add crop.');
  }
};

// PUT /api/farmer/crops/:id
const updateCrop = async (req, res) => {
  try {
    const { data, error } = sanitize(req.body, { required: false });
    if (error) return sendError(res, 400, error);

    const crop = await findOwnedCrop(req, res);
    if (!crop) return;

    // farm: must be one of the farmer's own (also when unchanged, to catch stale data)
    const farm = await findOwnFarm(req.user.id, data.farm || crop.farm);
    if (!farm) return sendError(res, 400, 'Select one of your own farms.');

    const area = data.area ?? crop.area;
    if (crop.currentStage !== 'Harvested' && (data.area !== undefined || data.farm !== undefined)) {
      const areaProblem = await checkAreaFits(farm, area, crop._id);
      if (areaProblem) return sendError(res, 400, areaProblem);
    }

    crop.set(data);
    await crop.save(); // full schema validation incl. harvest date > sowing date
    return sendSuccess(res, 200, 'Crop updated successfully.', { crop: present(crop, new Map([[String(farm._id), farm]])) });
  } catch (err) {
    return handleError(res, err, 'Failed to update crop.');
  }
};

// PATCH /api/farmer/crops/:id/stage   { stage, date?, notes?, yield?: { quantity, unit } }
const updateCropStage = async (req, res) => {
  try {
    const body = req.body;
    if (!isObj(body)) return sendError(res, 400, 'Request body must be a JSON object.');
    const { stage, notes } = body;

    if (!STAGES.includes(stage)) return sendError(res, 400, 'Invalid lifecycle stage.');
    if (!blank(notes) && typeof notes !== 'string') return sendError(res, 400, 'Notes must be text.');
    if (typeof notes === 'string' && notes.length > 500) return sendError(res, 400, 'Notes cannot exceed 500 characters.');

    const crop = await findOwnedCrop(req, res);
    if (!crop) return;

    if (STAGES.indexOf(stage) <= STAGES.indexOf(crop.currentStage)) {
      return sendError(res, 400, `A crop can only move forward. It is already at "${crop.currentStage}".`);
    }

    let when = new Date();
    if (!blank(body.date)) {
      const { date, error } = parseDate(body.date, 'Stage date');
      if (error) return sendError(res, 400, error);
      when = date;
    }
    if (when.getTime() > Date.now() + DAY) return sendError(res, 400, 'Stage date cannot be in the future.');
    const last = crop.stageHistory[crop.stageHistory.length - 1];
    if (last && when.getTime() < last.date.getTime() - DAY) {
      return sendError(res, 400, 'Stage date cannot be earlier than the previous stage update.');
    }

    crop.currentStage = stage;
    crop.stageHistory.push({ stage, date: when, notes: (notes || '').trim() });

    if (stage === 'Harvested') {
      crop.actualHarvestDate = when;
      if (body.yield !== undefined && body.yield !== null) {
        if (!isObj(body.yield)) return sendError(res, 400, 'Yield must be an object.');
        const q = body.yield.quantity;
        if (!blank(q)) {
          const n = Number(q);
          if (!Number.isFinite(n) || n < 0) return sendError(res, 400, 'Yield quantity must be a non-negative number.');
          crop.yield.quantity = n;
        }
        if (!blank(body.yield.unit)) {
          if (!YIELD_UNITS.includes(body.yield.unit)) return sendError(res, 400, 'Invalid yield unit.');
          crop.yield.unit = body.yield.unit;
        }
      }
    }

    await crop.save();
    const farm = await Farm.findOne({ _id: crop.farm, farmer: req.user.id });
    return sendSuccess(res, 200, 'Crop stage updated.', { crop: present(crop, new Map(farm ? [[String(farm._id), farm]] : [])) });
  } catch (err) {
    return handleError(res, err, 'Failed to update crop stage.');
  }
};

// DELETE /api/farmer/crops/:id
const deleteCrop = async (req, res) => {
  try {
    const crop = await findOwnedCrop(req, res);
    if (!crop) return;
    await crop.deleteOne();
    return sendSuccess(res, 200, 'Crop deleted successfully.', { id: crop._id });
  } catch (err) {
    return handleError(res, err, 'Failed to delete crop.');
  }
};

module.exports = { getCrops, getCropById, createCrop, updateCrop, updateCropStage, deleteCrop };