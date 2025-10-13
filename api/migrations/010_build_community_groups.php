<?php
/**
 * Migration 010: Build community groups infrastructure and link posts to groups
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

    if ($tableExists('grupos')) {
        try {
            if (!$columnExists('grupos', 'slug')) {
                $pdo->exec("ALTER TABLE grupos ADD COLUMN slug VARCHAR(255) NULL AFTER nome");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('grupos', 'privacidade')) {
                $pdo->exec("ALTER TABLE grupos ADD COLUMN privacidade ENUM('publico','privado','somente_convidados') NOT NULL DEFAULT 'publico' AFTER categoria");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('grupos', 'regras')) {
                $pdo->exec("ALTER TABLE grupos ADD COLUMN regras TEXT NULL AFTER descricao");
            }
        } catch (Exception $e) {}

        try {
            if ($columnExists('grupos', 'criador_id')) {
                $pdo->exec("ALTER TABLE grupos CHANGE COLUMN criador_id criador_id INT NULL");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('grupos', 'moderacao_nivel')) {
                $pdo->exec("ALTER TABLE grupos ADD COLUMN moderacao_nivel ENUM('aberto','moderado','restrito') NOT NULL DEFAULT 'moderado' AFTER privacidade");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('grupos', 'tags')) {
                $pdo->exec("ALTER TABLE grupos ADD COLUMN tags TEXT NULL AFTER categoria");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('grupos', 'ux_grupos_slug')) {
                $pdo->exec("CREATE UNIQUE INDEX ux_grupos_slug ON grupos(slug)");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('grupos', 'idx_grupos_privacidade')) {
                $pdo->exec("CREATE INDEX idx_grupos_privacidade ON grupos(privacidade)");
            }
        } catch (Exception $e) {}

        try {
            if (!$fkExists('grupos', 'fk_grupos_criador') && $columnExists('grupos', 'criador_id')) {
                $pdo->exec("ALTER TABLE grupos ADD CONSTRAINT fk_grupos_criador FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE SET NULL");
            }
        } catch (Exception $e) {}
    }

    if (!$tableExists('grupo_membros')) {
        $pdo->exec("CREATE TABLE grupo_membros (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            grupo_id INT NOT NULL,
            usuario_id INT NOT NULL,
            papel ENUM('owner','moderador','membro') NOT NULL DEFAULT 'membro',
            status ENUM('ativo','pendente','banido','recusado') NOT NULL DEFAULT 'pendente',
            joined_at TIMESTAMP NULL DEFAULT NULL,
            last_seen_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY ux_grupo_usuario (grupo_id, usuario_id),
            INDEX idx_grupo_status (grupo_id, status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE grupo_membros ADD CONSTRAINT fk_grupo_membros_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE grupo_membros ADD CONSTRAINT fk_grupo_membros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if (!$tableExists('grupo_convites')) {
        $pdo->exec("CREATE TABLE grupo_convites (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            grupo_id INT NOT NULL,
            convidante_id INT NOT NULL,
            convidado_id INT NULL,
            email VARCHAR(255) NULL,
            token VARCHAR(255) NOT NULL,
            status ENUM('pendente','aceito','expirado','revogado','recusado') NOT NULL DEFAULT 'pendente',
            expira_em DATETIME NULL,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            respondido_em DATETIME NULL,
            UNIQUE KEY ux_grupo_token (grupo_id, token),
            INDEX idx_convites_grupo (grupo_id),
            INDEX idx_convites_convidado (convidado_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE grupo_convites ADD CONSTRAINT fk_convites_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE grupo_convites ADD CONSTRAINT fk_convites_convidante FOREIGN KEY (convidante_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE grupo_convites ADD CONSTRAINT fk_convites_convidado FOREIGN KEY (convidado_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if (!$tableExists('grupo_solicitacoes')) {
        $pdo->exec("CREATE TABLE grupo_solicitacoes (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            grupo_id INT NOT NULL,
            usuario_id INT NOT NULL,
            mensagem TEXT NULL,
            status ENUM('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
            analisado_por INT NULL,
            analisado_em DATETIME NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY ux_grupo_solicitacao (grupo_id, usuario_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE grupo_solicitacoes ADD CONSTRAINT fk_solicitacoes_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE grupo_solicitacoes ADD CONSTRAINT fk_solicitacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE grupo_solicitacoes ADD CONSTRAINT fk_solicitacoes_moderador FOREIGN KEY (analisado_por) REFERENCES usuarios(id) ON DELETE SET NULL");
        } catch (Exception $e) {}
    }

    if (!$tableExists('grupo_topicos')) {
        $pdo->exec("CREATE TABLE grupo_topicos (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            grupo_id INT NOT NULL,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT NULL,
            slug VARCHAR(255) NOT NULL,
            ativo TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY ux_grupo_topico_slug (grupo_id, slug)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE grupo_topicos ADD CONSTRAINT fk_topicos_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if ($tableExists('posts')) {
        try {
            if (!$columnExists('posts', 'grupo_id')) {
                $pdo->exec("ALTER TABLE posts ADD COLUMN grupo_id INT NULL AFTER categoria");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('posts', 'escopo_visibilidade')) {
                $pdo->exec("ALTER TABLE posts ADD COLUMN escopo_visibilidade ENUM('publico','seguidores','grupo','privado') NOT NULL DEFAULT 'publico' AFTER grupo_id");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('posts', 'idx_posts_grupo')) {
                $pdo->exec("CREATE INDEX idx_posts_grupo ON posts(grupo_id)");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('posts', 'idx_posts_visibilidade')) {
                $pdo->exec("CREATE INDEX idx_posts_visibilidade ON posts(escopo_visibilidade)");
            }
        } catch (Exception $e) {}

        try {
            if ($columnExists('posts', 'grupo_id') && !$fkExists('posts', 'fk_posts_grupo')) {
                $pdo->exec("ALTER TABLE posts ADD CONSTRAINT fk_posts_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE SET NULL");
            }
        } catch (Exception $e) {}
    }
};
