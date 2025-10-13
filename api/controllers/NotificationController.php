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
                        p.conteudo as post_content,
                        pc.conteudo as comment_content,
                        c.titulo as course_title,
                        conv.nome as conversa_nome
                 FROM notifications n
                 LEFT JOIN usuarios fu ON n.from_user_id = fu.id
                 LEFT JOIN posts p ON n.post_id = p.id
                 LEFT JOIN post_comentarios pc ON n.comment_id = pc.id
                 LEFT JOIN courses c ON n.type = "course" AND n.contexto_id = c.id
                 LEFT JOIN conversas conv ON n.type IN ("message","group") AND n.contexto_id = conv.id
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
                $extraData = [];
                if (!empty($notification['data_extra'])) {
                    $decoded = json_decode($notification['data_extra'], true);
                    if (is_array($decoded)) {
                        $extraData = $decoded;
                    }
                }

                $presentation = self::buildNotificationPresentation($notification, $extraData);
                $message = $notification['message'] ?: $presentation['message'];
                $metadata = $presentation['metadata'];
                $metadataOutput = !empty($metadata) ? $metadata : null;

                return [
                    'id' => (int)$notification['id'],
                    'type' => $notification['type'],
                    'category' => $notification['categoria'] ?? self::mapTypeToCategory($notification['type'] ?? 'social'),
                    'message' => $message,
                    'is_read' => (bool)$notification['is_read'],
                    'created_at' => $notification['created_at'],
                    'context_id' => $notification['contexto_id'] ? (int)$notification['contexto_id'] : null,
                    'metadata' => $metadataOutput,
                    'extra' => $metadataOutput,
                    'from_user' => $notification['from_user_id'] ? [
                        'id' => (int)$notification['from_user_id'],
                        'nome' => $notification['from_user_nome'],
                        'username' => $notification['from_user_username'],
                        'avatar_url' => $notification['from_user_avatar']
                    ] : null,
                    'post' => $notification['post_id'] ? [
                        'id' => (int)$notification['post_id'],
                        'conteudo' => $notification['post_content']
                    ] : null,
                    'comment' => $notification['comment_id'] ? [
                        'id' => (int)$notification['comment_id'],
                        'conteudo' => $notification['comment_content']
                    ] : null,
                    'course' => $notification['type'] === 'course' ? [
                        'id' => (int)($notification['contexto_id'] ?? 0),
                        'titulo' => $notification['course_title']
                    ] : null,
                    'conversation' => in_array($notification['type'], ['message', 'group'], true) ? [
                        'id' => (int)($notification['contexto_id'] ?? 0),
                        'nome' => $notification['conversa_nome']
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
    public static function createNotification(
        $userId,
        $fromUserId,
        $type,
        $postId = null,
        $commentId = null,
        $message = null,
        $contextId = null,
        $category = null,
        $extraData = null
    ) {
        try {
            // Não criar notificação para si mesmo
            if ($userId == $fromUserId) {
                return;
            }
            
            $db = Database::getInstance();

            $category = $category ?: self::mapTypeToCategory($type);
            $extraJson = $extraData ? json_encode($extraData, JSON_UNESCAPED_UNICODE) : null;
            
            // Verificar se já existe uma notificação similar recente (últimas 24h)
            $existing = $db->fetch(
                'SELECT id FROM notifications 
                 WHERE user_id = ? AND from_user_id <=> ? AND type = ? AND post_id <=> ?
                 AND comment_id <=> ? AND contexto_id <=> ?
                 AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
                 LIMIT 1',
                [$userId, $fromUserId, $type, $postId, $commentId, $contextId]
            );
            
            if ($existing) {
                // Atualizar timestamp da notificação existente
                $db->execute(
                    'UPDATE notifications SET created_at = NOW(), is_read = FALSE, message = ?, data_extra = ? WHERE id = ?',
                    [$message, $extraJson, $existing['id']]
                );
            } else {
                // Criar nova notificação
                $db->insert(
                    'INSERT INTO notifications (user_id, from_user_id, type, categoria, post_id, comment_id, contexto_id, message, data_extra) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [$userId, $fromUserId, $type, $category, $postId, $commentId, $contextId, $message, $extraJson]
                );
            }
            
        } catch (Exception $e) {
            Helper::logError('Create notification error: ' . $e->getMessage(), [
                'user_id' => $userId,
                'from_user_id' => $fromUserId,
                'type' => $type,
                'context_id' => $contextId
            ]);
        }
    }

    private static function mapTypeToCategory(string $type): string {
        switch ($type) {
            case 'message':
                return 'mensagem';
            case 'group':
                return 'grupos';
            case 'course':
                return 'cursos';
            case 'system':
                return 'sistema';
            default:
                return 'social';
        }
    }

    private static function buildNotificationPresentation(array $notification, array $extra): array {
        $metadata = $extra;
        $type = $notification['type'] ?? 'system';
        $actorName = $notification['from_user_nome'] ?? ($metadata['actor_name'] ?? null);

        if ($actorName) {
            $metadata['actor_name'] = $actorName;
        }

        if (!empty($notification['from_user_username'])) {
            $metadata['actor_username'] = $notification['from_user_username'];
        }

        if (!empty($notification['from_user_avatar'])) {
            $metadata['actor_avatar'] = $notification['from_user_avatar'];
        }

        if (!empty($notification['post_id'])) {
            $metadata['post_id'] = (int)$notification['post_id'];
        }

        if (!empty($notification['comment_id'])) {
            $metadata['comment_id'] = (int)$notification['comment_id'];
        }

        if (!empty($notification['contexto_id'])) {
            $metadata['context_id'] = (int)$notification['contexto_id'];
        }

        $postSnippet = self::makeSnippet($notification['post_content'] ?? null);
        $commentSnippet = self::makeSnippet($notification['comment_content'] ?? null);

        if ($postSnippet && !isset($metadata['post_excerpt'])) {
            $metadata['post_excerpt'] = $postSnippet;
        }

        if ($commentSnippet && !isset($metadata['comment_excerpt'])) {
            $metadata['comment_excerpt'] = $commentSnippet;
        }
        $conversationName = $notification['conversa_nome'] ?? ($metadata['conversation_name'] ?? null);

        $message = 'Você tem uma nova notificação';

        switch ($type) {
            case 'follow':
                $message = 'começou a seguir você';
                break;
            case 'like':
                $message = 'curtiu seu post';
                if (!isset($metadata['subtitle']) && $postSnippet) {
                    $metadata['subtitle'] = self::decorateSnippet($postSnippet);
                }
                break;
            case 'comment':
                $message = 'comentou no seu post';
                if (!isset($metadata['subtitle'])) {
                    if ($commentSnippet) {
                        $metadata['subtitle'] = self::decorateSnippet($commentSnippet);
                    } elseif ($postSnippet) {
                        $metadata['subtitle'] = self::decorateSnippet($postSnippet);
                    }
                }
                break;
            case 'save':
                $message = 'salvou seu post';
                if (!isset($metadata['subtitle']) && $postSnippet) {
                    $metadata['subtitle'] = self::decorateSnippet($postSnippet);
                }
                break;
            case 'message':
                $message = 'lhe enviou uma mensagem';
                if (!isset($metadata['subtitle'])) {
                    $preview = $metadata['preview'] ?? null;
                    if ($preview) {
                        $metadata['subtitle'] = self::decorateSnippet(self::makeSnippet($preview));
                    } elseif ($conversationName) {
                        $metadata['subtitle'] = 'Conversa: ' . $conversationName;
                    }
                }
                if ($conversationName && !isset($metadata['conversation_name'])) {
                    $metadata['conversation_name'] = $conversationName;
                }
                break;
            case 'group':
                $message = $notification['message'] ?: 'Atualização no seu grupo';
                if ($conversationName && !isset($metadata['subtitle'])) {
                    $metadata['subtitle'] = $conversationName;
                }
                break;
            case 'course':
                $message = $notification['message'] ?: 'Atualização nos seus cursos';
                if (!isset($metadata['subtitle']) && !empty($notification['course_title'])) {
                    $metadata['subtitle'] = $notification['course_title'];
                }
                break;
            case 'system':
                $message = $notification['message'] ?: 'Atualização importante do sistema';
                break;
            default:
                if ($notification['message']) {
                    $message = $notification['message'];
                }
        }

        $metadata['type'] = $type;

        return [
            'message' => $message,
            'metadata' => $metadata,
        ];
    }

    private static function makeSnippet(?string $text, int $limit = 80): ?string {
        if ($text === null) {
            return null;
        }

        $clean = trim(strip_tags($text));
        if ($clean === '') {
            return null;
        }

        if (mb_strlen($clean) > $limit) {
            return mb_substr($clean, 0, $limit - 1) . '…';
        }

        return $clean;
    }

    private static function decorateSnippet(?string $snippet): ?string {
        if ($snippet === null || $snippet === '') {
            return null;
        }

        // Evitar decorar texto que já contém aspas
        $trimmed = trim($snippet);
        $firstChar = mb_substr($trimmed, 0, 1);
        if (in_array($firstChar, ['"', "'"], true)) {
            return $snippet;
        }

        return '"' . $trimmed . '"';
    }
}
?>
