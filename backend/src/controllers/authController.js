const authService = require('../services/authService');
const { successResponse } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });

    res.cookie('token', token, authService.getCookieOptions());

    return successResponse(
      res,
      { user, token },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    res.cookie('token', token, authService.getCookieOptions());

    return successResponse(
      res,
      { user, token },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  const { maxAge, ...clearOptions } = authService.getCookieOptions();
  res.clearCookie('token', clearOptions);
  return successResponse(res, null, 'Logged out successfully');
};

const getMe = async (req, res) => {
  return successResponse(res, { user: req.user.toJSON() }, 'User profile retrieved');
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
