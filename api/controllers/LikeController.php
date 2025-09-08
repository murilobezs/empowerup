<?php
/**
 * Controlador de Likes e Compartilhamentos
 */

class LikeController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Curtir/Descurtir post
     */
    public function toggleLike($postId) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se post existe
            $post = $this->db->fetch('SELECT id FROM posts WHERE id = ?', [$postId]);
            
            if (!$post) {
                echo Helper::jsonResponse(false, 'Post não encontrado', [], 404);
                return;
            }
            
            // Verificar se já curtiu
            $existingLike = $this->db->fetch(
                'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
                [$postId, $user['id']]
            );
            
            if ($existingLike) {
                // Remover like
                $this->db->execute(
                    'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
                    [$postId, $user['id']]
                );
                $liked = false;
                $message = 'Like removido';
            } else {
                // Adicionar like
                $this->db->insert(
                    'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
                    [$postId, $user['id']]
                );
                $liked = true;
                $message = 'Post curtido';
                
                // Criar notificação para o autor do post
                $postAuthor = $this->db->fetch(
                    'SELECT user_id FROM posts WHERE id = ?',
                    [$postId]
                );
                
                if ($postAuthor) {
                    NotificationController::createNotification(
                        $postAuthor['user_id'],
                        $user['id'],
                        'like',
                        $postId
                    );
                }
            }
            
            // Buscar contagem atualizada
            $likesCount = $this->db->fetch(
                'SELECT COUNT(*) as total FROM post_likes WHERE post_id = ?',
                [$postId]
            );
            
            echo Helper::jsonResponse(true, $message, [
                'liked' => $liked,
                'likesCount' => (int)$likesCount['total']
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Toggle like error: ' . $e->getMessage(), ['post_id' => $postId]);
            echo Helper::jsonResponse(false, 'Erro ao curtir/descurtir post', [], 500);
        }
    }
    
    /**
     * Listar usuários que curtiram
     */
    public function getLikes($postId) {
        try {
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 20);
            $offset = ($page - 1) * $limit;
            
            // Buscar likes
            $likes = $this->db->fetchAll(
                'SELECT u.id, u.nome, u.username, u.avatar_url, pl.created_at
                 FROM post_likes pl
                 INNER JOIN usuarios u ON pl.user_id = u.id
                 WHERE pl.post_id = ?
                 ORDER BY pl.created_at DESC
                 LIMIT ? OFFSET ?',
                [$postId, $limit, $offset]
            );
            
            // Buscar total
            $totalLikes = $this->db->fetch(
                'SELECT COUNT(*) as total FROM post_likes WHERE post_id = ?',
                [$postId]
            );
            
            $formattedLikes = array_map(function($like) {
                return [
                    'user' => [
                        'id' => (int)$like['id'],
                        'nome' => $like['nome'],
                        'username' => $like['username'],
                        'avatar_url' => $like['avatar_url']
                    ],
                    'created_at' => $like['created_at']
                ];
            }, $likes);
            
            echo Helper::jsonResponse(true, '', [
                'likes' => $formattedLikes,
                'total' => (int)$totalLikes['total'],
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($totalLikes['total'] / $limit),
                    'hasNextPage' => ($page * $limit) < $totalLikes['total'],
                    'hasPrevPage' => $page > 1
                ]
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get likes error: ' . $e->getMessage(), ['post_id' => $postId]);
            echo Helper::jsonResponse(false, 'Erro ao buscar likes', [], 500);
        }
    }
    
    /**
     * Compartilhar post
     */
    public function sharePost($postId) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se post existe
            $post = $this->db->fetch('SELECT id FROM posts WHERE id = ?', [$postId]);
            
            if (!$post) {
                echo Helper::jsonResponse(false, 'Post não encontrado', [], 404);
                return;
            }
            
            // Verificar se já compartilhou
            $existingShare = $this->db->fetch(
                'SELECT id FROM post_compartilhamentos WHERE post_id = ? AND user_id = ?',
                [$postId, $user['id']]
            );
            
            if ($existingShare) {
                echo Helper::jsonResponse(false, 'Post já foi compartilhado', [], 400);
                return;
            }
            
            // Adicionar compartilhamento
            $this->db->insert(
                'INSERT INTO post_compartilhamentos (post_id, user_id) VALUES (?, ?)',
                [$postId, $user['id']]
            );
            
            // Buscar contagem atualizada
            $sharesCount = $this->db->fetch(
                'SELECT COUNT(*) as total FROM post_compartilhamentos WHERE post_id = ?',
                [$postId]
            );
            
            echo Helper::jsonResponse(true, 'Post compartilhado com sucesso', [
                'sharesCount' => (int)$sharesCount['total']
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Share post error: ' . $e->getMessage(), ['post_id' => $postId]);
            echo Helper::jsonResponse(false, 'Erro ao compartilhar post', [], 500);
        }
    }
    
    /**
     * Listar usuários que compartilharam
     */
    public function getShares($postId) {
        try {
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 20);
            $offset = ($page - 1) * $limit;
            
            // Buscar compartilhamentos
            $shares = $this->db->fetchAll(
                'SELECT u.id, u.nome, u.username, u.avatar_url, pc.created_at
                 FROM post_compartilhamentos pc
                 INNER JOIN usuarios u ON pc.user_id = u.id
                 WHERE pc.post_id = ?
                 ORDER BY pc.created_at DESC
                 LIMIT ? OFFSET ?',
                [$postId, $limit, $offset]
            );
            
            // Buscar total
            $totalShares = $this->db->fetch(
                'SELECT COUNT(*) as total FROM post_compartilhamentos WHERE post_id = ?',
                [$postId]
            );
            
            $formattedShares = array_map(function($share) {
                return [
                    'user' => [
                        'id' => (int)$share['id'],
                        'nome' => $share['nome'],
                        'username' => $share['username'],
                        'avatar_url' => $share['avatar_url']
                    ],
                    'created_at' => $share['created_at']
                ];
            }, $shares);
            
            echo Helper::jsonResponse(true, '', [
                'shares' => $formattedShares,
                'total' => (int)$totalShares['total'],
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($totalShares['total'] / $limit),
                    'hasNextPage' => ($page * $limit) < $totalShares['total'],
                    'hasPrevPage' => $page > 1
                ]
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get shares error: ' . $e->getMessage(), ['post_id' => $postId]);
            echo Helper::jsonResponse(false, 'Erro ao buscar compartilhamentos', [], 500);
        }
    }
}
