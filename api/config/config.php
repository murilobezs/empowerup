<?php
/**
 * Configurações da aplicação
 */

// Configurações do banco de dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'empowerup');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Configurações JWT
define('JWT_SECRET', 'sua_chave_super_secreta_aqui_2024_empowerup');
define('JWT_EXPIRE', 604800); // 7 dias em segundos

// Configurações de upload
define('UPLOAD_PATH', '../public/images/');
define('MAX_FILE_SIZE', 10485760); // 10MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
define('ALLOWED_VIDEO_EXTENSIONS', ['mp4', 'avi', 'mov', 'wmv']);

// Configurações gerais
define('API_VERSION', '1.0.0');
define('TIMEZONE', 'America/Sao_Paulo');
define('DEBUG_MODE', true);

// Headers CORS
define('CORS_ORIGINS', [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
]);

// Rate limiting
define('RATE_LIMIT_REQUESTS', 100);
define('RATE_LIMIT_WINDOW', 900); // 15 minutos

// Configurações de segurança
define('PASSWORD_MIN_LENGTH', 6);
define('USERNAME_MIN_LENGTH', 3);
define('USERNAME_MAX_LENGTH', 50);

// Configurar timezone
date_default_timezone_set(TIMEZONE);

// Configurar exibição de erros
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}
