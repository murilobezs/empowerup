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
     * Autenticação opcional
     */
    public static function optional() {
        return self::authenticate();
    }
    
    /**
     * Processar autenticação
     */
    private static function authenticate() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }
        
        $token = $matches[1];
        
        try {
            $payload = JWT::decode($token);
            
            // Verificar se o usuário ainda existe
            $db = Database::getInstance();
            $user = $db->fetch(
                'SELECT id, nome, username, email, tipo, avatar_url FROM usuarios WHERE id = ?',
                [$payload['userId']]
            );
            
            if (!$user) {
                return null;
            }
            
            return $user;
            
        } catch (Exception $e) {
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
