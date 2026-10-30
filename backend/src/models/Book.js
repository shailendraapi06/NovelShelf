const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  translator: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  genre: {
    type: String,
    default: 'Literary Prose'
  },
  era: {
    type: String,
    default: '20th Century'
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  pages: {
    type: Number,
    default: 250
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  readingLogs: {
    type: Number,
    default: 0
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
  },
  spineGradient: {
    type: String,
    default: 'from-primary via-primary-container to-primary'
  },
  spineText: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  synopsis: {
    type: String,
    required: [true, 'Synopsis is required']
  },
  synopsisExtended: {
    type: String,
    default: ''
  },
  quote: {
    type: String,
    default: ''
  },
  quoteAuthor: {
    type: String,
    default: ''
  },
  format: {
    type: [String],
    default: ['digital']
  },
  provenanceTag: {
    type: String,
    default: 'Ex-Libris Verified Archive'
  },
  language: {
    type: String,
    default: 'English'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isStaffPick: {
    type: Boolean,
    default: false
  },
  badge: {
    type: String,
    default: 'Archival Folio'
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published'
  },
  pdfFile: {
    originalName: String,
    filename: String,
    filePath: String,
    fileSize: Number,
    mimeType: { type: String, default: 'application/pdf' },
    uploadedAt: Date
  },
  sampleSpreads: {
    type: Array,
    default: []
  },
  contributedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);

