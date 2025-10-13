<?php
/**
 * Controlador de Cursos, Módulos e Aulas
 */

class CourseController {
    private $courseService;
    private $subscriptionService;

    public function __construct() {
        $this->courseService = new CourseService();
        $this->subscriptionService = new SubscriptionService();
    }

    /**
     * Listar cursos publicados
     */
    public function listCourses(): void {
        try {
            $user = AuthMiddleware::optional();

            $filters = [
                'category' => $_GET['category'] ?? null,
                'search' => $_GET['search'] ?? null,
                'featured' => isset($_GET['featured'])
                    ? in_array(strtolower((string)$_GET['featured']), ['1', 'true', 'yes'], true)
                    : null,
                'published' => isset($_GET['published'])
                    ? in_array(strtolower((string)$_GET['published']), ['1', 'true', 'yes'], true)
                    : null,
                'page' => $_GET['page'] ?? 1,
                'limit' => $_GET['limit'] ?? 12
            ];

            $result = $this->courseService->listCourses($filters, $user ? (int)$user['id'] : null);

            echo Helper::jsonResponse(true, '', $result);
        } catch (Exception $e) {
            Helper::logError('List courses error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao listar cursos', [], 500);
        }
    }

    /**
     * Detalhes completos do curso (apenas para assinantes com acesso)
     */
    public function getCourse($identifier): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'acesso_cursos')) {
                echo Helper::jsonResponse(false, 'Seu plano atual não permite acesso aos cursos completos', [
                    'subscription' => $this->subscriptionService->getActiveSubscription($user['id'])
                ], 403);
                return;
            }

            $course = $this->courseService->getCourseDetail($identifier, $user['id']);
            if (!$course) {
                echo Helper::jsonResponse(false, 'Curso não encontrado ou indisponível', [], 404);
                return;
            }

            echo Helper::jsonResponse(true, '', ['course' => $course]);
        } catch (Exception $e) {
            Helper::logError('Get course error: ' . $e->getMessage(), ['identifier' => $identifier]);
            echo Helper::jsonResponse(false, 'Erro ao buscar curso', [], 500);
        }
    }

    /**
     * Inscrever usuária em um curso
     */
    public function enroll($identifier): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'acesso_cursos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite inscrição em cursos', [], 403);
                return;
            }

            $course = $this->courseService->getCourseByIdentifier($identifier);
            if (!$course || !$course['publicado']) {
                echo Helper::jsonResponse(false, 'Curso indisponível', [], 404);
                return;
            }

            $existingEnrollment = $this->courseService->getEnrollment($user['id'], $course['id']);
            $subscription = $this->subscriptionService->getActiveSubscription($user['id']);
            $enrollment = $this->courseService->enroll($user['id'], $course['id'], $subscription['id'] ?? null);

            if ((!$existingEnrollment || ($existingEnrollment['status'] ?? '') !== 'ativo') && $enrollment && ($enrollment['status'] ?? '') === 'ativo') {
                try {
                    $courseDetail = $this->courseService->getCourseDetail($course['slug'] ?? $course['id'], $user['id']);
                    $modules = [];
                    if (!empty($courseDetail['modules'])) {
                        foreach ($courseDetail['modules'] as $module) {
                            $lessonTitles = [];
                            if (!empty($module['lessons'])) {
                                foreach ($module['lessons'] as $lesson) {
                                    $lessonTitles[] = $lesson['titulo'];
                                }
                            }
                            $modules[] = [
                                'title' => $module['titulo'],
                                'lessons' => $lessonTitles,
                            ];
                        }
                    }

                    $emailData = [
                        'user_name' => $user['nome'] ?? $user['username'] ?? 'Empreendedora',
                        'course_title' => $course['titulo'],
                        'course_level' => $course['nivel'] ?? null,
                        'course_duration' => $course['duracao_estimado'] ?? null,
                        'course_slug' => $course['slug'] ?? (string)$course['id'],
                        'modules' => $modules,
                        'course_url' => Helper::buildCoursesUrl('/curso/' . ($course['slug'] ?? $course['id'])),
                    ];

                    $emailHtml = EmailTemplates::courseEnrollment($emailData);
                    Mailer::send($user['email'], '🎓 Inscrição confirmada no curso ' . $course['titulo'], $emailHtml, ['isHtml' => true]);
                } catch (Exception $mailError) {
                    Helper::logError('Course enrollment email error: ' . $mailError->getMessage(), [
                        'course' => $course['id'],
                        'user' => $user['id'],
                    ]);
                }
            }

            echo Helper::jsonResponse(true, 'Inscrição realizada com sucesso', [
                'enrollment' => $enrollment
            ], 201);
        } catch (Exception $e) {
            Helper::logError('Enroll course error: ' . $e->getMessage(), ['identifier' => $identifier]);
            echo Helper::jsonResponse(false, 'Erro ao realizar inscrição', [], 500);
        }
    }

    /**
     * Obter progresso da usuária no curso
     */
    public function getProgress($identifier): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'acesso_cursos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite acesso ao progresso dos cursos', [], 403);
                return;
            }

            $course = $this->courseService->getCourseByIdentifier($identifier);
            if (!$course || !$course['publicado']) {
                echo Helper::jsonResponse(false, 'Curso indisponível', [], 404);
                return;
            }

            $progress = $this->courseService->getProgress($user['id'], $course['id']);
            echo Helper::jsonResponse(true, '', ['progress' => $progress]);
        } catch (Exception $e) {
            Helper::logError('Get course progress error: ' . $e->getMessage(), ['identifier' => $identifier]);
            echo Helper::jsonResponse(false, 'Erro ao buscar progresso', [], 500);
        }
    }

    /**
     * Atualizar progresso de uma aula específica
     */
    public function updateLessonProgress($courseIdentifier, $lessonId): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'acesso_cursos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite marcar progresso em cursos', [], 403);
                return;
            }

            $course = $this->courseService->getCourseByIdentifier($courseIdentifier);
            if (!$course || !$course['publicado']) {
                echo Helper::jsonResponse(false, 'Curso indisponível', [], 404);
                return;
            }

            $enrollment = $this->courseService->getEnrollment($user['id'], $course['id']);
            if (!$enrollment) {
                echo Helper::jsonResponse(false, 'Inscreva-se no curso antes de marcar progresso', [], 403);
                return;
            }

            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            $watched = isset($payload['watched']) ? (bool)$payload['watched'] : true;
            $rating = isset($payload['rating']) ? (int)$payload['rating'] : null;
            $feedback = isset($payload['feedback']) ? Helper::sanitizeString($payload['feedback']) : null;

            if ($rating !== null) {
                $rating = max(1, min(5, $rating));
            }

            $updated = $this->courseService->updateLessonProgress(
                (int)$enrollment['id'],
                (int)$lessonId,
                $watched,
                $rating,
                $feedback
            );

            if (($enrollment['status'] ?? '') !== 'concluido' && ($updated['status'] ?? '') === 'concluido') {
                try {
                    $courseDetail = $this->courseService->getCourseDetail($courseIdentifier, $user['id']);
                    $emailData = [
                        'user_name' => $user['nome'] ?? $user['username'] ?? 'Empreendedora',
                        'course_title' => $course['titulo'],
                        'course_slug' => $course['slug'] ?? (string)$course['id'],
                        'completed_at' => $updated['concluido_em'] ?? date('Y-m-d H:i:s'),
                        'progress' => $updated['progresso'] ?? 100,
                        'course_url' => Helper::buildCoursesUrl('/curso/' . ($course['slug'] ?? $course['id'])),
                    ];

                    $emailHtml = EmailTemplates::courseCompletion($emailData);
                    Mailer::send($user['email'], '🏅 Certificado conquistado em ' . $course['titulo'], $emailHtml, ['isHtml' => true]);
                } catch (Exception $mailError) {
                    Helper::logError('Course completion email error: ' . $mailError->getMessage(), [
                        'course' => $course['id'],
                        'user' => $user['id'],
                    ]);
                }
            }

            echo Helper::jsonResponse(true, 'Progresso atualizado', [
                'enrollment' => $updated
            ]);
        } catch (Exception $e) {
            Helper::logError('Update lesson progress error: ' . $e->getMessage(), [
                'course' => $courseIdentifier,
                'lesson' => $lessonId
            ]);
            echo Helper::jsonResponse(false, 'Erro ao atualizar progresso', [], 500);
        }
    }
}
