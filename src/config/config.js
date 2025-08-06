// Configurações da aplicação
const config = {
  // URL base da API
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost/empowerup/api',
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: 'empowerup_token',
    USER_KEY: 'empowerup_user',
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

export default config;
