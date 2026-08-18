const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: { 
    type: String, 
    enum: ['base', 'tailored'], 
    required: true 
  },
  applicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application',
    default: null
  },
  structuredContent: {
    summary: { type: String },
    skills: [{ type: String }],
    projects: [{ 
      title: { type: String }, 
      description: { type: String }, 
      tech: [{ type: String }] 
    }],
    experience: [{ 
      title: { type: String }, 
      company: { type: String }, 
      bullets: [{ type: String }] 
    }],
    education: [{ 
      degree: { type: String }, 
      institute: { type: String }, 
      year: { type: String } 
    }],
    overallScore: { type: Number },
    suggestions: [{ type: String }]
  },
  fileUrl: { type: String }
}, {
  timestamps: true
});

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
