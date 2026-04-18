const Application = require('../models/Application');
const Job = require('../models/Job');

// Apply to a job (JobSeeker only)
exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      userId: req.user.id,
      jobId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      userId: req.user.id,
      jobId
    });

    await application.save();

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get user's applications (JobSeeker only)
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate({
        path: 'jobId',
        populate: {
          path: 'company',
          model: 'Company',
          select: 'name'
        }
      })
      .sort({ appliedDate: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get applicants for a job (Recruiter only)
exports.getJobApplicants = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to view applicants for this job' });
    }

    const applications = await Application.find({ jobId })
      .populate('userId', ['name', 'email', 'profile'])
      .sort({ appliedDate: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update application status (Recruiter only)
exports.updateApplicationStatus = async (req, res) => {
  const { status } = req.body;

  try {
    let application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the job related to this application
    if (application.jobId.recruiterId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
