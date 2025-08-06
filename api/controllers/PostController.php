<?php
/**
 * Controlador de Posts
 */

class PostController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Listar posts
     */
    public function getPosts() {
        try {
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 10);
            $categoria = $_GET['categoria'] ?? '';
            $userId = $_GET['user_id'] ?? '';
            $offset = ($page - 1) * $limit;
            
            $currentUser = AuthMiddleware::optional();
            $currentUserId = $currentUser ? $currentUser['id'] : null;
            
            // Query base
            $query = "
                SELECT p.*, 
                       u.nome as autor, 
                       u.username, 
                       u.avatar_url as avatar
            ";
            
            // Adicionar verificação de like se usuário logado
            if ($currentUserId) {
                $query .= ",
                       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as isLiked
                ";
            } else {
                $query .= ", 0 as isLiked";
            }
            
            $query .= "
                FROM posts p
                INNER JOIN usuarios u ON p.user_id = u.id
            ";
            
            // Parâmetros da query
            $params = [];
            if ($currentUserId) {
                $params[] = $currentUserId;
            }
            
            // Condições WHERE
            $conditions = [];
            
            if ($categoria && $categoria !== 'Todas') {
                $conditions[] = 'p.categoria = ?';
                $params[] = $categoria;
            }
            
            if ($userId) {
                $conditions[] = 'p.user_id = ?';
                $params[] = $userId;
            }
            
            if (!empty($conditions)) {
                $query .= ' WHERE ' . implode(' AND ', $conditions);
            }
            
            $query .= ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
            $params[] = $limit;
            $params[] = $offset;
            
            $posts = $this->db->fetchAll($query, $params);
            
            // Query para contar total
            $countQuery = 'SELECT COUNT(*) as total FROM posts p';
            $countParams = [];
            
            if ($categoria && $categoria !== 'Todas') {
                $countQuery .= ' WHERE categoria = ?';
                $countParams[] = $categoria;
            }
            
            if ($userId) {
                $countQuery .= ($categoria && $categoria !== 'Todas' ? ' AND' : ' WHERE') . ' user_id = ?';
                $countParams[] = $userId;
            }
            
            $totalResult = $this->db->fetch($countQuery, $countParams);
            $total = $totalResult['total'];
            
            // Formatar posts
            $formattedPosts = array_map(function($post) use ($currentUserId) {
                return Helper::formatPost($post, $currentUserId);
            }, $posts);
            
            echo Helper::jsonResponse(true, '', [
                'posts' => $formattedPosts,
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($total / $limit),
                    'totalPosts' => (int)$total,
                    'hasNextPage' => ($page * $limit) < $total,
                    'hasPrevPage' => $page > 1
                ]
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get posts error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao buscar posts', [], 500);
        }
    }
    
    /**
     * Buscar post por ID
     */
    public function getPost($id) {
        try {
            $currentUser = AuthMiddleware::optional();
            $currentUserId = $currentUser ? $currentUser['id'] : null;
            
            $query = "
                SELECT p.*, 
                       u.nome as autor, 
                       u.username, 
                       u.avatar_url as avatar
            ";
            
            if ($currentUserId) {
                $query .= ",
                       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as isLiked
                ";
                $params = [$currentUserId, $id];
            } else {
                $query .= ", 0 as isLiked";
                $params = [$id];
            }
            
            $query .= "
                FROM posts p
                INNER JOIN usuarios u ON p.user_id = u.id
                WHERE p.id = ?
            ";
            
            $post = $this->db->fetch($query, $params);
            
            if (!$post) {
                echo Helper::jsonResponse(false, 'Post não encontrado', [], 404);
                return;
            }
            
            echo Helper::jsonResponse(true, '', [
                'post' => Helper::formatPost($post, $currentUserId)
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get post error: ' . $e->getMessage(), ['post_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao buscar post', [], 500);
        }
    }
    
    /**
     * Criar novo post
     */
    public function createPost() {
        try {
            $user = AuthMiddleware::required();
            
            // Processar dados
            $conteudo = $_POST['conteudo'] ?? '';
            $categoria = $_POST['categoria'] ?? 'Geral';
            $tags = isset($_POST['tags']) ? json_decode($_POST['tags'], true) : [];
            
            // Validar dados
            $validator = new Validator(['conteudo' => $conteudo, 'categoria' => $categoria, 'tags' => $tags]);
            $validator
                ->required('conteudo', 'Conteúdo é obrigatório')
                ->max('conteudo', 2000, 'Conteúdo deve ter no máximo 2000 caracteres')
                ->max('categoria', 100, 'Categoria deve ter no máximo 100 caracteres');
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            $imagemUrl = null;
            $videoUrl = null;
            $tipoMidia = 'none';
            
            // Processar upload de mídia
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $imagemUrl = Helper::processUpload($_FILES['image'], 'image');
                $tipoMidia = 'imagem';
            } elseif (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
                $videoUrl = Helper::processUpload($_FILES['video'], 'video');
                $tipoMidia = 'video';
            }
            
            // Inserir post
            $postId = $this->db->insert(
                'INSERT INTO posts (user_id, autor, username, avatar, conteudo, categoria, tags, imagem_url, video_url, tipo_midia) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $user['id'],
                    $user['nome'],
                    $user['username'],
                    $user['avatar_url'],
                    Helper::sanitizeString($conteudo),
                    Helper::sanitizeString($categoria),
                    json_encode($tags),
                    $imagemUrl,
                    $videoUrl,
                    $tipoMidia
                ]
            );
            
            // Buscar post criado
            $newPost = $this->db->fetch(
                'SELECT p.*, u.nome as autor, u.username, u.avatar_url as avatar, 0 as isLiked
                 FROM posts p
                 INNER JOIN usuarios u ON p.user_id = u.id
                 WHERE p.id = ?',
                [$postId]
            );
            
            echo Helper::jsonResponse(true, 'Post criado com sucesso', [
                'post' => Helper::formatPost($newPost, $user['id'])
            ], 201);
            
        } catch (Exception $e) {
            Helper::logError('Create post error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao criar post', [], 500);
        }
    }
    
    /**
     * Atualizar post
     */
    public function updatePost($id) {
        try {
            $user = AuthMiddleware::required();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }
            
            // Verificar se post existe e pertence ao usuário
            $existingPost = $this->db->fetch(
                'SELECT user_id FROM posts WHERE id = ?',
                [$id]
            );
            
            if (!$existingPost) {
                echo Helper::jsonResponse(false, 'Post não encontrado', [], 404);
                return;
            }
            
            if ($existingPost['user_id'] != $user['id']) {
                echo Helper::jsonResponse(false, 'Não autorizado a editar este post', [], 403);
                return;
            }
            
            // Validar dados
            $validator = new Validator($data);
            $validator
                ->required('conteudo', 'Conteúdo é obrigatório')
                ->max('conteudo', 2000, 'Conteúdo deve ter no máximo 2000 caracteres');
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            // Atualizar post
            $this->db->execute(
                'UPDATE posts SET conteudo = ?, categoria = ?, tags = ? WHERE id = ?',
                [
                    Helper::sanitizeString($data['conteudo']),
                    Helper::sanitizeString($data['categoria'] ?? 'Geral'),
                    json_encode($data['tags'] ?? []),
                    $id
                ]
            );
            
            // Buscar post atualizado
            $updatedPost = $this->db->fetch(
                'SELECT p.*, u.nome as autor, u.username, u.avatar_url as avatar,
                        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as isLiked
                 FROM posts p
                 INNER JOIN usuarios u ON p.user_id = u.id
                 WHERE p.id = ?',
                [$user['id'], $id]
            );
            
            echo Helper::jsonResponse(true, 'Post atualizado com sucesso', [
                'post' => Helper::formatPost($updatedPost, $user['id'])
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Update post error: ' . $e->getMessage(), ['post_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao atualizar post', [], 500);
        }
    }
    
    /**
     * Deletar post
     */
    public function deletePost($id) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se post existe e pertence ao usuário
            $existingPost = $this->db->fetch(
                'SELECT user_id, imagem_url, video_url FROM posts WHERE id = ?',
                [$id]
            );
            
            if (!$existingPost) {
                echo Helper::jsonResponse(false, 'Post não encontrado', [], 404);
                return;
            }
            
            if ($existingPost['user_id'] != $user['id']) {
                echo Helper::jsonResponse(false, 'Não autorizado a deletar este post', [], 403);
                return;
            }
            
            // Deletar arquivos de mídia
            if ($existingPost['imagem_url']) {
                $imagePath = __DIR__ . '/../../public' . $existingPost['imagem_url'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }
            
            if ($existingPost['video_url']) {
                $videoPath = __DIR__ . '/../../public' . $existingPost['video_url'];
                if (file_exists($videoPath)) {
                    unlink($videoPath);
                }
            }
            
            // Deletar post
            $this->db->execute('DELETE FROM posts WHERE id = ?', [$id]);
            
            echo Helper::jsonResponse(true, 'Post deletado com sucesso');
            
        } catch (Exception $e) {
            Helper::logError('Delete post error: ' . $e->getMessage(), ['post_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao deletar post', [], 500);
        }
    }
    
    /**
     * Buscar posts
     */
    public function searchPosts() {
        try {
            $query = $_GET['q'] ?? '';
            $categoria = $_GET['categoria'] ?? '';
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 10);
            $offset = ($page - 1) * $limit;
            
            if (strlen(trim($query)) < 2) {
                echo Helper::jsonResponse(false, 'Termo de busca deve ter pelo menos 2 caracteres', [], 400);
                return;
            }
            
            $currentUser = AuthMiddleware::optional();
            $currentUserId = $currentUser ? $currentUser['id'] : null;
            
            $searchTerm = '%' . trim($query) . '%';
            
            $sqlQuery = "
                SELECT p.*, 
                       u.nome as autor, 
                       u.username, 
                       u.avatar_url as avatar
            ";
            
            if ($currentUserId) {
                $sqlQuery .= ",
                       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as isLiked
                ";
                $params = [$currentUserId, $searchTerm, $searchTerm, $searchTerm];
            } else {
                $sqlQuery .= ", 0 as isLiked";
                $params = [$searchTerm, $searchTerm, $searchTerm];
            }
            
            $sqlQuery .= "
                FROM posts p
                INNER JOIN usuarios u ON p.user_id = u.id
                WHERE (p.conteudo LIKE ? OR u.nome LIKE ? OR u.username LIKE ?)
            ";
            
            if ($categoria && $categoria !== 'Todas') {
                $sqlQuery .= ' AND p.categoria = ?';
                $params[] = $categoria;
            }
            
            $sqlQuery .= ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
            $params[] = $limit;
            $params[] = $offset;
            
            $posts = $this->db->fetchAll($sqlQuery, $params);
            
            $formattedPosts = array_map(function($post) use ($currentUserId) {
                return Helper::formatPost($post, $currentUserId);
            }, $posts);
            
            echo Helper::jsonResponse(true, '', [
                'posts' => $formattedPosts,
                'searchTerm' => $query
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Search posts error: ' . $e->getMessage(), ['query' => $query ?? '']);
            echo Helper::jsonResponse(false, 'Erro na busca de posts', [], 500);
        }
    }
}
