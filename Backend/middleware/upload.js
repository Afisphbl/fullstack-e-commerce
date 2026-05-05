'use strict';

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ── Ensure upload dirs exist ──────────────────────────────────────────────────
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const UPLOAD_ROOT = path.join(__dirname, '..', 'public', 'uploads');
ensureDir(path.join(UPLOAD_ROOT, 'products'));
ensureDir(path.join(UPLOAD_ROOT, 'users'));

// ── Multer — memory storage (we process with sharp before writing) ─────────────
const memStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload only image files.', 400), false);
  }
};

const upload = multer({
  storage: memStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── Product images: one cover + up to 8 additional ───────────────────────────
const uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 8 },
]);

const resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files?.imageCover && !req.files?.images) return next();

  const dir = path.join(UPLOAD_ROOT, 'products');

  // 1) Cover image
  if (req.files.imageCover) {
    req.body.imageCover = `product-cover-${req.params.id || Date.now()}-${Date.now()}.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(1200, 800)
      .toFormat('jpeg')
      .jpeg({ quality: 85 })
      .toFile(path.join(dir, req.body.imageCover));
  }

  // 2) Gallery images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `product-${req.params.id || Date.now()}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(800, 800)
          .toFormat('jpeg')
          .jpeg({ quality: 80 })
          .toFile(path.join(dir, filename));
        req.body.images.push(filename);
      })
    );
  }

  next();
});

// ── User avatar: single photo ─────────────────────────────────────────────────
const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const dir = path.join(UPLOAD_ROOT, 'users');
  req.body.photo = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(400, 400)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(path.join(dir, req.body.photo));

  next();
});

module.exports = {
  uploadProductImages,
  resizeProductImages,
  uploadUserPhoto,
  resizeUserPhoto,
};
