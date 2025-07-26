-- Atualização do banco para sistema de likes, comentários e mídia

-- Adicionar campos de mídia na tabela posts
ALTER TABLE `posts` 
ADD COLUMN `imagem_url` VARCHAR(500) DEFAULT NULL,
ADD COLUMN `video_url` VARCHAR(500) DEFAULT NULL,
ADD COLUMN `gif_url` VARCHAR(500) DEFAULT NULL,
ADD COLUMN `tipo_midia` ENUM('imagem', 'video', 'gif', 'none') DEFAULT 'none',
ADD COLUMN `user_id` INT(11) DEFAULT NULL,
ADD INDEX `idx_user_id` (`user_id`);

-- Criar tabela de likes
CREATE TABLE `post_likes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `post_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`post_id`, `user_id`),
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Criar tabela de comentários
CREATE TABLE `post_comentarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `post_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `conteudo` TEXT NOT NULL,
  `parent_id` INT(11) DEFAULT NULL, -- Para respostas de comentários
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_parent_id` (`parent_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `post_comentarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Criar tabela de compartilhamentos
CREATE TABLE `post_compartilhamentos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `post_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_share` (`post_id`, `user_id`),
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Atualizar campo username na tabela usuarios se não existir
ALTER TABLE `usuarios` 
ADD COLUMN IF NOT EXISTS `username` VARCHAR(50) UNIQUE DEFAULT NULL,
ADD INDEX IF NOT EXISTS `idx_username` (`username`);

-- Adicionar triggers para atualizar contadores automaticamente
DELIMITER $$

CREATE TRIGGER `update_post_likes_count` 
AFTER INSERT ON `post_likes` 
FOR EACH ROW 
BEGIN
    UPDATE posts SET likes = (
        SELECT COUNT(*) FROM post_likes WHERE post_id = NEW.post_id
    ) WHERE id = NEW.post_id;
END$$

CREATE TRIGGER `update_post_likes_count_delete` 
AFTER DELETE ON `post_likes` 
FOR EACH ROW 
BEGIN
    UPDATE posts SET likes = (
        SELECT COUNT(*) FROM post_likes WHERE post_id = OLD.post_id
    ) WHERE id = OLD.post_id;
END$$

CREATE TRIGGER `update_post_comments_count` 
AFTER INSERT ON `post_comentarios` 
FOR EACH ROW 
BEGIN
    UPDATE posts SET comentarios = (
        SELECT COUNT(*) FROM post_comentarios WHERE post_id = NEW.post_id
    ) WHERE id = NEW.post_id;
END$$

CREATE TRIGGER `update_post_comments_count_delete` 
AFTER DELETE ON `post_comentarios` 
FOR EACH ROW 
BEGIN
    UPDATE posts SET comentarios = (
        SELECT COUNT(*) FROM post_comentarios WHERE post_id = OLD.post_id
    ) WHERE id = OLD.post_id;
END$$

CREATE TRIGGER `update_post_shares_count` 
AFTER INSERT ON `post_compartilhamentos` 
FOR EACH ROW 
BEGIN
    UPDATE posts SET compartilhamentos = (
        SELECT COUNT(*) FROM post_compartilhamentos WHERE post_id = NEW.post_id
    ) WHERE id = NEW.post_id;
END$$

CREATE TRIGGER `update_post_shares_count_delete` 
AFTER DELETE ON `post_compartilhamentos` 
FOR EACH ROW 
BEGIN
    UPDATE posts SET compartilhamentos = (
        SELECT COUNT(*) FROM post_compartilhamentos WHERE post_id = OLD.post_id
    ) WHERE id = OLD.post_id;
END$$

DELIMITER ;
