<?php
/**
 * Configurações da aplicação
 */

// Carregar variáveis de ambiente
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

loadEnv(__DIR__ . '/.env');

// Helpers
$detectedScheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$detectedHost = $_SERVER['HTTP_HOST'] ?? 'localhost:5173';
$detectedBaseUrl = $detectedScheme . '://' . $detectedHost;

// Configurações do banco de dados
define('DB_HOST', $_ENV['DB_HOST'] ?? '127.0.0.1:3306');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'u459313419_empowerup');
define('DB_USER', $_ENV['DB_USER'] ?? 'u459313419_empowerup');
define('DB_PASS', $_ENV['DB_PASS'] ?? 'EMPOWERup2025@');
define('DB_CHARSET', $_ENV['DB_CHARSET'] ?? 'utf8mb4');

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
define('DEBUG_MODE', isset($_ENV['DEBUG_MODE']) ? filter_var($_ENV['DEBUG_MODE'], FILTER_VALIDATE_BOOLEAN) : true);

// Configurações de URL da aplicação
$frontendUrl = $_ENV['FRONTEND_URL'] ?? $_ENV['APP_URL'] ?? $detectedBaseUrl;
define('FRONTEND_URL', rtrim($frontendUrl, '/'));

// URL base do frontend para links enviados por email
$configuredFrontend = $_ENV['APP_BASE_URL'] ?? $_ENV['FRONTEND_URL'] ?? $_ENV['FRONTEND_BASE_URL'] ?? null;
define('APP_BASE_URL', $configuredFrontend ? rtrim($configuredFrontend, '/') : '');

// Feature flags
define('RUN_AUTO_MIGRATIONS', isset($_ENV['RUN_AUTO_MIGRATIONS']) ? filter_var($_ENV['RUN_AUTO_MIGRATIONS'], FILTER_VALIDATE_BOOLEAN) : true);

// Mail / SMTP configuration
define('SMTP_ENABLED', true);
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_ENCRYPTION', 'tls'); // none | tls | ssl
define('SMTP_USERNAME', 'muriscamroll@gmail.com');
define('SMTP_PASSWORD', 'lroc xdio aesy tnov'); // 
define('MAIL_FROM', SMTP_USERNAME);
define('MAIL_FROM_NAME', 'EmpowerUp');

// Headers CORS
$defaultCorsOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://www.empowerup.com.br',
    'https://empowerup.com.br',
    'https://cursos.empowerup.com.br'
];

if (!empty($_ENV['CORS_ORIGINS'])) {
    $envOrigins = array_filter(array_map('trim', explode(',', $_ENV['CORS_ORIGINS'])));
    define('CORS_ORIGINS', $envOrigins ?: $defaultCorsOrigins);
} else {
    define('CORS_ORIGINS', $defaultCorsOrigins);
}

// Rate limiting
define('RATE_LIMIT_REQUESTS', 100);
define('RATE_LIMIT_WINDOW', 900); // 15 minutos


define('ADMIN_USERNAME', $_ENV['ADMIN_USERNAME'] ?? 'admin');
define('ADMIN_PASSWORD', $_ENV['ADMIN_PASSWORD'] ?? 'admin123');
define('ADMIN_JWT_SECRET', $_ENV['ADMIN_JWT_SECRET'] ?? 'empowerup_admin_secret_2025');
define('ADMIN_JWT_EXPIRE', isset($_ENV['ADMIN_JWT_EXPIRE']) ? (int)$_ENV['ADMIN_JWT_EXPIRE'] : 60 * 60 * 12); // padrão: 12h
define('ADMIN_EVENT_CREATOR_ID', isset($_ENV['ADMIN_EVENT_CREATOR_ID']) ? (int)$_ENV['ADMIN_EVENT_CREATOR_ID'] : 1);
define('ADMIN_EVENT_CREATOR_EMAIL', $_ENV['ADMIN_EVENT_CREATOR_EMAIL'] ?? 'eventos@empowerup.local');
define('ADMIN_EVENT_CREATOR_USERNAME', $_ENV['ADMIN_EVENT_CREATOR_USERNAME'] ?? 'empowerup_eventos');
define('ADMIN_EVENT_CREATOR_NAME', $_ENV['ADMIN_EVENT_CREATOR_NAME'] ?? 'Equipe EmpowerUp');
define('ADMIN_EVENT_CREATOR_TYPE', $_ENV['ADMIN_EVENT_CREATOR_TYPE'] ?? 'cliente');

// Configurações de segurança
define('PASSWORD_MIN_LENGTH', 6);
define('USERNAME_MIN_LENGTH', 3);
define('USERNAME_MAX_LENGTH', 50);

// Configurar timezone
date_default_timezone_set(TIMEZONE);

// Incluir configurações específicas de produção
if (!DEBUG_MODE) {
    require_once __DIR__ . '/../production_config.php';
}

// Configurar exibição de erros
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/debug_errors.log');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/production_errors.log');
}
