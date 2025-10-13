<?php
/**
 * Migration 018 - Garante coluna foto_perfil para compatibilidade
 */

return function (PDO $pdo) {
    $columnExists = function (string $table, string $column) use ($pdo): bool {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?');
        $stmt->execute([$table, $column]);
        return (int)$stmt->fetchColumn() > 0;
    };

    try {
        if (!$columnExists('usuarios', 'foto_perfil')) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN foto_perfil VARCHAR(255) NULL AFTER avatar_url");
        }
    } catch (Exception $e) {
        throw new RuntimeException('Erro ao ajustar usuarios: ' . $e->getMessage());
    }
};
