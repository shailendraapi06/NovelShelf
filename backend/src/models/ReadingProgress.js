const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: String,
    required: true
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 100
  },
  percent: {
    type: Number,
    default: 0
  },
  chapter: {
    type: String,
    default: 'Chapter I'
  },
  spreadIndex: {
    type: Number,
    default: 0
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

readingProgressSchema.index({ user: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);

