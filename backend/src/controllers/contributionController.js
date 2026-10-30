const fs = require('fs');
const path = require('path');
const { Contributions, ActivityLogs } = require('../services/store');

// Submit user PDF contribution (Saved to quarantine)
exports.submitContribution = async (req, res) => {
  try {
    const { title, author, genre, year, pages, edition, license, synopsis, rightsConfirmed } = req.body;

    if (!title || !author || !synopsis) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and synopsis are mandatory.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a digital book file in PDF format.'
      });
    }

    const contribution = await Contributions.create({
      contributor: req.user._id || req.user.id,
      contributorName: req.user.name,
      contributorEmail: req.user.email,
      title: title.trim(),
      author: author.trim(),
      genre: genre || 'Fiction',
      year: year ? Number(year) : new Date().getFullYear(),
      pages: pages ? Number(pages) : 120,
      edition: edition || 'Digitized Folio Edition',
      license: license || 'Public Domain / Creative Commons',
      rightsConfirmed: rightsConfirmed === 'true' || rightsConfirmed === true,
      synopsis: synopsis.trim(),
      pdfFile: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        isQuarantined: true
      },
      status: 'under_review'
    });

    await ActivityLogs.create({
      actorId: req.user._id || req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'CONTRIBUTION_SUBMITTED',
      entityType: 'contribution',
      entityId: contribution._id || contribution.id,
      entityTitle: contribution.title,
      details: {
        author: contribution.author,
        pdfName: req.file.originalname,
        fileSizeMb: (req.file.size / (1024 * 1024)).toFixed(2)
      },
      ipAddress: req.ip || ''
    });

    res.status(201).json({
      success: true,
      message: 'Your folio contribution has been safely submitted to the quarantine chamber for archivist review.',
      contribution
    });
  } catch (err) {
    console.error('[Contributions] Submit error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to process manuscript upload.',
      error: err.message
    });
  }
};

// Get current user's submitted contributions
exports.getMyContributions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const list = await Contributions.find({ contributor: userId });
    res.json({
      success: true,
      contributions: list
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Stream quarantined PDF for inspection
exports.getContributionPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const contrib = await Contributions.findById(id);

    if (!contrib || !contrib.pdfFile || !contrib.pdfFile.filePath) {
      return res.status(404).json({ success: false, message: 'Contribution or PDF file not found.' });
    }

    const userId = req.user._id || req.user.id;
    // Allow if user is admin OR user is the contributor
    if (req.user.role !== 'admin' && String(contrib.contributor) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied to this quarantined file.' });
    }

    const filePath = contrib.pdfFile.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'PDF file is missing on server.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${contrib.pdfFile.originalName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

