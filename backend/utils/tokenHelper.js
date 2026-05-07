const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      resumeUrl: user.resumeUrl,
      company: user.company,
      location: user.location,
      bio: user.bio,
      skills: user.skills,
      phone: user.phone,
    },
  });
};

module.exports = { generateToken, sendTokenResponse };
