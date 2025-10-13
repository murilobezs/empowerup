<?php
/**
 * Migration 015 - Garantir colunas de recibos de mensagens e metadados de participantes
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

    $addColumnIfMissing = function (string $table, string $column, string $definition) use ($pdo, $columnExists) {
        if ($columnExists($table, $column)) {
            return;
        }
        $pdo->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
    };

    $indexExists = function (string $table, string $index) use ($pdo, $currentDb): bool {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?');
        $stmt->execute([$currentDb, $table, $index]);
        return (int) $stmt->fetchColumn() > 0;
    };

    $addIndexIfMissing = function (string $table, string $index, string $definition) use ($pdo, $indexExists) {
        if ($indexExists($table, $index)) {
            return;
        }
        $pdo->exec("CREATE INDEX {$index} ON {$table} ({$definition})");
    };

    // Conversa participantes: garantir colunas de metadados utilizados nos recibos
    $addColumnIfMissing('conversa_participantes', 'papel', "ENUM('owner','admin','member') NOT NULL DEFAULT 'member'");
    $addColumnIfMissing('conversa_participantes', 'joined_at', 'DATETIME NULL');
    $addColumnIfMissing('conversa_participantes', 'ultimo_visto_em', 'DATETIME NULL');
    $addColumnIfMissing('conversa_participantes', 'silenciado', 'TINYINT(1) NOT NULL DEFAULT 0');
    $addColumnIfMissing('conversa_participantes', 'favorito', 'TINYINT(1) NOT NULL DEFAULT 0');

    $addIndexIfMissing('conversa_participantes', 'idx_conversa_participantes_conversa', 'conversa_id');
    $addIndexIfMissing('conversa_participantes', 'idx_conversa_participantes_usuario', 'usuario_id');

    // Conversas: garantir colunas de última mensagem para ordenação
    $addColumnIfMissing('conversas', 'ultima_mensagem_id', 'INT NULL');
    $addColumnIfMissing('conversas', 'ultima_mensagem_em', 'DATETIME NULL');
    $addIndexIfMissing('conversas', 'idx_conversas_ultima_mensagem', 'ultima_mensagem_em');

    // Mensagens: garantir colunas auxiliares para recibos
    $addColumnIfMissing('mensagens', 'tipo', "VARCHAR(50) NOT NULL DEFAULT 'texto'");
    $addColumnIfMissing('mensagens', 'metadata', 'LONGTEXT NULL');
    $addColumnIfMissing('mensagens', 'reply_to_id', 'INT NULL');
    $addColumnIfMissing('mensagens', 'lida_em', 'DATETIME NULL');
    $addColumnIfMissing('mensagens', 'recebida_em', 'DATETIME NULL');

    $addIndexIfMissing('mensagens', 'idx_mensagens_conversa', 'conversa_id');
    $addIndexIfMissing('mensagens', 'idx_mensagens_usuario', 'usuario_id');
    $addIndexIfMissing('mensagens', 'idx_mensagens_reply', 'reply_to_id');

    // Ajustar valores iniciais
    if ($columnExists('conversas', 'ultima_mensagem_em')) {
        $pdo->exec("UPDATE conversas SET ultima_mensagem_em = criado_em WHERE ultima_mensagem_em IS NULL");
    }

    if ($columnExists('conversa_participantes', 'papel')) {
        $pdo->exec("UPDATE conversa_participantes SET papel = 'member' WHERE papel IS NULL OR papel = ''");
    }
};
