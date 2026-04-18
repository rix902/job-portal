const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  applyForJob,
  getUserApplications,
  getJobApplicants,
  updateApplicationStatus
} = require('../controllers/applicationController');

// @route   POST api/applications/apply/:jobId
// @desc    Apply for a job
// @access  Private (JobSeeker)
router.post('/apply/:jobId', auth, roleCheck(['jobseeker']), applyForJob);

// @route   GET api/applications/me
// @desc    Get user's applications
// @access  Private (JobSeeker)
router.get('/me', auth, roleCheck(['jobseeker']), getUserApplications);

// @route   GET api/applications/job/:jobId
// @desc    Get applicants for a job
// @access  Private (Recruiter)
router.get('/job/:jobId', auth, roleCheck(['recruiter']), getJobApplicants);

// @route   PUT api/applications/:id
// @desc    Update application status
// @access  Private (Recruiter)
router.put('/:id', auth, roleCheck(['recruiter']), updateApplicationStatus);

module.exports = router;
