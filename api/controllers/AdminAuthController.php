<?php
/**
 * Controlador de autenticação administrativa
 */

class AdminAuthController {
    /**
     * Realiza o login do painel administrativo
     */
    public function login() {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            $username = trim($data['username'] ?? '');
            $password = (string)($data['password'] ?? '');

            if ($username === '' || $password === '') {
                echo Helper::jsonResponse(false, 'Usuário e senha são obrigatórios', [], 400);
                return;
            }

            $validUser = hash_equals(ADMIN_USERNAME, $username);
            $validPassword = false;

            if (preg_match('/^\$2[aby]\$/', ADMIN_PASSWORD)) {
                // ADMIN_PASSWORD armazenado como hash bcrypt
                $validPassword = password_verify($password, ADMIN_PASSWORD);
            } else {
                $validPassword = hash_equals(ADMIN_PASSWORD, $password);
            }

            if (!$validUser || !$validPassword) {
                Helper::logError('Tentativa de login admin falhou', ['username' => $username]);
                echo Helper::jsonResponse(false, 'Credenciais inválidas', [], 401);
                return;
            }

            $issuedAt = time();
            $payload = [
                'admin' => true,
                'username' => ADMIN_USERNAME,
                'permissions' => ['dashboard', 'users', 'content', 'community', 'events', 'monetization'],
                'iat' => $issuedAt,
                'exp' => $issuedAt + ADMIN_JWT_EXPIRE
            ];

            $token = JWT::encode($payload, ADMIN_JWT_SECRET);

            $adminProfile = [
                'username' => ADMIN_USERNAME,
                'displayName' => $_ENV['ADMIN_DISPLAY_NAME'] ?? 'Administrador',
                'permissions' => $payload['permissions'],
                'lastLoginAt' => date('c', $issuedAt)
            ];

            echo Helper::jsonResponse(true, 'Login realizado com sucesso', [
                'token' => $token,
                'expiresIn' => ADMIN_JWT_EXPIRE,
                'admin' => $adminProfile
            ]);
        } catch (Exception $e) {
            Helper::logError('Erro no login administrativo: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro interno ao autenticar', [], 500);
        }
    }

    /**
     * Retorna os dados do admin logado (validação do token)
     */
    public function profile() {
        $payload = AdminAuthMiddleware::required();

        $adminProfile = [
            'username' => $payload['username'] ?? ADMIN_USERNAME,
            'displayName' => $_ENV['ADMIN_DISPLAY_NAME'] ?? 'Administrador',
            'permissions' => $payload['permissions'] ?? []
        ];

        echo Helper::jsonResponse(true, '', [
            'admin' => $adminProfile
        ]);
    }
}
