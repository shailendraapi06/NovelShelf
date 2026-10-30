// NovelShelf Centralized API Client

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

function getAuthHeader() {
  const token = localStorage.getItem('novelshelf_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    ...getAuthHeader(),
    ...options.headers
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => 
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => 
    request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => 
    request('/auth/me'),
  updateProfile: (updates) => 
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(updates) }),

  // Public Catalog & Books
  getBooks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/books${query ? `?${query}` : ''}`);
  },
  getBookById: (id) => 
    request(`/books/${id}`),
  getBookContent: (id) => 
    request(`/books/${id}/content`),

  // Categories
  getCategories: () => 
    request('/categories'),

  // Contributions
  submitContribution: (formData) => 
    request('/contributions', { method: 'POST', body: formData }),
  getMyContributions: () => 
    request('/contributions/my'),
  getContributionPdfUrl: (id) => 
    `${API_BASE_URL}/contributions/${id}/pdf`,

  // Reading Progress & Bookmarks
  getReadingProgress: (bookId) => 
    request(`/reading/progress/${bookId}`),
  saveReadingProgress: (bookId, progressData) => 
    request(`/reading/progress/${bookId}`, { method: 'POST', body: JSON.stringify(progressData) }),
  getBookmarks: (bookId) => 
    request(`/reading/bookmarks${bookId ? `?bookId=${bookId}` : ''}`),
  addBookmark: (bookmarkData) => 
    request('/reading/bookmarks', { method: 'POST', body: JSON.stringify(bookmarkData) }),
  removeBookmark: (bookId, page) => 
    request(`/reading/bookmarks/${bookId}${page ? `/${page}` : ''}`, { method: 'DELETE' }),

  // Admin Endpoints
  admin: {
    getDashboardStats: () => 
      request('/admin/dashboard'),
    getBooks: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/books${query ? `?${query}` : ''}`);
    },
    createBook: (formData) => 
      request('/admin/books', { method: 'POST', body: formData }),
    updateBook: (id, formData) => 
      request(`/admin/books/${id}`, { method: 'PUT', body: formData }),
    deleteBook: (id) => 
      request(`/admin/books/${id}`, { method: 'DELETE' }),
    createCategory: (data) => 
      request('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
    updateCategory: (id, data) => 
      request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCategory: (id) => 
      request(`/admin/categories/${id}`, { method: 'DELETE' }),
    getContributions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/contributions${query ? `?${query}` : ''}`);
    },
    reviewContribution: (id, reviewData) => 
      request(`/admin/contributions/${id}/review`, { method: 'POST', body: JSON.stringify(reviewData) }),
    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/users${query ? `?${query}` : ''}`);
    },
    updateUserRole: (id, role) => 
      request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    toggleUserStatus: (id, status) => 
      request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/logs${query ? `?${query}` : ''}`);
    }
  }
};

