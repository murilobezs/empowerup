import config from '../config/config';
import { getStoredToken, clearAuthSession } from '../utils/authStorage';

/**
 * Classe para gerenciar todas as chamadas da API
 */
class ApiService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  /**
   * Método genérico para fazer requisições
   */
  async request(endpoint, options = {}) {
    const {
      headers: customHeaders = {},
      retryOnUnauthorized = true,
      includeAuth = true,
      _retry401 = false,
      ...restOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
      },
      ...restOptions,
    };

    const method = (requestConfig.method || 'GET').toUpperCase();

    // Adicionar token de autorização se disponível
    if (includeAuth) {
      const token = getStoredToken();
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
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

        const trimmed = typeof data === 'string' ? data.trim() : '';
        if (trimmed) {
          const looksLikeJson = (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'));

          if (looksLikeJson) {
            try {
              data = JSON.parse(trimmed);
            } catch (parseError) {
              console.warn('API Service - Failed to parse JSON from text response:', parseError);
            }
          }
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.clearStoredAuth();

          if (retryOnUnauthorized && !_retry401 && method === 'GET') {
            console.warn('API Service - Retrying request without authorization header.');
            return this.request(endpoint, {
              ...restOptions,
              headers: customHeaders,
              includeAuth: false,
              retryOnUnauthorized: false,
              _retry401: true,
            });
          }
        }

        const err = new Error((data && data.message) || `HTTP error! status: ${response.status}`);
        err.status = response.status;
        err.data = data;
        console.error('API Service - Request failed:', err);
        throw err;
      }

      return data;
    } catch (error) {
      console.error('API Service - Request Error:', error);
      throw error;
    }
  }

  clearStoredAuth() {
    try {
      clearAuthSession();
      if (config.AUTH.TOKEN_KEY) {
        localStorage.removeItem(config.AUTH.TOKEN_KEY);
      }
    } catch (storageError) {
      console.warn('API Service - Failed to clear auth storage:', storageError);
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
        const err = new Error(data.message || `HTTP error! status: ${response.status}`);
        err.status = response.status;
        err.data = data;
        console.error('API Service Upload - Request failed:', err);
        throw err;
      }

      return data;
    } catch (error) {
      console.error('API Service Upload - Request Error:', error);
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
      includeAuth: false,
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ token, newPassword }),
    });
  }

  /**
   * Verificar email com token enviado por email
   */
  async verifyEmail(token) {
    const query = encodeURIComponent(token);
    return this.request(`/auth/verify?token=${query}`, {
      includeAuth: false,
    });
  }

  /**
   * Iniciar fluxo de recuperação de senha
   */
  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Resetar senha usando token recebido por email
   */
  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      includeAuth: false,
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
   * Atualizar capa do perfil
   */
  async updateCover(file) {
    const formData = new FormData();
    formData.append('cover', file);

    return this.uploadRequest('/users/cover', formData);
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
   * Buscar posts curtidos pelo usuário
   */
  async getLikedPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/posts/liked${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Listar posts salvos
   */
  async getSavedPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/saves/posts${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Verificar se post está salvo
   */
  async checkPostSaved(postId) {
    return this.request(`/saves/posts/${postId}/check`);
  }

  // ===== USUÁRIOS =====

  /**
   * Seguir/deixar de seguir usuário
   */
  async toggleFollow(userId) {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  /**
   * Buscar perfil de usuário
   */
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  /**
   * Listar seguidores
   */
  async getUserFollowers(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/${userId}/followers${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Listar seguindo
   */
  async getUserFollowing(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/${userId}/following${queryString ? '?' + queryString : ''}`);
  }

  // ===== NOTIFICAÇÕES =====

  /**
   * Listar notificações do usuário
   */
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Marcar notificação como lida
   */
  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // ===== MENSAGENS =====

  /**
   * Resumo de mensagens não lidas
   */
  async getMessagesUnreadSummary() {
    return this.request('/conversas/unread-summary');
  }

  /**
   * Buscar conversas da usuária
   */
  async getConversations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/conversas${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Buscar mensagens de uma conversa
   */
  async getConversationMessages(conversationId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/conversas/${conversationId}/mensagens${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Enviar mensagem
   */
  async sendMessage(conversationId, messageData) {
    return this.request(`/conversas/${conversationId}/mensagens`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  /**
   * Criar conversa privada
   */
  async startConversation(targetUserId) {
    return this.request(`/conversas/iniciar/${targetUserId}`, {
      method: 'POST',
    });
  }

  /**
   * Criar grupo de mensagens
   */
  async createConversationGroup(data) {
    return this.request('/conversas/grupos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualizar grupo de mensagens
   */
  async updateConversationGroup(conversationId, data) {
    return this.request(`/conversas/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Adicionar participante ao grupo
   */
  async addConversationParticipant(conversationId, participantId) {
    return this.request(`/conversas/${conversationId}/participantes`, {
      method: 'POST',
      body: JSON.stringify({ participante_id: participantId }),
    });
  }

  /**
   * Remover participante do grupo
   */
  async removeConversationParticipant(conversationId, participantId) {
    return this.request(`/conversas/${conversationId}/participantes/${participantId}`, {
      method: 'DELETE',
    });
  }

  // ===== EVENTOS =====

  /**
   * Listar eventos
   */
  async getEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/eventos${queryString ? '?' + queryString : ''}`;

    try {
      return await this.request(endpoint);
    } catch (error) {
      if (error?.status === 404 || error?.status === 405) {
        return this.request(`/events${queryString ? '?' + queryString : ''}`);
      }
      throw error;
    }
  }

  /**
   * Buscar evento por ID
   */
  async getEvent(eventId) {
    return this.request(`/events/${eventId}`);
  }

  /**
   * Criar evento (admin apenas)
   */
  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Atualizar evento (admin apenas)
   */
  async updateEvent(eventId, eventData) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Deletar evento (admin apenas)
   */
  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
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
   * Listar inscrições de um evento (admin apenas)
   */
  async getEventSubscriptions(eventId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/events/${eventId}/subscriptions${queryString ? '?' + queryString : ''}`);
  }

  // ===== GRUPOS =====

  /**
   * Listar grupos com filtros
   */
  async listGroups(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/grupos${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Detalhes do grupo
   */
  async getGroup(groupId) {
    return this.request(`/grupos/${groupId}`);
  }

  async getGroupBySlug(slug) {
    return this.request(`/grupos/slug/${encodeURIComponent(slug)}`);
  }

  /**
   * Feed de posts do grupo
   */
  async getGroupFeed(groupId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/grupos/${groupId}/feed${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Entrar ou solicitar participação
   */
  async joinGroup(groupId) {
    return this.request(`/grupos/${groupId}/participar`, {
      method: 'POST',
    });
  }

  /**
   * Sair do grupo
   */
  async leaveGroup(groupId) {
    return this.request(`/grupos/${groupId}/sair`, {
      method: 'POST',
    });
  }

  /**
   * Buscar posts dos grupos que o usuário participa
   */
  async getMyGroupsPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/grupos/meus-posts${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Buscar posts de um grupo específico
   */
  async getGroupPosts(groupId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/grupos/${groupId}/posts${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Buscar grupo por slug
   */
  async getGroupBySlug(slug) {
    return this.request(`/grupos/slug/${slug}`);
  }

  /**
   * Criar grupo
   */
  async createGroup(data) {
    return this.request('/grupos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualizar grupo
   */
  async updateGroup(groupId, data) {
    return this.request(`/grupos/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listGroupMembers(groupId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/grupos/${groupId}/membros${queryString ? `?${queryString}` : ''}`);
  }

  async listGroupRequests(groupId) {
    return this.request(`/grupos/${groupId}/solicitacoes`);
  }

  async respondGroupRequest(groupId, requestId, status) {
    return this.request(`/grupos/${groupId}/solicitacoes/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async removeGroupMember(groupId, memberId) {
    return this.request(`/grupos/${groupId}/membros/${memberId}`, {
      method: 'DELETE',
    });
  }

  // ===== PLANOS E ASSINATURAS =====

  async getSubscriptionPlans(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/subscriptions/plans${queryString ? '?' + queryString : ''}`);
  }

  async getCurrentSubscription() {
    return this.request('/subscriptions/current');
  }

  async startSubscription(payload) {
    return this.request('/subscriptions/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async cancelSubscription(subscriptionId) {
    return this.request(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  async getSubscriptionAdUsage() {
    return this.request('/subscriptions/ad-usage');
  }

  // ===== CURSOS =====

  async listCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/courses${queryString ? '?' + queryString : ''}`);
  }

  async getCourse(identifier) {
    return this.request(`/courses/${identifier}`);
  }

  async enrollCourse(identifier) {
    return this.request(`/courses/${identifier}/enroll`, {
      method: 'POST',
    });
  }

  async getCourseProgress(identifier) {
    return this.request(`/courses/${identifier}/progress`);
  }

  async updateLessonProgress(identifier, lessonId, data) {
    return this.request(`/courses/${identifier}/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== CAMPANHAS PROMOVIDAS =====

  async listAdCampaigns(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/ads/campaigns${queryString ? '?' + queryString : ''}`);
  }

  async getAdCampaign(campaignId) {
    return this.request(`/ads/campaigns/${campaignId}`);
  }

  async createAdCampaign(data) {
    return this.request('/ads/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdCampaign(campaignId, data) {
    return this.request(`/ads/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addPostToCampaign(campaignId, postId) {
    return this.request(`/ads/campaigns/${campaignId}/posts`, {
      method: 'POST',
      body: JSON.stringify({ post_id: postId }),
    });
  }

  async removePostFromCampaign(campaignId, postId) {
    return this.request(`/ads/campaigns/${campaignId}/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async deleteAdCampaign(campaignId) {
    return this.request(`/ads/campaigns/${campaignId}`, {
      method: 'DELETE',
    });
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
