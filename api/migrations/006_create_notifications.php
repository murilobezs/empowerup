<?php
/**
 * Migration 006: Create notifications table with extended metadata support
 */

return function (PDO $pdo) {
    $tableExists = function (string $table) use ($pdo): bool {
        $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?");
        $stmt->execute([$table]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row && (int)$row['cnt'] > 0;
    };

    $columnExists = function (string $table, string $column) use ($pdo): bool {
        $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?");
        $stmt->execute([$table, $column]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row && (int)$row['cnt'] > 0;
    };

    $indexExists = function (string $table, string $index) use ($pdo): bool {
        $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?");
        $stmt->execute([$table, $index]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row && (int)$row['cnt'] > 0;
    };

    $fkExists = function (string $table, string $fk) use ($pdo): bool {
        $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = ? AND constraint_name = ? AND constraint_type = 'FOREIGN KEY'");
        $stmt->execute([$table, $fk]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row && (int)$row['cnt'] > 0;
    };

    echo "Configurando tabela de notificações...\n";

    if (!$tableExists('notifications')) {
        $pdo->exec("CREATE TABLE notifications (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            from_user_id INT NULL,
            type ENUM('like','comment','follow','save','mention','message','group','course','system') NOT NULL,
            categoria ENUM('social','mensagem','grupos','cursos','sistema') NOT NULL DEFAULT 'social',
            post_id INT NULL,
            comment_id INT NULL,
            contexto_id INT NULL,
            message TEXT NULL,
            data_extra JSON NULL,
            is_read TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_notifications (user_id, created_at),
            INDEX idx_user_unread (user_id, is_read),
            INDEX idx_notifications_categoria (categoria),
            INDEX idx_notifications_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        echo "Tabela 'notifications' criada.\n";
    } else {
        try {
            $pdo->exec("ALTER TABLE notifications MODIFY type ENUM('like','comment','follow','save','mention','message','group','course','system') NOT NULL");
        } catch (Exception $e) {}

        try {
            if (!$columnExists('notifications', 'categoria')) {
                $pdo->exec("ALTER TABLE notifications ADD COLUMN categoria ENUM('social','mensagem','grupos','cursos','sistema') NOT NULL DEFAULT 'social' AFTER type");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('notifications', 'contexto_id')) {
                $pdo->exec("ALTER TABLE notifications ADD COLUMN contexto_id INT NULL AFTER comment_id");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('notifications', 'data_extra')) {
                $pdo->exec("ALTER TABLE notifications ADD COLUMN data_extra JSON NULL AFTER message");
            }
        } catch (Exception $e) {}

        try {
            if ($columnExists('notifications', 'is_read')) {
                $pdo->exec("ALTER TABLE notifications MODIFY is_read TINYINT(1) NOT NULL DEFAULT 0");
            }
        } catch (Exception $e) {}
    }

    // Garantir índices
    try {
        if (!$indexExists('notifications', 'idx_user_notifications')) {
            $pdo->exec("CREATE INDEX idx_user_notifications ON notifications(user_id, created_at)");
        }
    } catch (Exception $e) {}

    try {
        if (!$indexExists('notifications', 'idx_user_unread')) {
            $pdo->exec("CREATE INDEX idx_user_unread ON notifications(user_id, is_read)");
        }
    } catch (Exception $e) {}

    try {
        if (!$indexExists('notifications', 'idx_notifications_categoria')) {
            $pdo->exec("CREATE INDEX idx_notifications_categoria ON notifications(categoria)");
        }
    } catch (Exception $e) {}

    try {
        if (!$indexExists('notifications', 'idx_notifications_created')) {
            $pdo->exec("CREATE INDEX idx_notifications_created ON notifications(created_at)");
        }
    } catch (Exception $e) {}

    // Garantir chaves estrangeiras (se tabelas existirem)
    try {
        if ($columnExists('notifications', 'user_id') && !$fkExists('notifications', 'fk_notifications_user')) {
            $pdo->exec("ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if ($columnExists('notifications', 'from_user_id') && !$fkExists('notifications', 'fk_notifications_from_user')) {
            $pdo->exec("ALTER TABLE notifications ADD CONSTRAINT fk_notifications_from_user FOREIGN KEY (from_user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if ($columnExists('notifications', 'post_id') && !$fkExists('notifications', 'fk_notifications_post')) {
            $pdo->exec("ALTER TABLE notifications ADD CONSTRAINT fk_notifications_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if ($columnExists('notifications', 'comment_id') && !$fkExists('notifications', 'fk_notifications_comment')) {
            $pdo->exec("ALTER TABLE notifications ADD CONSTRAINT fk_notifications_comment FOREIGN KEY (comment_id) REFERENCES post_comentarios(id) ON DELETE CASCADE");
        }
    } catch (Exception $e) {}

    try {
        if ($columnExists('notifications', 'contexto_id') && !$fkExists('notifications', 'fk_notifications_contexto')) {
            $pdo->exec("ALTER TABLE notifications ADD CONSTRAINT fk_notifications_contexto FOREIGN KEY (contexto_id) REFERENCES conversas(id) ON DELETE SET NULL");
        }
    } catch (Exception $e) {}

    echo "Tabela de notificações configurada com sucesso.\n";
};
