<?php
require_once '../config/Database.php';
require_once '../middleware/CorsMiddleware.php';
require_once '../middleware/AuthMiddleware.php';
require_once '../utils/Helper.php';

CorsMiddleware::handle();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo Helper::jsonResponse(false, 'Método não permitido', [], 405);
    exit;
}

// Verificar autenticação
$user = AuthMiddleware::optional();
if (!$user) {
    echo Helper::jsonResponse(false, 'Token inválido ou expirado', [], 401);
    exit;
}

// Obter dados da requisição
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['notification_id'])) {
    echo Helper::jsonResponse(false, 'ID da notificação é obrigatório');
    exit;
}

$notificationId = $input['notification_id'];

try {
    $db = Database::getInstance()->getConnection();
    
    // Verificar se a notificação pertence ao usuário
    $stmt = $db->prepare("
        SELECT id FROM notifications 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$notificationId, $user['id']]);
    
    if (!$stmt->fetch()) {
        echo Helper::jsonResponse(false, 'Notificação não encontrada');
        exit;
    }
    
    // Marcar como lida
    $stmt = $db->prepare("
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ? AND user_id = ?
    ");
    
    if ($stmt->execute([$notificationId, $user['id']])) {
        echo Helper::jsonResponse(true, 'Notificação marcada como lida');
    } else {
        echo Helper::jsonResponse(false, 'Erro ao marcar notificação como lida');
    }
    
} catch (Exception $e) {
    error_log("Erro ao marcar notificação como lida: " . $e->getMessage());
    echo Helper::jsonResponse(false, 'Erro interno do servidor', [], 500);
}
