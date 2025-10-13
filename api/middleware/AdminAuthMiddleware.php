<?php
/**
 * Middleware de autenticação para o painel administrativo
 */

class AdminAuthMiddleware {
    /**
     * Autenticação obrigatória para rotas administrativas
     */
    public static function required() {
        $payload = self::authenticate();
        if (!$payload) {
            http_response_code(401);
            echo Helper::jsonResponse(false, 'Acesso administrativo requerido', [], 401);
            exit;
        }
        return $payload;
    }

    /**
     * Autenticação opcional
     */
    public static function optional() {
        return self::authenticate();
    }

    /**
     * Realiza a validação do token administrativo
     */
    private static function authenticate() {
        // Obter headers de forma segura em ambientes diferentes
        $rawHeaders = [];
        if (function_exists('getallheaders')) {
            $rawHeaders = getallheaders();
        } else {
            foreach ($_SERVER as $key => $value) {
                if (strpos($key, 'HTTP_') === 0) {
                    $normalized = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                    $rawHeaders[$normalized] = $value;
                }
            }
        }

        $headers = [];
        foreach ($rawHeaders as $key => $value) {
            $headers[strtolower($key)] = $value;
        }

        $authHeader = $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }

        $token = $matches[1];

        try {
            $payload = JWT::decode($token, ADMIN_JWT_SECRET);

            if (!isset($payload['admin']) || !$payload['admin']) {
                throw new Exception('Token administrativo inválido');
            }

            return $payload;
        } catch (Exception $e) {
            Helper::logError('Admin auth token error: ' . $e->getMessage());
            return null;
        }
    }
}
