const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register(req, res, next) {
  try {
    const { name, email, password, referralCode } = req.body;
    if (!name || !email || !password) {
      throw new ApiError(400, 'name, email and password are required');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, 'An account with this email already exists');

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) referredBy = referrer._id;
    }

    const passwordHash = await User.hashPassword(password);
    const myReferralCode = crypto.randomBytes(4).toString('hex');

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      referredBy,
      referralCode: myReferralCode,
    });

    res.status(201).json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, referralCode: user.referralCode },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, referralCode: user.referralCode },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
