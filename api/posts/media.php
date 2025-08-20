<?php
// Endpoint simples para servir mídia armazenada em post_media por id
// URL: /api/posts/media.php?id={id}

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

// Apply CORS and security headers for direct access (so images can be fetched from frontend)
if (class_exists('CorsMiddleware')) {
    CorsMiddleware::handle();
    // Do not call securityHeaders here since it sets Strict-Transport-Security (safe), but keep content sniffing header
    header("X-Content-Type-Options: nosniff");
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        // Preflight handled by CorsMiddleware above, ensure we exit
        http_response_code(200);
        exit;
    }

    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID da mídia não informado']);
        exit;
    }

    $id = intval($_GET['id']);
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    $stmt = $pdo->prepare('SELECT media_type, data FROM post_media WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Mídia não encontrada']);
        exit;
    }

    // Set binary response headers explicitly — content type from DB
    $mediaType = $row['media_type'] ?: 'application/octet-stream';
    header('Content-Type: ' . $mediaType);
    header('Content-Length: ' . strlen($row['data']));
    header('Cache-Control: public, max-age=31536000');

    // For binary output, echo raw data
    echo $row['data'];
    exit;
} catch (Exception $e) {
    Helper::logError('Media serve error: ' . $e->getMessage(), ['media_id' => $_GET['id'] ?? null]);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao servir mídia']);
    exit;
}
