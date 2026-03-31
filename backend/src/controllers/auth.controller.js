import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateAccessToken } from '../utils/generateToken.js';
import { successResponse } from '../utils/apiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('Email already registered', 400);

  const allowedRoles = ['student', 'instructor'];
  const userRole = allowedRoles.includes(role) ? role : 'student';

  const user = await User.create({ name, email, password, role: userRole });
  const token = generateAccessToken(user._id);

  successResponse(res, { user: user.toPublicJSON(), token }, 'Registered successfully', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) throw new AppError('Invalid credentials', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  if (user.isBanned) throw new AppError('Account has been banned', 403);

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateAccessToken(user._id);

  successResponse(res, { user: user.toPublicJSON(), token }, 'Login successful');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'title thumbnail price rating slug');
  successResponse(res, { user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, headline, website, socialLinks, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, bio, headline, website, socialLinks, avatar },
    { new: true, runValidators: true }
  );
  successResponse(res, { user }, 'Profile updated');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new AppError('Current password incorrect', 400);

  user.password = newPassword;
  await user.save();

  const token = generateAccessToken(user._id);
  successResponse(res, { token }, 'Password changed');
});