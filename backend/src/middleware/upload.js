const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_ROOT = path.join(__dirname, '../../uploads');
const QUARANTINE_DIR = path.join(UPLOADS_ROOT, 'quarantine');
const BOOKS_DIR = path.join(UPLOADS_ROOT, 'books');
const COVERS_DIR = path.join(UPLOADS_ROOT, 'covers');

[UPLOADS_ROOT, QUARANTINE_DIR, BOOKS_DIR, COVERS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage for user contributions (stored in quarantine until admin approves)
const quarantineStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, QUARANTINE_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').replace(ext, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `quarantine_${safeName}_${uniqueSuffix}${ext}`);
  }
});

// Storage for official admin book uploads
const bookStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      cb(null, COVERS_DIR);
    } else {
      cb(null, BOOKS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').replace(ext, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}_${safeName}_${uniqueSuffix}${ext}`);
  }
});

// Filter for PDFs only
const pdfFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype === 'application/pdf' || ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents (.pdf) are permitted in the archival repository.'), false);
  }
};

// Filter for PDFs or Images (covers)
const mediaFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'cover') {
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Cover image must be JPG, PNG, or WebP format.'), false);
    }
  } else if (file.fieldname === 'pdf' || file.fieldname === 'bookFile') {
    if (file.mimetype === 'application/pdf' || ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Book content file must be a PDF document.'), false);
    }
  } else {
    cb(null, true);
  }
};

const uploadContributionPdf = multer({
  storage: quarantineStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: pdfFilter
});

const uploadAdminBookFiles = multer({
  storage: bookStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: mediaFilter
});

module.exports = {
  uploadContributionPdf,
  uploadAdminBookFiles,
  QUARANTINE_DIR,
  BOOKS_DIR,
  COVERS_DIR
};

