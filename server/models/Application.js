const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  drive: {
    type: mongoose.Schema.ObjectId,
    ref: 'PlacementDrive',
    required: true
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    default: 0
  },
  matchExplanation: {
    type: String
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'offered'],
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);
