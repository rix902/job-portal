const User = require('../models/User');
const Company = require('../models/Company');
const { validationResult } = require('express-validator');

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If recruiter, also fetch their company
    let company = null;
    if (user.role === 'recruiter') {
      company = await Company.findOne({ recruiterId: req.user.id });
    }

    res.json({ user, company });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { name, bio, skills, education, resume } = req.body;

  // Build profile object
  const profileFields = {};
  if (name) profileFields.name = name; // Top level
  
  profileFields.profile = {};
  if (bio) profileFields.profile.bio = bio;
  if (skills) {
    profileFields.profile.skills = Array.isArray(skills) 
      ? skills 
      : skills.split(',').map(skill => skill.trim());
  }
  if (education) profileFields.profile.education = education;
  if (resume) profileFields.profile.resume = resume;

  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update top level name if provided
    if (name) user.name = name;
    
    // Merge existing profile with new fields
    user.profile = { ...user.profile.toObject(), ...profileFields.profile };

    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create or update company profile (Recruiter only)
exports.createOrUpdateCompany = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, website, location } = req.body;

  const companyFields = {
    recruiterId: req.user.id,
    name,
    description,
    website,
    location
  };

  try {
    let company = await Company.findOne({ recruiterId: req.user.id });

    if (company) {
      // Update
      company = await Company.findOneAndUpdate(
        { recruiterId: req.user.id },
        { $set: companyFields },
        { new: true }
      );
      return res.json(company);
    }

    // Create
    company = new Company(companyFields);
    await company.save();

    // Update user's company reference
    await User.findByIdAndUpdate(req.user.id, { 'profile.companyId': company._id });

    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
