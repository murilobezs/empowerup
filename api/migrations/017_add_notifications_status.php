<?php
/**
 * Migration 017 - Adiciona coluna de status às notificações
 */

return function (PDO $pdo) {
    $columnExists = function (string $table, string $column) use ($pdo): bool {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?');
        $stmt->execute([$table, $column]);
        return (int)$stmt->fetchColumn() > 0;
    };

    $indexExists = function (string $table, string $index) use ($pdo): bool {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?');
        $stmt->execute([$table, $index]);
        return (int)$stmt->fetchColumn() > 0;
    };

    try {
        if (!$columnExists('notifications', 'status')) {
            $pdo->exec("ALTER TABLE notifications ADD COLUMN status ENUM('pending','in_review','resolved','dismissed') NOT NULL DEFAULT 'pending' AFTER type");
        }

        if (!$indexExists('notifications', 'idx_notifications_status')) {
            $pdo->exec('CREATE INDEX idx_notifications_status ON notifications (status)');
        }
    } catch (Exception $e) {
        throw new RuntimeException('Erro ao ajustar notificações: ' . $e->getMessage());
    }
};
