<?php
/**
 * Arquivo de teste para debugar problemas de autenticação
 */

// Carregar classes
spl_autoload_register(function ($class) {
    $directories = [
        __DIR__ . '/config/',
        __DIR__ . '/utils/',
        __DIR__ . '/middleware/',
        __DIR__ . '/controllers/'
    ];
    
    foreach ($directories as $directory) {
        $file = $directory . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Carregar configurações
require_once __DIR__ . '/config/config.php';

header('Content-Type: application/json; charset=utf-8');

echo "=== TESTE DE AUTENTICAÇÃO ===\n\n";

// Teste 1: Verificar configurações
echo "1. Configurações:\n";
echo "JWT_SECRET definido: " . (defined('JWT_SECRET') ? 'SIM' : 'NÃO') . "\n";
echo "JWT_EXPIRE: " . (defined('JWT_EXPIRE') ? JWT_EXPIRE : 'NÃO DEFINIDO') . "\n";
echo "DEBUG_MODE: " . (defined('DEBUG_MODE') ? (DEBUG_MODE ? 'TRUE' : 'FALSE') : 'NÃO DEFINIDO') . "\n\n";

// Teste 2: Gerar token de teste
echo "2. Teste de geração de token:\n";
try {
    $payload = [
        'userId' => 1,
        'email' => 'teste@teste.com',
        'iat' => time(),
        'exp' => time() + JWT_EXPIRE
    ];
    
    $token = JWT::encode($payload);
    echo "Token gerado: " . substr($token, 0, 50) . "...\n";
    
    // Teste 3: Decodificar token
    echo "\n3. Teste de decodificação:\n";
    $decoded = JWT::decode($token);
    echo "Token decodificado: " . json_encode($decoded) . "\n";
    
} catch (Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}

// Teste 4: Verificar headers
echo "\n4. Headers recebidos:\n";
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    foreach ($headers as $key => $value) {
        echo "$key: $value\n";
    }
} else {
    echo "getallheaders() não disponível, verificando \$_SERVER:\n";
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            echo "$key: $value\n";
        }
    }
}

// Teste 5: Simular autenticação
echo "\n5. Teste de autenticação:\n";
try {
    $user = AuthMiddleware::optional();
    if ($user) {
        echo "Usuário autenticado: " . $user['email'] . "\n";
    } else {
        echo "Nenhum usuário autenticado\n";
    }
} catch (Exception $e) {
    echo "ERRO na autenticação: " . $e->getMessage() . "\n";
}

echo "\n=== FIM DOS TESTES ===\n";
