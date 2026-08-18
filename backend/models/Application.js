const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  company: { type: String, required: true },
  role: { type: String, required: true },
  website: { type: String, default: '' },
  platform: { 
    type: String, 
    enum: ['LinkedIn', 'Naukri', 'Internshala', 'Wellfound', 'Cutshort', 'Indeed', 'Other'],
    default: 'Other'
  },
  appliedDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Applied', 'OA', 'Interview_R1', 'Interview_R2', 'Offer', 'Rejected'],
    default: 'Applied'
  },
  jobDescription: { type: String },
  extractedSkills: [{ type: String }],
  matchScore: { type: Number },
  missingSkills: [{ type: String }],
  tailoredResumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  followUpSent: { type: Boolean, default: false },
  lastFollowUpDate: { type: Date },
  interviewDate: { type: Date },
  interviewReminderSent: { type: Boolean, default: false },
  timeline: [{
    stage: { type: String },
    date: { type: Date, default: Date.now },
    notes: { type: String }
  }]
}, {
  timestamps: true
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
