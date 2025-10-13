<?php
// Compatibilidade: endpoint usado pelo frontend para obter posts com metadata de mídia

require_once __DIR__ . '/../config/config.php';

// Autoload (copiado do index)
spl_autoload_register(function ($class) {
    $directories = [
        __DIR__ . '/../config/',
        __DIR__ . '/../utils/',
        __DIR__ . '/../middleware/',
        __DIR__ . '/../controllers/'
    ];
    foreach ($directories as $directory) {
        $file = $directory . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Apply CORS and security headers for direct access (ensures preflight and cross-origin requests work)
if (class_exists('CorsMiddleware')) {
    CorsMiddleware::handle();
    CorsMiddleware::securityHeaders();
}

// Content-Type after CORS headers
header('Content-Type: application/json; charset=utf-8');

try {
    $controller = new PostController();
    // Delegar para o método getPosts que já formata e retorna JSON
    $controller->getPosts();
} catch (Exception $e) {
    Helper::logError('postagens_blob error: ' . $e->getMessage());
    echo Helper::jsonResponse(false, 'Erro interno', [], 500);
}
