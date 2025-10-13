<?php
/**
 * Middleware de autenticação
 */

class AuthMiddleware {
    
    /**
     * Verificar autenticação obrigatória
     */
    public static function required() {
        $user = self::authenticate();
        if (!$user) {
            http_response_code(401);
            echo Helper::jsonResponse(false, 'Token de acesso requerido', [], 401);
            exit;
        }
        return $user;
    }
    
    /**
     * Verificar autenticação por sessão (alternativa ao token)
     */
    public static function sessionRequired() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $user = self::authenticateBySession();
        if (!$user) {
            http_response_code(401);
            echo Helper::jsonResponse(false, 'Usuário não autenticado', [], 401);
            exit;
        }
        return $user;
    }
    
    /**
     * Autenticação híbrida: tenta token primeiro, depois sessão
     */
    public static function hybrid() {
        // Primeiro tenta autenticação por token
        $user = self::authenticate();
        
        if (!$user) {
            // Se não funcionar, tenta por sessão
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $user = self::authenticateBySession();
        }
        
        return $user;
    }
    
    /**
     * Autenticação híbrida obrigatória
     */
    public static function hybridRequired() {
        $user = self::hybrid();
        if (!$user) {
            http_response_code(401);
            echo Helper::jsonResponse(false, 'Autenticação necessária', [], 401);
            exit;
        }
        return $user;
    }
    
    /**
     * Autenticação opcional
     */
    public static function optional() {
        return self::authenticate();
    }
    
    /**
     * Processar autenticação
     */
    private static function authenticate() {
        // getallheaders() may not exist in some SAPIs; provide a safe fallback
        $rawHeaders = [];
        if (function_exists('getallheaders')) {
            $rawHeaders = getallheaders();
        } else {
            // Build headers from $_SERVER keys
            foreach ($_SERVER as $key => $value) {
                if (strpos($key, 'HTTP_') === 0) {
                    $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                    $rawHeaders[$name] = $value;
                }
            }
        }

        // Normalize header keys to lowercase for safe access
        $headers = [];
        foreach ($rawHeaders as $k => $v) {
            $headers[strtolower($k)] = $v;
        }

        $authHeader = $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }

        $token = $matches[1];

        try {
            $payload = JWT::decode($token);

            // Verificar se o usuário ainda existe
            $db = Database::getInstance();
            $user = $db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, capa_url, website, localizacao, created_at, updated_at FROM usuarios WHERE id = ?',
                [$payload['userId']]
            );

            if (!$user) {
                return null;
            }

            return $user;

        } catch (Exception $e) {
            // Registrar erro para diagnóstico sem vazar detalhes ao cliente
            Helper::logError('Auth token error: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Autenticação baseada em sessão
     */
    private static function authenticateBySession() {
        if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
            return null;
        }

        try {
            $db = Database::getInstance();
            $user = $db->fetch(
                'SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, capa_url, website, localizacao, created_at, updated_at FROM usuarios WHERE id = ?',
                [$_SESSION['user_id']]
            );

            if (!$user) {
                // Limpar sessão se usuário não existe mais
                unset($_SESSION['user_id']);
                return null;
            }

            return $user;

        } catch (Exception $e) {
            Helper::logError('Session auth error: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Middleware de rate limiting
     */
    public static function rateLimit($requests = RATE_LIMIT_REQUESTS, $window = RATE_LIMIT_WINDOW) {
        $clientId = self::getClientId();
        $cacheFile = __DIR__ . "/../cache/rate_limit_{$clientId}.json";
        $cacheDir = dirname($cacheFile);
        
        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0755, true);
        }
        
        $now = time();
        $data = [];
        
        if (file_exists($cacheFile)) {
            $data = json_decode(file_get_contents($cacheFile), true) ?? [];
        }
        
        // Limpar registros antigos
        $data = array_filter($data, function($timestamp) use ($now, $window) {
            return ($now - $timestamp) < $window;
        });
        
        // Verificar limite
        if (count($data) >= $requests) {
            http_response_code(429);
            echo Helper::jsonResponse(false, 'Muitas tentativas. Tente novamente em ' . ceil($window/60) . ' minutos.', [], 429);
            exit;
        }
        
        // Adicionar registro atual
        $data[] = $now;
        
        // Salvar cache
        file_put_contents($cacheFile, json_encode($data), LOCK_EX);
    }
    
    /**
     * Obter ID único do cliente
     */
    private static function getClientId() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        return md5($ip . $userAgent);
    }
}
