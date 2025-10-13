import config from '../config/config';
import { getStoredToken, clearAuthSession } from '../utils/authStorage';

// Configuração da API
const API_BASE_URL = config.API_BASE_URL;

/**
 * Classe para gerenciar todas as chamadas da API
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Método genérico para fazer requisições
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autorização se disponível
    const token = getStoredToken();
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    try {
  const response = await fetch(url, requestConfig);
      
      // Se não é JSON, retornar texto
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const err = new Error(data && data.message ? data.message : `HTTP error! status: ${response.status}`);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Método para upload de arquivos
   */
  async uploadRequest(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const requestConfig = {
      method: 'POST',
      headers: {
        // Não definir Content-Type para FormData (o browser define automaticamente)
        ...options.headers,
      },
      body: formData,
      ...options,
    };

    // Adicionar token de autorização se disponível
    const token = getStoredToken();
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      if (!response.ok) {
        const err = new Error(data && data.message ? data.message : `HTTP error! status: ${response.status}`);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.error('Upload Request Error:', error);
      throw error;
    }
  }

  // ===== AUTENTICAÇÃO =====

  /**
   * Registrar usuário
   */
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Login de usuário
   */
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Obter perfil do usuário logado
   */
  async getProfile() {
    return this.request('/auth/profile');
  }

  /**
   * Atualizar token
   */
  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async verifyEmail(token) {
    const query = new URLSearchParams({ token }).toString();
    return this.request(`/auth/verify?${query}`, {
      method: 'GET',
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // ===== USUÁRIOS =====

  /**
   * Buscar usuário por ID
   */
  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Atualizar avatar do usuário
   */
  async updateAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.uploadRequest('/users/avatar', formData);
  }

  /**
   * Buscar usuários
   */
  async searchUsers(query) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Verificar disponibilidade de username
   */
  async checkUsername(username) {
    return this.request(`/users/check-username/${encodeURIComponent(username)}`);
  }

  // ===== POSTS =====

  /**
   * Listar posts
   */
  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/posts${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Buscar post por ID
   */
  async getPost(id) {
    return this.request(`/posts/${id}`);
  }

  /**
   * Criar novo post
   */
  async createPost(postData = {}, file = null) {
    const payload = {
      conteudo: postData.conteudo,
      categoria: postData.categoria || 'Geral',
      tags: Array.isArray(postData.tags) ? postData.tags : [],
      escopo_visibilidade: postData.escopo_visibilidade,
      grupo_id: postData.grupo_id,
    };

    if (payload.grupo_id && !payload.escopo_visibilidade) {
      payload.escopo_visibilidade = 'grupo';
    }

    if (file) {
      const formData = new FormData();
      formData.append('conteudo', payload.conteudo);
      formData.append('categoria', payload.categoria);
      formData.append('tags', JSON.stringify(payload.tags));

      if (payload.grupo_id) {
        formData.append('grupo_id', payload.grupo_id);
      }

      if (payload.escopo_visibilidade) {
        formData.append('escopo_visibilidade', payload.escopo_visibilidade);
      }
      
      if (file.type.startsWith('image/')) {
        formData.append('image', file);
      } else if (file.type.startsWith('video/')) {
        formData.append('video', file);
      }
      
      return this.uploadRequest('/posts', formData);
    }

    const sanitizedPayload = Object.entries(payload).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'tags' && !Array.isArray(value)) {
          acc[key] = [];
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(sanitizedPayload),
    });
  }

  /**
   * Atualizar post
   */
  async updatePost(id, postData) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  /**
   * Deletar post
   */
  async deletePost(id) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Buscar posts
   */
  async searchPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/posts/search${queryString ? '?' + queryString : ''}`);
  }

  // ===== EXPLORE =====

  /**
   * Buscar destaques do explorar
   */
  async getExploreOverview(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/explore${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Tendências do explorar (hashtags)
   */
  async getExploreTrending(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/explore/trending${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Pesquisa unificada do explorar
   */
  async searchExplore(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/explore/search${queryString ? '?' + queryString : ''}`);
  }

  // ===== COMENTÁRIOS =====

  /**
   * Listar comentários de um post
   */
  async getComments(postId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/comments/posts/${postId}${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Criar comentário
   */
  async createComment(postId, commentData) {
    return this.request(`/comments/posts/${postId}`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  /**
   * Atualizar comentário
   */
  async updateComment(commentId, commentData) {
    return this.request(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
    });
  }

  /**
   * Deletar comentário
   */
  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // ===== LIKES =====

  /**
   * Curtir/descurtir post
   */
  async toggleLike(postId) {
    return this.request(`/likes/posts/${postId}`, {
      method: 'POST',
    });
  }

  /**
   * Listar usuários que curtiram
   */
  async getLikes(postId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/likes/posts/${postId}${queryString ? '?' + queryString : ''}`);
  }

  // ===== SEGUIR USUÁRIOS =====

  /**
   * Seguir/desseguir usuário
   */
  async toggleFollowUser(userId) {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  /**
   * Listar seguidores de um usuário
   */
  async getFollowers(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/${userId}/followers${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Listar usuários que o usuário segue
   */
  async getFollowing(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/${userId}/following${queryString ? '?' + queryString : ''}`);
  }

  // ===== COMPARTILHAMENTOS =====

  /**
   * Compartilhar post
   */
  async sharePost(postId) {
    return this.request(`/shares/posts/${postId}`, {
      method: 'POST',
    });
  }

  /**
   * Listar usuários que compartilharam
   */
  async getShares(postId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/shares/posts/${postId}${queryString ? '?' + queryString : ''}`);
  }

  // ===== SALVAMENTOS =====

  /**
   * Salvar/dessalvar post
   */
  async toggleSavePost(postId) {
    return this.request(`/saves/posts/${postId}`, {
      method: 'POST',
    });
  }

  /**
   * Listar posts salvos do usuário
   */
  async getSavedPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/saves/posts${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Verificar se post está salvo
   */
  async isPostSaved(postId) {
    return this.request(`/saves/posts/${postId}/check`);
  }

  // ===== EVENTOS =====

  /**
   * Listar eventos
   */
  async getEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/events${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Criar evento
   */
  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Atualizar evento
   */
  async updateEvent(eventId, eventData) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Excluir evento
   */
  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Buscar evento específico
   */
  async getEvent(eventId) {
    return this.request(`/events/${eventId}`);
  }

  /**
   * Inscrever-se em evento
   */
  async subscribeToEvent(eventId, subscriptionData) {
    return this.request(`/events/${eventId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  /**
   * Cancelar inscrição em evento
   */
  async unsubscribeFromEvent(eventId) {
    return this.request(`/events/${eventId}/subscribe`, {
      method: 'DELETE',
    });
  }

  /**
   * Listar inscrições de um evento (admin)
   */
  async getEventSubscriptions(eventId) {
    return this.request(`/events/${eventId}/subscriptions`);
  }

  // ===== UTILITÁRIOS =====

  /**
   * Health check da API
   */
  async healthCheck() {
    return this.request('/');
  }
}

// Instância singleton da API
const apiService = new ApiService();

export default apiService;
