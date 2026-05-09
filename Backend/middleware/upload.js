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
  { name: 'images', maxCount: 5 },

]);

const resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files || (!req.files.imageCover && !req.files.images)) return next();

  const uploadToCloudinary = (imageBuffer, folder, public_id) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id,
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

  // 1) Cover image
  if (req.files.imageCover) {
    const buffer = await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const result = await uploadToCloudinary(
      buffer, 
      'e-commerce/products', 
      `product-cover-${req.params.id || 'new'}-${Date.now()}`
    );
    req.body.imageCover = result.secure_url;
  }

  // 2) Images
  if (req.files.images) {
    // If updating, we might want to keep existing images if they are passed in req.body.images
    // But usually when uploading new files via multipart/form-data, Multer populates req.files.images
    // and the other images in req.body.images might be a string or array of strings.
    
    const existingImages = Array.isArray(req.body.images) 
      ? req.body.images 
      : (typeof req.body.images === 'string' ? [req.body.images] : []);

    const newImageUrls = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const buffer = await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toBuffer();

        const result = await uploadToCloudinary(
          buffer, 
          'e-commerce/products', 
          `product-gallery-${req.params.id || 'new'}-${Date.now()}-${i + 1}`
        );
        newImageUrls.push(result.secure_url);
      })
    );

    req.body.images = [...existingImages, ...newImageUrls].slice(0, 5);

  }

  next();
});


module.exports = {
  uploadProductImages,
  resizeProductImages,
  uploadUserPhoto,
  resizeUserPhoto,
};

