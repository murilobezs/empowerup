<?php
/**
 * Controlador de Autenticação
 */

class AuthController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Registrar novo usuário
     */
    public function register() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }
            
            // Validar dados
            $validator = new Validator($data);
            $validator
                ->required('nome', 'Nome é obrigatório')
                ->min('nome', 2, 'Nome deve ter pelo menos 2 caracteres')
                ->max('nome', 255, 'Nome deve ter no máximo 255 caracteres')
                ->required('email', 'Email é obrigatório')
                ->email('email', 'Email inválido')
                ->required('senha', 'Senha é obrigatória')
                ->min('senha', PASSWORD_MIN_LENGTH, 'Senha deve ter pelo menos ' . PASSWORD_MIN_LENGTH . ' caracteres')
                ->required('tipo', 'Tipo é obrigatório')
                ->in('tipo', ['empreendedora', 'cliente'], 'Tipo deve ser empreendedora ou cliente');
            
            if (isset($data['telefone'])) {
                $validator->phone('telefone', 'Formato de telefone inválido');
            }
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            // Verificar se email já existe
            $existingUser = $this->db->fetch(
                'SELECT id FROM usuarios WHERE email = ?',
                [$data['email']]
            );
            
            if ($existingUser) {
                echo Helper::jsonResponse(false, 'Email já está em uso', [], 400);
                return;
            }
            
            // Verificar se telefone já existe (se fornecido)
            if (isset($data['telefone']) && !empty($data['telefone'])) {
                $existingPhone = $this->db->fetch(
                    'SELECT id FROM usuarios WHERE telefone = ?',
                    [$data['telefone']]
                );
                
                if ($existingPhone) {
                    echo Helper::jsonResponse(false, 'Telefone já está em uso', [], 400);
                    return;
                }
            }
            
            // Gerar ou validar username
            $username = '';
            if (isset($data['username']) && !empty($data['username'])) {
                // Username fornecido pelo usuário - validar
                $customUsername = Helper::sanitizeString($data['username']);
                
                // Validar formato do username
                if (!preg_match('/^[a-zA-Z0-9_\.]{3,30}$/', $customUsername)) {
                    echo Helper::jsonResponse(false, 'Username deve conter apenas letras, números, _ ou . e ter entre 3-30 caracteres', [], 400);
                    return;
                }
                
                // Verificar se username já existe
                $usernameExists = $this->db->fetch(
                    'SELECT id FROM usuarios WHERE username = ?',
                    [$customUsername]
                );
                
                if ($usernameExists) {
                    echo Helper::jsonResponse(false, 'Username já está em uso', [], 400);
                    return;
                }
                
                $username = $customUsername;
            } else {
                // Gerar username único automaticamente
                $username = Helper::generateUsername($data['nome']);
                $usernameExists = $this->db->fetch(
                    'SELECT id FROM usuarios WHERE username = ?',
                    [$username]
                );
                
                while ($usernameExists) {
                    $username = Helper::generateUsername($data['nome']) . rand(100, 999);
                    $usernameExists = $this->db->fetch(
                        'SELECT id FROM usuarios WHERE username = ?',
                        [$username]
                    );
                }
            }
            
            // Hash da senha
            $hashedPassword = Helper::hashPassword($data['senha']);
            
            // Inserir usuário
            $userId = $this->db->insert(
                'INSERT INTO usuarios (nome, username, email, senha, telefone, bio, tipo, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    Helper::sanitizeString($data['nome']),
                    $username,
                    Helper::sanitizeString($data['email']),
                    $hashedPassword,
                    isset($data['telefone']) ? Helper::sanitizeString($data['telefone']) : null,
                    isset($data['bio']) ? Helper::sanitizeString($data['bio']) : null,
                    $data['tipo'],
                    '/placeholder.svg?height=40&width=40'
                ]
            );
            
            // Buscar usuário criado
            $newUser = $this->db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, capa_url, website, localizacao, created_at, updated_at FROM usuarios WHERE id = ?',
                [$userId]
            );
            
            // Criar token de verificação por email
            $verificationToken = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', time() + 60*60*24); // 24h
            $this->db->insert(
                'INSERT INTO user_tokens (user_id, token, type, expires_at) VALUES (?, ?, ?, ?)',
                [$userId, $verificationToken, 'email_verification', $expires]
            );

            // Enviar email (modo dev grava em logs/mail.log)
            $verifyUrl = $this->buildFrontendUrl('/verificar-email', ['token' => $verificationToken]);
            
            $emailHtml = EmailTemplates::welcomeVerification([
                'user_name' => $newUser['nome'],
                'verify_url' => $verifyUrl
            ]);
            
            $subject = 'Bem-vinda ao EmpowerUp! 🎉 Verifique seu email';
            Mailer::send($newUser['email'], $subject, $emailHtml);

            // Gerar token JWT de sessão também
            $payload = [
                'userId' => $userId,
                'email' => $data['email'],
                'iat' => time(),
                'exp' => time() + JWT_EXPIRE
            ];
            $token = JWT::encode($payload);

            // Criar refresh token e armazenar
            $refreshToken = bin2hex(random_bytes(32));
            $refreshExpires = date('Y-m-d H:i:s', time() + (60*60*24*30)); // 30 dias
            $this->db->insert('INSERT INTO user_tokens (user_id, token, type, expires_at) VALUES (?, ?, ?, ?)', [$userId, $refreshToken, 'refresh', $refreshExpires]);

            echo Helper::jsonResponse(true, 'Usuário criado com sucesso (verifique seu email)', [
                'user' => $this->buildUserResponse($newUser),
                'token' => $token,
                'refreshToken' => $refreshToken
            ], 201);
            
        } catch (Exception $e) {
            Helper::logError('Register error: ' . $e->getMessage(), $data ?? []);
            echo Helper::jsonResponse(false, 'Erro ao criar usuário', [], 500);
        }
    }
    
    /**
     * Login de usuário
     */
    public function login() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }
            
            // Validar dados
            $validator = new Validator($data);
            $validator
                ->required('login', 'Email, telefone ou username é obrigatório')
                ->required('senha', 'Senha é obrigatória');
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            // Buscar usuário por email, username ou telefone
            $login = Helper::sanitizeString($data['login']);
            $user = null;
            
            // Tentar buscar por email se contém @
            if (strpos($login, '@') !== false) {
                $user = $this->db->fetch(
                    'SELECT * FROM usuarios WHERE email = ?',
                    [$login]
                );
            } else {
                // Buscar por username ou telefone
                $user = $this->db->fetch(
                    'SELECT * FROM usuarios WHERE username = ? OR telefone = ?',
                    [$login, $login]
                );
            }
            
            if (!$user) {
                echo Helper::jsonResponse(false, 'Credenciais incorretas', [], 401);
                return;
            }
            
            // Verificar senha
            if (!Helper::verifyPassword($data['senha'], $user['senha'])) {
                echo Helper::jsonResponse(false, 'Credenciais incorretas', [], 401);
                return;
            }
            
            // Gerar token JWT
            $payload = [
                'userId' => $user['id'],
                'email' => $user['email'],
                'iat' => time(),
                'exp' => time() + JWT_EXPIRE
            ];

            $token = JWT::encode($payload);

            // Criar refresh token e armazenar
            $refreshToken = bin2hex(random_bytes(32));
            $refreshExpires = date('Y-m-d H:i:s', time() + (60*60*24*30)); // 30 dias
            $this->db->insert('INSERT INTO user_tokens (user_id, token, type, expires_at) VALUES (?, ?, ?, ?)', [$user['id'], $refreshToken, 'refresh', $refreshExpires]);

            echo Helper::jsonResponse(true, 'Login realizado com sucesso', [
                'user' => $this->buildUserResponse($user),
                'token' => $token,
                'refreshToken' => $refreshToken
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Login error: ' . $e->getMessage(), $data ?? []);
            echo Helper::jsonResponse(false, 'Erro ao fazer login', [], 500);
        }
    }
    
    /**
     * Obter perfil do usuário logado
     */
    public function profile() {
        try {
            $user = AuthMiddleware::required();
            
            echo Helper::jsonResponse(true, '', [
                'user' => $this->buildUserResponse($user)
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Profile error: ' . $e->getMessage());
            if (defined('DEBUG_MODE') && DEBUG_MODE) {
                echo Helper::jsonResponse(false, 'Erro ao buscar perfil: ' . $e->getMessage(), [], 500);
            } else {
                echo Helper::jsonResponse(false, 'Erro ao buscar perfil', [], 500);
            }
        }
    }
    
    /**
     * Atualizar token
     */
    public function refreshToken() {
        try {
            // Refresh token endpoint expects POST with { refreshToken }
            $data = json_decode(file_get_contents('php://input'), true) ?: [];
            $refresh = $data['refreshToken'] ?? null;
            if (!$refresh) {
                echo Helper::jsonResponse(false, 'Refresh token requerido', [], 400);
                return;
            }

            $row = $this->db->fetch('SELECT user_id, expires_at, revoked FROM user_tokens WHERE token = ? AND type = ?', [$refresh, 'refresh']);
            if (!$row) {
                echo Helper::jsonResponse(false, 'Refresh token inválido', [], 401);
                return;
            }
            if ($row['revoked']) {
                echo Helper::jsonResponse(false, 'Refresh token revogado', [], 401);
                return;
            }
            if ($row['expires_at'] && strtotime($row['expires_at']) < time()) {
                echo Helper::jsonResponse(false, 'Refresh token expirado', [], 401);
                return;
            }

            $userId = $row['user_id'];
            // Buscar dados atualizados do usuário
            $updatedUser = $this->db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, capa_url, website, localizacao, created_at, updated_at FROM usuarios WHERE id = ?',
                [$userId]
            );
            
            if (!$updatedUser) {
                echo Helper::jsonResponse(false, 'Usuário não encontrado', [], 404);
                return;
            }

            // Gerar novo token JWT
            $payload = [
                'userId' => $updatedUser['id'],
                'email' => $updatedUser['email'],
                'iat' => time(),
                'exp' => time() + JWT_EXPIRE
            ];

            $token = JWT::encode($payload);

            echo Helper::jsonResponse(true, 'Token atualizado com sucesso', [
                'user' => $this->buildUserResponse($updatedUser),
                'token' => $token
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Refresh token error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao atualizar token', [], 500);
        }
    }

    /**
     * Verificar email com token
     */
    public function verifyEmail() {
        try {
            $token = $_GET['token'] ?? null;
            if (!$token) {
                echo Helper::jsonResponse(false, 'Token requerido', [], 400);
                return;
            }

            $row = $this->db->fetch('SELECT id, user_id, expires_at, revoked FROM user_tokens WHERE token = ? AND type = ?', [$token, 'email_verification']);
            if (!$row) {
                echo Helper::jsonResponse(false, 'Token inválido', [], 400);
                return;
            }
            if ($row['revoked']) {
                echo Helper::jsonResponse(false, 'Token já utilizado', [], 400);
                return;
            }
            if ($row['expires_at'] && strtotime($row['expires_at']) < time()) {
                echo Helper::jsonResponse(false, 'Token expirado', [], 400);
                return;
            }

            // Atualizar usuário
            $this->db->execute('UPDATE usuarios SET verified = 1, updated_at = NOW() WHERE id = ?', [$row['user_id']]);
            // Marcar token como revogado
            $this->db->execute('UPDATE user_tokens SET revoked = 1 WHERE id = ?', [$row['id']]);

            echo Helper::jsonResponse(true, 'Email verificado com sucesso');
        } catch (Exception $e) {
            Helper::logError('Verify email error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao verificar email', [], 500);
        }
    }

    /**
     * Iniciar fluxo de reset de senha (forgot password)
     */
    public function forgotPassword() {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?: [];
            $email = $data['email'] ?? null;
            if (!$email) {
                echo Helper::jsonResponse(false, 'Email requerido', [], 400);
                return;
            }

            $user = $this->db->fetch('SELECT id, nome, email FROM usuarios WHERE email = ?', [$email]);
            if (!$user) {
                // Não revelar se email existe
                echo Helper::jsonResponse(true, 'Se o email existir, você receberá instruções para resetar sua senha');
                return;
            }

            // Criar token de reset
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', time() + 60*60); // 1 hora
            $this->db->insert('INSERT INTO user_tokens (user_id, token, type, expires_at) VALUES (?, ?, ?, ?)', [$user['id'], $token, 'password_reset', $expires]);

            $resetUrl = $this->buildFrontendUrl('/redefinir-senha', ['token' => $token]);
            
            $emailHtml = EmailTemplates::passwordReset([
                'user_name' => $user['nome'],
                'reset_url' => $resetUrl
            ]);
            
            $subject = 'Redefinir Senha - EmpowerUp 🔐';
            Mailer::send($user['email'], $subject, $emailHtml);

            echo Helper::jsonResponse(true, 'Se o email existir, você receberá instruções para resetar sua senha');
        } catch (Exception $e) {
            Helper::logError('Forgot password error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao iniciar reset de senha', [], 500);
        }
    }

    /**
     * Resetar senha com token
     */
    public function resetPassword() {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?: [];
            $token = $data['token'] ?? null;
            $newPassword = $data['newPassword'] ?? null;
            if (!$token || !$newPassword) {
                echo Helper::jsonResponse(false, 'Token e nova senha são obrigatórios', [], 400);
                return;
            }

            $row = $this->db->fetch('SELECT id, user_id, expires_at, revoked FROM user_tokens WHERE token = ? AND type = ?', [$token, 'password_reset']);
            if (!$row) {
                echo Helper::jsonResponse(false, 'Token inválido', [], 400);
                return;
            }
            if ($row['revoked']) {
                echo Helper::jsonResponse(false, 'Token já utilizado', [], 400);
                return;
            }
            if ($row['expires_at'] && strtotime($row['expires_at']) < time()) {
                echo Helper::jsonResponse(false, 'Token expirado', [], 400);
                return;
            }

            // Validar senha
            if (!Helper::validatePassword($newPassword)) {
                echo Helper::jsonResponse(false, 'Senha não atende os requisitos', [], 400);
                return;
            }

            $hashed = Helper::hashPassword($newPassword);
            $this->db->execute('UPDATE usuarios SET senha = ?, updated_at = NOW() WHERE id = ?', [$hashed, $row['user_id']]);
            $this->db->execute('UPDATE user_tokens SET revoked = 1 WHERE id = ?', [$row['id']]);

            echo Helper::jsonResponse(true, 'Senha atualizada com sucesso');
        } catch (Exception $e) {
            Helper::logError('Reset password error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao resetar senha', [], 500);
        }
    }

    /**
     * Logout / revoke refresh token
     */
    public function logout() {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?: [];
            $refresh = $data['refreshToken'] ?? null;
            if (!$refresh) {
                echo Helper::jsonResponse(false, 'Refresh token requerido', [], 400);
                return;
            }

            $this->db->execute('UPDATE user_tokens SET revoked = 1 WHERE token = ? AND type = ?', [$refresh, 'refresh']);
            echo Helper::jsonResponse(true, 'Logout realizado');
        } catch (Exception $e) {
            Helper::logError('Logout error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao realizar logout', [], 500);
        }
    }

    /**
     * Atualizar username do usuário
     */
    public function updateUsername() {
        try {
            $user = AuthMiddleware::required();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || !isset($data['username'])) {
                echo Helper::jsonResponse(false, 'Username é obrigatório', [], 400);
                return;
            }
            
            $newUsername = Helper::sanitizeString($data['username']);
            
            // Validar formato do username
            if (!preg_match('/^[a-zA-Z0-9_\.]{3,30}$/', $newUsername)) {
                echo Helper::jsonResponse(false, 'Username deve conter apenas letras, números, _ ou . e ter entre 3-30 caracteres', [], 400);
                return;
            }
            
            // Verificar se username já existe
            $existingUser = $this->db->fetch(
                'SELECT id FROM usuarios WHERE username = ? AND id != ?',
                [$newUsername, $user['id']]
            );
            
            if ($existingUser) {
                echo Helper::jsonResponse(false, 'Username já está em uso', [], 400);
                return;
            }
            
            // Atualizar username
            $this->db->execute(
                'UPDATE usuarios SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [$newUsername, $user['id']]
            );
            
            // Buscar usuário atualizado
            $updatedUser = $this->db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, capa_url, website, localizacao, created_at, updated_at FROM usuarios WHERE id = ?',
                [$user['id']]
            );
            
            echo Helper::jsonResponse(true, 'Username atualizado com sucesso', [
                'user' => $this->buildUserResponse($updatedUser)
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Update username error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao atualizar username', [], 500);
        }
    }

    /**
     * Monta URL do frontend para links enviados por email
     */
    private function buildFrontendUrl(string $path, array $query = []): string {
        $base = $this->getFrontendBaseUrl();
        $cleanPath = '/' . ltrim($path, '/');
        $url = rtrim($base, '/') . $cleanPath;

        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }

        return $url;
    }

    private function buildUserResponse(array $user): array {
        $userId = isset($user['id']) ? (int)$user['id'] : null;

        if (!$userId) {
            return Helper::mergeUserSubscriptionData(
                Helper::formatUser($user),
                null
            );
        }

        $requiredKeys = ['website', 'localizacao', 'capa_url', 'created_at', 'updated_at'];
        $needsRefresh = false;
        foreach ($requiredKeys as $key) {
            if (!array_key_exists($key, $user)) {
                $needsRefresh = true;
                break;
            }
        }

        if ($needsRefresh) {
            $fresh = $this->db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, capa_url, website, localizacao, created_at, updated_at FROM usuarios WHERE id = ?',
                [$userId]
            );

            if ($fresh) {
                $user = array_merge($fresh, $user);
            }
        }

        $subscription = null;

        try {
            $subscriptionService = new SubscriptionService();
            $subscription = $subscriptionService->getActiveSubscription($userId);
        } catch (Exception $subscriptionError) {
            Helper::logError(
                'AuthController subscription fetch error: ' . $subscriptionError->getMessage(),
                ['user_id' => $userId]
            );
        }

        return Helper::mergeUserSubscriptionData(
            Helper::formatUser($user),
            $subscription
        );
    }

    /**
     * Detecta URL base do frontend com fallback sensato
     */
    private function getFrontendBaseUrl(): string {
        if (defined('FRONTEND_URL') && FRONTEND_URL) {
            return rtrim(FRONTEND_URL, '/');
        }

        if (defined('APP_BASE_URL') && APP_BASE_URL) {
            return rtrim(APP_BASE_URL, '/');
        }

        if (!empty($_ENV['APP_URL'])) {
            return rtrim($_ENV['APP_URL'], '/');
        }

        if (isset($_SERVER['HTTP_HOST'])) {
            $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            return $scheme . '://' . $_SERVER['HTTP_HOST'];
        }

        return 'https://www.empowerup.com.br';
    }
}
