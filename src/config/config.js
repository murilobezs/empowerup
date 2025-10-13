// Configurações da aplicação
// Em produção, sempre usar as URLs específicas do empowerup.com.br
const defaultOrigin = 'https://www.empowerup.com.br';
const origin = typeof window !== 'undefined' && window.location.origin
  ? window.location.origin.replace(/\/$/, '')
  : defaultOrigin;

const coursesOrigin = 'https://cursos.empowerup.com.br';

const config = {
  // URLs base - sempre priorizar variáveis de ambiente em produção
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://www.empowerup.com.br/api',
  BASE_URL: import.meta.env.VITE_BASE_URL || defaultOrigin,
  PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL || 'https://www.empowerup.com.br/public',
  COURSES_URL: import.meta.env.VITE_COURSES_URL || coursesOrigin,
  
  // URLs helper functions
  getApiUrl: (endpoint = '') => {
    const baseUrl = config.API_BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${cleanEndpoint}`;
  },
  
  getPublicUrl: (path = '') => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${config.PUBLIC_URL}/${cleanPath}`;
  },
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: 'empowerup_token',
    USER_KEY: 'empowerup_user',
    TOKEN_COOKIE: import.meta.env.VITE_AUTH_COOKIE_NAME || 'empowerup_token',
    COOKIE_DOMAIN: import.meta.env.VITE_COOKIE_DOMAIN || 'auto',
    COOKIE_SAMESITE: import.meta.env.VITE_COOKIE_SAMESITE || 'Lax',
    TOKEN_EXPIRY_HOURS: 24
  },
  
  // Configurações de upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov'],
    MAX_FILES: 4
  },
  
  // Configurações da UI
  UI: {
    POST_CHARACTER_LIMIT: 280,
    PAGINATION_LIMIT: 20,
    DEBOUNCE_DELAY: 300 // ms
  },
  
  // Configurações de cache
  CACHE: {
    POSTS_TTL: 5 * 60 * 1000, // 5 minutos
    USER_PROFILE_TTL: 10 * 60 * 1000, // 10 minutos
    COMMENTS_TTL: 2 * 60 * 1000 // 2 minutos
  },
  
  // URLs de desenvolvimento
  DEV: {
    TEST_PAGE: '/test-integration.html'
  }
};

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');

config.getCoursesUrl = (path = '') => {
  const baseUrl = stripTrailingSlash(config.COURSES_URL || coursesOrigin || defaultOrigin);
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
};

export default config;
