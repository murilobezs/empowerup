<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$token = 'bf417d93289c192102ac3180d0ce8fa437bbe17c';
$url = 'http://localhost/empowerup/api/index.php/auth/verify?token=' . $token;

$options = [
    'http' => [
        'method' => 'GET',
        'ignore_errors' => true,
        'timeout' => 10
    ]
];
$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

echo "HTTP RESPONSE:\n";
if (isset($http_response_header)) {
    foreach ($http_response_header as $h) echo $h . "\n";
}

echo "\nBODY:\n";
echo $response . "\n\n";

// Check DB
$db = Database::getInstance();
$user = $db->fetch('SELECT id, email, verified FROM usuarios WHERE email = ?', [SMTP_USERNAME]);

echo "DB USER:\n";
var_export($user);

echo "\n";
