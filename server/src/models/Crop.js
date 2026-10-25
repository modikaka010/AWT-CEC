const mongoose = require('mongoose');

// Ordered lifecycle: a crop can only move forward through these stages
const STAGES = [
  'Land Preparation',
  'Sowing',
  'Germination',
  'Vegetative Growth',
  'Flowering',
  'Grain / Fruit Filling',
  'Maturity',
  'Harvested',
];
const SEASONS = ['Kharif', 'Rabi', 'Zaid'];
const HEALTH = ['Healthy', 'Under Observation', 'At Risk'];
const YIELD_UNITS = ['kg', 'quintal', 'ton'];

const stageEntrySchema = new mongoose.Schema(
  {
    stage: { type: String, enum: STAGES, required: true },
    date: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: false }
);

const cropSchema = new mongoose.Schema(
  {
    // Owner — always from the JWT
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Which of the farmer's farms the crop is grown on (ownership re-checked in the controller)
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: [true, 'Farm is required'], index: true },

    name: {
      type: String, required: [true, 'Crop name is required'], trim: true,
      minlength: [2, 'Crop name must be at least 2 characters'], maxlength: [80, 'Crop name cannot exceed 80 characters'],
    },
    variety: { type: String, trim: true, maxlength: 80, default: '' },
    season: { type: String, enum: { values: SEASONS, message: 'Invalid season' }, required: [true, 'Season is required'] },
    // Area in the unit of the farm it belongs to (acres / hectares / bigha)
    area: { type: Number, required: [true, 'Area is required'], min: [0.01, 'Area must be greater than 0'], max: [1000000, 'Area is too large'] },

    sowingDate: { type: Date, required: [true, 'Sowing date is required'] },
    expectedHarvestDate: {
      type: Date,
      required: [true, 'Expected harvest date is required'],
      validate: {
        validator: function (v) { return !this.sowingDate || v > this.sowingDate; },
        message: 'Expected harvest date must be after the sowing date',
      },
    },
    actualHarvestDate: { type: Date, default: null },

    currentStage: { type: String, enum: { values: STAGES, message: 'Invalid lifecycle stage' }, default: STAGES[0] },
    stageHistory: { type: [stageEntrySchema], default: [] },

    health: { type: String, enum: { values: HEALTH, message: 'Invalid health status' }, default: 'Healthy' },
    irrigationCycle: { type: String, trim: true, maxlength: 120, default: '' },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },

    yield: {
      quantity: { type: Number, min: [0, 'Yield cannot be negative'], default: null },
      unit: { type: String, enum: { values: YIELD_UNITS, message: 'Invalid yield unit' }, default: 'quintal' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => { delete ret.id; delete ret.__v; return ret; },
    },
  }
);

cropSchema.virtual('progress').get(function () {
  const i = STAGES.indexOf(this.currentStage);
  return Math.round((Math.max(i, 0) / (STAGES.length - 1)) * 100);
});

const Crop = mongoose.model('Crop', cropSchema);
Crop.OPTIONS = { STAGES, SEASONS, HEALTH, YIELD_UNITS };

module.exports = Crop;