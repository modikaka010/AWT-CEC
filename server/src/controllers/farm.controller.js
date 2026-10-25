const mongoose = require('mongoose');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const MAX_FARMS_PER_FARMER = 25;

// Only these fields may be written from a request body (blocks mass assignment of `farmer`, `_id`, etc.)
const WRITABLE_FIELDS = [
  'name', 'location', 'coordinates', 'areaUnit', 'totalArea', 'cultivatedArea',
  'soilType', 'soilPh', 'irrigationType', 'waterSource', 'primaryCrops',
  'organicCertified', 'certificationId',
];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const blank = (v) => v === undefined || v === null || v === '';
const str = (v) => (typeof v === 'string' ? v.trim() : v);

/**
 * Pick + normalise whitelisted fields from the body. Empty strings for optional
 * numeric fields become null. Returns { data, error }.
 */
const sanitize = (body) => {
  if (!isObj(body)) return { error: 'Request body must be a JSON object.' };
  const data = {};

  for (const key of WRITABLE_FIELDS) {
    if (body[key] === undefined) continue;
    data[key] = body[key];
  }

  if ('name' in data) {
    if (typeof data.name !== 'string') return { error: 'Farm name must be text.' };
    data.name = data.name.trim();
  }

  if ('location' in data) {
    if (!isObj(data.location)) return { error: 'Location must be an object.' };
    const loc = {};
    for (const k of ['village', 'district', 'state', 'pincode']) {
      if (data.location[k] === undefined) continue;
      if (typeof data.location[k] !== 'string') return { error: `Location ${k} must be text.` };
      loc[k] = data.location[k].trim();
    }
    data.location = loc;
  }

  if ('coordinates' in data) {
    if (data.coordinates === null) data.coordinates = { lat: null, lng: null };
    if (!isObj(data.coordinates)) return { error: 'Coordinates must be an object.' };
    const c = {};
    for (const k of ['lat', 'lng']) {
      const v = data.coordinates[k];
      if (blank(v)) { c[k] = null; continue; }
      const n = Number(v);
      if (!Number.isFinite(n)) return { error: `Coordinate ${k} must be a number.` };
      c[k] = n;
    }
    if ((c.lat === null) !== (c.lng === null)) return { error: 'Provide both latitude and longitude, or neither.' };
    data.coordinates = c;
  }

  for (const k of ['totalArea', 'cultivatedArea', 'soilPh']) {
    if (!(k in data)) continue;
    if (blank(data[k])) {
      data[k] = k === 'soilPh' ? null : undefined; // area fields are required → let the schema complain
      continue;
    }
    const n = Number(data[k]);
    if (!Number.isFinite(n)) return { error: `${k} must be a number.` };
    data[k] = n;
  }

  if ('primaryCrops' in data) {
    if (!Array.isArray(data.primaryCrops)) return { error: 'Primary crops must be a list.' };
    if (data.primaryCrops.some((c) => typeof c !== 'string')) return { error: 'Each crop must be text.' };
    const seen = new Set();
    data.primaryCrops = data.primaryCrops.map(str).filter((c) => {
      const k = c.toLowerCase();
      if (!c || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  if ('organicCertified' in data && typeof data.organicCertified !== 'boolean') {
    return { error: 'organicCertified must be true or false.' };
  }
  if ('certificationId' in data && typeof data.certificationId !== 'string') {
    return { error: 'Certification ID must be text.' };
  }

  return { data };
};

const validationMessage = (err) => Object.values(err.errors).map((e) => e.message).join(', ');

const handleError = (res, err, fallback) => {
  if (err.name === 'ValidationError') return sendError(res, 400, validationMessage(err));
  if (err.code === 11000) return sendError(res, 409, 'You already have a farm with this name.');
  console.error(fallback, err);
  return sendError(res, 500, fallback);
};

/** Find a farm by id that belongs to the authenticated farmer. Responds 404 otherwise
 *  (same response for "doesn't exist" and "belongs to someone else" so ids can't be probed). */
const findOwnedFarm = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    sendError(res, 404, 'Farm not found.');
    return null;
  }
  const farm = await Farm.findOne({ _id: id, farmer: req.user.id });
  if (!farm) {
    sendError(res, 404, 'Farm not found.');
    return null;
  }
  return farm;
};

// GET /api/farmer/farms
const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ farmer: req.user.id }).sort({ createdAt: 1 });
    return sendSuccess(res, 200, 'Farms fetched.', {
      farms,
      count: farms.length,
      hasFarm: farms.length > 0,
      options: Farm.OPTIONS,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch farms.');
  }
};

// GET /api/farmer/farms/:id
const getFarmById = async (req, res) => {
  try {
    const farm = await findOwnedFarm(req, res);
    if (!farm) return;
    return sendSuccess(res, 200, 'Farm fetched.', { farm });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch farm.');
  }
};

// POST /api/farmer/farms
const createFarm = async (req, res) => {
  try {
    const { data, error } = sanitize(req.body);
    if (error) return sendError(res, 400, error);

    const existing = await Farm.countDocuments({ farmer: req.user.id });
    if (existing >= MAX_FARMS_PER_FARMER) {
      return sendError(res, 400, `You can register at most ${MAX_FARMS_PER_FARMER} farms.`);
    }

    const farm = await Farm.create({ ...data, farmer: req.user.id });
    return sendSuccess(res, 201, 'Farm created successfully.', { farm });
  } catch (err) {
    return handleError(res, err, 'Failed to create farm.');
  }
};

// PUT /api/farmer/farms/:id
const updateFarm = async (req, res) => {
  try {
    const { data, error } = sanitize(req.body);
    if (error) return sendError(res, 400, error);

    const farm = await findOwnedFarm(req, res);
    if (!farm) return;

    // Merge nested objects so partial updates don't wipe sibling fields
    if (data.location) data.location = { ...farm.location.toObject(), ...data.location };
    if (data.coordinates) data.coordinates = { ...farm.coordinates.toObject(), ...data.coordinates };
    if (data.organicCertified === false) data.certificationId = '';

    farm.set(data);
    await farm.save(); // runs full validation (cross-field rules included)
    return sendSuccess(res, 200, 'Farm updated successfully.', { farm });
  } catch (err) {
    return handleError(res, err, 'Failed to update farm.');
  }
};

// DELETE /api/farmer/farms/:id
const deleteFarm = async (req, res) => {
  try {
    const farm = await findOwnedFarm(req, res);
    if (!farm) return;

    const count = await Farm.countDocuments({ farmer: req.user.id });
    if (count <= 1) {
      return sendError(res, 400, 'You must keep at least one farm. Create another farm before deleting this one.');
    }

        // Crops belong to a farm — don't leave them orphaned
    const cropCount = await Crop.countDocuments({ farm: farm._id });
    if (cropCount > 0) {
      return sendError(res, 400, `This farm still has ${cropCount} crop${cropCount > 1 ? 's' : ''}. Delete or move them to another farm first.`);
    }

    await farm.deleteOne();
    return sendSuccess(res, 200, 'Farm deleted successfully.', { id: farm._id });
  } catch (err) {
    return handleError(res, err, 'Failed to delete farm.');
  }
};

module.exports = { getFarms, getFarmById, createFarm, updateFarm, deleteFarm };