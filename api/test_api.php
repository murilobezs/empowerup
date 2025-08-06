<?php
/**
 * Script de teste da API EmpowerUp
 */

// URL base da API
$baseUrl = 'http://localhost/empowerup/api';

/**
 * Função para fazer requisições HTTP
 */
function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, is_array($data) ? json_encode($data) : $data);
        $headers[] = 'Content-Type: application/json';
    }
    
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error];
    }
    
    return [
        'status' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

echo "🚀 Testando EmpowerUp API\n";
echo "========================\n\n";

// 1. Health Check
echo "1. Health Check...\n";
$response = makeRequest($baseUrl . '/');
echo "Status: " . $response['status'] . "\n";
echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// 2. Teste de registro
echo "2. Testando registro de usuário...\n";
$userData = [
    'nome' => 'Teste API',
    'email' => 'teste@api.com',
    'senha' => '123456',
    'tipo' => 'empreendedora',
    'telefone' => '11999999999',
    'bio' => 'Usuário de teste da API'
];

$response = makeRequest($baseUrl . '/auth/register', 'POST', $userData);
echo "Status: " . $response['status'] . "\n";
echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// Extrair token se registro foi bem-sucedido
$token = null;
if ($response['status'] === 201 && isset($response['body']['token'])) {
    $token = $response['body']['token'];
    echo "✅ Token obtido: " . substr($token, 0, 20) . "...\n\n";
} else {
    echo "❌ Falha no registro. Tentando login...\n\n";
    
    // 3. Teste de login
    echo "3. Testando login...\n";
    $loginData = [
        'email' => 'teste@api.com',
        'senha' => '123456'
    ];
    
    $response = makeRequest($baseUrl . '/auth/login', 'POST', $loginData);
    echo "Status: " . $response['status'] . "\n";
    echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
    
    if ($response['status'] === 200 && isset($response['body']['token'])) {
        $token = $response['body']['token'];
        echo "✅ Token obtido via login: " . substr($token, 0, 20) . "...\n\n";
    }
}

if ($token) {
    // 4. Teste de perfil
    echo "4. Testando busca de perfil...\n";
    $response = makeRequest($baseUrl . '/auth/profile', 'GET', null, ['Authorization: Bearer ' . $token]);
    echo "Status: " . $response['status'] . "\n";
    echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
    
    // 5. Teste de criação de post
    echo "5. Testando criação de post...\n";
    $postData = [
        'conteudo' => 'Este é um post de teste da API! 🚀',
        'categoria' => 'Tecnologia',
        'tags' => ['teste', 'api', 'empowerup']
    ];
    
    $response = makeRequest($baseUrl . '/posts', 'POST', $postData, ['Authorization: Bearer ' . $token]);
    echo "Status: " . $response['status'] . "\n";
    echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
    
    // 6. Teste de listagem de posts
    echo "6. Testando listagem de posts...\n";
    $response = makeRequest($baseUrl . '/posts?page=1&limit=5');
    echo "Status: " . $response['status'] . "\n";
    echo "Posts encontrados: " . count($response['body']['posts'] ?? []) . "\n";
    echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
    
} else {
    echo "❌ Não foi possível obter token. Testes autenticados não executados.\n\n";
}

// 7. Teste de busca de usuários
echo "7. Testando busca de usuários...\n";
$response = makeRequest($baseUrl . '/users/search?q=teste');
echo "Status: " . $response['status'] . "\n";
echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// 8. Teste de verificação de username
echo "8. Testando verificação de username...\n";
$response = makeRequest($baseUrl . '/users/check-username/testeunico123');
echo "Status: " . $response['status'] . "\n";
echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

echo "🎉 Testes concluídos!\n";
echo "=====================\n";
echo "Para mais testes, execute:\n";
echo "php " . __FILE__ . "\n\n";
echo "Ou acesse diretamente:\n";
echo $baseUrl . "/\n";
?>
