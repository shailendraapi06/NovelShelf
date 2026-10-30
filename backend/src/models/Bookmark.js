const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: String,
    required: true
  },
  page: {
    type: Number,
    default: 1
  },
  chapter: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

bookmarkSchema.index({ user: 1, bookId: 1, page: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);

