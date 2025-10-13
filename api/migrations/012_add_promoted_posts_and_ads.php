<?php
/**
 * Migration 012: Add promoted posts (ads) infrastructure
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

    if ($tableExists('posts')) {
        try {
            if (!$columnExists('posts', 'is_promovido')) {
                $pdo->exec("ALTER TABLE posts ADD COLUMN is_promovido TINYINT(1) NOT NULL DEFAULT 0 AFTER escopo_visibilidade");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('posts', 'promocao_status')) {
                $pdo->exec("ALTER TABLE posts ADD COLUMN promocao_status ENUM('ativo','agendado','expirado','pausado') NULL AFTER is_promovido");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('posts', 'promocao_expira_em')) {
                $pdo->exec("ALTER TABLE posts ADD COLUMN promocao_expira_em DATETIME NULL AFTER promocao_status");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('posts', 'promocao_metadata')) {
                $pdo->exec("ALTER TABLE posts ADD COLUMN promocao_metadata JSON NULL AFTER promocao_expira_em");
            }
        } catch (Exception $e) {}

        try {
            if (!$columnExists('posts', 'ad_campaign_id')) {
                $pdo->exec("ALTER TABLE posts ADD COLUMN ad_campaign_id INT NULL AFTER promocao_metadata");
            }
        } catch (Exception $e) {}

        try {
            if (!$indexExists('posts', 'idx_posts_promovido')) {
                $pdo->exec("CREATE INDEX idx_posts_promovido ON posts(is_promovido, promocao_status)");
            }
        } catch (Exception $e) {}
    }

    if (!$tableExists('ad_campaigns')) {
        $pdo->exec("CREATE TABLE ad_campaigns (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            plan_id INT NULL,
            titulo VARCHAR(255) NOT NULL,
            objetivo ENUM('alcance','cliques','conversao','engajamento') NOT NULL DEFAULT 'alcance',
            status ENUM('rascunho','ativo','pausado','encerrado') NOT NULL DEFAULT 'rascunho',
            data_inicio DATETIME NOT NULL,
            data_fim DATETIME NULL,
            orcamento_total DECIMAL(10,2) NULL,
            orcamento_diario DECIMAL(10,2) NULL,
            publico_alvo JSON NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_campaign_user (user_id),
            INDEX idx_campaign_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE ad_campaigns ADD CONSTRAINT fk_campaigns_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE ad_campaigns ADD CONSTRAINT fk_campaigns_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL");
        } catch (Exception $e) {}
    }

    if (!$tableExists('ad_campaign_posts')) {
        $pdo->exec("CREATE TABLE ad_campaign_posts (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            campaign_id INT NOT NULL,
            post_id INT NOT NULL,
            status ENUM('ativo','pausado','removido') NOT NULL DEFAULT 'ativo',
            prioridade INT NOT NULL DEFAULT 0,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY ux_campaign_post (campaign_id, post_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE ad_campaign_posts ADD CONSTRAINT fk_campaign_posts_campaign FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE ad_campaign_posts ADD CONSTRAINT fk_campaign_posts_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if (!$tableExists('ad_metrics_daily')) {
        $pdo->exec("CREATE TABLE ad_metrics_daily (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            campaign_id INT NOT NULL,
            post_id INT NULL,
            data DATE NOT NULL,
            impressoes INT NOT NULL DEFAULT 0,
            cliques INT NOT NULL DEFAULT 0,
            engagements INT NOT NULL DEFAULT 0,
            gastos DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            UNIQUE KEY ux_campaign_day (campaign_id, post_id, data)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE ad_metrics_daily ADD CONSTRAINT fk_metrics_campaign FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE ad_metrics_daily ADD CONSTRAINT fk_metrics_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if ($tableExists('posts') && !$fkExists('posts', 'fk_posts_campaign') && $columnExists('posts', 'ad_campaign_id')) {
        try {
            $pdo->exec("ALTER TABLE posts ADD CONSTRAINT fk_posts_campaign FOREIGN KEY (ad_campaign_id) REFERENCES ad_campaigns(id) ON DELETE SET NULL");
        } catch (Exception $e) {}
    }
};
