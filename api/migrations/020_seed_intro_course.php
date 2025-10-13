<?php
/**
 * Migration 020: Seed introductory entrepreneurship course with placeholder lessons
 */

return function (PDO $pdo) {
    $courseSlug = 'introducao-ao-empreendedorismo';

    $stmtCheck = $pdo->prepare('SELECT id FROM courses WHERE slug = ? LIMIT 1');
    $stmtCheck->execute([$courseSlug]);
    if ($stmtCheck->fetch(PDO::FETCH_ASSOC)) {
        return;
    }

    $pdo->beginTransaction();

    try {
        $stmtCategory = $pdo->prepare('INSERT IGNORE INTO course_categories (slug, nome, descricao) VALUES (?, ?, ?)');
        $stmtCategory->execute([
            'fundamentos-empreendedorismo',
            'Fundamentos do Empreendedorismo',
            'Trilhas para começar seu negócio com confiança.'
        ]);

        $stmtCatId = $pdo->prepare('SELECT id FROM course_categories WHERE slug = ? LIMIT 1');
        $stmtCatId->execute(['fundamentos-empreendedorismo']);
        $categoryRow = $stmtCatId->fetch(PDO::FETCH_ASSOC);
        $categoryId = $categoryRow ? (int)$categoryRow['id'] : null;

        $stmtInsertCourse = $pdo->prepare('INSERT INTO courses (categoria_id, slug, titulo, descricao, nivel, duracao_estimado, imagem_capa, trailer_url, destaque, publicado, publicado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW())');
        $stmtInsertCourse->execute([
            $categoryId,
            $courseSlug,
            'Introdução ao Empreendedorismo Feminino',
            'Construa uma base sólida para tirar sua ideia do papel com ferramentas práticas, exemplos reais e materiais exclusivos pensados para mulheres empreendedoras.',
            'iniciante',
            150,
            null,
            null
        ]);

        $courseId = (int)$pdo->lastInsertId();

        $modules = [
            [
                'titulo' => 'Mentalidade Empreendedora',
                'descricao' => 'Descubra o que muda quando você assume o papel de empreendedora.',
                'lessons' => [
                    ['titulo' => 'Bem-vinda à jornada empreendedora', 'duracao' => 12],
                    ['titulo' => 'Como lidar com medos e inseguranças', 'duracao' => 18],
                    ['titulo' => 'Organizando sua rotina para empreender', 'duracao' => 20]
                ]
            ],
            [
                'titulo' => 'Da Ideia ao Modelo de Negócio',
                'descricao' => 'Transforme sua ideia em uma proposta de valor clara e sustentável.',
                'lessons' => [
                    ['titulo' => 'Identificando oportunidades no seu contexto', 'duracao' => 22],
                    ['titulo' => 'Proposta de valor para clientes reais', 'duracao' => 20],
                    ['titulo' => 'Primeiros passos no plano financeiro', 'duracao' => 24]
                ]
            ],
            [
                'titulo' => 'Colocando em Prática',
                'descricao' => 'Defina metas, valide com o mercado e crie sua primeira oferta.',
                'lessons' => [
                    ['titulo' => 'Checklist para validar sua ideia', 'duracao' => 18],
                    ['titulo' => 'Construindo seu MVP com poucos recursos', 'duracao' => 21],
                    ['titulo' => 'Preparando-se para os primeiros clientes', 'duracao' => 15]
                ]
            ]
        ];

        $stmtModule = $pdo->prepare('INSERT INTO course_modules (course_id, titulo, descricao, ordem) VALUES (?, ?, ?, ?)');
        $stmtLesson = $pdo->prepare('INSERT INTO course_lessons (module_id, titulo, descricao, conteudo_url, duracao_min, ordem, tipo, recurso_extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

        $moduleOrder = 1;
        foreach ($modules as $module) {
            $stmtModule->execute([
                $courseId,
                $module['titulo'],
                $module['descricao'],
                $moduleOrder
            ]);
            $moduleId = (int)$pdo->lastInsertId();
            $moduleOrder++;

            $lessonOrder = 1;
            foreach ($module['lessons'] as $lesson) {
                $stmtLesson->execute([
                    $moduleId,
                    $lesson['titulo'],
                    null,
                    null,
                    $lesson['duracao'],
                    $lessonOrder,
                    'video',
                    json_encode(['youtube_embed' => ''], JSON_UNESCAPED_UNICODE)
                ]);
                $lessonOrder++;
            }
        }

        $resources = [
            ['titulo' => 'Canvas para o seu negócio', 'descricao' => 'Modelo editável para estruturar seu plano.', 'tipo' => 'modelo'],
            ['titulo' => 'Checklist primeiros 30 dias', 'descricao' => 'Ações rápidas para ganhar tração.', 'tipo' => 'checklist']
        ];

        $stmtResource = $pdo->prepare('INSERT INTO course_resources (course_id, titulo, tipo, url, descricao, ordem) VALUES (?, ?, ?, ?, ?, ?)');
        $resourceOrder = 1;
        foreach ($resources as $resource) {
            $stmtResource->execute([
                $courseId,
                $resource['titulo'],
                $resource['tipo'],
                '',
                $resource['descricao'],
                $resourceOrder++
            ]);
        }

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
};
