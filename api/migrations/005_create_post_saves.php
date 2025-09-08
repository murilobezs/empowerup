<?php
/**
 * Migration 005: create post_saves table for saving posts
 */
return function(PDO $pdo) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS post_saves (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            user_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_save (post_id, user_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            INDEX idx_post_saves_user_id (user_id),
            INDEX idx_post_saves_post_id (post_id)
        ) ENGINE=InnoDB;");
    } catch (Exception $e) {
        // ignore if exists
    }
};
