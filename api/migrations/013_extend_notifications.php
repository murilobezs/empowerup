<?php
/**
 * Migration 013: Extend notifications to support messaging and richer metadata
 */

return function (PDO $pdo) {
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

    if ($columnExists('notifications', 'type')) {
        try {
            $pdo->exec("ALTER TABLE notifications MODIFY type ENUM('like','comment','follow','save','mention','message','group','course','system') NOT NULL");
        } catch (Exception $e) {}
    }

    try {
        if (!$columnExists('notifications', 'categoria')) {
            $pdo->exec("ALTER TABLE notifications ADD COLUMN categoria ENUM('social','mensagem','grupos','cursos','sistema') NOT NULL DEFAULT 'social' AFTER type");
        }
    } catch (Exception $e) {}

    try {
        if (!$columnExists('notifications', 'data_extra')) {
            $pdo->exec("ALTER TABLE notifications ADD COLUMN data_extra JSON NULL AFTER message");
        }
    } catch (Exception $e) {}

    try {
        if (!$columnExists('notifications', 'contexto_id')) {
            $pdo->exec("ALTER TABLE notifications ADD COLUMN contexto_id INT NULL AFTER post_id");
        }
    } catch (Exception $e) {}

    try {
        if (!$indexExists('notifications', 'idx_notifications_categoria')) {
            $pdo->exec("CREATE INDEX idx_notifications_categoria ON notifications(categoria)");
        }
    } catch (Exception $e) {}

    try {
        if (!$indexExists('notifications', 'idx_notifications_created')) {
            $pdo->exec("CREATE INDEX idx_notifications_created ON notifications(created_at DESC)");
        }
    } catch (Exception $e) {}
};
