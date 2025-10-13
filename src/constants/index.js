/**
 * Constantes da aplicação EmpowerUp
 */

// Rotas da aplicação
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/cadastro',
  VERIFY_EMAIL: '/verificar-email',
  FORGOT_PASSWORD: '/recuperar-senha',
  RESET_PASSWORD: '/resetar-senha',
  FEED: '/comunidade',
  PROFILE: '/perfil',
  MENSAGENS: '/mensagens',
  NOTIFICACOES: '/notificacoes',
  EDIT_PROFILE: '/editar-perfil',
  SAVED_POSTS: '/posts-salvos',
  ABOUT: '/sobre',
  CONTACT: '/contato',
  TERMS: '/termos',
  PRIVACY: '/privacidade',
  VERIFY_EMAIL: '/verificar-email',
  FORGOT_PASSWORD: '/recuperar-senha',
  RESET_PASSWORD: '/redefinir-senha',
  EVENTS: '/eventos',
  GROUPS: '/grupos',
  GROUP_DETAIL: '/grupos/:slug',
  COURSES: '/cursos',
  COURSE_DETAIL: '/cursos/:identifier',
  COURSES_EXTERNAL: 'https://cursos.empowerup.com.br',
  COURSE_DETAIL_EXTERNAL: 'https://cursos.empowerup.com.br/curso/:identifier',
  SUBSCRIPTIONS: '/planos',
  AD_CAMPAIGNS: '/campanhas',
  EXPLORE: '/explorar',
  TRENDING: '/trending',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login'
};

// Status de carregamento
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Tipos de usuário
export const USER_TYPES = {
  EMPREENDEDORA: 'empreendedora',
  CLIENTE: 'cliente',
  ADMIN: 'admin'
};

// Categorias de posts
export const POST_CATEGORIES = [
  'Geral',
  'Artesanato',
  'Moda',
  'Beleza',
  'Tecnologia',
  'Negócios',
  'Saúde',
  'Educação',
  'Dicas',
  'Inspiração',
  'Eventos'
];

// Configurações de upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov'],
  MAX_FILES: 4
};

// Mensagens padrão
export const MESSAGES = {
  ERRORS: {
    NETWORK: 'Erro de conexão com o servidor',
    UNAUTHORIZED: 'Você precisa estar logado para realizar esta ação',
    FORBIDDEN: 'Você não tem permissão para realizar esta ação',
    NOT_FOUND: 'Recurso não encontrado',
    VALIDATION: 'Dados inválidos',
    SERVER: 'Erro interno do servidor'
  },
  SUCCESS: {
    LOGIN: 'Login realizado com sucesso!',
    REGISTER: 'Cadastro realizado com sucesso!',
    POST_CREATED: 'Post publicado com sucesso!',
    POST_UPDATED: 'Post atualizado com sucesso!',
    POST_DELETED: 'Post excluído com sucesso!',
    PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
    COMMENT_ADDED: 'Comentário adicionado com sucesso!'
  },
  LOADING: {
    DEFAULT: 'Carregando...',
    POSTS: 'Carregando posts...',
    PROFILE: 'Carregando perfil...',
    SAVING: 'Salvando...',
    UPLOADING: 'Enviando arquivo...'
  }
};

// Configurações da UI
export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000
};

// Regex patterns para validação
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^.{6,}$/ // Mínimo 6 caracteres
};

// Cores e tema
export const THEME = {
  COLORS: {
    PRIMARY: '#ff6b6b',
    SECONDARY: '#4ecdc4',
    SUCCESS: '#51cf66',
    WARNING: '#ffd43b',
    ERROR: '#ff6b6b',
    INFO: '#339af0'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px'
  }
};
