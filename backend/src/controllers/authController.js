const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Users, ActivityLogs } = require('../services/store');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'novelshelf_super_secret_jwt_key_2026_literary_sanctuary';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.'
      });
    }

    const existing = await Users.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An archival account with this email address already exists.'
      });
    }

    const newUser = await Users.create({
      name,
      email,
      password,
      role: 'user',
      status: 'active'
    });

    const token = generateToken(newUser);

    await ActivityLogs.create({
      actorId: newUser._id,
      actorName: newUser.name,
      actorEmail: newUser.email,
      actorRole: newUser.role,
      action: 'USER_REGISTER',
      entityType: 'auth',
      entityId: newUser._id,
      entityTitle: newUser.name,
      details: { email: newUser.email },
      ipAddress: req.ip || ''
    });

    res.status(201).json({
      success: true,
      message: 'Account successfully registered in the NovelShelf sanctuary.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error registering account.',
      error: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const userWithPass = await Users.findOne({ email }, true);
    if (!userWithPass) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const isMatch = await bcrypt.compare(password, userWithPass.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    if (userWithPass.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This archival account has been suspended. Please contact the administrator.'
      });
    }

    const { password: _, ...safeUser } = userWithPass;
    const token = generateToken(safeUser);

    await ActivityLogs.create({
      actorId: safeUser._id,
      actorName: safeUser.name,
      actorEmail: safeUser.email,
      actorRole: safeUser.role,
      action: 'USER_LOGIN',
      entityType: 'auth',
      entityId: safeUser._id,
      entityTitle: safeUser.name,
      details: { role: safeUser.role },
      ipAddress: req.ip || ''
    });

    res.json({
      success: true,
      message: 'Authentication successful. Welcome back to NovelShelf.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      error: err.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await Users.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar) updates.avatar = avatar;

    const updated = await Users.updateById(req.user._id || req.user.id, updates);
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Session closed successfully.'
  });
};

