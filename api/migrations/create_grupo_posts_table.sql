-- Criar tabela grupo_posts para relacionar posts com grupos
CREATE TABLE IF NOT EXISTS grupo_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_grupo_post (grupo_id, post_id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_grupo_posts_grupo (grupo_id),
    INDEX idx_grupo_posts_post (post_id),
    INDEX idx_grupo_posts_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
