<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';
$db = Database::getInstance();
$user = $db->fetch('SELECT id FROM usuarios WHERE email = ?', [SMTP_USERNAME]);
if (!$user) { echo "No user\n"; exit; }
$tokens = $db->fetchAll('SELECT id,user_id,token,type,expires_at,revoked,created_at FROM user_tokens WHERE user_id = ?', [$user['id']]);
echo json_encode($tokens, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT) . PHP_EOL;
