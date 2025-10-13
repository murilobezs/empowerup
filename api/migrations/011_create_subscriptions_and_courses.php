<?php
/**
 * Migration 011: Create subscription plans and course learning infrastructure
 */

return function (PDO $pdo) {
    $tableExists = function (string $table) use ($pdo): bool {
        $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?");
        $stmt->execute([$table]);
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

    if (!$tableExists('subscription_plans')) {
        $pdo->exec("CREATE TABLE subscription_plans (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(100) NOT NULL UNIQUE,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT NULL,
            valor_mensal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            moeda VARCHAR(10) NOT NULL DEFAULT 'BRL',
            limite_anuncios_semana INT NULL,
            acesso_grupos TINYINT(1) NOT NULL DEFAULT 0,
            acesso_cursos TINYINT(1) NOT NULL DEFAULT 0,
            anuncios_promovidos TINYINT(1) NOT NULL DEFAULT 0,
            beneficios JSON NULL,
            destaque TINYINT(1) NOT NULL DEFAULT 0,
            ativo TINYINT(1) NOT NULL DEFAULT 1,
            ordem INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
    }

    if (!$tableExists('user_subscriptions')) {
        $pdo->exec("CREATE TABLE user_subscriptions (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            plan_id INT NOT NULL,
            status ENUM('ativa','pendente','cancelada','expirada') NOT NULL DEFAULT 'pendente',
            starts_at DATETIME NOT NULL,
            expires_at DATETIME NOT NULL,
            auto_renova TINYINT(1) NOT NULL DEFAULT 1,
            cancel_requested_at DATETIME NULL,
            canceled_at DATETIME NULL,
            metadata JSON NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_plan (user_id, plan_id),
            INDEX idx_subscription_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE user_subscriptions ADD CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE user_subscriptions ADD CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if (!$tableExists('subscription_transactions')) {
        $pdo->exec("CREATE TABLE subscription_transactions (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            subscription_id INT NOT NULL,
            user_id INT NOT NULL,
            plan_id INT NOT NULL,
            valor DECIMAL(10,2) NOT NULL,
            moeda VARCHAR(10) NOT NULL DEFAULT 'BRL',
            status ENUM('pendente','pago','falhou','estornado') NOT NULL DEFAULT 'pendente',
            referencia_gateway VARCHAR(255) NULL,
            payload JSON NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_transactions_subscription (subscription_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE subscription_transactions ADD CONSTRAINT fk_transactions_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE subscription_transactions ADD CONSTRAINT fk_transactions_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE subscription_transactions ADD CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if (!$tableExists('course_categories')) {
        $pdo->exec("CREATE TABLE course_categories (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(150) NOT NULL UNIQUE,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT NULL,
            cor VARCHAR(9) NULL,
            icon VARCHAR(100) NULL,
            ativo TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
    }

    if (!$tableExists('courses')) {
        $pdo->exec("CREATE TABLE courses (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            categoria_id INT NULL,
            slug VARCHAR(200) NOT NULL UNIQUE,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT NULL,
            nivel ENUM('iniciante','intermediario','avancado') NOT NULL DEFAULT 'iniciante',
            duracao_estimado INT NULL,
            imagem_capa VARCHAR(500) NULL,
            trailer_url VARCHAR(500) NULL,
            destaque TINYINT(1) NOT NULL DEFAULT 0,
            publicado TINYINT(1) NOT NULL DEFAULT 0,
            criado_por INT NULL,
            publicado_em DATETIME NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_courses_categoria (categoria_id),
            INDEX idx_courses_publicado (publicado)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE courses ADD CONSTRAINT fk_courses_categoria FOREIGN KEY (categoria_id) REFERENCES course_categories(id) ON DELETE SET NULL");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE courses ADD CONSTRAINT fk_courses_usuario FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL");
        } catch (Exception $e) {}
    }

    if (!$tableExists('course_modules')) {
        $pdo->exec("CREATE TABLE course_modules (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT NULL,
            ordem INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_modules_course_ordem (course_id, ordem)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE course_modules ADD CONSTRAINT fk_modules_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if (!$tableExists('course_lessons')) {
        $pdo->exec("CREATE TABLE course_lessons (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            module_id INT NOT NULL,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT NULL,
            conteudo_url VARCHAR(500) NULL,
            duracao_min INT NULL,
            ordem INT NOT NULL DEFAULT 0,
            tipo ENUM('video','artigo','recurso') NOT NULL DEFAULT 'video',
            recurso_extra JSON NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_lessons_module_ordem (module_id, ordem)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE course_lessons ADD CONSTRAINT fk_lessons_module FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if (!$tableExists('course_enrollments')) {
        $pdo->exec("CREATE TABLE course_enrollments (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            user_id INT NOT NULL,
            subscription_id INT NULL,
            status ENUM('ativo','concluido','pendente','cancelado') NOT NULL DEFAULT 'ativo',
            progresso DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            iniciado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            concluido_em DATETIME NULL,
            UNIQUE KEY ux_enrollment_user_course (course_id, user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE course_enrollments ADD CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE course_enrollments ADD CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE course_enrollments ADD CONSTRAINT fk_enrollments_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL");
        } catch (Exception $e) {}
    }

    if (!$tableExists('course_progress')) {
        $pdo->exec("CREATE TABLE course_progress (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            enrollment_id INT NOT NULL,
            lesson_id INT NOT NULL,
            assistido TINYINT(1) NOT NULL DEFAULT 0,
            assistido_em DATETIME NULL,
            nota INT NULL,
            feedback TEXT NULL,
            UNIQUE KEY ux_progress_lesson (enrollment_id, lesson_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE course_progress ADD CONSTRAINT fk_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE course_progress ADD CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if (!$tableExists('course_reviews')) {
        $pdo->exec("CREATE TABLE course_reviews (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            user_id INT NOT NULL,
            rating INT NOT NULL,
            comentario TEXT NULL,
            destacado TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY ux_review_course_user (course_id, user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE course_reviews ADD CONSTRAINT fk_reviews_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE course_reviews ADD CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    if (!$tableExists('course_resources')) {
        $pdo->exec("CREATE TABLE course_resources (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            titulo VARCHAR(255) NOT NULL,
            tipo ENUM('pdf','link','modelo','checklist','outro') NOT NULL DEFAULT 'link',
            url VARCHAR(500) NOT NULL,
            descricao TEXT NULL,
            ordem INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_resources_course (course_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        try {
            $pdo->exec("ALTER TABLE course_resources ADD CONSTRAINT fk_resources_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE");
        } catch (Exception $e) {}
    }

    // Seed default plans if not present
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM subscription_plans WHERE slug IN ('plano-essencial','plano-premium')");
    $stmt->execute();
    $countResult = $stmt->fetch(PDO::FETCH_ASSOC);
    $existing = $countResult ? (int)$countResult['cnt'] : 0;

    if ($existing < 2) {
        $plans = [
            [
                'slug' => 'plano-essencial',
                'nome' => 'Essencial',
                'descricao' => 'Até 5 anúncios simultâneos por semana e acesso às comunidades exclusivas.',
                'valor_mensal' => 30.00,
                'beneficios' => json_encode([
                    'Até 5 anúncios simultâneos por semana',
                    'Acesso a grupos exclusivos da comunidade',
                    'Badge Essencial no perfil'
                ], JSON_UNESCAPED_UNICODE),
                'limite_anuncios_semana' => 5,
                'acesso_grupos' => 1,
                'acesso_cursos' => 0,
                'anuncios_promovidos' => 1,
                'ordem' => 1
            ],
            [
                'slug' => 'plano-premium',
                'nome' => 'Premium',
                'descricao' => 'Mais de 10 anúncios simultâneos, acesso aos cursos e destaque na plataforma.',
                'valor_mensal' => 50.00,
                'beneficios' => json_encode([
                    'Anuncie com campanhas ilimitadas (fair-use)',
                    'Acesso completo aos cursos e trilhas',
                    'Prioridade em destaque de eventos e comunidades',
                    'Badge Premium no perfil'
                ], JSON_UNESCAPED_UNICODE),
                'limite_anuncios_semana' => 10,
                'acesso_grupos' => 1,
                'acesso_cursos' => 1,
                'anuncios_promovidos' => 1,
                'ordem' => 2,
                'destaque' => 1
            ]
        ];

        foreach ($plans as $plan) {
            $columns = [
                'slug', 'nome', 'descricao', 'valor_mensal', 'beneficios', 'limite_anuncios_semana',
                'acesso_grupos', 'acesso_cursos', 'anuncios_promovidos', 'ordem', 'destaque'
            ];
            $placeholders = implode(', ', array_fill(0, count($columns), '?'));
            $values = [
                $plan['slug'],
                $plan['nome'],
                $plan['descricao'],
                $plan['valor_mensal'],
                $plan['beneficios'],
                $plan['limite_anuncios_semana'],
                $plan['acesso_grupos'],
                $plan['acesso_cursos'],
                $plan['anuncios_promovidos'],
                $plan['ordem'],
                $plan['destaque'] ?? 0
            ];

            $stmtInsert = $pdo->prepare("INSERT IGNORE INTO subscription_plans (" . implode(', ', $columns) . ") VALUES ({$placeholders})");
            $stmtInsert->execute($values);
        }
    }

    // Seed course categories and sample Sebrae-inspired courses
    if ($tableExists('course_categories') && $tableExists('courses') && $tableExists('course_modules') && $tableExists('course_lessons')) {
        $categories = [
            ['slug' => 'empreendedorismo', 'nome' => 'Empreendedorismo', 'descricao' => 'Fundamentos para iniciar e escalar negócios'],
            ['slug' => 'marketing-digital', 'nome' => 'Marketing Digital', 'descricao' => 'Aprenda a divulgar e posicionar seu negócio online'],
            ['slug' => 'financas', 'nome' => 'Finanças', 'descricao' => 'Organização financeira e precificação para empreendedoras']
        ];

        foreach ($categories as $cat) {
            $stmtCat = $pdo->prepare("INSERT IGNORE INTO course_categories (slug, nome, descricao) VALUES (?, ?, ?)");
            $stmtCat->execute([$cat['slug'], $cat['nome'], $cat['descricao']]);
        }

        $stmtCatId = $pdo->prepare("SELECT id FROM course_categories WHERE slug = ?");
        $coursesSeed = [
            [
                'slug' => 'trilha-inicio-negocios',
                'titulo' => 'Trilha: Comece Seu Negócio do Zero',
                'descricao' => 'Um passo a passo prático inspirado em conteúdos do Sebrae para tirar sua ideia do papel.',
                'categoria_slug' => 'empreendedorismo',
                'nivel' => 'iniciante',
                'duracao' => 180,
                'imagem' => 'https://img.youtube.com/vi/zP6x9hXDs2c/maxresdefault.jpg',
                'modules' => [
                    [
                        'titulo' => 'Validação da Ideia',
                        'descricao' => 'Confirme se o seu negócio resolve um problema real.',
                        'lessons' => [
                            ['titulo' => 'Como validar sua ideia de negócio', 'url' => 'https://www.youtube.com/watch?v=zP6x9hXDs2c', 'duracao' => 24],
                            ['titulo' => 'Definindo seu público-alvo', 'url' => 'https://www.youtube.com/watch?v=OVwOB1p5MNk', 'duracao' => 18]
                        ]
                    ],
                    [
                        'titulo' => 'Modelo de Negócio',
                        'descricao' => 'Estruture a proposta de valor e o funcionamento da sua empresa.',
                        'lessons' => [
                            ['titulo' => 'Canvas para empreendedoras', 'url' => 'https://www.youtube.com/watch?v=gGnZk90un0w', 'duracao' => 28],
                            ['titulo' => 'Como precificar seus produtos', 'url' => 'https://www.youtube.com/watch?v=uks0YqSuk-g', 'duracao' => 22]
                        ]
                    ]
                ]
            ],
            [
                'slug' => 'marketing-digital-para-empreendedoras',
                'titulo' => 'Marketing Digital para Empreendedoras',
                'descricao' => 'Aprenda a criar presença digital e vender mais nas redes sociais.',
                'categoria_slug' => 'marketing-digital',
                'nivel' => 'intermediario',
                'duracao' => 210,
                'imagem' => 'https://img.youtube.com/vi/vBzBa7Ykg8k/maxresdefault.jpg',
                'modules' => [
                    [
                        'titulo' => 'Fundamentos do Marketing Digital',
                        'descricao' => null,
                        'lessons' => [
                            ['titulo' => 'Estratégias de redes sociais', 'url' => 'https://www.youtube.com/watch?v=vBzBa7Ykg8k', 'duracao' => 35],
                            ['titulo' => 'Conteúdo que engaja', 'url' => 'https://www.youtube.com/watch?v=mZPtE2Qua7o', 'duracao' => 26]
                        ]
                    ],
                    [
                        'titulo' => 'Vendas e Relacionamento',
                        'descricao' => null,
                        'lessons' => [
                            ['titulo' => 'Como transformar seguidores em clientes', 'url' => 'https://www.youtube.com/watch?v=Fknc0aF4P-8', 'duracao' => 31],
                            ['titulo' => 'CRM para pequenas empreendedoras', 'url' => 'https://www.youtube.com/watch?v=DaIW3N3KX9w', 'duracao' => 28]
                        ]
                    ]
                ]
            ]
        ];

        foreach ($coursesSeed as $course) {
            $stmtCheck = $pdo->prepare("SELECT id FROM courses WHERE slug = ?");
            $stmtCheck->execute([$course['slug']]);
            if ($stmtCheck->fetch(PDO::FETCH_ASSOC)) {
                continue;
            }

            $categoriaId = null;
            if (!empty($course['categoria_slug'])) {
                $stmtCatId->execute([$course['categoria_slug']]);
                $catRow = $stmtCatId->fetch(PDO::FETCH_ASSOC);
                $categoriaId = $catRow ? (int)$catRow['id'] : null;
            }

            $stmtInsertCourse = $pdo->prepare("INSERT INTO courses (categoria_id, slug, titulo, descricao, nivel, duracao_estimado, imagem_capa, destaque, publicado) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)");
            $stmtInsertCourse->execute([
                $categoriaId,
                $course['slug'],
                $course['titulo'],
                $course['descricao'],
                $course['nivel'],
                $course['duracao'],
                $course['imagem']
            ]);

            $courseId = (int)$pdo->lastInsertId();

            $ordemModulo = 1;
            foreach ($course['modules'] as $module) {
                $stmtInsertModule = $pdo->prepare("INSERT INTO course_modules (course_id, titulo, descricao, ordem) VALUES (?, ?, ?, ?)");
                $stmtInsertModule->execute([$courseId, $module['titulo'], $module['descricao'], $ordemModulo++]);
                $moduleId = (int)$pdo->lastInsertId();

                $ordemLesson = 1;
                foreach ($module['lessons'] as $lesson) {
                    $stmtInsertLesson = $pdo->prepare("INSERT INTO course_lessons (module_id, titulo, descricao, conteudo_url, duracao_min, ordem) VALUES (?, ?, NULL, ?, ?, ?)");
                    $stmtInsertLesson->execute([$moduleId, $lesson['titulo'], $lesson['url'], $lesson['duracao'], $ordemLesson++]);
                }
            }
        }
    }
};
