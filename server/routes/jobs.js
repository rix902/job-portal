const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByRecruiter
} = require('../controllers/jobController');

// @route   GET api/jobs
// @desc    Get all active jobs
// @access  Public
router.get('/', getJobs);

// @route   GET api/jobs/recruiter
// @desc    Get jobs posted by logged-in recruiter
// @access  Private (Recruiter)
router.get('/recruiter', auth, roleCheck(['recruiter']), getJobsByRecruiter);

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', getJobById);

// @route   POST api/jobs
// @desc    Create a job
// @access  Private (Recruiter)
router.post(
  '/',
  [
    auth,
    roleCheck(['recruiter']),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('company', 'Company ID is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('salary', 'Salary is required').not().isEmpty()
    ]
  ],
  createJob
);

// @route   PUT api/jobs/:id
// @desc    Update a job
// @access  Private (Recruiter)
router.put('/:id', auth, roleCheck(['recruiter']), updateJob);

// @route   DELETE api/jobs/:id
// @desc    Delete a job
// @access  Private (Recruiter)
router.delete('/:id', auth, roleCheck(['recruiter']), deleteJob);

module.exports = router;
