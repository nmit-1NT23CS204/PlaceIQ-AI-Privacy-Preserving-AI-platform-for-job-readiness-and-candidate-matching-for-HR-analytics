const mongoose = require('mongoose');

const ResumeProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  resumeUrl: {
    type: String
  },
  skills: {
    type: [String]
  },
  embedding: {
    type: [Number]
  },
  academicRecord: {
    cgpa: Number,
    backlogs: {
      type: Number,
      default: 0
    }
  },
  readinessScore: {
    type: Number,
    default: 0
  },
  readinessHistory: [{
    score: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  skillGaps: [{
    domain: String,
    gapPercentage: Number,
    suggestion: String
  }],
  interviewFeedback: [{
    text: String,
    competencies: [String],
    sentiment: String,
    summary: String,
    scoreImpact: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ResumeProfile', ResumeProfileSchema);
