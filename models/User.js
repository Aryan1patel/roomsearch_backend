const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNo: {
    type: String,
    required: true,
    trim: true
  },
  currentHostelBlock: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  currentFloor: {
    type: String,
    required: true,
    trim: true
  },
  desiredHostelBlock: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  desiredFloor: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ currentHostelBlock: 1, currentFloor: 1 });
userSchema.index({ desiredHostelBlock: 1, desiredFloor: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
