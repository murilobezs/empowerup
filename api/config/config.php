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

// Mail / SMTP configuration
// To enable SMTP set SMTP_ENABLED to true and fill SMTP_PASSWORD
define('SMTP_ENABLED', true);
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_ENCRYPTION', 'tls'); // none | tls | ssl
define('SMTP_USERNAME', 'muriscamroll@gmail.com');
define('SMTP_PASSWORD', 'lroc xdio aesy tnov'); // <-- put your SMTP password or app password here
define('MAIL_FROM', SMTP_USERNAME);
define('MAIL_FROM_NAME', 'EmpowerUp');

// Headers CORS
define('CORS_ORIGINS', [
    'https://www.empowerup.com.br',
    // Desenvolvimento local
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
