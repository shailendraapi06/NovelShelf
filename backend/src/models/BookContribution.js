const mongoose = require('mongoose');

const bookContributionSchema = new mongoose.Schema({
  contributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contributorName: {
    type: String,
    required: true
  },
  contributorEmail: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  genre: {
    type: String,
    default: 'Fiction'
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  pages: {
    type: Number,
    default: 150
  },
  edition: {
    type: String,
    default: 'Digitized Archival Edition'
  },
  license: {
    type: String,
    required: [true, 'Rights & license declaration is required'],
    default: 'Public Domain / Open Access'
  },
  rightsConfirmed: {
    type: Boolean,
    default: true
  },
  synopsis: {
    type: String,
    required: [true, 'Synopsis / summary is required']
  },
  pdfFile: {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    isQuarantined: { type: Boolean, default: true }
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected'],
    default: 'under_review'
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  publishedBookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BookContribution', bookContributionSchema);

