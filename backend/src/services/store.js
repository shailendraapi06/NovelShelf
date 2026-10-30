const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Mongoose Models
const UserModel = require('../models/User');
const BookModel = require('../models/Book');
const CategoryModel = require('../models/Category');
const ContributionModel = require('../models/BookContribution');
const ReadingProgressModel = require('../models/ReadingProgress');
const BookmarkModel = require('../models/Bookmark');
const ActivityLogModel = require('../models/ActivityLog');
const NotificationModel = require('../models/Notification');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readJSON(collection) {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeJSON(collection, data) {
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// ================= USER OPERATIONS =================
const Users = {
  async find(filter = {}) {
    if (isMongoConnected()) {
      return UserModel.find(filter).lean();
    }
    let list = readJSON('users');
    if (filter.role) list = list.filter(u => u.role === filter.role);
    if (filter.status) list = list.filter(u => u.status === filter.status);
    return list.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
  },

  async findById(id) {
    if (isMongoConnected()) {
      return UserModel.findById(id).lean();
    }
    const list = readJSON('users');
    const u = list.find(item => item._id === id || item.id === id);
    if (!u) return null;
    const { password, ...rest } = u;
    return rest;
  },

  async findOne(filter = {}, includePassword = false) {
    if (isMongoConnected()) {
      const q = UserModel.findOne(filter);
      if (includePassword) q.select('+password');
      return q.lean();
    }
    const list = readJSON('users');
    const u = list.find(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (typeof val === 'string' && typeof item[key] === 'string') {
          if (item[key].toLowerCase() !== val.toLowerCase()) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });
    if (!u) return null;
    if (includePassword) return { ...u };
    const { password, ...rest } = u;
    return rest;
  },

  async create(userData) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);
    
    if (isMongoConnected()) {
      const doc = await UserModel.create({
        ...userData,
        password: userData.password
      });
      const obj = doc.toObject();
      delete obj.password;
      return obj;
    }

    const list = readJSON('users');
    const newUser = {
      _id: 'usr_' + crypto.randomUUID().slice(0, 12),
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: passwordHash,
      role: userData.role || 'user',
      status: userData.status || 'active',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      bio: userData.bio || 'Bibliophile & Patron of the Archival Arts',
      readingStats: {
        booksRead: 0,
        pagesRead: 0,
        currentStreakDays: 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(newUser);
    writeJSON('users', list);
    const { password, ...safeUser } = newUser;
    return safeUser;
  },

  async updateById(id, updates) {
    if (isMongoConnected()) {
      return UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    }
    const list = readJSON('users');
    const index = list.findIndex(u => u._id === id || u.id === id);
    if (index === -1) return null;
    
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeJSON('users', list);
    const { password, ...safeUser } = list[index];
    return safeUser;
  },

  async count(filter = {}) {
    if (isMongoConnected()) {
      return UserModel.countDocuments(filter);
    }
    let list = readJSON('users');
    if (filter.role) list = list.filter(u => u.role === filter.role);
    if (filter.status) list = list.filter(u => u.status === filter.status);
    return list.length;
  }
};

// ================= BOOK OPERATIONS =================
const Books = {
  async find(filter = {}) {
    if (isMongoConnected()) {
      return BookModel.find(filter).sort({ createdAt: -1 }).lean();
    }
    let list = readJSON('books');
    if (filter.status) list = list.filter(b => b.status === filter.status);
    if (filter.category) list = list.filter(b => b.category === filter.category || b.categoryName === filter.category);
    if (filter.isFeatured !== undefined) list = list.filter(b => b.isFeatured === filter.isFeatured);
    return list;
  },

  async findById(id) {
    if (isMongoConnected()) {
      const b = await BookModel.findById(id).lean().catch(() => null);
      if (b) return b;
      return BookModel.findOne({ slug: id }).lean();
    }
    const list = readJSON('books');
    return list.find(b => b._id === id || b.id === id || b.slug === id) || null;
  },

  async findOne(filter = {}) {
    if (isMongoConnected()) {
      return BookModel.findOne(filter).lean();
    }
    const list = readJSON('books');
    return list.find(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] !== val) return false;
      }
      return true;
    }) || null;
  },

  async create(bookData) {
    if (isMongoConnected()) {
      const doc = await BookModel.create(bookData);
      return doc.toObject();
    }
    const list = readJSON('books');
    const newBook = {
      _id: 'bk_' + crypto.randomUUID().slice(0, 12),
      id: bookData.slug || ('bk_' + crypto.randomUUID().slice(0, 8)),
      ...bookData,
      status: bookData.status || 'published',
      rating: bookData.rating || 4.8,
      reviewsCount: bookData.reviewsCount || 0,
      readingLogs: bookData.readingLogs || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newBook);
    writeJSON('books', list);
    return newBook;
  },

  async updateById(id, updates) {
    if (isMongoConnected()) {
      const updated = await BookModel.findByIdAndUpdate(id, updates, { new: true }).lean().catch(() => null);
      if (updated) return updated;
      return BookModel.findOneAndUpdate({ slug: id }, updates, { new: true }).lean();
    }
    const list = readJSON('books');
    const index = list.findIndex(b => b._id === id || b.id === id || b.slug === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeJSON('books', list);
    return list[index];
  },

  async deleteById(id) {
    if (isMongoConnected()) {
      return BookModel.findByIdAndDelete(id).lean();
    }
    const list = readJSON('books');
    const index = list.findIndex(b => b._id === id || b.id === id || b.slug === id);
    if (index === -1) return null;
    const [deleted] = list.splice(index, 1);
    writeJSON('books', list);
    return deleted;
  },

  async count(filter = {}) {
    if (isMongoConnected()) {
      return BookModel.countDocuments(filter);
    }
    let list = readJSON('books');
    if (filter.status) list = list.filter(b => b.status === filter.status);
    return list.length;
  }
};

// ================= CATEGORY OPERATIONS =================
const Categories = {
  async find() {
    if (isMongoConnected()) {
      return CategoryModel.find().sort({ order: 1, name: 1 }).lean();
    }
    const list = readJSON('categories');
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async findById(id) {
    if (isMongoConnected()) {
      return CategoryModel.findById(id).lean();
    }
    const list = readJSON('categories');
    return list.find(c => c._id === id || c.id === id || c.slug === id) || null;
  },

  async create(catData) {
    if (isMongoConnected()) {
      const doc = await CategoryModel.create(catData);
      return doc.toObject();
    }
    const list = readJSON('categories');
    const newCat = {
      _id: 'cat_' + crypto.randomUUID().slice(0, 10),
      ...catData,
      active: catData.active !== undefined ? catData.active : true,
      order: catData.order || list.length + 1,
      createdAt: new Date().toISOString()
    };
    list.push(newCat);
    writeJSON('categories', list);
    return newCat;
  },

  async updateById(id, updates) {
    if (isMongoConnected()) {
      return CategoryModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    }
    const list = readJSON('categories');
    const index = list.findIndex(c => c._id === id || c.id === id || c.slug === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    writeJSON('categories', list);
    return list[index];
  },

  async deleteById(id) {
    if (isMongoConnected()) {
      return CategoryModel.findByIdAndDelete(id).lean();
    }
    const list = readJSON('categories');
    const index = list.findIndex(c => c._id === id || c.id === id || c.slug === id);
    if (index === -1) return null;
    const [deleted] = list.splice(index, 1);
    writeJSON('categories', list);
    return deleted;
  }
};

// ================= CONTRIBUTION OPERATIONS =================
const Contributions = {
  async find(filter = {}) {
    if (isMongoConnected()) {
      return ContributionModel.find(filter).sort({ createdAt: -1 }).lean();
    }
    let list = readJSON('contributions');
    if (filter.status) list = list.filter(c => c.status === filter.status);
    if (filter.contributor) list = list.filter(c => String(c.contributor) === String(filter.contributor));
    return list;
  },

  async findById(id) {
    if (isMongoConnected()) {
      return ContributionModel.findById(id).lean();
    }
    const list = readJSON('contributions');
    return list.find(c => c._id === id || c.id === id) || null;
  },

  async create(contribData) {
    if (isMongoConnected()) {
      const doc = await ContributionModel.create(contribData);
      return doc.toObject();
    }
    const list = readJSON('contributions');
    const newContrib = {
      _id: 'contrib_' + crypto.randomUUID().slice(0, 12),
      id: 'contrib_' + crypto.randomUUID().slice(0, 8),
      ...contribData,
      status: contribData.status || 'under_review',
      reviewNotes: '',
      reviewer: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newContrib);
    writeJSON('contributions', list);
    return newContrib;
  },

  async updateById(id, updates) {
    if (isMongoConnected()) {
      return ContributionModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    }
    const list = readJSON('contributions');
    const index = list.findIndex(c => c._id === id || c.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeJSON('contributions', list);
    return list[index];
  },

  async count(filter = {}) {
    if (isMongoConnected()) {
      return ContributionModel.countDocuments(filter);
    }
    let list = readJSON('contributions');
    if (filter.status) list = list.filter(c => c.status === filter.status);
    return list.length;
  }
};

// ================= ACTIVITY LOG OPERATIONS =================
const ActivityLogs = {
  async find(filter = {}, limit = 50) {
    if (isMongoConnected()) {
      return ActivityLogModel.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    }
    let list = readJSON('activityLogs');
    if (filter.action) list = list.filter(l => l.action === filter.action);
    if (filter.entityType) list = list.filter(l => l.entityType === filter.entityType);
    if (filter.actorRole) list = list.filter(l => l.actorRole === filter.actorRole);
    return list.slice(0, limit);
  },

  async create(logData) {
    if (isMongoConnected()) {
      const doc = await ActivityLogModel.create(logData);
      return doc.toObject();
    }
    const list = readJSON('activityLogs');
    const newLog = {
      _id: 'log_' + crypto.randomUUID().slice(0, 12),
      ...logData,
      createdAt: new Date().toISOString()
    };
    list.unshift(newLog);
    writeJSON('activityLogs', list.slice(0, 500)); // retain last 500
    return newLog;
  },

  async count(filter = {}) {
    if (isMongoConnected()) {
      return ActivityLogModel.countDocuments(filter);
    }
    return readJSON('activityLogs').length;
  }
};

// ================= READING PROGRESS & BOOKMARKS =================
const Reading = {
  async getProgress(userId, bookId) {
    if (isMongoConnected()) {
      return ReadingProgressModel.findOne({ user: userId, bookId }).lean();
    }
    const list = readJSON('readingProgress');
    return list.find(r => String(r.userId) === String(userId) && r.bookId === bookId) || null;
  },

  async saveProgress(userId, bookId, data) {
    if (isMongoConnected()) {
      return ReadingProgressModel.findOneAndUpdate(
        { user: userId, bookId },
        { ...data, lastReadAt: new Date() },
        { upsert: true, new: true }
      ).lean();
    }
    const list = readJSON('readingProgress');
    const index = list.findIndex(r => String(r.userId) === String(userId) && r.bookId === bookId);
    const updated = {
      _id: index >= 0 ? list[index]._id : 'prog_' + crypto.randomUUID().slice(0, 10),
      userId,
      bookId,
      currentPage: data.currentPage || 1,
      totalPages: data.totalPages || 100,
      percent: data.percent || Math.round(((data.currentPage || 1) / (data.totalPages || 100)) * 100),
      chapter: data.chapter || 'Chapter I',
      spreadIndex: data.spreadIndex || 0,
      lastReadAt: new Date().toISOString()
    };
    if (index >= 0) {
      list[index] = updated;
    } else {
      list.push(updated);
    }
    writeJSON('readingProgress', list);
    return updated;
  },

  async getBookmarks(userId, bookId) {
    if (isMongoConnected()) {
      const filter = { user: userId };
      if (bookId) filter.bookId = bookId;
      return BookmarkModel.find(filter).sort({ createdAt: -1 }).lean();
    }
    let list = readJSON('bookmarks');
    list = list.filter(b => String(b.userId) === String(userId));
    if (bookId) list = list.filter(b => b.bookId === bookId);
    return list;
  },

  async addBookmark(userId, bookId, data) {
    if (isMongoConnected()) {
      return BookmarkModel.create({
        user: userId,
        bookId,
        page: data.page || 1,
        chapter: data.chapter || '',
        note: data.note || ''
      });
    }
    const list = readJSON('bookmarks');
    const newBm = {
      _id: 'bm_' + crypto.randomUUID().slice(0, 10),
      userId,
      bookId,
      page: data.page || 1,
      chapter: data.chapter || '',
      note: data.note || '',
      createdAt: new Date().toISOString()
    };
    list.unshift(newBm);
    writeJSON('bookmarks', list);
    return newBm;
  },

  async removeBookmark(userId, bookId, page) {
    if (isMongoConnected()) {
      return BookmarkModel.findOneAndDelete({ user: userId, bookId, page });
    }
    let list = readJSON('bookmarks');
    const beforeCount = list.length;
    list = list.filter(b => !(String(b.userId) === String(userId) && b.bookId === bookId && (!page || b.page === page)));
    writeJSON('bookmarks', list);
    return { deleted: beforeCount - list.length };
  }
};

module.exports = {
  Users,
  Books,
  Categories,
  Contributions,
  ActivityLogs,
  Reading,
  isMongoConnected
};

