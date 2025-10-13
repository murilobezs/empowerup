<?php
/**
 * Migration 014 - Patch legacy message/conversation schema
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

    $indexExists = function (string $table, string $index) use ($pdo, $currentDb): bool {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?');
        $stmt->execute([$currentDb, $table, $index]);
        return (int) $stmt->fetchColumn() > 0;
    };

    $ensureColumn = function (string $table, string $column, string $definition) use ($pdo, $columnExists) {
        if ($columnExists($table, $column)) {
            return;
        }
        $pdo->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
    };

    $ensureIndex = function (string $table, string $index, string $definition) use ($pdo, $indexExists) {
        if ($indexExists($table, $index)) {
            return;
        }
        $pdo->exec("CREATE INDEX {$index} ON {$table} ({$definition})");
    };

    // Conversas: garantir colunas utilizadas no backend moderno
    $ensureColumn('conversas', 'descricao', 'TEXT NULL');
    $ensureColumn('conversas', 'imagem', 'VARCHAR(255) NULL');
    $ensureColumn('conversas', 'imagem_capa', 'VARCHAR(255) NULL');
    $ensureColumn('conversas', 'criador_id', 'INT NULL');
    $ensureColumn('conversas', 'privacidade', "ENUM('publica','privada') NOT NULL DEFAULT 'privada'");
    $ensureColumn('conversas', 'ultima_mensagem_id', 'INT NULL');
    $ensureColumn('conversas', 'ultima_mensagem_em', 'DATETIME NULL');

    $ensureIndex('conversas', 'idx_conversas_tipo', 'tipo');
    $ensureIndex('conversas', 'idx_conversas_privacidade', 'privacidade');
    $ensureIndex('conversas', 'idx_conversas_ultima', 'ultima_mensagem_em');

    // Conversa participantes: garantir metadados adicionais
    $ensureColumn('conversa_participantes', 'papel', "ENUM('owner','admin','member') NOT NULL DEFAULT 'member'");
    $ensureColumn('conversa_participantes', 'joined_at', 'DATETIME NULL');
    $ensureColumn('conversa_participantes', 'ultimo_visto_em', 'DATETIME NULL');
    $ensureColumn('conversa_participantes', 'silenciado', 'TINYINT(1) NOT NULL DEFAULT 0');
    $ensureColumn('conversa_participantes', 'favorito', 'TINYINT(1) NOT NULL DEFAULT 0');

    // Mensagens: metadados estendidos
    $ensureColumn('mensagens', 'tipo', "VARCHAR(50) NOT NULL DEFAULT 'texto'");
    $ensureColumn('mensagens', 'metadata', 'LONGTEXT NULL');
    $ensureColumn('mensagens', 'reply_to_id', 'INT NULL');

    $ensureIndex('mensagens', 'idx_mensagens_conversa', 'conversa_id');
    $ensureIndex('mensagens', 'idx_mensagens_reply', 'reply_to_id');

    // Notifications: status para analytics administrativos
    $ensureColumn('notifications', 'status', "ENUM('pending','sent','read','archived') NOT NULL DEFAULT 'pending'");

    // Ajustar valores padrão para novas colunas onde necessário
    if ($columnExists('conversas', 'privacidade')) {
        $pdo->exec("UPDATE conversas SET privacidade = 'privada' WHERE privacidade IS NULL");
    }

    if ($columnExists('conversas', 'ultima_mensagem_em')) {
        $pdo->exec("UPDATE conversas SET ultima_mensagem_em = criado_em WHERE ultima_mensagem_em IS NULL");
    }

    if ($columnExists('conversa_participantes', 'papel')) {
        $pdo->exec("UPDATE conversa_participantes SET papel = 'member' WHERE papel IS NULL OR papel = ''");
    }

    if ($columnExists('notifications', 'status')) {
        $pdo->exec("UPDATE notifications SET status = CASE WHEN is_read = 1 THEN 'read' ELSE 'sent' END WHERE status IS NULL");
    }
};
