const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  evaluator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  drive: {
    type: mongoose.Schema.ObjectId,
    ref: 'PlacementDrive'
  },
  feedbackText: {
    type: String,
    required: true
  },
  competencies: [String],
  sentiment: String,
  aiSummary: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
