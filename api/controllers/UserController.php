<?php
/**
 * Controlador de Usuários
 */

class UserController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Seguir ou deixar de seguir usuário
     */
    public function toggleFollow($id) {
        try {
            $user = AuthMiddleware::required();
            $targetId = intval($id);
            if ($user['id'] === $targetId) {
                echo Helper::jsonResponse(false, 'Não é possível seguir a si mesmo', [], 400);
                return;
            }
            // Verificar existência
            $existing = $this->db->fetch(
                'SELECT 1 FROM user_follows WHERE follower_id = ? AND followed_id = ?',
                [$user['id'], $targetId]
            );
            if ($existing) {
                // Unfollow
                $this->db->execute(
                    'DELETE FROM user_follows WHERE follower_id = ? AND followed_id = ?',
                    [$user['id'], $targetId]
                );
                $following = false;
                $message = 'Deixou de seguir';
            } else {
                // Follow
                $this->db->insert(
                    'INSERT INTO user_follows (follower_id, followed_id) VALUES (?, ?)',
                    [$user['id'], $targetId]
                );
                $following = true;
                $message = 'Seguindo';
            }
            // Contar seguidores
            $count = $this->db->fetch(
                'SELECT COUNT(*) as cnt FROM user_follows WHERE followed_id = ?',
                [$targetId]
            );
            echo Helper::jsonResponse(true, $message, [
                'following' => $following,
                'followers_count' => (int)$count['cnt']
            ]);
        } catch (Exception $e) {
            Helper::logError('Toggle follow error: ' . $e->getMessage(), ['target_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao seguir/desseguir usuário', [], 500);
        }
    }

    /**
     * Listar seguidores de um usuário
     */
    public function getFollowers($id) {
        try {
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 20);
            $offset = ($page - 1) * $limit;
            $followers = $this->db->fetchAll(
                'SELECT u.id, u.nome, u.username, u.avatar_url
                 FROM user_follows uf
                 JOIN usuarios u ON uf.follower_id = u.id
                 WHERE uf.followed_id = ?
                 ORDER BY uf.created_at DESC
                 LIMIT ? OFFSET ?',
                [$id, $limit, $offset]
            );
            $total = $this->db->fetch(
                'SELECT COUNT(*) as cnt FROM user_follows WHERE followed_id = ?',
                [$id]
            );
            $list = array_map(function($u) {
                return Helper::formatUser($u);
            }, $followers);
            echo Helper::jsonResponse(true, '', [
                'followers' => $list,
                'total' => (int)$total['cnt'],
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($total['cnt'] / $limit),
                    'hasNextPage' => ($page * $limit) < $total['cnt'],
                    'hasPrevPage' => $page > 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Get followers error: ' . $e->getMessage(), ['user_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao buscar seguidores', [], 500);
        }
    }

    /**
     * Listar usuários que o usuário segue
     */
    public function getFollowing($id) {
        try {
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 20);
            $offset = ($page - 1) * $limit;
            $following = $this->db->fetchAll(
                'SELECT u.id, u.nome, u.username, u.avatar_url
                 FROM user_follows uf
                 JOIN usuarios u ON uf.followed_id = u.id
                 WHERE uf.follower_id = ?
                 ORDER BY uf.created_at DESC
                 LIMIT ? OFFSET ?',
                [$id, $limit, $offset]
            );
            $total = $this->db->fetch(
                'SELECT COUNT(*) as cnt FROM user_follows WHERE follower_id = ?',
                [$id]
            );
            $list = array_map(function($u) {
                return Helper::formatUser($u);
            }, $following);
            echo Helper::jsonResponse(true, '', [
                'following' => $list,
                'total' => (int)$total['cnt'],
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($total['cnt'] / $limit),
                    'hasNextPage' => ($page * $limit) < $total['cnt'],
                    'hasPrevPage' => $page > 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Get following error: ' . $e->getMessage(), ['user_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao buscar seguindo', [], 500);
        }
    }
    
    /**
     * Buscar usuário por ID
     */
    public function getUser($id) {
        try {
            $user = $this->db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, created_at, updated_at FROM usuarios WHERE id = ?',
                [$id]
            );
            
            if (!$user) {
                echo Helper::jsonResponse(false, 'Usuário não encontrado', [], 404);
                return;
            }
            
            // Fetch follow counts and relationship
            $currentUser = AuthMiddleware::optional();
            $currentUserId = $currentUser['id'] ?? null;
            // Count followers and following
            $followers = $this->db->fetch(
                'SELECT COUNT(*) as cnt FROM user_follows WHERE followed_id = ?',
                [$id]
            );
            $following = $this->db->fetch(
                'SELECT COUNT(*) as cnt FROM user_follows WHERE follower_id = ?',
                [$id]
            );
            // Check if current user follows this user
            $isFollowed = false;
            if ($currentUserId) {
                $exists = $this->db->fetch(
                    'SELECT 1 FROM user_follows WHERE follower_id = ? AND followed_id = ?',
                    [$currentUserId, $id]
                );
                $isFollowed = (bool)$exists;
            }
            $formatted = Helper::formatUser($user);
            $formatted['followers_count'] = (int)($followers['cnt'] ?? 0);
            $formatted['following_count'] = (int)($following['cnt'] ?? 0);
            $formatted['isFollowed'] = $isFollowed;
            echo Helper::jsonResponse(true, '', [
                'user' => $formatted
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get user error: ' . $e->getMessage(), ['user_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao buscar usuário', [], 500);
        }
    }
    
    /**
     * Atualizar perfil do usuário
     */
    public function updateProfile() {
        try {
            $user = AuthMiddleware::required();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }
            
            // Validar dados
            $validator = new Validator($data);
            
            if (isset($data['nome'])) {
                $validator
                    ->min('nome', 2, 'Nome deve ter pelo menos 2 caracteres')
                    ->max('nome', 255, 'Nome deve ter no máximo 255 caracteres');
            }
            
            if (isset($data['username'])) {
                $validator->username('username');
            }
            
            if (isset($data['bio'])) {
                $validator->max('bio', 500, 'Bio deve ter no máximo 500 caracteres');
            }
            
            if (isset($data['telefone'])) {
                $validator->phone('telefone', 'Formato de telefone inválido');
            }
            // website and localization optional fields
            // no validation required: sanitized and stored if present
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            // Verificar se username já existe (se foi fornecido)
            if (isset($data['username'])) {
                $existingUser = $this->db->fetch(
                    'SELECT id FROM usuarios WHERE username = ? AND id != ?',
                    [$data['username'], $user['id']]
                );
                
                if ($existingUser) {
                    echo Helper::jsonResponse(false, 'Username já está em uso', [], 400);
                    return;
                }
            }
            
            // Construir query de atualização
            $updates = [];
            $values = [];
            
            if (isset($data['nome'])) {
                $updates[] = 'nome = ?';
                $values[] = Helper::sanitizeString($data['nome']);
            }
            
            if (isset($data['username'])) {
                $updates[] = 'username = ?';
                $values[] = Helper::sanitizeString($data['username']);
            }
            
            if (isset($data['bio'])) {
                $updates[] = 'bio = ?';
                $values[] = Helper::sanitizeString($data['bio']);
            }
            
            if (isset($data['telefone'])) {
                $updates[] = 'telefone = ?';
                $values[] = Helper::sanitizeString($data['telefone']);
            }
            // Website and localization are optional
            if (isset($data['website'])) {
                $updates[] = 'website = ?';
                $values[] = Helper::sanitizeString($data['website']);
            }
            if (isset($data['localizacao'])) {
                $updates[] = 'localizacao = ?';
                $values[] = Helper::sanitizeString($data['localizacao']);
            }
            
            if (empty($updates)) {
                echo Helper::jsonResponse(false, 'Nenhum campo para atualizar', [], 400);
                return;
            }
            
            $updates[] = 'updated_at = NOW()';
            $values[] = $user['id'];
            
            $this->db->execute(
                'UPDATE usuarios SET ' . implode(', ', $updates) . ' WHERE id = ?',
                $values
            );
            
            // Buscar usuário atualizado
            $updatedUser = $this->db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, created_at, updated_at FROM usuarios WHERE id = ?',
                [$user['id']]
            );
            
            echo Helper::jsonResponse(true, 'Perfil atualizado com sucesso', [
                'user' => Helper::formatUser($updatedUser)
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Update profile error: ' . $e->getMessage(), $data ?? []);
            echo Helper::jsonResponse(false, 'Erro ao atualizar perfil', [], 500);
        }
    }
    
    /**
     * Atualizar avatar do usuário
     */
    public function updateAvatar() {
        try {
            $user = AuthMiddleware::required();
            
            if (!isset($_FILES['avatar'])) {
                echo Helper::jsonResponse(false, 'Nenhuma imagem foi enviada', [], 400);
                return;
            }
            
            // Processar upload
            $avatarUrl = Helper::processUpload($_FILES['avatar'], 'avatar');
            
            // Buscar avatar antigo para deletar
            $currentUser = $this->db->fetch(
                'SELECT avatar_url FROM usuarios WHERE id = ?',
                [$user['id']]
            );
            
            // Atualizar avatar no banco
            $this->db->execute(
                'UPDATE usuarios SET avatar_url = ?, updated_at = NOW() WHERE id = ?',
                [$avatarUrl, $user['id']]
            );
            
            // Deletar avatar antigo se não for placeholder
            if ($currentUser && $currentUser['avatar_url'] && !strpos($currentUser['avatar_url'], 'placeholder')) {
                $oldAvatarPath = __DIR__ . '/../../public' . $currentUser['avatar_url'];
                if (file_exists($oldAvatarPath)) {
                    unlink($oldAvatarPath);
                }
            }
            
            // Buscar usuário atualizado
            $updatedUser = $this->db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, created_at, updated_at FROM usuarios WHERE id = ?',
                [$user['id']]
            );
            
            echo Helper::jsonResponse(true, 'Avatar atualizado com sucesso', [
                'user' => Helper::formatUser($updatedUser)
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Update avatar error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao atualizar avatar', [], 500);
        }
    }
    
    /**
     * Buscar usuários
     */
    public function searchUsers() {
        try {
            $query = $_GET['q'] ?? '';
            
            if (strlen(trim($query)) < 2) {
                echo Helper::jsonResponse(false, 'Termo de busca deve ter pelo menos 2 caracteres', [], 400);
                return;
            }
            
            $searchTerm = '%' . trim($query) . '%';
            
            $users = $this->db->fetchAll(
                'SELECT id, nome, username, email, bio, tipo, avatar_url, created_at 
                 FROM usuarios 
                 WHERE nome LIKE ? OR username LIKE ? OR email LIKE ?
                 ORDER BY nome ASC
                 LIMIT 20',
                [$searchTerm, $searchTerm, $searchTerm]
            );
            
            $formattedUsers = array_map(function($user) {
                return Helper::formatUser($user);
            }, $users);
            
            echo Helper::jsonResponse(true, '', [
                'users' => $formattedUsers
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Search users error: ' . $e->getMessage(), ['query' => $query ?? '']);
            echo Helper::jsonResponse(false, 'Erro na busca de usuários', [], 500);
        }
    }
    
    /**
     * Verificar disponibilidade de username
     */
    public function checkUsername($username) {
        try {
            if (strlen($username) < USERNAME_MIN_LENGTH) {
                echo Helper::jsonResponse(false, 'Username deve ter pelo menos ' . USERNAME_MIN_LENGTH . ' caracteres', [], 400);
                return;
            }
            
            $user = $this->db->fetch(
                'SELECT id FROM usuarios WHERE username = ?',
                [$username]
            );
            
            echo Helper::jsonResponse(true, '', [
                'available' => !$user
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Check username error: ' . $e->getMessage(), ['username' => $username]);
            echo Helper::jsonResponse(false, 'Erro ao verificar username', [], 500);
        }
    }
}
