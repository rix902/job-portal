const Job = require('../models/Job');
const { validationResult } = require('express-validator');

// Create a job (Recruiter only)
exports.createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, company, location, salary } = req.body;

  try {
    const newJob = new Job({
      title,
      description,
      company, // company ID
      location,
      salary,
      recruiterId: req.user.id
    });

    const job = await newJob.save();
    res.status(201).json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all jobs (Public/JobSeeker)
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .populate('company', ['name', 'description'])
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', ['name', 'description']);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update a job (Recruiter who created it only)
exports.updateJob = async (req, res) => {
  const { title, description, company, location, salary, status } = req.body;

  // Build job object
  const jobFields = {};
  if (title) jobFields.title = title;
  if (description) jobFields.description = description;
  if (company) jobFields.company = company;
  if (location) jobFields.location = location;
  if (salary) jobFields.salary = salary;
  if (status) jobFields.status = status;

  try {
    let job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Make sure user owns job
    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: jobFields },
      { new: true }
    );

    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a job (Recruiter only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Make sure user owns job
    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get jobs by recruiter
exports.getJobsByRecruiter = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id })
      .populate('company', ['name'])
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
