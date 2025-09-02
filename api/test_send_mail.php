<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/utils/Mailer.php';

$to = SMTP_USERNAME;
$subject = 'EmpowerUp - Teste de envio';
$body = "Olá,\n\nEste é um email de teste enviado pela aplicação EmpowerUp para verificar a configuração SMTP.\n\nSe você recebeu, SMTP está funcionando.\n\n-- EmpowerUp";

try {
    $ok = Mailer::send($to, $subject, $body);
    if ($ok) {
        echo "OK: send returned true\n";
    } else {
        echo "FAIL: send returned false\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
