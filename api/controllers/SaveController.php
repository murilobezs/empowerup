<?php
/**
 * Controlador de Salvamentos de Posts
 */

class SaveController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Salvar/dessalvar post
     */
    public function toggleSave($postId) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se post existe
            $post = $this->db->fetch('SELECT id FROM posts WHERE id = ?', [$postId]);
            
            if (!$post) {
                echo Helper::jsonResponse(false, 'Post não encontrado', [], 404);
                return;
            }
            
            // Verificar se já salvou
            $existingSave = $this->db->fetch(
                'SELECT id FROM post_saves WHERE post_id = ? AND user_id = ?',
                [$postId, $user['id']]
            );
            
            if ($existingSave) {
                // Remover save
                $this->db->execute(
                    'DELETE FROM post_saves WHERE post_id = ? AND user_id = ?',
                    [$postId, $user['id']]
                );
                $saved = false;
                $message = 'Post removido dos salvos';
            } else {
                // Adicionar save
                $this->db->insert(
                    'INSERT INTO post_saves (post_id, user_id) VALUES (?, ?)',
                    [$postId, $user['id']]
                );
                $saved = true;
                $message = 'Post salvo';
                
                // Criar notificação para o autor do post
                $postAuthor = $this->db->fetch(
                    'SELECT user_id FROM posts WHERE id = ?',
                    [$postId]
                );
                
                if ($postAuthor) {
                    NotificationController::createNotification(
                        $postAuthor['user_id'],
                        $user['id'],
                        'save',
                        $postId
                    );
                }
            }
            
            echo Helper::jsonResponse(true, $message, [
                'saved' => $saved
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Toggle save error: ' . $e->getMessage(), ['post_id' => $postId]);
            echo Helper::jsonResponse(false, 'Erro ao salvar/dessalvar post', [], 500);
        }
    }
    
    /**
     * Listar posts salvos do usuário
     */
    public function getSavedPosts() {
        try {
            Helper::logError("Iniciando getSavedPosts");
            
            $user = AuthMiddleware::required();
            Helper::logError("User authenticated in getSavedPosts: " . $user['id'] . " - " . $user['username']);
            
            $page = intval(isset($_GET['page']) ? $_GET['page'] : 1);
            $limit = intval(isset($_GET['limit']) ? $_GET['limit'] : 20);
            $offset = ($page - 1) * $limit;
            
            Helper::logError("Searching saved posts for user ID: " . $user['id']);
            
            // Buscar posts salvos
            $posts = $this->db->fetchAll(
                'SELECT p.*, u.nome, u.username, u.avatar_url, ps.created_at as saved_at,
                        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likes_count,
                        (SELECT COUNT(*) FROM post_comentarios pc WHERE pc.post_id = p.id) as comments_count,
                        (SELECT COUNT(*) FROM post_compartilhamentos psh WHERE psh.post_id = p.id) as shares_count,
                        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as user_liked
                 FROM post_saves ps
                 INNER JOIN posts p ON ps.post_id = p.id
                 INNER JOIN usuarios u ON p.user_id = u.id
                 WHERE ps.user_id = ?
                 ORDER BY ps.created_at DESC
                 LIMIT ? OFFSET ?'
                , [$user['id'], $user['id'], $limit, $offset]
            );
            
            Helper::logError("Found " . count($posts) . " saved posts");
            
            // Buscar total
            $totalSaves = $this->db->fetch(
                'SELECT COUNT(*) as total FROM post_saves WHERE user_id = ?'
                , [$user['id']]
            );
            
            $formattedPosts = array_map(function($post) {
                return Helper::formatPost($post);
            }, $posts);
            
            Helper::logError("Returning response with " . count($formattedPosts) . " formatted posts");
            
            echo Helper::jsonResponse(true, '', [
                'posts' => $formattedPosts,
                'total' => (int)$totalSaves['total'],
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($totalSaves['total'] / $limit),
                    'hasNextPage' => ($page * $limit) < $totalSaves['total'],
                    'hasPrevPage' => $page > 1
                ]
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get saved posts error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao buscar posts salvos', [], 500);
        }
    }
    
    /**
     * Verificar se post está salvo
     */
    public function isPostSaved($postId) {
        try {
            $user = AuthMiddleware::required();
            
            $save = $this->db->fetch(
                'SELECT id FROM post_saves WHERE post_id = ? AND user_id = ?',
                [$postId, $user['id']]
            );
            
            echo Helper::jsonResponse(true, '', [
                'saved' => (bool)$save
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Check save error: ' . $e->getMessage(), ['post_id' => $postId]);
            echo Helper::jsonResponse(false, 'Erro ao verificar salvamento', [], 500);
        }
    }
}
