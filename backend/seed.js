require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Create admin
  const existingAdmin = await User.findOne({ email: 'admin@jobportal.com' });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: 'admin@jobportal.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin created: admin@jobportal.com / admin123');
  } else {
    console.log('ℹ Admin already exists');
  }

  // Create sample recruiter
  let recruiter = await User.findOne({ email: 'recruiter@techcorp.com' });
  if (!recruiter) {
    recruiter = await User.create({
      name: 'Alice Johnson',
      email: 'recruiter@techcorp.com',
      password: 'password123',
      role: 'recruiter',
      company: 'TechCorp Solutions',
    });
    console.log('✅ Sample recruiter created');
  }

  // Create sample seeker
  if (!(await User.findOne({ email: 'seeker@example.com' }))) {
    await User.create({
      name: 'Bob Smith',
      email: 'seeker@example.com',
      password: 'password123',
      role: 'seeker',
      skills: ['React', 'Node.js', 'MongoDB'],
      bio: 'Passionate full-stack developer with 3 years of experience.',
      location: 'Bangalore, India',
    });
    console.log('✅ Sample seeker created');
  }

  // Create sample jobs
  const jobCount = await Job.countDocuments();
  if (jobCount === 0) {
    const jobs = [
      {
        title: 'Senior React Developer',
        company: 'TechCorp Solutions',
        location: 'Bangalore, India',
        type: 'full-time',
        category: 'Technology',
        experience: '2-5 years',
        salary: { min: 1200000, max: 2000000, period: 'yearly' },
        description: 'We are looking for an experienced React developer to join our growing team. You will work on cutting-edge web applications serving millions of users.',
        requirements: ['3+ years of React experience', 'Strong TypeScript skills', 'Experience with REST APIs', 'Agile/Scrum methodology'],
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        postedBy: recruiter._id,
      },
      {
        title: 'UI/UX Designer',
        company: 'DesignHub',
        location: 'Remote',
        type: 'remote',
        category: 'Design',
        experience: '1-2 years',
        salary: { min: 600000, max: 1000000, period: 'yearly' },
        description: 'Join our creative team to design beautiful, intuitive interfaces for our SaaS products. You\'ll collaborate with product managers and engineers.',
        requirements: ['Proficiency in Figma', 'Portfolio of web/mobile designs', 'User research experience'],
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        postedBy: recruiter._id,
      },
      {
        title: 'Backend Engineer (Node.js)',
        company: 'StartupX',
        location: 'Mumbai, India',
        type: 'full-time',
        category: 'Technology',
        experience: '2-5 years',
        salary: { min: 900000, max: 1500000, period: 'yearly' },
        description: 'Build robust backend services and APIs for our rapidly growing platform. You\'ll own critical infrastructure components.',
        requirements: ['Strong Node.js expertise', 'MongoDB/PostgreSQL experience', 'Docker & Kubernetes basics', 'System design knowledge'],
        skills: ['Node.js', 'MongoDB', 'Docker', 'AWS', 'Redis'],
        postedBy: recruiter._id,
      },
      {
        title: 'Data Analyst',
        company: 'Analytics Pro',
        location: 'Hyderabad, India',
        type: 'full-time',
        category: 'Technology',
        experience: '1-2 years',
        salary: { min: 500000, max: 800000, period: 'yearly' },
        description: 'Analyze complex datasets to provide actionable business insights. Work with stakeholders to define KPIs and build dashboards.',
        requirements: ['SQL proficiency', 'Python/R for data analysis', 'Experience with Tableau or PowerBI', 'Statistical analysis skills'],
        skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
        postedBy: recruiter._id,
      },
      {
        title: 'Marketing Manager',
        company: 'GrowthCo',
        location: 'Delhi, India',
        type: 'full-time',
        category: 'Marketing',
        experience: '2-5 years',
        salary: { min: 800000, max: 1200000, period: 'yearly' },
        description: 'Lead our digital marketing efforts across multiple channels. Drive user acquisition, retention, and brand awareness.',
        requirements: ['3+ years in digital marketing', 'Experience with Google Ads/Meta Ads', 'Strong analytical mindset', 'SEO/SEM expertise'],
        skills: ['Digital Marketing', 'SEO', 'Google Ads', 'Content Strategy', 'Analytics'],
        postedBy: recruiter._id,
      },
      {
        title: 'Frontend Developer Intern',
        company: 'InnovateTech',
        location: 'Pune, India',
        type: 'internship',
        category: 'Technology',
        experience: 'fresher',
        salary: { min: 15000, max: 25000, period: 'monthly' },
        description: 'Great opportunity for fresh graduates to kick-start their career in web development. You\'ll work on real projects with mentorship from senior developers.',
        requirements: ['Knowledge of HTML, CSS, JavaScript', 'Basic React knowledge', 'Eagerness to learn'],
        skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        postedBy: recruiter._id,
      },
    ];

    await Job.insertMany(jobs);
    console.log('✅ 6 sample jobs created');
  }

  console.log('\n🎉 Seed complete! You can now login with:\n');
  console.log('  Admin:     admin@jobportal.com    / admin123');
  console.log('  Recruiter: recruiter@techcorp.com / password123');
  console.log('  Seeker:    seeker@example.com     / password123\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
