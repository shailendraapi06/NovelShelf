const fs = require('fs');
const path = require('path');
const { Books, Categories } = require('../services/store');

// Public: Browse books with search & filters
exports.getBooks = async (req, res) => {
  try {
    const { search, category, genre, era, featured, limit = 50, page = 1 } = req.query;

    let books = await Books.find({ status: 'published' });

    if (search) {
      const q = search.toLowerCase().trim();
      books = books.filter(b => 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.genre && b.genre.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.synopsis && b.synopsis.toLowerCase().includes(q)) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      books = books.filter(b => 
        (b.category && b.category.toLowerCase() === catLower) ||
        (b.genre && b.genre.toLowerCase() === catLower)
      );
    }

    if (genre && genre !== 'all') {
      const gLower = genre.toLowerCase();
      books = books.filter(b => b.genre && b.genre.toLowerCase().includes(gLower));
    }

    if (era) {
      books = books.filter(b => b.era && b.era.toLowerCase() === era.toLowerCase());
    }

    if (featured === 'true') {
      books = books.filter(b => b.isFeatured || b.isStaffPick);
    }

    const total = books.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedBooks = books.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      books: paginatedBooks
    });
  } catch (err) {
    console.error('[Books] Error fetching books:', err);
    res.status(500).json({ success: false, message: 'Error retrieving book catalogue.', error: err.message });
  }
};

// Public: Get book by ID or Slug
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Books.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Archival book folio not found.'
      });
    }

    res.json({
      success: true,
      book
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Protected: Get Book Content / Stream PDF for Reading Room
// Strictly requires authentication!
exports.getBookContent = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Books.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found for reading session.'
      });
    }

    // If book has an uploaded PDF file, stream it with range request support
    if (book.pdfFile && book.pdfFile.filePath && fs.existsSync(book.pdfFile.filePath)) {
      const filePath = book.pdfFile.filePath;
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'application/pdf',
        };
        res.writeHead(206, head);
        file.pipe(res);
        return;
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    // Otherwise return digital excerpts & sample spreads for Reading Room
    res.json({
      success: true,
      book: {
        id: book.slug || book.id || book._id,
        title: book.title,
        subtitle: book.subtitle,
        author: book.author,
        pages: book.pages,
        sampleSpreads: book.sampleSpreads || []
      }
    });
  } catch (err) {
    console.error('[Books] Error serving content:', err);
    res.status(500).json({ success: false, message: 'Error streaming book content.', error: err.message });
  }
};

