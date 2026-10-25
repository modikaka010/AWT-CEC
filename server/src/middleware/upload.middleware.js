const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const expertDocsDir = path.join(__dirname, '../../../uploads/expert-docs');
if (!fs.existsSync(expertDocsDir)) {
  fs.mkdirSync(expertDocsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, expertDocsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `expert-doc-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed.'));
  }
};

const uploadExpertDocs = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB per file, max 5 files
  fileFilter,
});

// ── Consultation (crop problem) images — farmers only, images only ────────────
const consultationDir = path.join(__dirname, '../../../uploads/consultations');
if (!fs.existsSync(consultationDir)) {
  fs.mkdirSync(consultationDir, { recursive: true });
}

const consultationStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, consultationDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `consultation-${uniqueSuffix}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const ok =
    /\.(jpe?g|png|webp)$/i.test(file.originalname) &&
    /^image\/(jpeg|png|webp)$/.test(file.mimetype);
  if (ok) return cb(null, true);
  const err = new Error('Only JPG, PNG or WEBP images are allowed.');
  err.statusCode = 400;
  cb(err);
};

const CONSULTATION_MAX_IMAGES = 4;

const consultationUploader = multer({
  storage: consultationStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: CONSULTATION_MAX_IMAGES },
  fileFilter: imageFilter,
}).array('images', CONSULTATION_MAX_IMAGES);

// Wrapper so multer errors become clean 400 JSON instead of a 500
const uploadConsultationImages = (req, res, next) => {
  consultationUploader(req, res, (err) => {
    if (!err) return next();
    let message = err.message || 'Image upload failed.';
    if (err.code === 'LIMIT_FILE_SIZE') message = 'Each image must be 5 MB or smaller.';
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE')
      message = `You can upload at most ${CONSULTATION_MAX_IMAGES} images.`;
    return res.status(400).json({ success: false, message });
  });
};

module.exports = { uploadExpertDocs, uploadConsultationImages, consultationDir };
