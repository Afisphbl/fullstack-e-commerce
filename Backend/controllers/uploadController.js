"use strict";
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const cloudinary = require("../utils/cloudinary");
const crypto = require("crypto");

const memStorage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new AppError("Not an image.", 400), false);
};

const upload = multer({
  storage: memStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limits
});

exports.uploadImage = upload.single("image");

exports.resizeAndUploadToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file)
    return next(new AppError("Please provide an image file.", 400));

  const buffer = await sharp(req.file.buffer)
    .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
    .toFormat("webp") // Format conversion to webp for modern browsers
    .webp({ quality: 90 })
    .toBuffer();

  const uploadToCloudinary = (imageBuffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "e-commerce/general",
          format: "webp",
          resource_type: "image",
          public_id: `upload-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        },
        (error, result) => {
          if (error)
            return reject(new AppError("Error uploading to Cloudinary", 500));
          resolve(result);
        },
      );
      stream.end(imageBuffer);
    });
  };

  const result = await uploadToCloudinary(buffer);

  res.status(200).json({ status: "success", url: result.secure_url });
});
