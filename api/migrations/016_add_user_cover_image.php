<?php
/**
 * Migration 016 - Adiciona coluna de capa ao perfil das usuárias
 */

return function (PDO $pdo) {
    $currentDb = $pdo->query('SELECT DATABASE()')->fetchColumn();
    if (!$currentDb) {
        throw new Exception('Não foi possível identificar o banco de dados atual.');
    }

    $columnExists = function (string $table, string $column) use ($pdo, $currentDb): bool {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?');
        $stmt->execute([$currentDb, $table, $column]);
        return (int) $stmt->fetchColumn() > 0;
    };

    if (!$columnExists('usuarios', 'capa_url')) {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN capa_url VARCHAR(255) NULL AFTER avatar_url");
    }

    $indexExists = function (string $table, string $index) use ($pdo, $currentDb): bool {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?');
        $stmt->execute([$currentDb, $table, $index]);
        return (int) $stmt->fetchColumn() > 0;
    };

    if (!$indexExists('usuarios', 'idx_usuarios_capa')) {
        $pdo->exec('CREATE INDEX idx_usuarios_capa ON usuarios (capa_url)');
    }
};
