const User = require('../models/User');
const jwtUtils = require('../utils/jwtUtils');

exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwtUtils.generateToken({ userId: user._id });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err });
  }
};
