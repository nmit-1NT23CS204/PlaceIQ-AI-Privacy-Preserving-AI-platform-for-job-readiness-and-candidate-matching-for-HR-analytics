const mongoose = require('mongoose');

const PlacementDriveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  jdText: {
    type: String,
    required: true
  },
  eligibilityCriteria: {
    minCgpa: Number,
    maxBacklogs: Number,
    allowedBranches: [String]
  },
  deadline: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'completed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlacementDrive', PlacementDriveSchema);
