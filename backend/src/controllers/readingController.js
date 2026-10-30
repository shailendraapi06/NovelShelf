const { Reading } = require('../services/store');

exports.getProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id || req.user.id;
    const progress = await Reading.getProgress(userId, bookId);
    res.json({
      success: true,
      progress: progress || {
        bookId,
        currentPage: 1,
        totalPages: 100,
        percent: 0,
        chapter: 'Chapter I',
        spreadIndex: 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id || req.user.id;
    const { currentPage, totalPages, chapter, spreadIndex } = req.body;

    const progress = await Reading.saveProgress(userId, bookId, {
      currentPage: Number(currentPage) || 1,
      totalPages: Number(totalPages) || 100,
      percent: Math.min(100, Math.round(((Number(currentPage) || 1) / (Number(totalPages) || 100)) * 100)),
      chapter: chapter || 'Chapter I',
      spreadIndex: Number(spreadIndex) || 0
    });

    res.json({
      success: true,
      message: 'Reading progress synchronized.',
      progress
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const { bookId } = req.query;
    const userId = req.user._id || req.user.id;
    const bookmarks = await Reading.getBookmarks(userId, bookId);
    res.json({
      success: true,
      bookmarks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addBookmark = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { bookId, page, chapter, note } = req.body;

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'bookId is required.' });
    }

    const bm = await Reading.addBookmark(userId, bookId, {
      page: Number(page) || 1,
      chapter: chapter || '',
      note: note || ''
    });

    res.status(201).json({
      success: true,
      message: 'Archival bookmark placed.',
      bookmark: bm
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { bookId, page } = req.params;

    await Reading.removeBookmark(userId, bookId, page ? Number(page) : null);
    res.json({
      success: true,
      message: 'Bookmark removed.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

