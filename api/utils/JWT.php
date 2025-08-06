<?php
/**
 * Classe para manipulação de JWT
 */

class JWT {
    
    /**
     * Gerar token JWT
     */
    public static function encode($payload, $secret = JWT_SECRET) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $headerEncoded = self::base64UrlEncode($header);
        $payloadEncoded = self::base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }
    
    /**
     * Decodificar token JWT
     */
    public static function decode($token, $secret = JWT_SECRET) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            throw new Exception('Token inválido');
        }
        
        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
        
        $signature = self::base64UrlDecode($signatureEncoded);
        $expectedSignature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $secret, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            throw new Exception('Assinatura inválida');
        }
        
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        
        if ($payload === null) {
            throw new Exception('Payload inválido');
        }
        
        // Verificar expiração
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token expirado');
        }
        
        return $payload;
    }
    
    /**
     * Verificar se token é válido
     */
    public static function verify($token, $secret = JWT_SECRET) {
        try {
            self::decode($token, $secret);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Codificar em base64 URL-safe
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Decodificar base64 URL-safe
     */
    private static function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}
