const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Create or find users
    let recruiter = await User.findOne({ email: 'demo.recruiter@example.com' });
    if (!recruiter) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      recruiter = new User({
        name: 'Demo Recruiter',
        email: 'demo.recruiter@example.com',
        password: hashedPassword,
        role: 'recruiter'
      });
      await recruiter.save();
      console.log('Demo recruiter created');
    }

    let jobseeker = await User.findOne({ email: 'demo.jobseeker@example.com' });
    if (!jobseeker) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      jobseeker = new User({
        name: 'Demo Jobseeker',
        email: 'demo.jobseeker@example.com',
        password: hashedPassword,
        role: 'jobseeker',
        profile: {
          skills: ['React', 'Node.js', 'Javascript', 'MongoDB', 'Tailwind']
        }
      });
      await jobseeker.save();
      console.log('Demo jobseeker created');
    }

    // Create a company
    const company = new Company({
      name: 'TechCorp Solutions',
      description: 'A leading technology company specializing in AI and cloud computing.',
      website: 'https://techcorp.example.com',
      location: 'San Francisco, CA',
      recruiterId: recruiter._id
    });
    await company.save();
    console.log('Company created');

    // Create some jobs
    const jobs = [
      {
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced React developer to lead our frontend team. You should have strong skills in Javascript, React, and Tailwind CSS.',
        company: company._id,
        location: 'Remote',
        salary: '$120,000 - $150,000',
        recruiterId: recruiter._id
      },
      {
        title: 'Software Engineer (Java)',
        description: 'Join our team in Bangalore to build enterprise-grade applications. Strong knowledge of Spring Boot and Microservices is required.',
        company: company._id,
        location: 'Bangalore, India',
        salary: '₹18,00,000 - ₹25,00,000',
        recruiterId: recruiter._id
      },
      {
        title: 'Full Stack Developer',
        description: 'Work on cutting-edge MERN stack projects in the heart of Bangalore. Experience with Node.js and React is a must.',
        company: company._id,
        location: 'Bangalore, India',
        salary: '₹15,00,000 - ₹22,00,000',
        recruiterId: recruiter._id
      },
      {
        title: 'Backend Engineer (Node.js)',
        description: 'Join our backend team to build scalable APIs using Node.js, Express, and MongoDB. Experience with microservices is a plus.',
        company: company._id,
        location: 'New York, NY',
        salary: '$110,000 - $140,000',
        recruiterId: recruiter._id
      },
      {
        title: 'Data Scientist',
        description: 'Analyze large datasets and build machine learning models for our Bangalore office. Proficiency in Python and SQL is essential.',
        company: company._id,
        location: 'Bangalore, India',
        salary: '₹20,00,000 - ₹30,00,000',
        recruiterId: recruiter._id
      },
      {
        title: 'UI/UX Designer',
        description: 'Creative designer needed to craft beautiful user experiences for our flagship products. Proficiency in Figma and Adobe Creative Suite is required.',
        company: company._id,
        location: 'San Francisco, CA',
        salary: '$90,000 - $120,000',
        recruiterId: recruiter._id
      }
    ];

    await Job.insertMany(jobs);
    console.log('Jobs created');

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
