<?php
/**
 * Migration para criar tabela de notificações
 */

require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    
    // Criar tabela de notificações
    $db->execute("
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            from_user_id INT,
            type ENUM('like', 'comment', 'follow', 'save', 'mention') NOT NULL,
            post_id INT NULL,
            comment_id INT NULL,
            message TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (from_user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (comment_id) REFERENCES post_comentarios(id) ON DELETE CASCADE,
            INDEX idx_user_notifications (user_id, created_at DESC),
            INDEX idx_user_unread (user_id, is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
    
    echo "✅ Tabela de notificações criada com sucesso!\n";
    
} catch (Exception $e) {
    echo "❌ Erro ao criar tabela: " . $e->getMessage() . "\n";
    exit(1);
}
?>
