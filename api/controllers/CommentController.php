<?php
/**
 * Controlador de Comentários
 */

class CommentController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Listar comentários de um post
     */
    public function getComments($postId) {
        try {
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 10); // Reduzido de 20 para 10
            $offset = ($page - 1) * $limit;
            
            $currentUser = AuthMiddleware::optional();
            $currentUserId = $currentUser ? $currentUser['id'] : null;
            
            // Query otimizada para buscar comentários e respostas em uma única consulta
            $allComments = $this->db->fetchAll(
    'SELECT c.*, u.nome as autor, u.username, u.avatar_url as avatar, u.avatar_url as avatar_url,
                        CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END as main_comment_id
                 FROM post_comentarios c
                 INNER JOIN usuarios u ON c.user_id = u.id
                 WHERE c.post_id = ?
                 ORDER BY main_comment_id, c.parent_id IS NOT NULL, c.created_at ASC',
                [$postId]
            );
            
            // Organizar comentários e respostas
            $commentsWithReplies = [];
            $commentMap = [];
            
            foreach ($allComments as $comment) {
                $formattedComment = Helper::formatComment($comment, $currentUserId);
                
                if ($comment['parent_id'] === null) {
                    // Comentário principal
                    $formattedComment['replies'] = [];
                    $commentsWithReplies[] = $formattedComment;
                    $commentMap[$comment['id']] = count($commentsWithReplies) - 1;
                } else {
                    // Resposta - adicionar ao comentário pai
                    if (isset($commentMap[$comment['parent_id']])) {
                        $commentsWithReplies[$commentMap[$comment['parent_id']]]['replies'][] = $formattedComment;
                    }
                }
            }
            
            // Aplicar paginação apenas nos comentários principais
            $paginatedComments = array_slice($commentsWithReplies, $offset, $limit);
            
            // Buscar total de comentários (apenas principais para paginação)
            $totalComments = $this->db->fetch(
                'SELECT COUNT(*) as total FROM post_comentarios WHERE post_id = ? AND parent_id IS NULL',
                [$postId]
            );
            
            echo Helper::jsonResponse(true, '', [
                'comments' => $paginatedComments,
                'total' => (int)$totalComments['total'],
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($totalComments['total'] / $limit),
                    'hasNextPage' => ($page * $limit) < $totalComments['total'],
                    'hasPrevPage' => $page > 1
                ]
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get comments error: ' . $e->getMessage(), ['post_id' => $postId]);
            echo Helper::jsonResponse(false, 'Erro ao buscar comentários', [], 500);
        }
    }
    
    /**
     * Criar comentário
     */
    public function createComment($postId) {
        try {
            $user = AuthMiddleware::required();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }
            
            // Validar dados
            $validator = new Validator($data);
            $validator
                ->required('conteudo', 'Conteúdo do comentário é obrigatório')
                ->max('conteudo', 500, 'Comentário deve ter no máximo 500 caracteres');
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            // Verificar se post existe
            $post = $this->db->fetch('SELECT id FROM posts WHERE id = ?', [$postId]);
            
            if (!$post) {
                echo Helper::jsonResponse(false, 'Post não encontrado', [], 404);
                return;
            }
            
            // Se é resposta, verificar se comentário pai existe
            $parentId = $data['parent_id'] ?? null;
            if ($parentId) {
                $parentComment = $this->db->fetch(
                    'SELECT id FROM post_comentarios WHERE id = ? AND post_id = ?',
                    [$parentId, $postId]
                );
                
                if (!$parentComment) {
                    echo Helper::jsonResponse(false, 'Comentário pai não encontrado', [], 404);
                    return;
                }
            }
            
            // Criar comentário
            $commentId = $this->db->insert(
                'INSERT INTO post_comentarios (post_id, user_id, conteudo, parent_id) VALUES (?, ?, ?, ?)',
                [$postId, $user['id'], Helper::sanitizeString($data['conteudo']), $parentId]
            );
            
            // Buscar comentário criado
            $newComment = $this->db->fetch(
                'SELECT c.*, u.nome as autor, u.username, u.avatar_url as avatar, u.avatar_url as avatar_url
                 FROM post_comentarios c
                 INNER JOIN usuarios u ON c.user_id = u.id
                 WHERE c.id = ?',
                [$commentId]
            );
            
            // Criar notificação para o autor do post
            $postAuthor = $this->db->fetch(
                'SELECT user_id FROM posts WHERE id = ?',
                [$postId]
            );
            
            if ($postAuthor) {
                NotificationController::createNotification(
                    $postAuthor['user_id'],
                    $user['id'],
                    'comment',
                    $postId,
                    $commentId
                );
            }
            
            echo Helper::jsonResponse(true, 'Comentário criado com sucesso', [
                'comment' => Helper::formatComment($newComment, $user['id'])
            ], 201);
            
        } catch (Exception $e) {
            Helper::logError('Create comment error: ' . $e->getMessage(), ['post_id' => $postId]);
            echo Helper::jsonResponse(false, 'Erro ao criar comentário', [], 500);
        }
    }
    
    /**
     * Atualizar comentário
     */
    public function updateComment($commentId) {
        try {
            $user = AuthMiddleware::required();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || !isset($data['conteudo']) || empty(trim($data['conteudo']))) {
                echo Helper::jsonResponse(false, 'Conteúdo do comentário é obrigatório', [], 400);
                return;
            }
            
            // Verificar se comentário existe e pertence ao usuário
            $comment = $this->db->fetch(
                'SELECT user_id FROM post_comentarios WHERE id = ?',
                [$commentId]
            );
            
            if (!$comment) {
                echo Helper::jsonResponse(false, 'Comentário não encontrado', [], 404);
                return;
            }
            
            if ($comment['user_id'] != $user['id']) {
                echo Helper::jsonResponse(false, 'Não autorizado a editar este comentário', [], 403);
                return;
            }
            
            // Atualizar comentário
            $this->db->execute(
                'UPDATE post_comentarios SET conteudo = ?, updated_at = NOW() WHERE id = ?',
                [Helper::sanitizeString($data['conteudo']), $commentId]
            );
            
            // Buscar comentário atualizado
            $updatedComment = $this->db->fetch(
                'SELECT c.*, u.nome as autor, u.username, u.avatar_url as avatar
                 FROM post_comentarios c
                 INNER JOIN usuarios u ON c.user_id = u.id
                 WHERE c.id = ?',
                [$commentId]
            );
            
            echo Helper::jsonResponse(true, 'Comentário atualizado com sucesso', [
                'comment' => Helper::formatComment($updatedComment, $user['id'])
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Update comment error: ' . $e->getMessage(), ['comment_id' => $commentId]);
            echo Helper::jsonResponse(false, 'Erro ao atualizar comentário', [], 500);
        }
    }
    
    /**
     * Deletar comentário
     */
    public function deleteComment($commentId) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se comentário existe e pertence ao usuário
            $comment = $this->db->fetch(
                'SELECT user_id FROM post_comentarios WHERE id = ?',
                [$commentId]
            );
            
            if (!$comment) {
                echo Helper::jsonResponse(false, 'Comentário não encontrado', [], 404);
                return;
            }
            
            if ($comment['user_id'] != $user['id']) {
                echo Helper::jsonResponse(false, 'Não autorizado a deletar este comentário', [], 403);
                return;
            }
            
            // Deletar comentário (cascade deletará as respostas)
            $this->db->execute('DELETE FROM post_comentarios WHERE id = ?', [$commentId]);
            
            echo Helper::jsonResponse(true, 'Comentário deletado com sucesso');
            
        } catch (Exception $e) {
            Helper::logError('Delete comment error: ' . $e->getMessage(), ['comment_id' => $commentId]);
            echo Helper::jsonResponse(false, 'Erro ao deletar comentário', [], 500);
        }
    }
}
