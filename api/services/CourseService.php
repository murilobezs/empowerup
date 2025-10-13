<?php
/**
 * Serviço auxiliar para cursos e progresso
 */

class CourseService {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function listCourses(array $filters = [], ?int $userId = null): array {
        $params = [];
        $select = 'SELECT c.*, cat.nome as categoria_nome, cat.slug as categoria_slug';
        $from = ' FROM courses c LEFT JOIN course_categories cat ON cat.id = c.categoria_id';
        $where = ['1=1'];

        if (isset($filters['published'])) {
            $where[] = 'c.publicado = ?';
            $params[] = $filters['published'] ? 1 : 0;
        } else {
            $where[] = 'c.publicado = 1';
        }

        if (!empty($filters['category'])) {
            $where[] = '(cat.slug = ? OR c.categoria_id = ?)';
            $params[] = $filters['category'];
            $params[] = $filters['category'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(c.titulo LIKE ? OR c.descricao LIKE ?)';
            $term = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
        }

        if (!empty($filters['featured'])) {
            $where[] = 'c.destaque = 1';
        }

        $order = ' ORDER BY c.destaque DESC, c.created_at DESC';

        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(50, max(5, (int)($filters['limit'] ?? 12)));
        $offset = ($page - 1) * $limit;

        $rows = $this->db->fetchAll(
            $select . $from . ' WHERE ' . implode(' AND ', $where) . $order . ' LIMIT ? OFFSET ?',
            array_merge($params, [$limit, $offset])
        );

        $courseIds = array_column($rows, 'id');
        $enrollments = [];
        if ($userId && $courseIds) {
            $placeholders = implode(',', array_fill(0, count($courseIds), '?'));
            $rowsEnroll = $this->db->fetchAll(
                "SELECT course_id, status, progresso FROM course_enrollments WHERE user_id = ? AND course_id IN ({$placeholders})",
                array_merge([$userId], $courseIds)
            );
            foreach ($rowsEnroll as $enrollment) {
                $enrollments[(int)$enrollment['course_id']] = $enrollment;
            }
        }

        return [
            'courses' => array_map(function ($row) use ($enrollments) {
                $course = $this->formatCourseSummary($row);
                $course['enrollment'] = isset($enrollments[$course['id']]) ? [
                    'status' => $enrollments[$course['id']]['status'],
                    'progresso' => (float)$enrollments[$course['id']]['progresso']
                ] : null;
                return $course;
            }, $rows),
            'pagination' => [
                'currentPage' => $page,
                'perPage' => $limit,
                'hasNextPage' => count($rows) === $limit,
                'hasPrevPage' => $page > 1
            ]
        ];
    }

    public function getCourseByIdentifier($identifier): ?array {
        if (is_numeric($identifier)) {
            $course = $this->db->fetch(
                'SELECT c.*, cat.nome as categoria_nome, cat.slug as categoria_slug
                 FROM courses c
                 LEFT JOIN course_categories cat ON cat.id = c.categoria_id
                 WHERE c.id = ?',
                [$identifier]
            );
        } else {
            $course = $this->db->fetch(
                'SELECT c.*, cat.nome as categoria_nome, cat.slug as categoria_slug
                 FROM courses c
                 LEFT JOIN course_categories cat ON cat.id = c.categoria_id
                 WHERE c.slug = ?',
                [$identifier]
            );
        }

        return $course ? $this->formatCourseSummary($course) : null;
    }

    public function getCourseDetail($identifier, ?int $userId = null): ?array {
        $course = $this->getCourseByIdentifier($identifier);
        if (!$course || !$course['publicado']) {
            return null;
        }

        $modules = $this->db->fetchAll(
            'SELECT * FROM course_modules WHERE course_id = ? ORDER BY ordem ASC, id ASC',
            [$course['id']]
        );

        $moduleIds = array_column($modules, 'id');
        $lessonsMap = [];
        if ($moduleIds) {
            $placeholders = implode(',', array_fill(0, count($moduleIds), '?'));
            $lessons = $this->db->fetchAll(
                "SELECT * FROM course_lessons WHERE module_id IN ({$placeholders}) ORDER BY ordem ASC, id ASC",
                $moduleIds
            );
            foreach ($lessons as $lesson) {
                $lessonsMap[$lesson['module_id']][] = $this->formatLesson($lesson);
            }
        }

        $course['modules'] = array_map(function ($module) use ($lessonsMap) {
            return [
                'id' => (int)$module['id'],
                'titulo' => $module['titulo'],
                'descricao' => $module['descricao'],
                'ordem' => (int)$module['ordem'],
                'lessons' => $lessonsMap[$module['id']] ?? []
            ];
        }, $modules);

        $course['resources'] = $this->getResources($course['id']);

        if ($userId) {
            $enrollment = $this->db->fetch(
                'SELECT id, status, progresso FROM course_enrollments WHERE user_id = ? AND course_id = ?',
                [$userId, $course['id']]
            );
            $course['enrollment'] = $enrollment ? [
                'id' => (int)$enrollment['id'],
                'status' => $enrollment['status'],
                'progresso' => (float)$enrollment['progresso']
            ] : null;
        }

        return $course;
    }

    public function enroll(int $userId, int $courseId, ?int $subscriptionId = null): array {
        $existing = $this->db->fetch(
            'SELECT id, status FROM course_enrollments WHERE user_id = ? AND course_id = ?',
            [$userId, $courseId]
        );

        if ($existing) {
            if ($existing['status'] !== 'ativo') {
                $this->db->execute(
                    'UPDATE course_enrollments SET status = "ativo", iniciado_em = NOW() WHERE id = ?',
                    [$existing['id']]
                );
            }
            return $this->getEnrollment($userId, $courseId);
        }

        $enrollmentId = $this->db->insert(
            'INSERT INTO course_enrollments (course_id, user_id, subscription_id, status, progresso, iniciado_em)
             VALUES (?, ?, ?, "ativo", 0, NOW())',
            [$courseId, $userId, $subscriptionId]
        );

        return $this->getEnrollment($userId, $courseId);
    }

    public function getEnrollment(int $userId, int $courseId): ?array {
        $row = $this->db->fetch(
            'SELECT * FROM course_enrollments WHERE user_id = ? AND course_id = ?',
            [$userId, $courseId]
        );

        if (!$row) {
            return null;
        }

        $row['progresso'] = (float)$row['progresso'];
        return $row;
    }

    public function updateLessonProgress(int $enrollmentId, int $lessonId, bool $watched, ?int $rating = null, ?string $feedback = null): array {
        $progress = $this->db->fetch(
            'SELECT id FROM course_progress WHERE enrollment_id = ? AND lesson_id = ?'
            , [$enrollmentId, $lessonId]
        );

        if ($progress) {
            $this->db->execute(
                'UPDATE course_progress SET assistido = ?, assistido_em = ?, nota = ?, feedback = ? WHERE id = ?',
                [
                    $watched ? 1 : 0,
                    $watched ? date('Y-m-d H:i:s') : null,
                    $rating,
                    $feedback,
                    $progress['id']
                ]
            );
        } else {
            $this->db->insert(
                'INSERT INTO course_progress (enrollment_id, lesson_id, assistido, assistido_em, nota, feedback)
                 VALUES (?, ?, ?, ?, ?, ?)',
                [
                    $enrollmentId,
                    $lessonId,
                    $watched ? 1 : 0,
                    $watched ? date('Y-m-d H:i:s') : null,
                    $rating,
                    $feedback
                ]
            );
        }

        $this->recalculateProgress($enrollmentId);

        return $this->getEnrollmentById($enrollmentId) ?? [];
    }

    public function getProgress(int $userId, int $courseId): array {
        $enrollment = $this->db->fetch(
            'SELECT id, progresso FROM course_enrollments WHERE user_id = ? AND course_id = ?',
            [$userId, $courseId]
        );

        if (!$enrollment) {
            return ['progress' => 0];
        }

        $rows = $this->db->fetchAll(
            'SELECT cp.lesson_id, cp.assistido, cp.assistido_em, cp.nota, cp.feedback
             FROM course_progress cp
             WHERE cp.enrollment_id = ?',
            [$enrollment['id']]
        );

        return [
            'enrollment_id' => (int)$enrollment['id'],
            'progress' => (float)$enrollment['progresso'],
            'lessons' => array_map(function ($row) {
                return [
                    'lesson_id' => (int)$row['lesson_id'],
                    'watched' => (bool)$row['assistido'],
                    'watched_at' => $row['assistido_em'],
                    'rating' => $row['nota'] !== null ? (int)$row['nota'] : null,
                    'feedback' => $row['feedback']
                ];
            }, $rows)
        ];
    }

    private function recalculateProgress(int $enrollmentId): void {
        $enrollment = $this->getEnrollmentById($enrollmentId);
        if (!$enrollment) {
            return;
        }

        $totalLessonsRow = $this->db->fetch(
            'SELECT COUNT(*) as total
             FROM course_lessons l
             INNER JOIN course_modules m ON m.id = l.module_id
             WHERE m.course_id = ?',
            [$enrollment['course_id']]
        );
        $total = (int)($totalLessonsRow['total'] ?? 0);
        if ($total === 0) {
            return;
        }

        $watchedRow = $this->db->fetch(
            'SELECT COUNT(*) as total
             FROM course_progress
             WHERE enrollment_id = ? AND assistido = 1',
            [$enrollmentId]
        );
        $watched = (int)($watchedRow['total'] ?? 0);

        $percentage = min(100, round(($watched / $total) * 100, 2));

        $fields = ['progresso' => $percentage];
        if ($percentage >= 100 && $enrollment['status'] !== 'concluido') {
            $fields['status'] = 'concluido';
            $fields['concluido_em'] = date('Y-m-d H:i:s');
        }

        $set = [];
        $values = [];
        foreach ($fields as $column => $value) {
            $set[] = $column . ' = ?';
            $values[] = $value;
        }
        $values[] = $enrollmentId;

        $this->db->execute(
            'UPDATE course_enrollments SET ' . implode(', ', $set) . ' WHERE id = ?',
            $values
        );
    }

    private function getEnrollmentById(int $enrollmentId): ?array {
        $row = $this->db->fetch('SELECT * FROM course_enrollments WHERE id = ?', [$enrollmentId]);
        return $row ?: null;
    }

    private function getResources(int $courseId): array {
        $rows = $this->db->fetchAll(
            'SELECT * FROM course_resources WHERE course_id = ? ORDER BY ordem ASC, id ASC',
            [$courseId]
        );

        return array_map(function ($row) {
            return [
                'id' => (int)$row['id'],
                'titulo' => $row['titulo'],
                'tipo' => $row['tipo'],
                'url' => $row['url'],
                'descricao' => $row['descricao'],
                'ordem' => (int)$row['ordem']
            ];
        }, $rows);
    }

    private function formatCourseSummary(array $row): array {
        return [
            'id' => (int)$row['id'],
            'slug' => $row['slug'],
            'titulo' => $row['titulo'],
            'descricao' => $row['descricao'],
            'categoria' => $row['categoria_nome'],
            'categoria_slug' => $row['categoria_slug'],
            'nivel' => $row['nivel'],
            'duracao_estimado' => $row['duracao_estimado'] !== null ? (int)$row['duracao_estimado'] : null,
            'imagem_capa' => $row['imagem_capa'],
            'trailer_url' => $row['trailer_url'],
            'destaque' => (bool)$row['destaque'],
            'publicado' => (bool)$row['publicado'],
            'publicado_em' => $row['publicado_em'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }

    private function formatLesson(array $lesson): array {
        return [
            'id' => (int)$lesson['id'],
            'module_id' => (int)$lesson['module_id'],
            'titulo' => $lesson['titulo'],
            'descricao' => $lesson['descricao'],
            'conteudo_url' => $lesson['conteudo_url'],
            'duracao_min' => $lesson['duracao_min'] !== null ? (int)$lesson['duracao_min'] : null,
            'ordem' => (int)$lesson['ordem'],
            'tipo' => $lesson['tipo'],
            'recurso_extra' => $lesson['recurso_extra'] ? json_decode($lesson['recurso_extra'], true) : null
        ];
    }
}
