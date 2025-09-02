<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/utils/Helper.php';
require_once __DIR__ . '/utils/Mailer.php';

$db = Database::getInstance();
$pdo = $db->getConnection();

// Email do usuário de teste (usar + para entregar na mesma caixa)
$testEmail = SMTP_USERNAME; // enviar para sua conta principal
$testName = 'Usuário Teste';

// Checar se usuário já existe
$user = $db->fetch('SELECT id, nome, email FROM usuarios WHERE email = ?', [$testEmail]);
if (!$user) {
    // criar username rápido
    $username = Helper::generateUsername($testName) . rand(1000,9999);
    $hashed = Helper::hashPassword('SenhaTeste123');
    $userId = $db->insert('INSERT INTO usuarios (nome, username, email, senha, tipo, avatar_url, verified) VALUES (?, ?, ?, ?, ?, ?, ?)', [$testName, $username, $testEmail, $hashed, 'cliente', '/placeholder.svg?height=40&width=40', 0]);
    $user = $db->fetch('SELECT id, nome, email FROM usuarios WHERE id = ?', [$userId]);
}

// Gerar token de verificação
$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time() + 60*60*24);
$db->insert('INSERT INTO user_tokens (user_id, token, type, expires_at) VALUES (?, ?, ?, ?)', [$user['id'], $token, 'email_verification', $expires]);

// Construir URL de verificação (ajuste se seu app estiver em outro base path)
$verifyUrl = 'http://localhost/empowerup/api/index.php/auth/verify?token=' . $token;

$subject = 'EmpowerUp - Verifique seu e-mail (teste)';
$body = "Olá {$user['nome']},\n\nPor favor verifique seu email clicando no link abaixo:\n\n{$verifyUrl}\n\nSe você não solicitou, ignore este email.\n\n-- EmpowerUp";

try {
    $ok = Mailer::send($user['email'], $subject, $body);
    echo ($ok ? "Email enviado com sucesso para {$user['email']}\n" : "Falha ao enviar email\n");
    echo "Link de verificação: {$verifyUrl}\n";
} catch (Exception $e) {
    echo "Erro ao enviar: " . $e->getMessage() . "\n";
}
