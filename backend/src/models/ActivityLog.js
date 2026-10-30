const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actorName: {
    type: String,
    default: 'System'
  },
  actorEmail: {
    type: String,
    default: ''
  },
  actorRole: {
    type: String,
    enum: ['user', 'admin', 'system'],
    default: 'system'
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['book', 'contribution', 'category', 'user', 'auth', 'reading', 'system'],
    required: true
  },
  entityId: {
    type: String,
    default: ''
  },
  entityTitle: {
    type: String,
    default: ''
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);

