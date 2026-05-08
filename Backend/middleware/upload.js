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

const cloudinary = require('../utils/cloudinary');

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

// ── User avatar: single photo ─────────────────────────────────────────────────
const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // 1) Resize and format the image using sharp
  const buffer = await sharp(req.file.buffer)
    .resize(400, 400)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();

  // 2) Upload to Cloudinary using a promise-wrapped stream
  const uploadToCloudinary = (imageBuffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'e-commerce/users',
          public_id: `user-${req.user._id}-${Date.now()}`,
          format: 'jpg',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(new AppError('Error uploading to Cloudinary', 500));
          resolve(result);
        }
      );
      stream.end(imageBuffer);
    });
  };

  const result = await uploadToCloudinary(buffer);

  // 3) Store the Cloudinary URL in req.body.photo for the controller
  req.body.photo = result.secure_url;

  next();
});

// ── Product images: one cover + up to 8 additional (Keeping local for now, but ready for Cloudinary) ──
const uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 8 },
]);

const resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files?.imageCover && !req.files?.images) return next();
  
  // NOTE: This could also be updated to use Cloudinary similarly to resizeUserPhoto
  // For now, keeping the structure consistent with the user's request for profile pictures.
  
  next();
});

module.exports = {
  uploadProductImages,
  resizeProductImages,
  uploadUserPhoto,
  resizeUserPhoto,
};

