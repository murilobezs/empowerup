<?php
/**
 * Migration 004: create user_follows table for follow relationships
 */
return function(PDO $pdo) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS user_follows (
            follower_id INT NOT NULL,
            followed_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (follower_id, followed_id),
            FOREIGN KEY (follower_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (followed_id) REFERENCES usuarios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;");
    } catch (Exception $e) {
        // ignore if exists
    }
};