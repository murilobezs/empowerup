import config from '../config/config';

const ADMIN_TOKEN_KEY = 'empowerup_admin_token';
const ADMIN_PROFILE_KEY = 'empowerup_admin_profile';
const ADMIN_FLAG_KEY = 'admin_logged_in';

const buildUrl = (endpoint, params = null) => {
  const base = config.getApiUrl(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint);
  if (!params || Object.keys(params).length === 0) {
    return base;
  }
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
};

const getToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

const setToken = (token) => {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_FLAG_KEY, 'true');
  }
};

const setProfile = (profile) => {
  if (profile) {
    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
  }
};

const getProfile = () => {
  const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Erro ao ler perfil admin:', error);
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
  localStorage.removeItem(ADMIN_FLAG_KEY);
};

const handleResponse = async (response, autoLogout = true) => {
  const contentType = response.headers.get('content-type');
  let body;

  if (contentType && contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401 && autoLogout) {
      clearSession();
    }
    const message = body && body.message ? body.message : 'Erro inesperado';
    throw new Error(message);
  }

  if (body && body.success === false) {
    throw new Error(body.message || 'Erro inesperado');
  }

  return body;
};

const authenticatedRequest = async (endpoint, options = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error('Sessão administrativa expirada. Faça login novamente.');
  }

  const response = await fetch(buildUrl(endpoint), {
    method: 'GET',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  return handleResponse(response);
};

const adminApi = {
  isAuthenticated() {
    return !!getToken();
  },

  getProfile,

  async login({ username, password }) {
    const response = await fetch(buildUrl('/admin/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await handleResponse(response, false);

    if (data && data.token) {
      setToken(data.token);
      if (data.admin) {
        setProfile(data.admin);
      }
    }

    return data;
  },

  logout() {
    clearSession();
  },

  async validateSession() {
    const token = getToken();

    if (!token) {
      clearSession();
      throw new Error('Sessão administrativa expirada. Faça login novamente.');
    }

    try {
      const data = await authenticatedRequest('/admin/profile');
      if (data && data.admin) {
        setProfile(data.admin);
      }
      return data;
    } catch (error) {
      console.warn('Sessão admin inválida:', error?.message || error);
      clearSession();
      throw error instanceof Error ? error : new Error(error?.message || 'Sessão administrativa inválida.');
    }
  },

  async getDashboard() {
    const data = await authenticatedRequest('/admin/dashboard');
    return data;
  },

  async getUsers(params = {}) {
    const token = getToken();
    const response = await fetch(buildUrl('/admin/users', params), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  async updateUser(id, payload) {
    return authenticatedRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async getPosts(params = {}) {
    const token = getToken();
    const response = await fetch(buildUrl('/admin/posts', params), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  async updatePost(id, payload) {
    return authenticatedRequest(`/admin/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deletePost(id) {
    return authenticatedRequest(`/admin/posts/${id}`, {
      method: 'DELETE'
    });
  },

  async getGroups(params = {}) {
    const token = getToken();
    const response = await fetch(buildUrl('/admin/groups', params), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  async getEvents(params = {}) {
    const token = getToken();
    const response = await fetch(buildUrl('/admin/events', params), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  async createEvent(payload) {
    return authenticatedRequest('/admin/events', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateEvent(id, payload) {
    return authenticatedRequest(`/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteEvent(id) {
    return authenticatedRequest(`/admin/events/${id}`, {
      method: 'DELETE'
    });
  },

  async getEventSubscriptions(id) {
    return authenticatedRequest(`/admin/events/${id}/subscriptions`);
  },

  async getMonetization() {
    return authenticatedRequest('/admin/monetization');
  },

  async getCampaigns() {
    return authenticatedRequest('/admin/campaigns');
  }
};

export default adminApi;
