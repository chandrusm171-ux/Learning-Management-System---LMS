import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// Upload image (thumbnail)
router.post('/image', protect, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw new Error('No file uploaded');

  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'lms-pro/thumbnails',
    transformation: [{ width: 1280, height: 720, crop: 'fill' }],
  });

  successResponse(res, {
    url: result.secure_url,
    publicId: result.public_id,
  }, 'Image uploaded');
}));

// Upload video
router.post('/video', protect, restrictTo('instructor', 'admin'), upload.single('video'), asyncHandler(async (req, res) => {
  if (!req.file) throw new Error('No file uploaded');

  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    resource_type: 'video',
    folder: 'lms-pro/videos',
    eager: [{ format: 'mp4', quality: 'auto' }],
    eager_async: true,
  });

  successResponse(res, {
    url: result.secure_url,
    publicId: result.public_id,
    duration: Math.round(result.duration || 0),
    thumbnail: result.secure_url.replace(/\.[^/.]+$/, '.jpg'),
  }, 'Video uploaded');
}));

// Delete from cloudinary
router.delete('/delete', protect, asyncHandler(async (req, res) => {
  const { publicId, resourceType = 'image' } = req.body;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  successResponse(res, null, 'Deleted');
}));

export default router;