import { VALIDATION_PATTERNS, MESSAGES } from '../constants';

/**
 * Utilitários de validação
 */
export const validation = {
  /**
   * Valida email
   */
  email: (email) => {
    if (!email) return 'Email é obrigatório';
    if (!VALIDATION_PATTERNS.EMAIL.test(email)) return 'Email inválido';
    return null;
  },

  /**
   * Valida senha
   */
  password: (password) => {
    if (!password) return 'Senha é obrigatória';
    if (!VALIDATION_PATTERNS.PASSWORD.test(password)) return 'Senha deve ter pelo menos 6 caracteres';
    return null;
  },

  /**
   * Valida nome
   */
  name: (name) => {
    if (!name) return 'Nome é obrigatório';
    if (name.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (name.length > 100) return 'Nome deve ter no máximo 100 caracteres';
    return null;
  },

  /**
   * Valida telefone
   */
  phone: (phone) => {
    if (!phone) return 'Telefone é obrigatório';
    if (!VALIDATION_PATTERNS.PHONE.test(phone)) return 'Telefone inválido. Use o formato (11) 99999-9999';
    return null;
  },

  /**
   * Valida username
   */
  username: (username) => {
    if (!username) return 'Username é obrigatório';
    if (!VALIDATION_PATTERNS.USERNAME.test(username)) return 'Username deve ter 3-20 caracteres (apenas letras, números e _)';
    return null;
  },

  /**
   * Valida conteúdo de post
   */
  postContent: (content) => {
    if (!content || !content.trim()) return 'Conteúdo é obrigatório';
    if (content.length > 280) return 'Conteúdo deve ter no máximo 280 caracteres';
    return null;
  }
};

/**
 * Utilitários de formatação
 */
export const format = {
  /**
   * Formata data para exibição
   */
  date: (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    // Menos de 1 minuto
    if (diff < 60000) return 'Agora';
    
    // Menos de 1 hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m`;
    }
    
    // Menos de 24 horas
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h`;
    }
    
    // Menos de 7 dias
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d`;
    }
    
    // Mais de 7 dias - mostrar data
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  },

  /**
   * Formata número de curtidas/comentários
   */
  count: (count) => {
    if (!count || count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}M`;
  },

  /**
   * Formata tamanho de arquivo
   */
  fileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Formata telefone
   */
  phone: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }
};

/**
 * Utilitários gerais
 */
export const utils = {
  /**
   * Debounce function
   */
  debounce: (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },

  /**
   * Gera ID único
   */
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Copia texto para clipboard
   */
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch (err) {
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  },

  /**
   * Slugify string
   */
  slugify: (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Truncate string
   */
  truncate: (str, length = 100) => {
    if (!str || str.length <= length) return str;
    return str.slice(0, length) + '...';
  },

  /**
   * Remove acentos
   */
  removeAccents: (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Capitaliza primeira letra
   */
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Verifica se é imagem
   */
  isImage: (file) => {
    return file && file.type && file.type.startsWith('image/');
  },

  /**
   * Verifica se é vídeo
   */
  isVideo: (file) => {
    return file && file.type && file.type.startsWith('video/');
  },

  /**
   * Gera avatar placeholder
   */
  generateAvatarUrl: (name) => {
    if (!name) return '/placeholder-avatar.png';
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=random&format=svg`;
  }
};

/**
 * Utilitários de localStorage
 */
export const storage = {
  /**
   * Get item with error handling
   */
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Set item with error handling
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
      return false;
    }
  },

  /**
   * Remove item
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
      return false;
    }
  },

  /**
   * Clear all items
   */
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

/**
 * Utilitários de tratamento de erros
 */
export const errorHandler = {
  /**
   * Extrai mensagem de erro
   */
  getErrorMessage: (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return MESSAGES.ERRORS.SERVER;
  },

  /**
   * Log de erro
   */
  logError: (error, context = '') => {
    console.error(`[ERROR${context ? ` - ${context}` : ''}]:`, error);
  }
};

/**
 * Formatar tempo relativo (ex: "2h", "1d", "agora")
 */
export const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'agora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
  
  return date.toLocaleDateString('pt-BR');
};
