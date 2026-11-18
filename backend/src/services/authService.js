const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      name: user.name
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
};

const getCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  };
};

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.isOperational = true;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password
  });

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token
  };
};

module.exports = {
  registerUser,
  loginUser,
  generateToken,
  getCookieOptions
};
