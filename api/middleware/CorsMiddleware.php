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

        $resolvedOrigin = self::resolveOrigin($origin);

        if ($resolvedOrigin) {
            header("Access-Control-Allow-Origin: {$resolvedOrigin}");
            header('Access-Control-Allow-Credentials: true');
            header('Vary: Origin');
        }

        header('Vary: Access-Control-Request-Headers');
        header('Vary: Access-Control-Request-Method');
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Origin");
        header("Access-Control-Max-Age: 86400");

        // Responder a requisições OPTIONS
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code($resolvedOrigin ? 204 : 403);
            echo $resolvedOrigin ? '' : json_encode(['success' => false, 'message' => 'Origin not allowed']);
            exit;
        }
    }

    private static function resolveOrigin(?string $origin): ?string {
        $configuredOrigins = defined('CORS_ORIGINS') ? CORS_ORIGINS : [];
        $configuredOrigins = is_array($configuredOrigins) ? $configuredOrigins : array_map('trim', explode(',', (string)$configuredOrigins));
        $allowedOrigins = array_map([self::class, 'normalizeOrigin'], $configuredOrigins);

        if ($origin) {
            $normalizedOrigin = self::normalizeOrigin($origin);

            if (in_array($normalizedOrigin, $allowedOrigins, true)) {
                return $origin;
            }

            foreach ($allowedOrigins as $allowed) {
                if (self::matchesWildcard($normalizedOrigin, $allowed)) {
                    return $origin;
                }
            }
        }

        $sameHostOrigin = self::getHostOrigin();
        if ($sameHostOrigin) {
            $normalizedHost = self::normalizeOrigin($sameHostOrigin);
            if (in_array($normalizedHost, $allowedOrigins, true)) {
                return $sameHostOrigin;
            }
        }

        if (DEBUG_MODE && $origin) {
            return $origin;
        }

        return null;
    }

    private static function normalizeOrigin(?string $origin): string {
        return strtolower(rtrim(trim((string)$origin), '/'));
    }

    private static function matchesWildcard(string $origin, string $allowed): bool {
        if (strpos($allowed, '*') === false) {
            return false;
        }

        $pattern = '/^' . str_replace(['\\*', '\\/'], ['.*', '\\/'], preg_quote($allowed, '/')) . '$/i';
        return (bool)preg_match($pattern, $origin);
    }

    private static function getHostOrigin(): ?string {
        if (empty($_SERVER['HTTP_HOST'])) {
            return null;
        }

        $isHttps = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') || (($_SERVER['SERVER_PORT'] ?? '') === '443');
        $scheme = $isHttps ? 'https://' : 'http://';
        return $scheme . $_SERVER['HTTP_HOST'];
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
