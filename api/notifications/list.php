<?php
require_once '../config/Database.php';
require_once '../middleware/CorsMiddleware.php';
require_once '../middleware/AuthMiddleware.php';
require_once '../controllers/NotificationController.php';
require_once '../utils/Helper.php';

CorsMiddleware::handle();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo Helper::jsonResponse(false, 'Método não permitido', [], 405);
    exit;
}

try {
    $controller = new NotificationController();
    $controller->getNotifications();
} catch (Exception $e) {
    error_log("Erro ao listar notificações: " . $e->getMessage());
    echo Helper::jsonResponse(false, 'Erro interno do servidor', [], 500);
}
