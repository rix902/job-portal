const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getProfile,
  updateProfile,
  createOrUpdateCompany
} = require('../controllers/profileController');

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', auth, getProfile);

// @route   PUT api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, updateProfile);

// @route   POST api/profile/company
// @desc    Create or update company profile
// @access  Private (Recruiter)
router.post(
  '/company',
  [
    auth,
    roleCheck(['recruiter']),
    [
      check('name', 'Company name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  createOrUpdateCompany
);

module.exports = router;
