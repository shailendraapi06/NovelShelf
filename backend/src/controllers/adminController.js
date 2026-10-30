const fs = require('fs');
const path = require('path');
const {
  Users,
  Books,
  Categories,
  Contributions,
  ActivityLogs,
  Reading
} = require('../services/store');
const { BOOKS_DIR } = require('../middleware/upload');

// 1. Dashboard Overview Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await Users.count();
    const activeUsers = await Users.count({ status: 'active' });
    const suspendedUsers = await Users.count({ status: 'suspended' });
    const adminCount = await Users.count({ role: 'admin' });

    const totalBooks = await Books.count();
    const publishedBooks = await Books.count({ status: 'published' });
    const draftBooks = await Books.count({ status: 'draft' });

    const pendingContributions = await Contributions.count({ status: 'under_review' });
    const totalContributions = await Contributions.count();

    const recentLogs = await ActivityLogs.find({}, 8);
    const categories = await Categories.find();

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, admins: adminCount },
        books: { total: totalBooks, published: publishedBooks, drafts: draftBooks },
        contributions: { pending: pendingContributions, total: totalContributions },
        categoriesCount: categories.length
      },
      recentLogs
    });
  } catch (err) {
    console.error('[Admin] Dashboard stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Book Management
exports.getAdminBooks = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let books = await Books.find();

    if (status && status !== 'all') {
      books = books.filter(b => b.status === status);
    }
    if (category && category !== 'all') {
      books = books.filter(b => b.category === category || b.categoryName === category);
    }
    if (search) {
      const q = search.toLowerCase();
      books = books.filter(b => 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAdminBook = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      author,
      category,
      genre,
      era,
      year,
      pages,
      synopsis,
      synopsisExtended,
      quote,
      quoteAuthor,
      status,
      isFeatured,
      isStaffPick,
      badge,
      coverUrl
    } = req.body;

    if (!title || !author || !category || !synopsis) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, category, and synopsis are mandatory.'
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 1000);

    let pdfData = null;
    let coverImage = coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800';

    if (req.files) {
      if (req.files.pdf && req.files.pdf[0]) {
        const file = req.files.pdf[0];
        pdfData = {
          originalName: file.originalname,
          filename: file.filename,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date()
        };
      }
      if (req.files.cover && req.files.cover[0]) {
        coverImage = `/uploads/covers/${req.files.cover[0].filename}`;
      }
    }

    const newBook = await Books.create({
      title,
      slug,
      subtitle: subtitle || '',
      author,
      category,
      genre: genre || category,
      era: era || '20th Century',
      year: year ? Number(year) : new Date().getFullYear(),
      pages: pages ? Number(pages) : 250,
      synopsis,
      synopsisExtended: synopsisExtended || '',
      quote: quote || '',
      quoteAuthor: quoteAuthor || '',
      status: status || 'published',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isStaffPick: isStaffPick === 'true' || isStaffPick === true,
      badge: badge || 'Archival Volume',
      coverImage,
      pdfFile: pdfData,
      contributedBy: req.user._id || req.user.id
    });

    await ActivityLogs.create({
      actorId: req.user._id || req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'BOOK_CREATED',
      entityType: 'book',
      entityId: newBook._id || newBook.id,
      entityTitle: newBook.title,
      details: { author: newBook.author, category: newBook.category },
      ipAddress: req.ip || ''
    });

    res.status(201).json({
      success: true,
      message: 'New archival volume successfully cataloged.',
      book: newBook
    });
  } catch (err) {
    console.error('[Admin] Book creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAdminBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Handle uploaded files if any
    if (req.files) {
      if (req.files.pdf && req.files.pdf[0]) {
        const file = req.files.pdf[0];
        updates.pdfFile = {
          originalName: file.originalname,
          filename: file.filename,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date()
        };
      }
      if (req.files.cover && req.files.cover[0]) {
        updates.coverImage = `/uploads/covers/${req.files.cover[0].filename}`;
      }
    }

    const updated = await Books.updateById(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    await ActivityLogs.create({
      actorId: req.user._id || req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'BOOK_UPDATED',
      entityType: 'book',
      entityId: id,
      entityTitle: updated.title,
      details: { updatedFields: Object.keys(updates) },
      ipAddress: req.ip || ''
    });

    res.json({
      success: true,
      message: 'Archival book folio updated.',
      book: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAdminBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Books.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    await ActivityLogs.create({
      actorId: req.user._id || req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'BOOK_DELETED',
      entityType: 'book',
      entityId: id,
      entityTitle: deleted.title,
      details: { author: deleted.author },
      ipAddress: req.ip || ''
    });

    res.json({
      success: true,
      message: 'Book folio permanently decommissioned from library shelves.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Category Management
exports.createAdminCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newCat = await Categories.create({
      name,
      slug,
      description: description || '',
      icon: icon || 'auto_stories'
    });

    await ActivityLogs.create({
      actorId: req.user._id || req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'CATEGORY_CREATED',
      entityType: 'category',
      entityId: newCat._id || newCat.id,
      entityTitle: newCat.name,
      ipAddress: req.ip || ''
    });

    res.status(201).json({
      success: true,
      message: 'New archival alcove category created.',
      category: newCat
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAdminCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Categories.updateById(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await ActivityLogs.create({
      actorId: req.user._id || req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'CATEGORY_UPDATED',
      entityType: 'category',
      entityId: id,
      entityTitle: updated.name,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'Category updated.', category: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAdminCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Categories.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await ActivityLogs.create({
      actorId: req.user._id || req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'CATEGORY_DELETED',
      entityType: 'category',
      entityId: id,
      entityTitle: deleted.name,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'Category removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Contribution Review Queue
exports.getAdminContributions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    const list = await Contributions.find(filter);
    res.json({ success: true, contributions: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve or Reject Contribution
exports.reviewContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reviewNotes, category, title, author } = req.body;

    const contrib = await Contributions.findById(id);
    if (!contrib) {
      return res.status(404).json({ success: false, message: 'Contribution submission not found.' });
    }

    if (action === 'approve') {
      // 1. Move quarantined PDF to published books folder
      let publishedPdfPath = contrib.pdfFile.filePath;
      let publishedFilename = contrib.pdfFile.filename;

      if (fs.existsSync(contrib.pdfFile.filePath)) {
        publishedFilename = `pub_${Date.now()}_${contrib.pdfFile.filename.replace('quarantine_', '')}`;
        publishedPdfPath = path.join(BOOKS_DIR, publishedFilename);
        fs.copyFileSync(contrib.pdfFile.filePath, publishedPdfPath);
      }

      // 2. Create official published book in main catalogue
      const finalTitle = title || contrib.title;
      const finalAuthor = author || contrib.author;
      const finalCategory = category || contrib.genre || 'Fiction';
      const slug = finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 1000);

      const publishedBook = await Books.create({
        title: finalTitle,
        slug,
        subtitle: `Contributed by patron ${contrib.contributorName}`,
        author: finalAuthor,
        category: finalCategory,
        genre: contrib.genre,
        year: contrib.year,
        pages: contrib.pages,
        synopsis: contrib.synopsis,
        badge: 'Community Patron Folio',
        provenanceTag: `Patron Archive #${contrib._id.toString().slice(-4)}`,
        status: 'published',
        coverImage: contrib.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
        pdfFile: {
          originalName: contrib.pdfFile.originalName,
          filename: publishedFilename,
          filePath: publishedPdfPath,
          fileSize: contrib.pdfFile.fileSize,
          mimeType: 'application/pdf',
          uploadedAt: new Date()
        },
        contributedBy: contrib.contributor
      });

      // 3. Mark contribution approved
      const updatedContrib = await Contributions.updateById(id, {
        status: 'approved',
        reviewNotes: reviewNotes || 'Approved and published to the canonical library catalogue.',
        reviewer: req.user._id || req.user.id,
        reviewedAt: new Date().toISOString(),
        publishedBookId: publishedBook._id || publishedBook.id
      });

      // 4. Log actions
      await ActivityLogs.create({
        actorId: req.user._id || req.user.id,
        actorName: req.user.name,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'CONTRIBUTION_APPROVED',
        entityType: 'contribution',
        entityId: id,
        entityTitle: contrib.title,
        details: { publishedBookId: publishedBook._id, contributor: contrib.contributorName },
        ipAddress: req.ip || ''
      });

      return res.json({
        success: true,
        message: 'Contribution approved and published to the public library catalogue!',
        contribution: updatedContrib,
        publishedBook
      });
    } else if (action === 'reject') {
      const updatedContrib = await Contributions.updateById(id, {
        status: 'rejected',
        reviewNotes: reviewNotes || 'Does not meet archival verification or copyright criteria.',
        reviewer: req.user._id || req.user.id,
        reviewedAt: new Date().toISOString()
      });

      await ActivityLogs.create({
        actorId: req.user._id || req.user.id,
        actorName: req.user.name,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'CONTRIBUTION_REJECTED',
        entityType: 'contribution',
        entityId: id,
        entityTitle: contrib.title,
        details: { reason: reviewNotes },
        ipAddress: req.ip || ''
      });

      return res.json({
        success: true,
        message: 'Contribution marked as rejected with curator feedback.',
        contribution: updatedContrib
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action. Use 'approve' or 'reject'." });
    }
  } catch (err) {
    console.error('[Admin] Review error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. User Management
exports.getAdminUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let users = await Users.find();

    if (role && role !== 'all') {
      users = users.filter(u => u.role === role);
    }
    if (status && status !== 'all') {
      users = users.filter(u => u.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'user' or 'admin'." });
    }

    const updated = await Users.updateById(id, { role });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await ActivityLogs.create({
      actorId: req.user._id || req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'USER_ROLE_CHANGED',
      entityType: 'user',
      entityId: id,
      entityTitle: updated.name,
      details: { newRole: role },
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: `User role updated to ${role}.`, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'active' or 'suspended'." });
    }

    const updated = await Users.updateById(id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await ActivityLogs.create({
      actorId: req.user._id || req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'USER_STATUS_CHANGED',
      entityType: 'user',
      entityId: id,
      entityTitle: updated.name,
      details: { newStatus: status },
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: `Patron account status set to ${status}.`, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Activity & Audit Logs
exports.getAdminLogs = async (req, res) => {
  try {
    const { action, entityType, limit = 100 } = req.query;
    const filter = {};
    if (action && action !== 'all') filter.action = action;
    if (entityType && entityType !== 'all') filter.entityType = entityType;

    const logs = await ActivityLogs.find(filter, Number(limit));
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

