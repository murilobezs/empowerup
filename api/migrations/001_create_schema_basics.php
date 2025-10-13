<?php
/**
 * Migration 001: ensure basic tables and columns consistency
 */
return function(PDO $pdo) {
    // helper to check index existence
    $indexExists = function($table, $indexName) use ($pdo) {
        $stmt = $pdo->prepare("SELECT COUNT(1) as cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?");
        $stmt->execute([$table, $indexName]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row && (int)$row['cnt'] > 0;
    };

    // Ensure columns types (safe MODIFYs)
    try {
        $pdo->exec("ALTER TABLE usuarios
            MODIFY nome VARCHAR(255) NOT NULL");
    } catch (Exception $e) {}

    try { $pdo->exec("ALTER TABLE usuarios MODIFY email VARCHAR(255) NOT NULL"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE usuarios MODIFY senha VARCHAR(255) NOT NULL"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE usuarios MODIFY tipo ENUM('empreendedora','cliente') NOT NULL"); } catch (Exception $e) {}

    // Ensure unique indexes for email and username
    if (!$indexExists('usuarios', 'ux_usuarios_email')) {
        try {
            $pdo->exec("ALTER TABLE usuarios ADD UNIQUE INDEX ux_usuarios_email (email(191))");
        } catch (Exception $e) {}
    }

    if (!$indexExists('usuarios', 'ux_usuarios_username')) {
        try {
            $pdo->exec("ALTER TABLE usuarios ADD UNIQUE INDEX ux_usuarios_username (username)");
        } catch (Exception $e) {}
    }

    // Ensure posts.tipo_midia enum exists (safe MODIFY)
    try { $pdo->exec("ALTER TABLE posts MODIFY tipo_midia ENUM('imagem','video','gif','none') DEFAULT 'none'"); } catch (Exception $e) {}

    // Ensure post_media index on post_id
    if (!$indexExists('post_media', 'idx_post_media_post_id')) {
        try { $pdo->exec("ALTER TABLE post_media ADD INDEX idx_post_media_post_id (post_id)"); } catch (Exception $e) {}
    }
};
