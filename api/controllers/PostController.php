<?php
/**
 * Controlador de Posts
 */

class PostController {
    private $db;
    private $adCampaignService;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->adCampaignService = new AdCampaignService();
    }

    /**
     * Contar posts não lidos / novos para badge
     */
    public function unreadCount() {
        try {
            $currentUser = AuthMiddleware::optional();

            // Se usuário autenticado, tentar usar campo updated_at como referência
            if ($currentUser) {
                // Buscar última vez que usuário foi atualizado (usar updated_at como proxy)
                $userRow = $this->db->fetch('SELECT updated_at FROM usuarios WHERE id = ?', [$currentUser['id']]);
                $since = $userRow && isset($userRow['updated_at']) ? $userRow['updated_at'] : date('Y-m-d H:i:s', strtotime('-7 days'));
            } else {
                // Usuário anônimo: contar posts dos últimos 7 dias
                $since = date('Y-m-d H:i:s', strtotime('-7 days'));
            }

            $result = $this->db->fetch('SELECT COUNT(*) as count FROM posts WHERE created_at >= ?', [$since]);
            $count = $result ? (int)$result['count'] : 0;

            echo Helper::jsonResponse(true, '', ['count' => $count]);
        } catch (Exception $e) {
            Helper::logError('Unread count error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao calcular unread count', [], 500);
        }
    }
    
    /**
     * Listar posts
     */
    public function getPosts() {
        try {
            $page = intval($_GET['page'] ?? 1);
            $requestedLimit = $_GET['limit'] ?? null;
            $limit = intval($requestedLimit !== null ? $requestedLimit : 50);
            if ($limit <= 0) {
                $limit = 50;
            }
            $limit = min($limit, 100);
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
                       u.avatar_url as avatar,
                       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likes,
                       (SELECT COUNT(*) FROM post_comentarios pc WHERE pc.post_id = p.id) as comentarios,
                       (SELECT COUNT(*) FROM post_compartilhamentos ps WHERE ps.post_id = p.id) as compartilhamentos
            ";
            
            // Adicionar verificação de like se usuário logado
            if ($currentUserId) {
                $query .= ",
                       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as isLiked,
                       (SELECT COUNT(*) FROM user_follows uf WHERE uf.follower_id = ? AND uf.followed_id = p.user_id) as isFollowed
                ";
            } else {
                $query .= ", 0 as isLiked, 0 as isFollowed";
            }
            
            $query .= "
                FROM posts p
                INNER JOIN usuarios u ON p.user_id = u.id
            ";
            
            // Parâmetros da query
            $params = [];
            if ($currentUserId) {
                $params[] = $currentUserId;
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

            if (!$userId) {
                $conditions[] = 'p.is_promovido = 0';
            }
            
            if (!empty($conditions)) {
                $query .= ' WHERE ' . implode(' AND ', $conditions);
            }
            
            $query .= ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
            $params[] = $limit;
            $params[] = $offset;
            
            $posts = $this->db->fetchAll($query, $params);

            // Para compatibilidade com o frontend, adicionar media_files vazio para cada post
            foreach ($posts as &$p) {
                $p['media_files'] = [];
            }
            
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

            $sponsoredPosts = [];
            if (!$userId && (!isset($categoria) || $categoria === '' || $categoria === 'Todas')) {
                $maxAds = (int) floor(count($formattedPosts) / 10);
                if ($maxAds > 0) {
                    $adRows = $this->adCampaignService->getSponsoredFeedPosts($maxAds);

                    if ($adRows) {
                        $seenIds = array_map(function($post) {
                            return (int)$post['id'];
                        }, $posts);

                        $adRows = array_filter($adRows, function($row) use ($seenIds) {
                            return !in_array((int)$row['id'], $seenIds, true);
                        });

                        $formattedAds = array_map(function ($row) use ($currentUserId) {
                            $formatted = Helper::formatPost($row, $currentUserId);
                            $formatted['sponsored'] = true;
                            $formatted['sponsored_badge'] = $formatted['sponsored_badge'] ?? 'Patrocinado';
                            $formatted['sponsored_inserted_at'] = date('c');
                            return $formatted;
                        }, $adRows);

                        $sponsoredPosts = array_slice($formattedAds, 0, $maxAds);
                    }
                }
            }

            $finalPosts = $formattedPosts;
            if (!empty($sponsoredPosts)) {
                $finalPosts = [];
                $adIndex = 0;
                $postCounter = 0;

                foreach ($formattedPosts as $postItem) {
                    $finalPosts[] = $postItem;
                    $postCounter++;

                    if ($postCounter % 10 === 0 && isset($sponsoredPosts[$adIndex])) {
                        $finalPosts[] = $sponsoredPosts[$adIndex];
                        $adIndex++;
                    }
                }

                if ($adIndex < count($sponsoredPosts)) {
                    $finalPosts = array_merge($finalPosts, array_slice($sponsoredPosts, $adIndex));
                }
            }
            
            echo Helper::jsonResponse(true, '', [
                'posts' => $finalPosts,
                'ads' => [
                    'injected' => count($sponsoredPosts),
                    'interval' => 10,
                ],
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
                       u.avatar_url as avatar,
                       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likes,
                       (SELECT COUNT(*) FROM post_comentarios pc WHERE pc.post_id = p.id) as comentarios,
                       (SELECT COUNT(*) FROM post_compartilhamentos ps WHERE ps.post_id = p.id) as compartilhamentos
            ";
            
            if ($currentUserId) {
                $query .= ",
                       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as isLiked,
                       (SELECT COUNT(*) FROM user_follows uf WHERE uf.follower_id = ? AND uf.followed_id = u.id) as isFollowed
                ";
                $params = [$currentUserId, $currentUserId, $id];
            } else {
                $query .= ", 0 as isLiked, 0 as isFollowed";
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

            // Para compatibilidade com o frontend, adicionar media_files vazio
            $post['media_files'] = [];
            
            echo Helper::jsonResponse(true, '', [
                'post' => Helper::formatPost($post, $currentUserId)
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get post error: ' . $e->getMessage(), ['post_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao buscar post', [], 500);
        }
    }
    
    /**
     * Buscar posts curtidos pelo usuário atual
     */
    public function getLikedPosts() {
        try {
            $user = AuthMiddleware::required();
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 10);
            $offset = ($page - 1) * $limit;
            
            // Query para buscar posts curtidos pelo usuário
            $query = "
                SELECT p.*, 
                       u.nome as autor, 
                       u.username, 
                       u.avatar_url as avatar,
                       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likes,
                       (SELECT COUNT(*) FROM post_comentarios pc WHERE pc.post_id = p.id) as comentarios,
                       (SELECT COUNT(*) FROM post_compartilhamentos ps WHERE ps.post_id = p.id) as compartilhamentos,
                       1 as isLiked,
                       (SELECT COUNT(*) FROM user_follows uf WHERE uf.follower_id = ? AND uf.followed_id = p.user_id) as isFollowed
                FROM posts p
                INNER JOIN usuarios u ON p.user_id = u.id
                INNER JOIN post_likes pl ON p.id = pl.post_id
                WHERE pl.user_id = ?
                ORDER BY pl.created_at DESC 
                LIMIT ? OFFSET ?
            ";
            
            $posts = $this->db->fetchAll($query, [$user['id'], $user['id'], $limit, $offset]);

            // Para compatibilidade com o frontend, adicionar media_files vazio para cada post
            foreach ($posts as &$p) {
                $p['media_files'] = [];
            }
            
            // Contar total de posts curtidos
            $totalResult = $this->db->fetch(
                'SELECT COUNT(*) as total FROM post_likes pl WHERE pl.user_id = ?',
                [$user['id']]
            );
            $total = $totalResult['total'];
            
            // Formatar posts
            $formattedPosts = array_map(function($post) use ($user) {
                return Helper::formatPost($post, $user['id']);
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
            Helper::logError('Get liked posts error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao buscar posts curtidos', [], 500);
        }
    }
    
    /**
     * Criar novo post
     */
    public function createPost() {
        $pdo = null;

        try {
            $user = AuthMiddleware::required();

            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            $isJson = strpos($contentType, 'application/json') !== false;

            $body = [];
            if ($isJson) {
                $body = json_decode(file_get_contents('php://input'), true) ?: [];
            }

            $conteudo = $isJson ? ($body['conteudo'] ?? '') : ($_POST['conteudo'] ?? '');
            $categoria = $isJson ? ($body['categoria'] ?? 'Geral') : ($_POST['categoria'] ?? 'Geral');

            if ($isJson) {
                $tags = isset($body['tags']) && is_array($body['tags']) ? $body['tags'] : [];
            } else {
                $rawTags = $_POST['tags'] ?? [];
                if (is_string($rawTags)) {
                    $decoded = json_decode($rawTags, true);
                    $tags = is_array($decoded) ? $decoded : [];
                } elseif (is_array($rawTags)) {
                    $tags = $rawTags;
                } else {
                    $tags = [];
                }
            }

            $groupId = $isJson ? ($body['grupo_id'] ?? null) : ($_POST['grupo_id'] ?? null);
            $groupId = $groupId !== null && $groupId !== '' ? (int)$groupId : null;

            $visibility = $isJson ? ($body['escopo_visibilidade'] ?? null) : ($_POST['escopo_visibilidade'] ?? null);
            $visibility = $visibility ? strtolower($visibility) : null;
            $allowedScopes = ['publico', 'seguidores', 'grupo', 'privado'];
            if (!in_array($visibility, $allowedScopes, true)) {
                $visibility = $groupId ? 'grupo' : 'publico';
            }

            $validator = new Validator([
                'conteudo' => $conteudo,
                'categoria' => $categoria,
                'tags' => $tags
            ]);

            $validator
                ->required('conteudo', 'Conteúdo é obrigatório')
                ->max('conteudo', 2000, 'Conteúdo deve ter no máximo 2000 caracteres')
                ->max('categoria', 100, 'Categoria deve ter no máximo 100 caracteres');

            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }

            $group = null;
            if ($groupId) {
                $group = $this->db->fetch('SELECT id, slug, privacidade FROM grupos WHERE id = ? AND ativo = 1', [$groupId]);
                if (!$group) {
                    echo Helper::jsonResponse(false, 'Grupo não encontrado ou inativo', [], 404);
                    return;
                }

                $isAdmin = ($user['tipo'] ?? null) === 'admin';
                if (!$isAdmin) {
                    $membership = $this->db->fetch(
                        'SELECT status FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?',
                        [$groupId, $user['id']]
                    );

                    if (!$membership || $membership['status'] !== 'ativo') {
                        echo Helper::jsonResponse(false, 'Você precisa ser integrante ativa deste grupo para publicar', [], 403);
                        return;
                    }
                }

                $visibility = 'grupo';
            }

            $tipoMidia = 'none';
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $tipoMidia = 'imagem';
            } elseif (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
                $tipoMidia = 'video';
            }

            $pdo = $this->db->getConnection();
            $pdo->beginTransaction();

            $postId = $this->db->insert(
                'INSERT INTO posts (user_id, autor, username, avatar, conteudo, categoria, tags, imagem_url, video_url, tipo_midia, grupo_id, escopo_visibilidade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $user['id'],
                    $user['nome'],
                    $user['username'],
                    $user['avatar_url'],
                    Helper::sanitizeString($conteudo),
                    Helper::sanitizeString($categoria),
                    json_encode($tags, JSON_UNESCAPED_UNICODE),
                    null,
                    null,
                    $tipoMidia,
                    $groupId,
                    $visibility
                ]
            );

            if ($groupId) {
                $this->db->insert(
                    'INSERT INTO grupo_posts (grupo_id, post_id, created_at) VALUES (?, ?, NOW())',
                    [$groupId, $postId]
                );
                $this->db->execute('UPDATE grupos SET ultima_atividade = NOW() WHERE id = ?', [$groupId]);
            }

            $imagemUrl = null;
            $videoUrl = null;

            if ($postId && !empty($_FILES)) {
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $imagemUrl = Helper::processUpload($_FILES['image'], 'image');
                    $this->db->execute('UPDATE posts SET imagem_url = ? WHERE id = ?', [$imagemUrl, $postId]);
                }

                if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
                    $videoUrl = Helper::processUpload($_FILES['video'], 'video');
                    $this->db->execute('UPDATE posts SET video_url = ? WHERE id = ?', [$videoUrl, $postId]);
                }
            }

            $pdo->commit();

            $newPost = $this->db->fetch(
                'SELECT p.*, u.nome as autor, u.username, u.avatar_url as avatar,
                        0 as likes, 0 as comentarios, 0 as compartilhamentos, 0 as isLiked,
                        g.nome as grupo_nome, g.slug as grupo_slug, g.imagem as grupo_imagem, g.imagem_capa as grupo_capa
                 FROM posts p
                 INNER JOIN usuarios u ON p.user_id = u.id
                 LEFT JOIN grupos g ON g.id = p.grupo_id
                 WHERE p.id = ?',
                [$postId]
            );

            if ($newPost) {
                $newPost['media_files'] = [];
            }

            echo Helper::jsonResponse(true, '', [
                'post' => Helper::formatPost($newPost, $user['id'])
            ], 201);

        } catch (Exception $e) {
            if ($pdo instanceof PDO && $pdo->inTransaction()) {
                $pdo->rollBack();
            }

            Helper::logError('Create post error: ' . $e->getMessage());
            if (defined('DEBUG_MODE') && DEBUG_MODE) {
                echo Helper::jsonResponse(false, 'Erro ao criar post: ' . $e->getMessage(), [], 500);
            } else {
                echo Helper::jsonResponse(false, 'Erro ao criar post', [], 500);
            }
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
            
            // Deletar mídias relacionadas do banco (post_media)
            $this->db->execute('DELETE FROM post_media WHERE post_id = ?', [$id]);
            
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
            
            // Anexar metadata de mídia para os resultados da busca
            foreach ($posts as &$p) {
                $media = $this->db->fetchAll('SELECT id, media_filename, media_type FROM post_media WHERE post_id = ?', [$p['id']]);
                $p['media_files'] = $media ?: [];
            }

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
