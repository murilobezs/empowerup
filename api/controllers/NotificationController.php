<?php
/**
 * Controlador de Notificações
 */

class NotificationController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Listar notificações do usuário
     */
    public function getNotifications() {
        try {
            $user = AuthMiddleware::required();
            
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 20);
            $offset = ($page - 1) * $limit;
            
            // Buscar notificações
            $notifications = $this->db->fetchAll(
                'SELECT n.*, 
                        fu.nome as from_user_nome, 
                        fu.username as from_user_username, 
                        fu.avatar_url as from_user_avatar,
                        p.conteudo as post_content
                 FROM notifications n
                 LEFT JOIN usuarios fu ON n.from_user_id = fu.id
                 LEFT JOIN posts p ON n.post_id = p.id
                 WHERE n.user_id = ?
                 ORDER BY n.created_at DESC
                 LIMIT ? OFFSET ?',
                [$user['id'], $limit, $offset]
            );
            
            // Contar total e não lidas
            $totalResult = $this->db->fetch(
                'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
                [$user['id']]
            );
            
            $unreadResult = $this->db->fetch(
                'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
                [$user['id']]
            );
            
            // Formatar notificações
            $formattedNotifications = array_map(function($notification) {
                return [
                    'id' => (int)$notification['id'],
                    'type' => $notification['type'],
                    'message' => $notification['message'],
                    'is_read' => (bool)$notification['is_read'],
                    'created_at' => $notification['created_at'],
                    'from_user' => $notification['from_user_id'] ? [
                        'id' => (int)$notification['from_user_id'],
                        'nome' => $notification['from_user_nome'],
                        'username' => $notification['from_user_username'],
                        'avatar_url' => $notification['from_user_avatar']
                    ] : null,
                    'post' => $notification['post_id'] ? [
                        'id' => (int)$notification['post_id'],
                        'conteudo' => $notification['post_content']
                    ] : null
                ];
            }, $notifications);
            
            echo Helper::jsonResponse(true, '', [
                'notifications' => $formattedNotifications,
                'unread_count' => (int)$unreadResult['unread'],
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($totalResult['total'] / $limit),
                    'total' => (int)$totalResult['total'],
                    'hasNextPage' => ($page * $limit) < $totalResult['total'],
                    'hasPrevPage' => $page > 1
                ]
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get notifications error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao buscar notificações', [], 500);
        }
    }
    
    /**
     * Marcar notificação como lida
     */
    public function markAsRead($notificationId) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se a notificação pertence ao usuário
            $notification = $this->db->fetch(
                'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
                [$notificationId, $user['id']]
            );
            
            if (!$notification) {
                echo Helper::jsonResponse(false, 'Notificação não encontrada', [], 404);
                return;
            }
            
            // Marcar como lida
            $this->db->execute(
                'UPDATE notifications SET is_read = TRUE WHERE id = ?',
                [$notificationId]
            );
            
            echo Helper::jsonResponse(true, 'Notificação marcada como lida');
            
        } catch (Exception $e) {
            Helper::logError('Mark notification as read error: ' . $e->getMessage(), ['notification_id' => $notificationId]);
            echo Helper::jsonResponse(false, 'Erro ao marcar notificação como lida', [], 500);
        }
    }
    
    /**
     * Marcar todas as notificações como lidas
     */
    public function markAllAsRead() {
        try {
            $user = AuthMiddleware::required();
            
            $this->db->execute(
                'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
                [$user['id']]
            );
            
            echo Helper::jsonResponse(true, 'Todas as notificações foram marcadas como lidas');
            
        } catch (Exception $e) {
            Helper::logError('Mark all notifications as read error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao marcar todas as notificações como lidas', [], 500);
        }
    }
    
    /**
     * Criar notificação
     */
    public static function createNotification($userId, $fromUserId, $type, $postId = null, $commentId = null, $message = null) {
        try {
            // Não criar notificação para si mesmo
            if ($userId == $fromUserId) {
                return;
            }
            
            $db = Database::getInstance();
            
            // Verificar se já existe uma notificação similar recente (últimas 24h)
            $existing = $db->fetch(
                'SELECT id FROM notifications 
                 WHERE user_id = ? AND from_user_id = ? AND type = ? AND post_id = ? 
                 AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)',
                [$userId, $fromUserId, $type, $postId]
            );
            
            if ($existing) {
                // Atualizar timestamp da notificação existente
                $db->execute(
                    'UPDATE notifications SET created_at = NOW(), is_read = FALSE WHERE id = ?',
                    [$existing['id']]
                );
            } else {
                // Criar nova notificação
                $db->insert(
                    'INSERT INTO notifications (user_id, from_user_id, type, post_id, comment_id, message) 
                     VALUES (?, ?, ?, ?, ?, ?)',
                    [$userId, $fromUserId, $type, $postId, $commentId, $message]
                );
            }
            
        } catch (Exception $e) {
            Helper::logError('Create notification error: ' . $e->getMessage(), [
                'user_id' => $userId,
                'from_user_id' => $fromUserId,
                'type' => $type
            ]);
        }
    }
}
?>
