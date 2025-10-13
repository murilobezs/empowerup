<?php
/**
 * Controlador principal do painel administrativo
 */

class AdminController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Garantir autenticação administrativa antes de qualquer ação
     */
    private function requireAdmin() {
        return AdminAuthMiddleware::required();
    }

    /**
     * Executa uma consulta que retorna um único valor numérico ou string
     */
    private function fetchValue(string $sql, array $params = [], $default = 0) {
        $row = $this->db->fetch($sql, $params);
        if (!$row) {
            return $default;
        }
        $value = array_values($row)[0] ?? null;
        if ($value === null) {
            return $default;
        }
        return is_numeric($value) ? $value + 0 : $value;
    }

    /**
     * Versão segura de fetchValue que captura exceções e retorna valor padrão
     */
    private function safeFetchValue(string $sql, array $params = [], $default = 0) {
        try {
            return $this->fetchValue($sql, $params, $default);
        } catch (Exception $e) {
            Helper::logError('AdminController safeFetchValue error: ' . $e->getMessage(), ['sql' => $sql]);
            return $default;
        }
    }

    /**
     * Converte linhas (dia, total) em mapa associativo
     */
    private function rowsToMap(array $rows): array {
        $map = [];
        foreach ($rows as $row) {
            $date = isset($row['dia']) ? substr($row['dia'], 0, 10) : null;
            if ($date) {
                $map[$date] = (int)($row['total'] ?? 0);
            }
        }
        return $map;
    }

    /**
     * Gera série temporal preenchendo datas ausentes
     */
    private function buildTrendFromMap(array $map, int $days = 14, string $labelFormat = 'd/m'): array {
        $trend = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            $trend[] = [
                'date' => $date,
                'label' => date($labelFormat, strtotime($date)),
                'value' => (int)($map[$date] ?? 0)
            ];
        }
        return $trend;
    }

    /**
     * Normaliza payload básico de usuário para respostas administrativas
     */
    private function normalizeUserRow(array $row): array {
        return [
            'id' => (int)$row['id'],
            'nome' => $row['nome'] ?? '',
            'username' => $row['username'] ?? '',
            'email' => $row['email'] ?? '',
            'telefone' => $row['telefone'] ?? null,
            'tipo' => $row['tipo'] ?? '',
            'verified' => (bool)($row['verified'] ?? false),
            'created_at' => $row['created_at'] ?? null,
            'updated_at' => $row['updated_at'] ?? null
        ];
    }

    /**
     * Normaliza payload de post para listagem administrativa
     */
    private function normalizePostRow(array $row): array {
        return [
            'id' => (int)$row['id'],
            'conteudo' => $row['conteudo'] ?? '',
            'categoria' => $row['categoria'] ?? 'Geral',
            'created_at' => $row['created_at'] ?? null,
            'autor' => [
                'id' => (int)($row['user_id'] ?? 0),
                'nome' => $row['autor_nome'] ?? '',
                'username' => $row['autor_username'] ?? ''
            ],
            'metricas' => [
                'likes' => (int)($row['likes'] ?? 0),
                'comentarios' => (int)($row['comentarios'] ?? 0),
                'compartilhamentos' => (int)($row['compartilhamentos'] ?? 0),
                'salvos' => (int)($row['salvos'] ?? 0)
            ],
            'is_promovido' => (bool)($row['is_promovido'] ?? false),
            'promocao_status' => $row['promocao_status'] ?? null
        ];
    }

    /**
     * Normaliza payload de grupo
     */
    private function normalizeGroupRow(array $row): array {
        return [
            'id' => (int)$row['id'],
            'nome' => $row['nome'] ?? '',
            'categoria' => $row['categoria'] ?? '',
            'descricao' => $row['descricao'] ?? '',
            'ativo' => (bool)($row['ativo'] ?? false),
            'membros' => (int)($row['membros'] ?? 0),
            'pendencias' => (int)($row['pendencias'] ?? 0),
            'ultima_atividade' => $row['ultima_atividade'] ?? null
        ];
    }

    /**
     * Normaliza payload de evento
     */
    private function normalizeEventRow(array $row): array {
        return [
            'id' => (int)$row['id'],
            'titulo' => $row['titulo'] ?? '',
            'tipo' => $row['tipo'] ?? 'workshop',
            'data_evento' => $row['data_evento'] ?? null,
            'data_fim' => $row['data_fim'] ?? null,
            'local' => $row['local'] ?? '',
            'eh_online' => (bool)($row['eh_online'] ?? false),
            'capacidade_maxima' => (int)($row['capacidade_maxima'] ?? 0),
            'inscricoes_confirmadas' => (int)($row['inscricoes_confirmadas'] ?? 0),
            'valor' => (float)($row['valor'] ?? 0),
            'eh_gratuito' => (bool)($row['eh_gratuito'] ?? false),
            'status' => $row['status'] ?? 'ativo',
            'criado_por' => (int)($row['criado_por'] ?? 0),
            'criado_em' => $row['created_at'] ?? null
        ];
    }

    /**
     * Painel principal com métricas e insights da plataforma
     */
    public function dashboard() {
        $this->requireAdmin();

        try {
            $totals = [
                'usuarios' => (int)$this->safeFetchValue('SELECT COUNT(*) AS total FROM usuarios'),
                'usuariosNovos30d' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM usuarios WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'),
                'posts' => (int)$this->safeFetchValue('SELECT COUNT(*) AS total FROM posts'),
                'postsNovos30d' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM posts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'),
                'grupos' => (int)$this->safeFetchValue('SELECT COUNT(*) AS total FROM grupos'),
                'eventosAtivos' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM eventos WHERE status = "ativo"'),
                'comentarios' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM post_comentarios'),
                'likes' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM post_likes')
            ];

            $engagement30d = [
                'likes' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM post_likes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'),
                'comentarios' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM post_comentarios WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'),
                'compartilhamentos' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM post_compartilhamentos WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'),
            ];

            $growth = [
                'taxaCrescimentoUsuarios' => $totals['usuarios'] > 0 ? round(($totals['usuariosNovos30d'] / max($totals['usuarios'] - $totals['usuariosNovos30d'], 1)) * 100, 2) : 0,
                'taxaCrescimentoPosts' => $totals['posts'] > 0 ? round(($totals['postsNovos30d'] / max($totals['posts'] - $totals['postsNovos30d'], 1)) * 100, 2) : 0,
                'engajamento30d' => $engagement30d,
                'inscricoesEventos30d' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM evento_inscricoes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)')
            ];

            $userTrendRows = $this->db->fetchAll('SELECT DATE(created_at) as dia, COUNT(*) as total FROM usuarios WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) GROUP BY DATE(created_at) ORDER BY dia');
            $postTrendRows = $this->db->fetchAll('SELECT DATE(created_at) as dia, COUNT(*) as total FROM posts WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) GROUP BY DATE(created_at) ORDER BY dia');
            $likesTrendRows = $this->db->fetchAll('SELECT DATE(created_at) as dia, COUNT(*) as total FROM post_likes WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) GROUP BY DATE(created_at) ORDER BY dia');
            $commentsTrendRows = $this->db->fetchAll('SELECT DATE(created_at) as dia, COUNT(*) as total FROM post_comentarios WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) GROUP BY DATE(created_at) ORDER BY dia');

            $engagementMap = $this->rowsToMap($likesTrendRows);
            foreach ($this->rowsToMap($commentsTrendRows) as $day => $value) {
                $engagementMap[$day] = ($engagementMap[$day] ?? 0) + $value;
            }

            $trends = [
                'usuarios' => $this->buildTrendFromMap($this->rowsToMap($userTrendRows)),
                'posts' => $this->buildTrendFromMap($this->rowsToMap($postTrendRows)),
                'engajamento' => $this->buildTrendFromMap($engagementMap)
            ];

            $topCreators = $this->db->fetchAll('
                SELECT u.id, u.nome, u.username,
                       COUNT(p.id) as total_posts,
                       COALESCE(SUM(pl.likes_count), 0) as total_likes,
                       COALESCE(SUM(pc.comments_count), 0) as total_comments
                FROM usuarios u
                LEFT JOIN posts p ON p.user_id = u.id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as likes_count FROM post_likes GROUP BY post_id
                ) pl ON pl.post_id = p.id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as comments_count FROM post_comentarios GROUP BY post_id
                ) pc ON pc.post_id = p.id
                GROUP BY u.id
                ORDER BY total_posts DESC, total_likes DESC
                LIMIT 5
            ');

            $topCreators = array_map(function ($row) {
                return [
                    'id' => (int)$row['id'],
                    'nome' => $row['nome'] ?? '',
                    'username' => $row['username'] ?? '',
                    'posts' => (int)($row['total_posts'] ?? 0),
                    'likes' => (int)($row['total_likes'] ?? 0),
                    'comentarios' => (int)($row['total_comments'] ?? 0)
                ];
            }, $topCreators);

            $topPosts = $this->db->fetchAll('
                SELECT p.id, p.conteudo, p.categoria, p.created_at,
                       u.id as user_id, u.nome as autor_nome, u.username as autor_username,
                       COALESCE(l.likes, 0) as likes,
                       COALESCE(c.comments, 0) as comentarios,
                       COALESCE(s.salvos, 0) as salvos,
                       COALESCE(sh.compartilhamentos, 0) as compartilhamentos,
                       p.is_promovido, p.promocao_status
                FROM posts p
                INNER JOIN usuarios u ON u.id = p.user_id
                LEFT JOIN (SELECT post_id, COUNT(*) as likes FROM post_likes GROUP BY post_id) l ON l.post_id = p.id
                LEFT JOIN (SELECT post_id, COUNT(*) as comments FROM post_comentarios GROUP BY post_id) c ON c.post_id = p.id
                LEFT JOIN (SELECT post_id, COUNT(*) as salvos FROM post_saves GROUP BY post_id) s ON s.post_id = p.id
                LEFT JOIN (SELECT post_id, COUNT(*) as compartilhamentos FROM post_compartilhamentos GROUP BY post_id) sh ON sh.post_id = p.id
                ORDER BY likes DESC, comentarios DESC
                LIMIT 6
            ');

            $topPosts = array_map(fn($row) => $this->normalizePostRow($row), $topPosts);

            // Conteúdo por categoria
            $categoriaRows = $this->db->fetchAll('SELECT categoria, COUNT(*) as total FROM posts GROUP BY categoria ORDER BY total DESC');
            $contentMix = array_map(function ($row) use ($totals) {
                $count = (int)($row['total'] ?? 0);
                return [
                    'categoria' => $row['categoria'] ?? 'Geral',
                    'total' => $count,
                    'percentual' => $totals['posts'] > 0 ? round(($count / $totals['posts']) * 100, 1) : 0
                ];
            }, $categoriaRows);

            // Atividade recente (usuários, posts, eventos)
            $recentUsers = $this->db->fetchAll('SELECT id, nome, created_at FROM usuarios ORDER BY created_at DESC LIMIT 6');
            $recentPosts = $this->db->fetchAll('SELECT p.id, p.conteudo, p.created_at, u.nome as autor FROM posts p INNER JOIN usuarios u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 6');
            $recentEvents = $this->db->fetchAll('SELECT id, titulo, data_evento as created_at, tipo FROM eventos ORDER BY created_at DESC LIMIT 6');

            $recentActivity = [];
            foreach ($recentUsers as $user) {
                $recentActivity[] = [
                    'tipo' => 'usuario',
                    'titulo' => $user['nome'] ?? 'Novo usuário',
                    'descricao' => 'Novo cadastro na plataforma',
                    'referencia' => (int)$user['id'],
                    'timestamp' => $user['created_at'] ?? null
                ];
            }
            foreach ($recentPosts as $post) {
                $recentActivity[] = [
                    'tipo' => 'post',
                    'titulo' => $post['autor'] ?? 'Novo post',
                    'descricao' => mb_strimwidth($post['conteudo'] ?? '', 0, 90, '...'),
                    'referencia' => (int)$post['id'],
                    'timestamp' => $post['created_at'] ?? null
                ];
            }
            foreach ($recentEvents as $event) {
                $recentActivity[] = [
                    'tipo' => 'evento',
                    'titulo' => $event['titulo'] ?? 'Evento atualizado',
                    'descricao' => 'Evento ' . ($event['tipo'] ?? ''),
                    'referencia' => (int)$event['id'],
                    'timestamp' => $event['created_at'] ?? null
                ];
            }

            usort($recentActivity, function ($a, $b) {
                return strtotime($b['timestamp'] ?? 'now') <=> strtotime($a['timestamp'] ?? 'now');
            });

            $recentActivity = array_slice($recentActivity, 0, 12);

            // Saúde da plataforma
            $pendingRequests = $this->safeFetchValue('SELECT COUNT(*) FROM grupo_solicitacoes WHERE status = "pendente"', [], 0);
            $pendingReports = $this->safeFetchValue('SELECT COUNT(*) FROM notifications WHERE type = "report" AND status = "pending"', [], 0);

            $systemHealth = [
                'filaSolicitacoesGrupo' => (int)$pendingRequests,
                'relatoriosPendentes' => (int)$pendingReports,
                'emailQueue' => 0,
                'status' => $pendingRequests > 50 || $pendingReports > 20 ? 'atenção' : 'operacional'
            ];

            echo Helper::jsonResponse(true, '', [
                'totals' => $totals,
                'growth' => $growth,
                'trends' => $trends,
                'topCreators' => $topCreators,
                'topPosts' => $topPosts,
                'contentMix' => $contentMix,
                'recentActivity' => $recentActivity,
                'systemHealth' => $systemHealth
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin dashboard error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar dashboard administrativo', [], 500);
        }
    }

    /**
     * Listagem de usuários com analytics e filtros
     */
    public function listUsers() {
        $this->requireAdmin();

        try {
            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(100, max(5, (int)($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;
            $search = trim($_GET['search'] ?? '');
            $tipo = $_GET['tipo'] ?? null;
            $order = $_GET['order'] ?? 'recent';

            $conditions = [];
            $params = [];

            if ($search !== '') {
                $conditions[] = '(u.nome LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
                $like = '%' . $search . '%';
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
            }

            if ($tipo && in_array($tipo, ['empreendedora', 'cliente'], true)) {
                $conditions[] = 'u.tipo = ?';
                $params[] = $tipo;
            }

            $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);

            $orderBy = 'u.created_at DESC';
            if ($order === 'engagement') {
                $orderBy = 'metrics.total_posts DESC, metrics.total_likes DESC';
            }

            $query = '
                SELECT u.id, u.nome, u.username, u.email, u.telefone, u.tipo, u.verified, u.created_at, u.updated_at,
                       COALESCE(metrics.total_posts, 0) as total_posts,
                       COALESCE(metrics.total_likes, 0) as total_likes,
                       COALESCE(metrics.total_comments, 0) as total_comments
                FROM usuarios u
                LEFT JOIN (
                    SELECT p.user_id,
                           COUNT(p.id) as total_posts,
                           COALESCE(SUM(l.likes_count), 0) as total_likes,
                           COALESCE(SUM(c.comments_count), 0) as total_comments
                    FROM posts p
                    LEFT JOIN (SELECT post_id, COUNT(*) as likes_count FROM post_likes GROUP BY post_id) l ON l.post_id = p.id
                    LEFT JOIN (SELECT post_id, COUNT(*) as comments_count FROM post_comentarios GROUP BY post_id) c ON c.post_id = p.id
                    GROUP BY p.user_id
                ) metrics ON metrics.user_id = u.id
                ' . $where . '
                ORDER BY ' . $orderBy . '
                LIMIT ? OFFSET ?
            ';

            $users = $this->db->fetchAll($query, array_merge($params, [$limit, $offset]));

            $countRow = $this->db->fetch('SELECT COUNT(*) as total FROM usuarios u ' . $where, $params);
            $total = (int)($countRow['total'] ?? 0);

            $byType = $this->db->fetchAll('SELECT tipo, COUNT(*) as total FROM usuarios GROUP BY tipo');
            $verified = $this->db->fetchAll('SELECT verified, COUNT(*) as total FROM usuarios GROUP BY verified');

            $analytics = [
                'total' => $total,
                'porTipo' => array_reduce($byType, function ($carry, $item) {
                    $carry[$item['tipo'] ?? 'indefinido'] = (int)($item['total'] ?? 0);
                    return $carry;
                }, []),
                'verificados' => array_reduce($verified, function ($carry, $item) {
                    $key = ((int)($item['verified'] ?? 0)) === 1 ? 'sim' : 'nao';
                    $carry[$key] = (int)($item['total'] ?? 0);
                    return $carry;
                }, [
                    'sim' => 0,
                    'nao' => 0
                ])
            ];

            $items = array_map(function ($row) {
                $user = $this->normalizeUserRow($row);
                $user['metricas'] = [
                    'posts' => (int)($row['total_posts'] ?? 0),
                    'likes' => (int)($row['total_likes'] ?? 0),
                    'comentarios' => (int)($row['total_comments'] ?? 0)
                ];
                return $user;
            }, $users);

            echo Helper::jsonResponse(true, '', [
                'users' => $items,
                'analytics' => $analytics,
                'pagination' => [
                    'currentPage' => $page,
                    'perPage' => $limit,
                    'total' => $total,
                    'totalPages' => $limit ? (int)ceil($total / $limit) : 1,
                    'hasNextPage' => ($offset + count($items)) < $total,
                    'hasPrevPage' => $page > 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin listUsers error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar usuários', [], 500);
        }
    }

    /**
     * Atualizar dados do usuário via painel admin
     */
    public function updateUser($id) {
        $this->requireAdmin();

        try {
            $userId = (int)$id;
            if ($userId <= 0) {
                echo Helper::jsonResponse(false, 'Usuário inválido', [], 400);
                return;
            }

            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty($payload)) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }

            $allowedTypes = ['empreendedora', 'cliente'];
            if (isset($payload['tipo']) && !in_array($payload['tipo'], $allowedTypes, true)) {
                echo Helper::jsonResponse(false, 'Tipo de usuário inválido', [], 400);
                return;
            }

            $updates = [];
            $params = [];

            if (isset($payload['nome'])) {
                $updates[] = 'nome = ?';
                $params[] = Helper::sanitizeString($payload['nome']);
            }

            if (isset($payload['email'])) {
                $email = Helper::sanitizeString($payload['email']);
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    echo Helper::jsonResponse(false, 'Email inválido', [], 400);
                    return;
                }
                // Garantir unicidade
                $existing = $this->db->fetch('SELECT id FROM usuarios WHERE email = ? AND id != ?', [$email, $userId]);
                if ($existing) {
                    echo Helper::jsonResponse(false, 'Email já em uso por outro usuário', [], 400);
                    return;
                }
                $updates[] = 'email = ?';
                $params[] = $email;
            }

            if (isset($payload['telefone'])) {
                $updates[] = 'telefone = ?';
                $params[] = Helper::sanitizeString($payload['telefone']);
            }

            if (isset($payload['bio'])) {
                $updates[] = 'bio = ?';
                $params[] = Helper::sanitizeString($payload['bio']);
            }

            if (isset($payload['tipo'])) {
                $updates[] = 'tipo = ?';
                $params[] = $payload['tipo'];
            }

            if (isset($payload['verified'])) {
                $updates[] = 'verified = ?';
                $params[] = $payload['verified'] ? 1 : 0;
            }

            if (empty($updates)) {
                echo Helper::jsonResponse(false, 'Nenhuma alteração informada', [], 400);
                return;
            }

            $updates[] = 'updated_at = NOW()';
            $params[] = $userId;

            $this->db->execute('UPDATE usuarios SET ' . implode(', ', $updates) . ' WHERE id = ?', $params);

            $updated = $this->db->fetch('SELECT id, nome, username, email, telefone, tipo, verified, created_at, updated_at FROM usuarios WHERE id = ?', [$userId]);
            if (!$updated) {
                echo Helper::jsonResponse(false, 'Usuário não encontrado após atualização', [], 404);
                return;
            }

            echo Helper::jsonResponse(true, 'Usuário atualizado com sucesso', [
                'user' => $this->normalizeUserRow($updated)
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin updateUser error: ' . $e->getMessage(), ['user_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao atualizar usuário', [], 500);
        }
    }

    /**
     * Listagem de posts para moderação administrativa
     */
    public function listPosts() {
        $this->requireAdmin();

        try {
            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(100, max(5, (int)($_GET['limit'] ?? 15)));
            $offset = ($page - 1) * $limit;
            $search = trim($_GET['search'] ?? '');
            $categoria = trim($_GET['categoria'] ?? '');
            $autorId = isset($_GET['autorId']) ? (int)$_GET['autorId'] : null;
            $status = $_GET['status'] ?? null; // promovido / normal

            $conditions = [];
            $params = [];

            if ($search !== '') {
                $conditions[] = '(p.conteudo LIKE ? OR u.nome LIKE ? OR u.username LIKE ?)';
                $like = '%' . $search . '%';
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
            }

            if ($categoria !== '') {
                $conditions[] = 'p.categoria = ?';
                $params[] = $categoria;
            }

            if ($autorId) {
                $conditions[] = 'p.user_id = ?';
                $params[] = $autorId;
            }

            if ($status === 'promovido') {
                $conditions[] = 'p.is_promovido = 1';
            } elseif ($status === 'orgânico') {
                $conditions[] = 'p.is_promovido = 0';
            }

            $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);

            $query = '
                SELECT p.id, p.user_id, p.conteudo, p.categoria, p.created_at, p.is_promovido, p.promocao_status,
                       u.nome as autor_nome, u.username as autor_username,
                       COALESCE(l.likes, 0) as likes,
                       COALESCE(c.comments, 0) as comentarios,
                       COALESCE(s.salvos, 0) as salvos,
                       COALESCE(sh.compartilhamentos, 0) as compartilhamentos
                FROM posts p
                INNER JOIN usuarios u ON u.id = p.user_id
                LEFT JOIN (SELECT post_id, COUNT(*) as likes FROM post_likes GROUP BY post_id) l ON l.post_id = p.id
                LEFT JOIN (SELECT post_id, COUNT(*) as comments FROM post_comentarios GROUP BY post_id) c ON c.post_id = p.id
                LEFT JOIN (SELECT post_id, COUNT(*) as salvos FROM post_saves GROUP BY post_id) s ON s.post_id = p.id
                LEFT JOIN (SELECT post_id, COUNT(*) as compartilhamentos FROM post_compartilhamentos GROUP BY post_id) sh ON sh.post_id = p.id
                ' . $where . '
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            ';

            $rows = $this->db->fetchAll($query, array_merge($params, [$limit, $offset]));

            $countRow = $this->db->fetch('SELECT COUNT(*) as total FROM posts p INNER JOIN usuarios u ON u.id = p.user_id ' . $where, $params);
            $total = (int)($countRow['total'] ?? 0);

            $categorias = $this->db->fetchAll('SELECT categoria, COUNT(*) as total FROM posts GROUP BY categoria ORDER BY total DESC');

            echo Helper::jsonResponse(true, '', [
                'posts' => array_map(fn($row) => $this->normalizePostRow($row), $rows),
                'analytics' => [
                    'total' => $total,
                    'promovidos' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM posts WHERE is_promovido = 1'),
                    'porCategoria' => array_map(function ($row) use ($total) {
                        $count = (int)($row['total'] ?? 0);
                        return [
                            'categoria' => $row['categoria'] ?? 'Geral',
                            'total' => $count,
                            'percentual' => $total > 0 ? round(($count / $total) * 100, 1) : 0
                        ];
                    }, $categorias)
                ],
                'pagination' => [
                    'currentPage' => $page,
                    'perPage' => $limit,
                    'total' => $total,
                    'totalPages' => $limit ? (int)ceil($total / $limit) : 1,
                    'hasNextPage' => ($offset + count($rows)) < $total,
                    'hasPrevPage' => $page > 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin listPosts error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar posts', [], 500);
        }
    }

    /**
     * Atualiza informações básicas de um post
     */
    public function updatePost($id) {
        $this->requireAdmin();

        try {
            $postId = (int)$id;
            if ($postId <= 0) {
                echo Helper::jsonResponse(false, 'Post inválido', [], 400);
                return;
            }

            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty($payload)) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }

            $updates = [];
            $params = [];

            if (isset($payload['conteudo'])) {
                $updates[] = 'conteudo = ?';
                $params[] = Helper::sanitizeString($payload['conteudo']);
            }

            if (isset($payload['categoria'])) {
                $updates[] = 'categoria = ?';
                $params[] = Helper::sanitizeString($payload['categoria']);
            }

            if (isset($payload['is_promovido'])) {
                $updates[] = 'is_promovido = ?';
                $params[] = $payload['is_promovido'] ? 1 : 0;
            }

            if (isset($payload['promocao_status'])) {
                $updates[] = 'promocao_status = ?';
                $params[] = Helper::sanitizeString($payload['promocao_status']);
            }

            if (empty($updates)) {
                echo Helper::jsonResponse(false, 'Nenhuma alteração informada', [], 400);
                return;
            }

            $updates[] = 'updated_at = NOW()';
            $params[] = $postId;

            $this->db->execute('UPDATE posts SET ' . implode(', ', $updates) . ' WHERE id = ?', $params);

            $updated = $this->db->fetch('
                SELECT p.id, p.user_id, p.conteudo, p.categoria, p.created_at, p.is_promovido, p.promocao_status,
                       u.nome as autor_nome, u.username as autor_username
                FROM posts p
                INNER JOIN usuarios u ON u.id = p.user_id
                WHERE p.id = ?
            ', [$postId]);

            if (!$updated) {
                echo Helper::jsonResponse(false, 'Post não encontrado após atualização', [], 404);
                return;
            }

            echo Helper::jsonResponse(true, 'Post atualizado com sucesso', [
                'post' => $this->normalizePostRow($updated)
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin updatePost error: ' . $e->getMessage(), ['post_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao atualizar post', [], 500);
        }
    }

    /**
     * Remove um post e suas dependências
     */
    public function deletePost($id) {
        $this->requireAdmin();

        $postId = (int)$id;
        if ($postId <= 0) {
            echo Helper::jsonResponse(false, 'Post inválido', [], 400);
            return;
        }

        try {
            $this->db->beginTransaction();

            $exists = $this->db->fetch('SELECT id FROM posts WHERE id = ?', [$postId]);
            if (!$exists) {
                $this->db->rollback();
                echo Helper::jsonResponse(false, 'Post não encontrado', [], 404);
                return;
            }

            $tables = [
                'post_likes',
                'post_comentarios',
                'post_compartilhamentos',
                'post_saves',
                'post_media'
            ];
            foreach ($tables as $table) {
                $this->db->execute("DELETE FROM {$table} WHERE post_id = ?", [$postId]);
            }

            $this->db->execute('DELETE FROM posts WHERE id = ?', [$postId]);

            $this->db->commit();

            echo Helper::jsonResponse(true, 'Post removido com sucesso');
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            Helper::logError('Admin deletePost error: ' . $e->getMessage(), ['post_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao remover post', [], 500);
        }
    }

    /**
     * Lista grupos da comunidade com estatísticas
     */
    public function listGroups() {
        $this->requireAdmin();

        try {
            $limit = min(100, max(5, (int)($_GET['limit'] ?? 20)));
            $page = max(1, (int)($_GET['page'] ?? 1));
            $offset = ($page - 1) * $limit;
            $search = trim($_GET['search'] ?? '');

            $conditions = [];
            $params = [];
            if ($search !== '') {
                $conditions[] = '(g.nome LIKE ? OR g.categoria LIKE ? OR g.descricao LIKE ?)';
                $like = '%' . $search . '%';
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
            }

            $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);

            $rows = $this->db->fetchAll('
                SELECT g.id, g.nome, g.descricao, g.categoria, g.ativo, g.ultima_atividade,
                       COALESCE(m.total_membros, 0) as membros,
                       COALESCE(s.pendencias, 0) as pendencias
                FROM grupos g
                LEFT JOIN (
                    SELECT grupo_id, COUNT(*) as total_membros
                    FROM grupo_membros
                    WHERE status = "ativo"
                    GROUP BY grupo_id
                ) m ON m.grupo_id = g.id
                LEFT JOIN (
                    SELECT grupo_id, COUNT(*) as pendencias
                    FROM grupo_solicitacoes
                    WHERE status = "pendente"
                    GROUP BY grupo_id
                ) s ON s.grupo_id = g.id
                ' . $where . '
                ORDER BY g.ultima_atividade DESC
                LIMIT ? OFFSET ?
            ', array_merge($params, [$limit, $offset]));

            $totalRow = $this->db->fetch('SELECT COUNT(*) as total FROM grupos g ' . $where, $params);
            $total = (int)($totalRow['total'] ?? 0);

            echo Helper::jsonResponse(true, '', [
                'grupos' => array_map(fn($row) => $this->normalizeGroupRow($row), $rows),
                'analytics' => [
                    'total' => $total,
                    'ativos' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM grupos WHERE ativo = 1'),
                    'pendencias' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM grupo_solicitacoes WHERE status = "pendente"')
                ],
                'pagination' => [
                    'currentPage' => $page,
                    'perPage' => $limit,
                    'total' => $total,
                    'totalPages' => $limit ? (int)ceil($total / $limit) : 1,
                    'hasNextPage' => ($offset + count($rows)) < $total,
                    'hasPrevPage' => $page > 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin listGroups error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar grupos', [], 500);
        }
    }

    /**
     * Lista eventos com estatísticas
     */
    public function listEvents() {
        $this->requireAdmin();

        try {
            $limit = min(100, max(5, (int)($_GET['limit'] ?? 20)));
            $page = max(1, (int)($_GET['page'] ?? 1));
            $offset = ($page - 1) * $limit;
            $status = $_GET['status'] ?? null;

            $conditions = [];
            $params = [];
            if ($status && in_array($status, ['ativo', 'finalizado', 'cancelado'], true)) {
                $conditions[] = 'e.status = ?';
                $params[] = $status;
            }

            $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);

            $rows = $this->db->fetchAll('
                SELECT e.*, COALESCE(i.total_inscricoes, 0) as inscricoes_confirmadas
                FROM eventos e
                LEFT JOIN (
                    SELECT evento_id, COUNT(*) as total_inscricoes
                    FROM evento_inscricoes
                    WHERE status = "confirmada"
                    GROUP BY evento_id
                ) i ON i.evento_id = e.id
                ' . $where . '
                ORDER BY e.data_evento DESC
                LIMIT ? OFFSET ?
            ', array_merge($params, [$limit, $offset]));

            $totalRow = $this->db->fetch('SELECT COUNT(*) as total FROM eventos e ' . $where, $params);
            $total = (int)($totalRow['total'] ?? 0);

            echo Helper::jsonResponse(true, '', [
                'eventos' => array_map(fn($row) => $this->normalizeEventRow($row), $rows),
                'analytics' => [
                    'total' => $total,
                    'gratuitos' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM eventos WHERE eh_gratuito = 1'),
                    'online' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM eventos WHERE eh_online = 1'),
                    'participantes30d' => (int)$this->safeFetchValue('SELECT COUNT(*) FROM evento_inscricoes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)')
                ],
                'pagination' => [
                    'currentPage' => $page,
                    'perPage' => $limit,
                    'total' => $total,
                    'totalPages' => $limit ? (int)ceil($total / $limit) : 1,
                    'hasNextPage' => ($offset + count($rows)) < $total,
                    'hasPrevPage' => $page > 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin listEvents error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar eventos', [], 500);
        }
    }

    /**
     * Valida e sanitiza payload de eventos para criação/edição
     */
    private function sanitizeEventPayload(array $data): array {
        $validator = new Validator($data);
        $validator
            ->required('titulo', 'Título é obrigatório')
            ->required('tipo', 'Tipo é obrigatório')
            ->required('data_evento', 'Data do evento é obrigatória')
            ->max('titulo', 255, 'Título deve ter no máximo 255 caracteres')
            ->in('tipo', ['workshop', 'palestra', 'curso', 'meetup', 'networking'], 'Tipo de evento inválido');

        if ($validator->hasErrors()) {
            return ['errors' => $validator->getErrors()];
        }

        $sanitized = [
            'titulo' => Helper::sanitizeString($data['titulo']),
            'descricao' => Helper::sanitizeString($data['descricao'] ?? ''),
            'tipo' => $data['tipo'],
            'data_evento' => $data['data_evento'],
            'data_fim' => $data['data_fim'] ?? null,
            'local' => Helper::sanitizeString($data['local'] ?? ''),
            'endereco' => Helper::sanitizeString($data['endereco'] ?? ''),
            'capacidade_maxima' => intval($data['capacidade_maxima'] ?? 50),
            'valor' => floatval($data['valor'] ?? 0),
            'eh_gratuito' => (bool)($data['eh_gratuito'] ?? true),
            'instrutor_nome' => Helper::sanitizeString($data['instrutor_nome'] ?? ''),
            'instrutor_bio' => Helper::sanitizeString($data['instrutor_bio'] ?? ''),
            'instrutor_foto' => Helper::sanitizeString($data['instrutor_foto'] ?? ''),
            'requisitos' => Helper::sanitizeString($data['requisitos'] ?? ''),
            'material_necessario' => Helper::sanitizeString($data['material_necessario'] ?? ''),
            'certificado' => (bool)($data['certificado'] ?? false),
            'imagem_url' => Helper::sanitizeString($data['imagem_url'] ?? ''),
            'link_online' => Helper::sanitizeString($data['link_online'] ?? ''),
            'eh_online' => (bool)($data['eh_online'] ?? false)
        ];

        return ['data' => $sanitized];
    }

    /**
     * Determina o usuário responsável por eventos criados via painel admin
     */
    private function resolveEventCreatorId(?int $preferredId = null): ?int {
        $candidates = [];

        if ($preferredId !== null && $preferredId > 0) {
            $candidates[] = $preferredId;
        }

        if (defined('ADMIN_EVENT_CREATOR_ID')) {
            $defaultId = (int)ADMIN_EVENT_CREATOR_ID;
            if ($defaultId > 0) {
                $candidates[] = $defaultId;
            }
        }

        $candidates = array_values(array_filter(array_unique($candidates)));

        foreach ($candidates as $candidateId) {
            if ($this->userExists($candidateId)) {
                return $candidateId;
            }
        }

        if (defined('ADMIN_EVENT_CREATOR_EMAIL')) {
            $normalizedEmail = trim((string)ADMIN_EVENT_CREATOR_EMAIL);
            if ($normalizedEmail !== '') {
                $existing = $this->db->fetch('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [$normalizedEmail]);
                if ($existing && isset($existing['id'])) {
                    return (int)$existing['id'];
                }
            }
        }

        $placeholderId = $this->ensureAdminEventCreatorUser();
        if ($placeholderId !== null) {
            return $placeholderId;
        }

        $firstUser = $this->db->fetch('SELECT id FROM usuarios ORDER BY id ASC LIMIT 1');
        if ($firstUser && isset($firstUser['id'])) {
            return (int)$firstUser['id'];
        }

        return null;
    }

    private function userExists(int $userId): bool {
        if ($userId <= 0) {
            return false;
        }

        $row = $this->db->fetch('SELECT id FROM usuarios WHERE id = ? LIMIT 1', [$userId]);
        return $row && isset($row['id']);
    }

    private function ensureAdminEventCreatorUser(): ?int {
        $email = defined('ADMIN_EVENT_CREATOR_EMAIL') ? trim((string)ADMIN_EVENT_CREATOR_EMAIL) : '';

        if ($email === '' || !Helper::validateEmail($email)) {
            return null;
        }

        try {
            $existing = $this->db->fetch('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [$email]);
            if ($existing && isset($existing['id'])) {
                return (int)$existing['id'];
            }

            $usernameBase = defined('ADMIN_EVENT_CREATOR_USERNAME') ? trim((string)ADMIN_EVENT_CREATOR_USERNAME) : '';
            if ($usernameBase === '') {
                $usernameBase = strtok($email, '@') ?: 'empowerup_eventos';
            }

            $usernameSlug = strtolower(preg_replace('/[^a-z0-9_.]/i', '', $usernameBase));
            if ($usernameSlug === '' || strlen($usernameSlug) < 3) {
                $usernameSlug = 'empowerup_eventos';
            }

            $candidateUsername = $usernameSlug;
            $suffix = 1;
            while ($this->db->fetch('SELECT id FROM usuarios WHERE username = ? LIMIT 1', [$candidateUsername])) {
                $candidateUsername = $usernameSlug . $suffix;
                $suffix++;
            }

            $name = defined('ADMIN_EVENT_CREATOR_NAME') ? trim((string)ADMIN_EVENT_CREATOR_NAME) : 'Equipe EmpowerUp';
            if ($name === '') {
                $name = 'Equipe EmpowerUp';
            }

            $allowedTypes = ['empreendedora', 'cliente'];
            $type = defined('ADMIN_EVENT_CREATOR_TYPE') ? strtolower(trim((string)ADMIN_EVENT_CREATOR_TYPE)) : 'cliente';
            if (!in_array($type, $allowedTypes, true)) {
                $type = 'cliente';
            }

            $bio = 'Perfil interno utilizado para eventos criados pelo painel administrativo.';
            $hashedPassword = Helper::hashPassword(bin2hex(random_bytes(24)));

            $userId = $this->db->insert(
                'INSERT INTO usuarios (nome, username, email, senha, telefone, bio, tipo, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    Helper::sanitizeString($name),
                    $candidateUsername,
                    $email,
                    $hashedPassword,
                    null,
                    Helper::sanitizeString($bio),
                    $type,
                    '/placeholder.svg?height=40&width=40'
                ]
            );

            Helper::logError('Admin event creator placeholder user criado automaticamente', ['user_id' => $userId, 'email' => $email]);

            return (int)$userId;
        } catch (Exception $e) {
            Helper::logError('Erro ao garantir usuário padrão para eventos admin: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Cria um novo evento
     */
    public function createEvent() {
        $this->requireAdmin();

        try {
            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            $requestedCreatorId = isset($payload['criado_por']) ? (int)$payload['criado_por'] : null;
            $result = $this->sanitizeEventPayload($payload);

            if (isset($result['errors'])) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $result['errors']], 400);
                return;
            }

            $data = $result['data'];
            $creatorId = $this->resolveEventCreatorId($requestedCreatorId);

            if (!$creatorId) {
                Helper::logError('Admin createEvent error: Nenhum usuário válido encontrado para atribuir como criador do evento');
                echo Helper::jsonResponse(false, 'Nenhum usuário disponível para vincular como criador do evento.', [], 500);
                return;
            }

            $eventId = $this->db->insert('
                INSERT INTO eventos (
                    titulo, descricao, tipo, data_evento, data_fim, local, endereco,
                    capacidade_maxima, valor, eh_gratuito, instrutor_nome, instrutor_bio,
                    instrutor_foto, requisitos, material_necessario, certificado,
                    imagem_url, link_online, eh_online, status, criado_por
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ', [
                $data['titulo'],
                $data['descricao'],
                $data['tipo'],
                $data['data_evento'],
                $data['data_fim'],
                $data['local'],
                $data['endereco'],
                $data['capacidade_maxima'],
                $data['valor'],
                $data['eh_gratuito'] ? 1 : 0,
                $data['instrutor_nome'],
                $data['instrutor_bio'],
                $data['instrutor_foto'],
                $data['requisitos'],
                $data['material_necessario'],
                $data['certificado'] ? 1 : 0,
                $data['imagem_url'],
                $data['link_online'],
                $data['eh_online'] ? 1 : 0,
                'ativo',
                $creatorId
            ]);

            $event = $this->db->fetch('SELECT * FROM eventos WHERE id = ?', [$eventId]);

            echo Helper::jsonResponse(true, 'Evento criado com sucesso', [
                'event' => $this->normalizeEventRow($event)
            ], 201);
        } catch (Exception $e) {
            Helper::logError('Admin createEvent error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao criar evento', [], 500);
        }
    }

    /**
     * Atualiza dados de um evento existente
     */
    public function updateEvent($id) {
        $this->requireAdmin();

        try {
            $eventId = (int)$id;
            if ($eventId <= 0) {
                echo Helper::jsonResponse(false, 'Evento inválido', [], 400);
                return;
            }

            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty($payload)) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }

            $result = $this->sanitizeEventPayload(array_merge($payload, ['titulo' => $payload['titulo'] ?? 'Evento']));
            if (isset($result['errors'])) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $result['errors']], 400);
                return;
            }

            $data = $result['data'];
            $updates = [];
            $params = [];

            foreach ($data as $column => $value) {
                $updates[] = $column . ' = ?';
                $params[] = $value;
            }

            if (isset($payload['status']) && in_array($payload['status'], ['ativo', 'finalizado', 'cancelado'], true)) {
                $updates[] = 'status = ?';
                $params[] = $payload['status'];
            }

            if (empty($updates)) {
                echo Helper::jsonResponse(false, 'Nenhuma alteração informada', [], 400);
                return;
            }

            $updates[] = 'updated_at = NOW()';
            $params[] = $eventId;

            $this->db->execute('UPDATE eventos SET ' . implode(', ', $updates) . ' WHERE id = ?', $params);

            $event = $this->db->fetch('SELECT * FROM eventos WHERE id = ?', [$eventId]);
            if (!$event) {
                echo Helper::jsonResponse(false, 'Evento não encontrado', [], 404);
                return;
            }

            echo Helper::jsonResponse(true, 'Evento atualizado com sucesso', [
                'event' => $this->normalizeEventRow($event)
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin updateEvent error: ' . $e->getMessage(), ['event_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao atualizar evento', [], 500);
        }
    }

    /**
     * Remove um evento
     */
    public function deleteEvent($id) {
        $this->requireAdmin();

        $eventId = (int)$id;
        if ($eventId <= 0) {
            echo Helper::jsonResponse(false, 'Evento inválido', [], 400);
            return;
        }

        try {
            $this->db->beginTransaction();

            $exists = $this->db->fetch('SELECT id FROM eventos WHERE id = ?', [$eventId]);
            if (!$exists) {
                $this->db->rollback();
                echo Helper::jsonResponse(false, 'Evento não encontrado', [], 404);
                return;
            }

            $this->db->execute('DELETE FROM evento_inscricoes WHERE evento_id = ?', [$eventId]);
            $this->db->execute('DELETE FROM eventos WHERE id = ?', [$eventId]);

            $this->db->commit();

            echo Helper::jsonResponse(true, 'Evento removido com sucesso');
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            Helper::logError('Admin deleteEvent error: ' . $e->getMessage(), ['event_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao remover evento', [], 500);
        }
    }

    /**
     * Lista inscrições de um evento
     */
    public function listEventSubscriptions($id) {
        $this->requireAdmin();

        try {
            $eventId = (int)$id;
            if ($eventId <= 0) {
                echo Helper::jsonResponse(false, 'Evento inválido', [], 400);
                return;
            }

            $subscriptions = $this->db->fetchAll('
                SELECT es.*, u.nome, u.email, u.telefone
                FROM evento_inscricoes es
                LEFT JOIN usuarios u ON u.id = es.user_id
                WHERE es.evento_id = ?
                ORDER BY es.created_at DESC
            ', [$eventId]);

            echo Helper::jsonResponse(true, '', [
                'inscricoes' => array_map(function ($sub) {
                    return [
                        'id' => (int)$sub['id'],
                        'nome' => $sub['nome'] ?? $sub['nome_completo'] ?? '',
                        'email' => $sub['email'] ?? null,
                        'telefone' => $sub['telefone'] ?? null,
                        'status' => $sub['status'] ?? 'pendente',
                        'created_at' => $sub['created_at'] ?? null
                    ];
                }, $subscriptions)
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin listEventSubscriptions error: ' . $e->getMessage(), ['event_id' => $id]);
            echo Helper::jsonResponse(false, 'Erro ao carregar inscrições', [], 500);
        }
    }

    /**
     * Dados financeiros e de monetização (assinaturas, cursos, campanhas)
     */
    public function monetization() {
        $this->requireAdmin();

        try {
            $ativos = (int)$this->safeFetchValue('SELECT COUNT(*) FROM user_subscriptions WHERE status = "ativa" AND expires_at >= NOW()');
            $receita30d = (float)$this->safeFetchValue('SELECT COALESCE(SUM(valor), 0) FROM subscription_transactions WHERE status = "pago" AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)', [], 0.0);
            $receitaTotal = (float)$this->safeFetchValue('SELECT COALESCE(SUM(valor), 0) FROM subscription_transactions WHERE status = "pago"', [], 0.0);

            $topPlanos = $this->db->fetchAll('
                SELECT sp.nome, sp.slug, COUNT(us.id) as assinaturas
                FROM subscription_plans sp
                LEFT JOIN user_subscriptions us ON us.plan_id = sp.id AND us.status = "ativa"
                GROUP BY sp.id
                ORDER BY assinaturas DESC
                LIMIT 5
            ');

            $cursos = $this->safeFetchValue('SELECT COUNT(*) FROM courses', [], 0);
            $matriculas = $this->safeFetchValue('SELECT COUNT(*) FROM course_enrollments', [], 0);
            $campanhasAtivas = $this->safeFetchValue('SELECT COUNT(*) FROM ad_campaigns WHERE status = "ativo"', [], 0);

            echo Helper::jsonResponse(true, '', [
                'assinaturasAtivas' => $ativos,
                'receita30d' => round($receita30d, 2),
                'receitaTotal' => round($receitaTotal, 2),
                'topPlanos' => array_map(function ($row) {
                    return [
                        'nome' => $row['nome'] ?? '',
                        'slug' => $row['slug'] ?? '',
                        'assinaturas' => (int)($row['assinaturas'] ?? 0)
                    ];
                }, $topPlanos),
                'cursosPublicados' => (int)$cursos,
                'matriculas' => (int)$matriculas,
                'campanhasAtivas' => (int)$campanhasAtivas
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin monetization error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar dados de monetização', [], 500);
        }
    }

    /**
     * Lista campanhas promocionais
     */
    public function listCampaigns() {
        $this->requireAdmin();

        try {
            $rows = $this->db->fetchAll('
                SELECT ac.*, COUNT(cp.post_id) as total_posts
                FROM ad_campaigns ac
                LEFT JOIN ad_campaign_posts cp ON cp.campaign_id = ac.id
                GROUP BY ac.id
                ORDER BY ac.created_at DESC
                LIMIT 25
            ');

            echo Helper::jsonResponse(true, '', [
                'campanhas' => array_map(function ($row) {
                    return [
                        'id' => (int)$row['id'],
                        'nome' => $row['nome'] ?? '',
                        'status' => $row['status'] ?? 'rascunho',
                        'orcamento' => (float)($row['orcamento_total'] ?? 0),
                        'gasto' => (float)($row['orcamento_utilizado'] ?? 0),
                        'total_posts' => (int)($row['total_posts'] ?? 0),
                        'inicia_em' => $row['inicio_em'] ?? null,
                        'expira_em' => $row['fim_em'] ?? null
                    ];
                }, $rows)
            ]);
        } catch (Exception $e) {
            Helper::logError('Admin listCampaigns error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar campanhas', [], 500);
        }
    }
}
