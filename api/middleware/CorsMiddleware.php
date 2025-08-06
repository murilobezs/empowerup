<?php
/**
 * Middleware CORS
 */

class CorsMiddleware {
    
    /**
     * Configurar headers CORS
     */
    public static function handle() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // Verificar se origin está na lista permitida
        if (in_array($origin, CORS_ORIGINS)) {
            header("Access-Control-Allow-Origin: {$origin}");
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 86400");
        
        // Responder a requisições OPTIONS
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
    
    /**
     * Headers de segurança
     */
    public static function securityHeaders() {
        header("X-Content-Type-Options: nosniff");
        header("X-Frame-Options: DENY");
        header("X-XSS-Protection: 1; mode=block");
        header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
        header("Referrer-Policy: strict-origin-when-cross-origin");
    }
}
