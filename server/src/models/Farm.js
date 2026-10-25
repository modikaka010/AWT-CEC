const mongoose = require('mongoose');

const AREA_UNITS = ['acres', 'hectares', 'bigha'];
const SOIL_TYPES = ['Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy', 'Saline / Alkaline', 'Other'];
const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Flood / Canal', 'Tube-well', 'Rain-fed', 'Solar Pump', 'Other'];
const WATER_SOURCES = ['Canal', 'Borewell', 'River', 'Pond / Tank', 'Rainwater', 'Well', 'Other'];

const farmSchema = new mongoose.Schema(
  {
    // Owner — always taken from the authenticated JWT, never from the request body
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
      minlength: [2, 'Farm name must be at least 2 characters'],
      maxlength: [100, 'Farm name cannot exceed 100 characters'],
    },
    // lower-cased name, used to enforce unique farm names per farmer
    nameKey: { type: String, select: false },
    location: {
      village:  { type: String, trim: true, maxlength: 100, default: '' },
      district: { type: String, trim: true, required: [true, 'District is required'], maxlength: 100 },
      state:    { type: String, trim: true, required: [true, 'State is required'], maxlength: 100 },
      pincode:  {
        type: String,
        trim: true,
        default: '',
        match: [/^(\d{6})?$/, 'Pincode must be 6 digits'],
      },
    },
    coordinates: {
      lat: { type: Number, min: [-90, 'Latitude must be between -90 and 90'], max: [90, 'Latitude must be between -90 and 90'], default: null },
      lng: { type: Number, min: [-180, 'Longitude must be between -180 and 180'], max: [180, 'Longitude must be between -180 and 180'], default: null },
    },
    areaUnit: { type: String, enum: { values: AREA_UNITS, message: 'Invalid area unit' }, default: 'acres' },
    totalArea: {
      type: Number,
      required: [true, 'Total area is required'],
      min: [0.01, 'Total area must be greater than 0'],
      max: [1000000, 'Total area is too large'],
    },
    cultivatedArea: {
      type: Number,
      required: [true, 'Cultivated area is required'],
      min: [0, 'Cultivated area cannot be negative'],
      validate: {
        validator: function (v) {
          return typeof this.totalArea !== 'number' || v <= this.totalArea;
        },
        message: 'Cultivated area cannot exceed total area',
      },
    },
    soilType: { type: String, enum: { values: SOIL_TYPES, message: 'Invalid soil type' }, required: [true, 'Soil type is required'] },
    soilPh: { type: Number, min: [0, 'Soil pH must be between 0 and 14'], max: [14, 'Soil pH must be between 0 and 14'], default: null },
    irrigationType: { type: String, enum: { values: IRRIGATION_TYPES, message: 'Invalid irrigation type' }, required: [true, 'Irrigation type is required'] },
    waterSource: { type: String, enum: { values: WATER_SOURCES, message: 'Invalid water source' }, required: [true, 'Water source is required'] },
    primaryCrops: {
      type: [{ type: String, trim: true, maxlength: 60 }],
      validate: [(arr) => arr.length <= 20, 'A farm can list at most 20 crops'],
      default: [],
    },
    organicCertified: { type: Boolean, default: false },
    certificationId: {
      type: String,
      trim: true,
      maxlength: 60,
      default: '',
      validate: {
        validator: function (v) {
          return !this.organicCertified || !!(v && v.trim());
        },
        message: 'Certification ID is required for organic-certified farms',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.nameKey; // internal helper for the unique-name index
        delete ret.__v;
        return ret;
      },
    },
  }
);

farmSchema.pre('validate', function (next) {
  if (this.name) this.nameKey = this.name.trim().toLowerCase();
  next();
});

// A farmer cannot have two farms with the same name
farmSchema.index({ farmer: 1, nameKey: 1 }, { unique: true });

const Farm = mongoose.model('Farm', farmSchema);
Farm.OPTIONS = { AREA_UNITS, SOIL_TYPES, IRRIGATION_TYPES, WATER_SOURCES };

module.exports = Farm;