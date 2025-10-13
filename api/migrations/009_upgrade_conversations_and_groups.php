<?php
/**
 * Migration 009: Upgrade conversation tables to support group chats and unread tracking
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

    // Conversas table adjustments
    if ($tableExists('conversas')) {
        try {
            if (!$columnExists('conversas', 'descricao')) {
                $pdo->exec("ALTER TABLE conversas ADD COLUMN descricao TEXT NULL AFTER nome");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversas', 'imagem')) {
                $pdo->exec("ALTER TABLE conversas ADD COLUMN imagem VARCHAR(255) NULL AFTER descricao");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversas', 'imagem_capa')) {
                $pdo->exec("ALTER TABLE conversas ADD COLUMN imagem_capa VARCHAR(255) NULL AFTER imagem");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversas', 'criador_id')) {
                $pdo->exec("ALTER TABLE conversas ADD COLUMN criador_id INT NULL AFTER tipo");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversas', 'ultima_mensagem_id')) {
                $pdo->exec("ALTER TABLE conversas ADD COLUMN ultima_mensagem_id INT NULL AFTER imagem_capa");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversas', 'ultima_mensagem_em')) {
                $pdo->exec("ALTER TABLE conversas ADD COLUMN ultima_mensagem_em DATETIME NULL AFTER ultima_mensagem_id");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversas', 'privacidade')) {
                $pdo->exec("ALTER TABLE conversas ADD COLUMN privacidade ENUM('publica','privada') NOT NULL DEFAULT 'privada' AFTER criador_id");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('conversas', 'idx_conversas_tipo')) {
                $pdo->exec("CREATE INDEX idx_conversas_tipo ON conversas(tipo)");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('conversas', 'idx_conversas_privacidade')) {
                $pdo->exec("CREATE INDEX idx_conversas_privacidade ON conversas(privacidade)");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('conversas', 'idx_conversas_ultima_mensagem')) {
                $pdo->exec("CREATE INDEX idx_conversas_ultima_mensagem ON conversas(ultima_mensagem_em)");
            }
        } catch (Exception $e) {}

        try {
            if (!$fkExists('conversas', 'fk_conversas_criador')) {
                $pdo->exec("ALTER TABLE conversas ADD CONSTRAINT fk_conversas_criador FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE SET NULL");
            }
        } catch (Exception $e) {}

        try {
            if ($columnExists('conversas', 'ultima_mensagem_id') && !$fkExists('conversas', 'fk_conversas_ultima_mensagem')) {
                $pdo->exec("ALTER TABLE conversas ADD CONSTRAINT fk_conversas_ultima_mensagem FOREIGN KEY (ultima_mensagem_id) REFERENCES mensagens(id) ON DELETE SET NULL");
            }
        } catch (Exception $e) {}
    }

    // Conversa participantes table adjustments
    if ($tableExists('conversa_participantes')) {
        try {
            $hasPrimaryKey = false;
            $stmt = $pdo->query("SHOW KEYS FROM conversa_participantes WHERE Key_name = 'PRIMARY'");
            if ($stmt && $stmt->fetch(PDO::FETCH_ASSOC)) {
                $hasPrimaryKey = true;
            }
            if (!$hasPrimaryKey) {
                $pdo->exec("ALTER TABLE conversa_participantes ADD PRIMARY KEY (id)");
            }
        } catch (Exception $e) {}

        try {
            $pdo->exec("ALTER TABLE conversa_participantes MODIFY id INT NOT NULL AUTO_INCREMENT");
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversa_participantes', 'papel')) {
                $pdo->exec("ALTER TABLE conversa_participantes ADD COLUMN papel ENUM('owner','admin','member') NOT NULL DEFAULT 'member' AFTER usuario_id");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversa_participantes', 'ultimo_visto_em')) {
                $pdo->exec("ALTER TABLE conversa_participantes ADD COLUMN ultimo_visto_em DATETIME NULL AFTER status");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversa_participantes', 'silenciado')) {
                $pdo->exec("ALTER TABLE conversa_participantes ADD COLUMN silenciado TINYINT(1) NOT NULL DEFAULT 0 AFTER ultimo_visto_em");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('conversa_participantes', 'favorito')) {
                $pdo->exec("ALTER TABLE conversa_participantes ADD COLUMN favorito TINYINT(1) NOT NULL DEFAULT 0 AFTER silenciado");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('conversa_participantes', 'ux_conversa_usuario')) {
                $pdo->exec("CREATE UNIQUE INDEX ux_conversa_usuario ON conversa_participantes(conversa_id, usuario_id)");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('conversa_participantes', 'idx_conversa_participantes_status')) {
                $pdo->exec("CREATE INDEX idx_conversa_participantes_status ON conversa_participantes(status)");
            }
        } catch (Exception $e) {}
    }

    // Mensagens table adjustments
    if ($tableExists('mensagens')) {
        try {
            if (!$columnExists('mensagens', 'tipo')) {
                $pdo->exec("ALTER TABLE mensagens ADD COLUMN tipo ENUM('texto','arquivo','sistema') NOT NULL DEFAULT 'texto' AFTER conteudo");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('mensagens', 'metadata')) {
                $pdo->exec("ALTER TABLE mensagens ADD COLUMN metadata LONGTEXT NULL AFTER tipo");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('mensagens', 'reply_to_id')) {
                $pdo->exec("ALTER TABLE mensagens ADD COLUMN reply_to_id INT NULL AFTER metadata");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('mensagens', 'idx_mensagens_conversa')) {
                $pdo->exec("CREATE INDEX idx_mensagens_conversa ON mensagens(conversa_id, enviada_em)");
            }
        } catch (Exception $e) {}

        try {
            if ($columnExists('mensagens', 'reply_to_id') && !$fkExists('mensagens', 'fk_mensagens_reply')) {
                $pdo->exec("ALTER TABLE mensagens ADD CONSTRAINT fk_mensagens_reply FOREIGN KEY (reply_to_id) REFERENCES mensagens(id) ON DELETE SET NULL");
            }
        } catch (Exception $e) {}
    }

    // Conversation invitations table
    if (!$tableExists('conversa_convites')) {
        $pdo->exec("CREATE TABLE conversa_convites (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            conversa_id INT NOT NULL,
            remetente_id INT NOT NULL,
            convidado_id INT NOT NULL,
            status ENUM('pendente','aceito','recusado','expirado') NOT NULL DEFAULT 'pendente',
            token VARCHAR(255) NOT NULL,
            expira_em DATETIME NULL,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            aceito_em DATETIME NULL,
            INDEX idx_convites_conversa (conversa_id),
            INDEX idx_convites_convidado (convidado_id),
            UNIQUE KEY ux_convite_token (token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE conversa_convites ADD CONSTRAINT fk_convites_conversa FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE conversa_convites ADD CONSTRAINT fk_convites_remetente FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE conversa_convites ADD CONSTRAINT fk_convites_convidado FOREIGN KEY (convidado_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    // Conversation reactions table (optional quality of life for future)
    if (!$tableExists('mensagem_reacoes')) {
        $pdo->exec("CREATE TABLE mensagem_reacoes (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            mensagem_id INT NOT NULL,
            usuario_id INT NOT NULL,
            reacao VARCHAR(32) NOT NULL,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY ux_reacao_usuario (mensagem_id, usuario_id, reacao),
            INDEX idx_reacao_mensagem (mensagem_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE mensagem_reacoes ADD CONSTRAINT fk_reacoes_mensagem FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE mensagem_reacoes ADD CONSTRAINT fk_reacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    // Conversation pinned messages table
    if (!$tableExists('conversa_mensagens_fixadas')) {
        $pdo->exec("CREATE TABLE conversa_mensagens_fixadas (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            conversa_id INT NOT NULL,
            mensagem_id INT NOT NULL,
            fixado_por INT NOT NULL,
            fixado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY ux_conversa_mensagem_fixada (conversa_id, mensagem_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE conversa_mensagens_fixadas ADD CONSTRAINT fk_fixadas_conversa FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE conversa_mensagens_fixadas ADD CONSTRAINT fk_fixadas_mensagem FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE conversa_mensagens_fixadas ADD CONSTRAINT fk_fixadas_usuario FOREIGN KEY (fixado_por) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }
};
