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
            
            // Gerar username único
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
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, created_at, updated_at FROM usuarios WHERE id = ?',
                [$userId]
            );
            
            // Gerar token JWT
            $payload = [
                'userId' => $userId,
                'email' => $data['email'],
                'iat' => time(),
                'exp' => time() + JWT_EXPIRE
            ];
            
            $token = JWT::encode($payload);
            
            echo Helper::jsonResponse(true, 'Usuário criado com sucesso', [
                'user' => Helper::formatUser($newUser),
                'token' => $token
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
                ->required('email', 'Email é obrigatório')
                ->email('email', 'Email inválido')
                ->required('senha', 'Senha é obrigatória');
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            // Buscar usuário
            $user = $this->db->fetch(
                'SELECT * FROM usuarios WHERE email = ?',
                [$data['email']]
            );
            
            if (!$user) {
                echo Helper::jsonResponse(false, 'Email ou senha incorretos', [], 401);
                return;
            }
            
            // Verificar senha
            if (!Helper::verifyPassword($data['senha'], $user['senha'])) {
                echo Helper::jsonResponse(false, 'Email ou senha incorretos', [], 401);
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
            
            echo Helper::jsonResponse(true, 'Login realizado com sucesso', [
                'user' => Helper::formatUser($user),
                'token' => $token
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
                'user' => Helper::formatUser($user)
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
            $user = AuthMiddleware::required();
            
            // Buscar dados atualizados do usuário
            $updatedUser = $this->db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, created_at, updated_at FROM usuarios WHERE id = ?',
                [$user['id']]
            );
            
            if (!$updatedUser) {
                echo Helper::jsonResponse(false, 'Usuário não encontrado', [], 404);
                return;
            }
            
            // Gerar novo token
            $payload = [
                'userId' => $updatedUser['id'],
                'email' => $updatedUser['email'],
                'iat' => time(),
                'exp' => time() + JWT_EXPIRE
            ];
            
            $token = JWT::encode($payload);
            
            echo Helper::jsonResponse(true, 'Token atualizado com sucesso', [
                'user' => Helper::formatUser($updatedUser),
                'token' => $token
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Refresh token error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao atualizar token', [], 500);
        }
    }
}
