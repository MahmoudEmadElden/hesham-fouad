(function () {
  'use strict';

  const API_BASE = '/api';
  const TOKEN_KEY = 'heshamFouadToken';
  const USER_KEY = 'heshamFouadUser';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function isAdmin() {
    const user = getUser();
    return user && (user.role === 'admin' || user.role === 'cashier');
  }

  function logout() {
    removeToken();
    window.location.href = 'index.html';
  }

  async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 && !endpoint.includes('/auth/login')) {
          removeToken();
          window.location.href = 'admin.html';
        }
        throw new Error(data.message || 'حدث خطأ في الاتصال بالسيرفر');
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  async function login(username, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }

  async function changePassword(currentPassword, newPassword) {
    return await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async function getMe() {
    const data = await request('/auth/me');
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  }

  async function createOrder(orderData) {
    return await request('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async function getOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.status) query.set('status', params.status);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.all) query.set('all', params.all);

    const qs = query.toString();
    return await request(`/orders${qs ? '?' + qs : ''}`);
  }

  async function getOrderById(id) {
    return await request(`/orders/${id}`);
  }

  async function updateOrderStatus(id, status) {
    return await request(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async function getStats(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.all) query.set('all', params.all);

    const qs = query.toString();
    return await request(`/orders/stats${qs ? '?' + qs : ''}`);
  }

  window.HeshamFouadAPI = {
    getToken,
    setToken,
    removeToken,
    getUser,
    setUser,
    isLoggedIn,
    isAdmin,
    logout,
    login,
    changePassword,
    getMe,
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getStats
  };
})();
