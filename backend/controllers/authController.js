import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register User
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: '❌ Saari fields bharo' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: '❌ Email pehle se registered hai' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: '✅ Registration successful!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '❌ Email aur password dono do' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: '❌ Email ya password galat hai' });
    }

    res.json({
      message: '✅ Login successful!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Profile
export const getProfile = async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
};