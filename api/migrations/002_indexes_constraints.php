<?php
/**
 * Migration 002: add missing indexes and foreign keys safely
 */
return function(PDO $pdo) {
    // helper to check fk existence
    $fkExists = function($table, $fkName) use ($pdo) {
        $stmt = $pdo->prepare("SELECT COUNT(1) as cnt FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = ? AND constraint_name = ? AND constraint_type = 'FOREIGN KEY'");
        $stmt->execute([$table, $fkName]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row && (int)$row['cnt'] > 0;
    };

    // Add foreign keys if missing
    try {
        if (!$fkExists('posts', 'fk_posts_user_id')) {
            $pdo->exec("ALTER TABLE posts ADD CONSTRAINT fk_posts_user_id FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if (!$fkExists('post_comentarios', 'post_comentarios_ibfk_1')) {
            $pdo->exec("ALTER TABLE post_comentarios ADD CONSTRAINT post_comentarios_ibfk_1 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if (!$fkExists('post_comentarios', 'post_comentarios_ibfk_2')) {
            $pdo->exec("ALTER TABLE post_comentarios ADD CONSTRAINT post_comentarios_ibfk_2 FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if (!$fkExists('post_comentarios', 'post_comentarios_ibfk_3')) {
            $pdo->exec("ALTER TABLE post_comentarios ADD CONSTRAINT post_comentarios_ibfk_3 FOREIGN KEY (parent_id) REFERENCES post_comentarios(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if (!$fkExists('post_compartilhamentos', 'post_compartilhamentos_ibfk_1')) {
            $pdo->exec("ALTER TABLE post_compartilhamentos ADD CONSTRAINT post_compartilhamentos_ibfk_1 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if (!$fkExists('post_compartilhamentos', 'post_compartilhamentos_ibfk_2')) {
            $pdo->exec("ALTER TABLE post_compartilhamentos ADD CONSTRAINT post_compartilhamentos_ibfk_2 FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if (!$fkExists('post_likes', 'post_likes_ibfk_1')) {
            $pdo->exec("ALTER TABLE post_likes ADD CONSTRAINT post_likes_ibfk_1 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if (!$fkExists('post_likes', 'post_likes_ibfk_2')) {
            $pdo->exec("ALTER TABLE post_likes ADD CONSTRAINT post_likes_ibfk_2 FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if (!$fkExists('post_media', 'post_media_ibfk_1')) {
            $pdo->exec("ALTER TABLE post_media ADD CONSTRAINT post_media_ibfk_1 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}
};
