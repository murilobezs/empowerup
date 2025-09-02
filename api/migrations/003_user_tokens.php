<?php
/**
 * Migration 003: add verified column to usuarios and create user_tokens table
 */
return function(PDO $pdo) {
    // Add verified column if not exists
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'verified'");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || (int)$row['cnt'] === 0) {
        try {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN verified TINYINT(1) NOT NULL DEFAULT 0 AFTER senha");
        } catch (Exception $e) {}
    }

    // Create user_tokens table
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'user_tokens'");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || (int)$row['cnt'] === 0) {
        $pdo->exec("CREATE TABLE user_tokens (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            type ENUM('email_verification','password_reset','refresh') NOT NULL,
            expires_at DATETIME DEFAULT NULL,
            revoked TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_token (token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // add FK
        try {
            $pdo->exec("ALTER TABLE user_tokens ADD CONSTRAINT fk_user_tokens_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }
};
