<?php
/**
 * Controlador de Grupos da Comunidade
 */

class GroupController {
    private $db;
    private $subscriptionService;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->subscriptionService = new SubscriptionService();
    }

    /**
     * Listar grupos com filtros opcionais
     */
    public function listGroups() {
        try {
            $user = AuthMiddleware::optional();
            $currentUserId = $user['id'] ?? null;

            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(50, max(5, (int)($_GET['limit'] ?? 12)));
            $offset = ($page - 1) * $limit;
            $search = trim($_GET['q'] ?? '');
            $filter = $_GET['filter'] ?? null;

            $params = [];
            $select = 'SELECT g.*, stats.total_membros';
            $from = ' FROM grupos g'
                . ' LEFT JOIN (
                        SELECT grupo_id, COUNT(*) as total_membros
                        FROM grupo_membros
                        WHERE status = "ativo"
                        GROUP BY grupo_id
                    ) stats ON stats.grupo_id = g.id';

            if ($currentUserId) {
                $select .= ', gm.status as membership_status, gm.papel as membership_role';
                $from .= ' LEFT JOIN grupo_membros gm ON gm.grupo_id = g.id AND gm.usuario_id = ?';
                $params[] = $currentUserId;
            } else {
                $select .= ', NULL as membership_status, NULL as membership_role';
            }

            $conditions = ['g.ativo = 1'];

            if ($search !== '') {
                $conditions[] = '(g.nome LIKE ? OR g.categoria LIKE ? OR g.tags LIKE ? OR g.descricao LIKE ?)';
                $term = '%' . $search . '%';
                $params[] = $term;
                $params[] = $term;
                $params[] = $term;
                $params[] = $term;
            }

            if ($filter === 'joined' && $currentUserId) {
                $conditions[] = 'gm.status = "ativo"';
            } elseif ($filter === 'managed' && $currentUserId) {
                $conditions[] = 'gm.papel IN ("owner","moderador")';
            } elseif ($filter === 'discover' && $currentUserId) {
                $conditions[] = '(gm.status IS NULL OR gm.status != "ativo")';
            }

            $where = ' WHERE ' . implode(' AND ', $conditions);

            $order = ' ORDER BY g.ultima_atividade DESC, g.nome ASC';
            $limitClause = ' LIMIT ? OFFSET ?';

            $rows = $this->db->fetchAll(
                $select . $from . $where . $order . $limitClause,
                array_merge($params, [$limit, $offset])
            );

            $totalRow = $this->db->fetch(
                'SELECT COUNT(*) as total FROM (
                    SELECT g.id' . $from . $where . ' GROUP BY g.id
                ) sub',
                $params
            );

            $groups = array_map(function ($row) use ($currentUserId) {
                return $this->formatGroup($row, $currentUserId);
            }, $rows);

            echo Helper::jsonResponse(true, '', [
                'groups' => $groups,
                'pagination' => [
                    'currentPage' => $page,
                    'perPage' => $limit,
                    'total' => (int)($totalRow['total'] ?? 0),
                    'totalPages' => $limit ? (int)ceil(($totalRow['total'] ?? 0) / $limit) : 1,
                    'hasNextPage' => ($offset + count($groups)) < (int)($totalRow['total'] ?? 0),
                    'hasPrevPage' => $page > 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('List groups error: ' . $e->getMessage(), $_GET ?? []);
            echo Helper::jsonResponse(false, 'Erro ao listar grupos', [], 500);
        }
    }

    /**
     * Obter detalhes de um grupo
     */
    public function getGroup($groupId) {
        try {
            $user = AuthMiddleware::optional();
            $currentUserId = $user['id'] ?? null;
            $currentUserType = $user['tipo'] ?? null;
            $groupId = (int)$groupId;

            $this->respondWithGroupDetails($groupId, $currentUserId, $currentUserType);
        } catch (Exception $e) {
            Helper::logError('Get group error: ' . $e->getMessage(), ['group_id' => $groupId]);
            echo Helper::jsonResponse(false, 'Erro ao buscar grupo', [], 500);
        }
    }

    /**
     * Obter detalhes de um grupo pelo slug amigável
     */
    public function getGroupBySlug($slug) {
        try {
            $user = AuthMiddleware::optional();
            $currentUserId = $user['id'] ?? null;
            $currentUserType = $user['tipo'] ?? null;
            $sanitizedSlug = Helper::sanitizeString((string)$slug);

            if ($sanitizedSlug === '') {
                echo Helper::jsonResponse(false, 'Slug inválido', [], 400);
                return;
            }

            $group = $this->db->fetch('SELECT id FROM grupos WHERE slug = ? AND ativo = 1', [$sanitizedSlug]);
            if (!$group) {
                echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
                return;
            }

            $this->respondWithGroupDetails((int)$group['id'], $currentUserId, $currentUserType);
        } catch (Exception $e) {
            Helper::logError('Get group by slug error: ' . $e->getMessage(), ['slug' => $slug]);
            echo Helper::jsonResponse(false, 'Erro ao buscar grupo', [], 500);
        }
    }

    private function respondWithGroupDetails(int $groupId, ?int $currentUserId, ?string $currentUserType = null): void {
        $group = $this->fetchGroup($groupId, $currentUserId);
        if (!$group) {
            echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
            return;
        }

        $members = $this->db->fetchAll(
            'SELECT gm.id, gm.usuario_id, gm.papel, gm.status, gm.joined_at, gm.last_seen_at,
                    u.nome, u.username, u.avatar_url
             FROM grupo_membros gm
             INNER JOIN usuarios u ON u.id = gm.usuario_id
             WHERE gm.grupo_id = ? AND gm.status = "ativo"
             ORDER BY CASE gm.papel WHEN "owner" THEN 1 WHEN "moderador" THEN 2 ELSE 3 END, gm.joined_at ASC
             LIMIT 25',
            [$groupId]
        );

        $membershipStatus = $group['membership']['status'] ?? null;
        $role = $group['membership']['role'] ?? null;
        $isAdmin = $currentUserType === 'admin';
        $isMember = $membershipStatus === 'ativo';
        $isPending = $membershipStatus === 'pendente';
        $canModerate = $currentUserId && ($isAdmin || in_array($role, ['owner', 'moderador'], true));

        $formattedMembers = array_map(function ($member) use ($currentUserId, $canModerate) {
            $memberId = (int)$member['usuario_id'];
            return [
                'id' => $memberId,
                'papel' => $member['papel'],
                'status' => $member['status'],
                'joined_at' => $member['joined_at'],
                'last_seen_at' => $member['last_seen_at'],
                'nome' => $member['nome'],
                'username' => $member['username'],
                'avatar_url' => $member['avatar_url'],
                'is_self' => $currentUserId ? $memberId === (int)$currentUserId : false,
                'can_be_removed' => $canModerate && $member['papel'] !== 'owner' && (!$currentUserId || $memberId !== (int)$currentUserId)
            ];
        }, $members);

        $pendingRequests = 0;
        if ($canModerate) {
            $count = $this->db->fetch(
                'SELECT COUNT(*) as total FROM grupo_solicitacoes WHERE grupo_id = ? AND status = "pendente"',
                [$groupId]
            );
            $pendingRequests = (int)($count['total'] ?? 0);
        }

        $group['membership']['is_member'] = $isMember;
        $group['membership']['is_pending'] = $isPending;

        $group['permissions'] = [
            'can_edit' => $currentUserId && ($isAdmin || in_array($role, ['owner', 'moderador'], true)),
            'can_moderate' => (bool)$canModerate,
            'can_manage_requests' => (bool)$canModerate,
            'can_invite' => (bool)$canModerate,
            'can_remove_members' => (bool)$canModerate
        ];

        $group['stats'] = [
            'members' => (int)($group['membros'] ?? count($formattedMembers)),
            'pending_requests' => $pendingRequests
        ];

        echo Helper::jsonResponse(true, '', [
            'group' => $group,
            'members' => $formattedMembers,
            'pending_requests' => $pendingRequests
        ]);
    }

    /**
     * Criar um novo grupo
     */
    public function createGroup() {
        try {
            $user = AuthMiddleware::required();
            $isAdmin = ($user['tipo'] ?? null) === 'admin';

            if (!$isAdmin && !$this->subscriptionService->userHasFeature((int)$user['id'], 'acesso_grupos')) {
                echo Helper::jsonResponse(false, 'Plano Premium necessário para criar grupos', [], 403);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data || empty(trim($data['nome'] ?? ''))) {
                echo Helper::jsonResponse(false, 'Nome do grupo é obrigatório', [], 400);
                return;
            }

            $nome = Helper::sanitizeString($data['nome']);
            $descricao = isset($data['descricao']) ? Helper::sanitizeString($data['descricao']) : null;
            $categoria = isset($data['categoria']) ? Helper::sanitizeString($data['categoria']) : null;
            $privacidade = $this->validateEnum($data['privacidade'] ?? 'publico', ['publico', 'privado', 'somente_convidados']);
            $moderacao = $this->validateEnum($data['moderacao_nivel'] ?? 'moderado', ['aberto', 'moderado', 'restrito']);
            $tags = isset($data['tags']) ? $this->normalizeTags($data['tags']) : null;
            $regras = isset($data['regras']) ? Helper::sanitizeString($data['regras']) : null;
            $imagem = isset($data['imagem']) ? Helper::sanitizeString($data['imagem']) : null;
            $imagemCapa = isset($data['imagem_capa']) ? Helper::sanitizeString($data['imagem_capa']) : null;

            $slug = $this->generateUniqueSlug($nome);

            $pdo = $this->db->getConnection();
            $pdo->beginTransaction();

            $groupId = $this->db->insert(
                'INSERT INTO grupos (criador_id, nome, slug, descricao, categoria, tags, regras, privacidade, moderacao_nivel, imagem, imagem_capa, ativo, membros, ultima_atividade, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())',
                [
                    $user['id'],
                    $nome,
                    $slug,
                    $descricao,
                    $categoria,
                    $tags,
                    $regras,
                    $privacidade,
                    $moderacao,
                    $imagem,
                    $imagemCapa
                ]
            );

            $this->db->insert(
                'INSERT INTO grupo_membros (grupo_id, usuario_id, papel, status, joined_at, last_seen_at)
                 VALUES (?, ?, "owner", "ativo", NOW(), NOW())',
                [$groupId, $user['id']]
            );

            $pdo->commit();

            echo Helper::jsonResponse(true, 'Grupo criado com sucesso', [
                'group_id' => (int)$groupId,
                'slug' => $slug
            ], 201);
        } catch (Exception $e) {
            if ($this->db->getConnection()->inTransaction()) {
                $this->db->getConnection()->rollBack();
            }
            Helper::logError('Create group error: ' . $e->getMessage(), $data ?? []);
            echo Helper::jsonResponse(false, 'Erro ao criar grupo', [], 500);
        }
    }

    /**
     * Atualizar informações do grupo
     */
    public function updateGroup($groupId) {
        try {
            $user = AuthMiddleware::required();
            $groupId = (int)$groupId;

            $membership = $this->db->fetch(
                'SELECT papel FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ? AND status = "ativo"',
                [$groupId, $user['id']]
            );

            if (!$membership || $membership['papel'] !== 'owner') {
                echo Helper::jsonResponse(false, 'Somente a criadora pode editar o grupo', [], 403);
                return;
            }

            $group = $this->db->fetch('SELECT * FROM grupos WHERE id = ?', [$groupId]);
            if (!$group || !(int)$group['ativo']) {
                echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }

            $updates = [];
            $params = [];

            if (isset($data['nome']) && !empty(trim($data['nome']))) {
                $nome = Helper::sanitizeString($data['nome']);
                if ($nome !== $group['nome']) {
                    $updates[] = 'nome = ?';
                    $params[] = $nome;
                }
            }

            if (isset($data['descricao'])) {
                $updates[] = 'descricao = ?';
                $params[] = Helper::sanitizeString($data['descricao']);
            }

            if (isset($data['categoria'])) {
                $updates[] = 'categoria = ?';
                $params[] = Helper::sanitizeString($data['categoria']);
            }

            if (isset($data['tags'])) {
                $updates[] = 'tags = ?';
                $params[] = $this->normalizeTags($data['tags']);
            }

            if (isset($data['regras'])) {
                $updates[] = 'regras = ?';
                $params[] = Helper::sanitizeString($data['regras']);
            }

            if (isset($data['privacidade'])) {
                $updates[] = 'privacidade = ?';
                $params[] = $this->validateEnum($data['privacidade'], ['publico', 'privado', 'somente_convidados']);
            }

            if (isset($data['moderacao_nivel'])) {
                $updates[] = 'moderacao_nivel = ?';
                $params[] = $this->validateEnum($data['moderacao_nivel'], ['aberto', 'moderado', 'restrito']);
            }

            if (isset($data['imagem'])) {
                $updates[] = 'imagem = ?';
                $params[] = Helper::sanitizeString($data['imagem']);
            }

            if (isset($data['imagem_capa'])) {
                $updates[] = 'imagem_capa = ?';
                $params[] = Helper::sanitizeString($data['imagem_capa']);
            }

            if (empty($updates)) {
                echo Helper::jsonResponse(false, 'Nenhum campo para atualizar', [], 400);
                return;
            }

            $updates[] = 'ultima_atividade = NOW()';
            $params[] = $groupId;

            $this->db->execute('UPDATE grupos SET ' . implode(', ', $updates) . ' WHERE id = ?', $params);

            echo Helper::jsonResponse(true, 'Grupo atualizado com sucesso');
        } catch (Exception $e) {
            Helper::logError('Update group error: ' . $e->getMessage(), ['group_id' => $groupId]);
            echo Helper::jsonResponse(false, 'Erro ao atualizar grupo', [], 500);
        }
    }

    /**
     * Aderir a um grupo (ou solicitar acesso)
     */
    public function joinGroup($groupId) {
        try {
            $user = AuthMiddleware::required();
            $groupId = (int)$groupId;

            $group = $this->db->fetch('SELECT * FROM grupos WHERE id = ? AND ativo = 1', [$groupId]);
            if (!$group) {
                echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
                return;
            }

            $membership = $this->db->fetch(
                'SELECT id, status, papel FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?',
                [$groupId, $user['id']]
            );

            $groupSummary = [
                'id' => (int)$group['id'],
                'slug' => $group['slug'],
                'nome' => $group['nome'],
                'imagem' => $group['imagem'],
                'imagem_capa' => $group['imagem_capa'],
                'privacidade' => $group['privacidade']
            ];

            $membershipPayload = function($status, ?array $membershipRow = null) use ($user) {
                $role = $membershipRow['papel'] ?? 'membro';
                if ((!$role || $role === 'membro') && isset($user['tipo']) && $user['tipo'] === 'admin') {
                    $role = 'admin';
                }

                $payload = ['status' => $status];
                if ($role) {
                    $payload['role'] = $role;
                }

                return $payload;
            };

            if ($membership && $membership['status'] === 'banido') {
                echo Helper::jsonResponse(false, 'Você foi banida deste grupo', [], 403);
                return;
            }

            if ($membership && $membership['status'] === 'ativo') {
                $membershipData = $membershipPayload('ativo', $membership);
                echo Helper::jsonResponse(true, 'Você já participa deste grupo', [
                    'group' => $groupSummary,
                    'group_id' => (int)$group['id'],
                    'slug' => $group['slug'],
                    'membership' => $membershipData,
                    'membership_status' => 'ativo',
                    'data' => [
                        'group' => $groupSummary,
                        'membership' => $membershipData
                    ]
                ]);
                return;
            }

            $isAdmin = ($user['tipo'] ?? null) === 'admin';
            if (!$isAdmin && !$this->subscriptionService->userHasFeature((int)$user['id'], 'acesso_grupos')) {
                echo Helper::jsonResponse(false, 'Plano Premium necessário para participar dos grupos', [], 403);
                return;
            }

            if (in_array($group['privacidade'], ['publico', 'privado'], true)) {
                $this->activateMembership($groupId, $user['id'], $membership);
                $this->db->execute(
                    'DELETE FROM grupo_solicitacoes WHERE grupo_id = ? AND usuario_id = ?',
                    [$groupId, $user['id']]
                );

                $membershipData = $membershipPayload('ativo', $membership);

                echo Helper::jsonResponse(true, 'Você entrou no grupo', [
                    'group' => $groupSummary,
                    'group_id' => (int)$group['id'],
                    'slug' => $group['slug'],
                    'membership' => $membershipData,
                    'membership_status' => 'ativo',
                    'data' => [
                        'group' => $groupSummary,
                        'membership' => $membershipData
                    ]
                ]);
                return;
            }

            // somente_convidados
            $invite = $this->db->fetch(
                'SELECT * FROM grupo_convites WHERE grupo_id = ? AND convidado_id = ? AND status = "pendente" AND (expira_em IS NULL OR expira_em > NOW())',
                [$groupId, $user['id']]
            );

            if ($invite) {
                $this->activateMembership($groupId, $user['id'], $membership);
                $this->db->execute('UPDATE grupo_convites SET status = "aceito", respondido_em = NOW() WHERE id = ?', [$invite['id']]);

                $membershipData = $membershipPayload('ativo', $membership);

                echo Helper::jsonResponse(true, 'Você entrou no grupo', [
                    'group' => $groupSummary,
                    'group_id' => (int)$group['id'],
                    'slug' => $group['slug'],
                    'membership' => $membershipData,
                    'membership_status' => 'ativo',
                    'data' => [
                        'group' => $groupSummary,
                        'membership' => $membershipData
                    ]
                ]);
                return;
            }

            $membershipData = $membershipPayload('restrito', $membership);

            echo Helper::jsonResponse(false, 'Este grupo requer convite para entrar', [
                'group' => $groupSummary,
                'group_id' => (int)$group['id'],
                'slug' => $group['slug'],
                'membership' => $membershipData,
                'membership_status' => 'restrito',
                'data' => [
                    'group' => $groupSummary,
                    'membership' => $membershipData
                ]
            ], 403);
        } catch (Exception $e) {
            Helper::logError('Join group error: ' . $e->getMessage(), ['group_id' => $groupId]);
            echo Helper::jsonResponse(false, 'Erro ao entrar no grupo', [], 500);
        }
    }

    /**
     * Sair do grupo
     */
    public function leaveGroup($groupId) {
        try {
            $user = AuthMiddleware::required();
            $groupId = (int)$groupId;

            $membership = $this->db->fetch(
                'SELECT id, papel, status FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?',
                [$groupId, $user['id']]
            );

            if (!$membership || $membership['status'] !== 'ativo') {
                echo Helper::jsonResponse(false, 'Você não participa deste grupo', [], 400);
                return;
            }

            if ($membership['papel'] === 'owner') {
                echo Helper::jsonResponse(false, 'A criadora não pode sair do grupo', [], 400);
                return;
            }

            $this->db->execute('DELETE FROM grupo_membros WHERE id = ?', [$membership['id']]);
            $this->refreshMemberCount($groupId);
            $this->db->execute('UPDATE grupos SET ultima_atividade = NOW() WHERE id = ?', [$groupId]);

            echo Helper::jsonResponse(true, 'Você saiu do grupo');
        } catch (Exception $e) {
            Helper::logError('Leave group error: ' . $e->getMessage(), ['group_id' => $groupId]);
            echo Helper::jsonResponse(false, 'Erro ao sair do grupo', [], 500);
        }
    }

    /**
     * Listar membros do grupo (com paginação)
     */
    public function listMembers($groupId) {
        try {
            $user = AuthMiddleware::optional();
            $currentUserId = $user['id'] ?? null;
            $groupId = (int)$groupId;

            $group = $this->db->fetch('SELECT id, privacidade FROM grupos WHERE id = ? AND ativo = 1', [$groupId]);
            if (!$group) {
                echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
                return;
            }

            $isAdmin = ($user['tipo'] ?? null) === 'admin';

            if ($group['privacidade'] !== 'publico' && !$isAdmin) {
                $membership = $this->db->fetch(
                    'SELECT status FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?',
                    [$groupId, $currentUserId]
                );
                if (!$membership || $membership['status'] !== 'ativo') {
                    echo Helper::jsonResponse(false, 'Acesso restrito aos membros', [], 403);
                    return;
                }
            }

            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(100, max(10, (int)($_GET['limit'] ?? 30)));
            $offset = ($page - 1) * $limit;

            $rows = $this->db->fetchAll(
                'SELECT gm.id, gm.usuario_id, gm.papel, gm.status, gm.joined_at, gm.last_seen_at,
                        u.nome, u.username, u.avatar_url
                 FROM grupo_membros gm
                 INNER JOIN usuarios u ON u.id = gm.usuario_id
                 WHERE gm.grupo_id = ? AND gm.status = "ativo"
                 ORDER BY CASE gm.papel WHEN "owner" THEN 1 WHEN "moderador" THEN 2 ELSE 3 END, gm.joined_at ASC
                 LIMIT ? OFFSET ?',
                [$groupId, $limit, $offset]
            );

            $total = $this->db->fetch(
                'SELECT COUNT(*) as total FROM grupo_membros WHERE grupo_id = ? AND status = "ativo"',
                [$groupId]
            );

            $members = array_map(function ($row) {
                return [
                    'id' => (int)$row['usuario_id'],
                    'papel' => $row['papel'],
                    'status' => $row['status'],
                    'joined_at' => $row['joined_at'],
                    'last_seen_at' => $row['last_seen_at'],
                    'nome' => $row['nome'],
                    'username' => $row['username'],
                    'avatar_url' => $row['avatar_url']
                ];
            }, $rows);

            echo Helper::jsonResponse(true, '', [
                'members' => $members,
                'pagination' => [
                    'currentPage' => $page,
                    'perPage' => $limit,
                    'total' => (int)($total['total'] ?? 0),
                    'totalPages' => $limit ? (int)ceil(($total['total'] ?? 0) / $limit) : 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('List group members error: ' . $e->getMessage(), ['group_id' => $groupId]);
            echo Helper::jsonResponse(false, 'Erro ao listar membros', [], 500);
        }
    }

    /**
     * Listar solicitações pendentes para aprovação
     */
    public function listRequests($groupId) {
        try {
            $user = AuthMiddleware::required();
            $groupId = (int)$groupId;

            $userType = $user['tipo'] ?? null;

            if (!$this->isModerator($groupId, $user['id'], $userType)) {
                echo Helper::jsonResponse(false, 'Somente moderadoras podem acessar as solicitações', [], 403);
                return;
            }

            $rows = $this->db->fetchAll(
                'SELECT gs.id, gs.usuario_id, gs.status, gs.created_at,
                        u.nome, u.username, u.avatar_url
                 FROM grupo_solicitacoes gs
                 INNER JOIN usuarios u ON u.id = gs.usuario_id
                 WHERE gs.grupo_id = ? AND gs.status = "pendente"
                 ORDER BY gs.created_at ASC',
                [$groupId]
            );

            $requests = array_map(function ($row) {
                return [
                    'id' => (int)$row['id'],
                    'usuario' => [
                        'id' => (int)$row['usuario_id'],
                        'nome' => $row['nome'],
                        'username' => $row['username'],
                        'avatar_url' => $row['avatar_url']
                    ],
                    'status' => $row['status'],
                    'created_at' => $row['created_at']
                ];
            }, $rows);

            echo Helper::jsonResponse(true, '', ['requests' => $requests]);
        } catch (Exception $e) {
            Helper::logError('List group requests error: ' . $e->getMessage(), ['group_id' => $groupId]);
            echo Helper::jsonResponse(false, 'Erro ao listar solicitações', [], 500);
        }
    }

    /**
     * Aprovar ou rejeitar uma solicitação
     */
    public function handleRequest($groupId, $requestId) {
        try {
            $user = AuthMiddleware::required();
            $groupId = (int)$groupId;
            $requestId = (int)$requestId;

            $userType = $user['tipo'] ?? null;

            if (!$this->isModerator($groupId, $user['id'], $userType)) {
                echo Helper::jsonResponse(false, 'Somente moderadoras podem gerenciar solicitações', [], 403);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $status = $this->validateEnum($data['status'] ?? '', ['aprovado', 'rejeitado']);

            $request = $this->db->fetch(
                'SELECT * FROM grupo_solicitacoes WHERE id = ? AND grupo_id = ?',
                [$requestId, $groupId]
            );

            if (!$request || $request['status'] !== 'pendente') {
                echo Helper::jsonResponse(false, 'Solicitação inválida', [], 400);
                return;
            }

            if ($status === 'aprovado') {
                $this->activateMembership($groupId, (int)$request['usuario_id']);
                $this->db->execute(
                    'UPDATE grupo_solicitacoes SET status = "aprovado", analisado_por = ?, analisado_em = NOW() WHERE id = ?',
                    [$user['id'], $requestId]
                );

                NotificationController::createNotification(
                    (int)$request['usuario_id'],
                    $user['id'],
                    'group',
                    null,
                    null,
                    'Sua solicitação para o grupo foi aprovada',
                    $groupId,
                    'grupos'
                );
            } else {
                $this->db->execute(
                    'UPDATE grupo_solicitacoes SET status = "rejeitado", analisado_por = ?, analisado_em = NOW() WHERE id = ?',
                    [$user['id'], $requestId]
                );

                NotificationController::createNotification(
                    (int)$request['usuario_id'],
                    $user['id'],
                    'group',
                    null,
                    null,
                    'Sua solicitação para o grupo foi recusada',
                    $groupId,
                    'grupos',
                    ['status' => 'rejeitado']
                );
            }

            echo Helper::jsonResponse(true, 'Solicitação atualizada', ['status' => $status]);
        } catch (Exception $e) {
            Helper::logError('Handle request error: ' . $e->getMessage(), ['group_id' => $groupId, 'request_id' => $requestId]);
            echo Helper::jsonResponse(false, 'Erro ao atualizar solicitação', [], 500);
        }
    }

    /**
     * Criar convite para o grupo
     */
    public function createInvite($groupId) {
        try {
            $user = AuthMiddleware::required();
            $groupId = (int)$groupId;

            $userType = $user['tipo'] ?? null;

            if (!$this->isModerator($groupId, $user['id'], $userType)) {
                echo Helper::jsonResponse(false, 'Somente moderadoras podem convidar', [], 403);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || (!isset($data['usuario_id']) && empty($data['email'] ?? ''))) {
                echo Helper::jsonResponse(false, 'Informe usuária ou email para convite', [], 400);
                return;
            }

            $targetUserId = isset($data['usuario_id']) ? (int)$data['usuario_id'] : null;
            $email = isset($data['email']) ? Helper::sanitizeString($data['email']) : null;
            $expiresInHours = isset($data['expira_em_horas']) ? max(1, (int)$data['expira_em_horas']) : 72;

            if ($targetUserId) {
                $existingMember = $this->db->fetch(
                    'SELECT status FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?',
                    [$groupId, $targetUserId]
                );
                if ($existingMember && $existingMember['status'] === 'ativo') {
                    echo Helper::jsonResponse(false, 'Usuária já participa do grupo', [], 400);
                    return;
                }
            }

            $token = bin2hex(random_bytes(16));
            $expiraEm = (new DateTime())->modify('+' . $expiresInHours . ' hours')->format('Y-m-d H:i:s');

            $this->db->insert(
                'INSERT INTO grupo_convites (grupo_id, convidante_id, convidado_id, email, token, status, expira_em)
                 VALUES (?, ?, ?, ?, ?, "pendente", ?)',
                [$groupId, $user['id'], $targetUserId, $email, $token, $expiraEm]
            );

            if ($targetUserId) {
                NotificationController::createNotification(
                    $targetUserId,
                    $user['id'],
                    'group',
                    null,
                    null,
                    'Você recebeu um convite para participar de um grupo',
                    $groupId,
                    'grupos',
                    ['token' => $token]
                );
            }

            echo Helper::jsonResponse(true, 'Convite criado', [
                'token' => $token,
                'expira_em' => $expiraEm
            ], 201);
        } catch (Exception $e) {
            Helper::logError('Create group invite error: ' . $e->getMessage(), ['group_id' => $groupId]);
            echo Helper::jsonResponse(false, 'Erro ao criar convite', [], 500);
        }
    }

    /**
     * Aceitar convite
     */
    public function acceptInvite($groupId, $token) {
        try {
            $user = AuthMiddleware::required();
            $groupId = (int)$groupId;
            $token = Helper::sanitizeString($token);

            $invite = $this->db->fetch(
                'SELECT * FROM grupo_convites WHERE grupo_id = ? AND token = ?',
                [$groupId, $token]
            );

            if (!$invite || $invite['status'] !== 'pendente') {
                echo Helper::jsonResponse(false, 'Convite inválido', [], 400);
                return;
            }

            if ($invite['expira_em'] && strtotime($invite['expira_em']) < time()) {
                echo Helper::jsonResponse(false, 'Convite expirado', [], 400);
                return;
            }

            if ($invite['convidado_id'] && (int)$invite['convidado_id'] !== (int)$user['id']) {
                echo Helper::jsonResponse(false, 'Convite destinado a outra usuária', [], 403);
                return;
            }

            $membership = $this->db->fetch(
                'SELECT id, status FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?',
                [$groupId, $user['id']]
            );

            $isAdmin = ($user['tipo'] ?? null) === 'admin';
            $alreadyActive = $membership && $membership['status'] === 'ativo';
            if (!$alreadyActive && !$isAdmin && !$this->subscriptionService->userHasFeature((int)$user['id'], 'acesso_grupos')) {
                echo Helper::jsonResponse(false, 'Plano Premium necessário para participar dos grupos', [], 403);
                return;
            }

            $this->activateMembership($groupId, $user['id'], $membership);
            $this->db->execute('UPDATE grupo_convites SET status = "aceito", respondido_em = NOW(), convidado_id = ? WHERE id = ?', [$user['id'], $invite['id']]);

            echo Helper::jsonResponse(true, 'Convite aceito com sucesso', [
                'membership' => ['status' => 'ativo']
            ]);
        } catch (Exception $e) {
            Helper::logError('Accept invite error: ' . $e->getMessage(), ['group_id' => $groupId]);
            echo Helper::jsonResponse(false, 'Erro ao aceitar convite', [], 500);
        }
    }

    /**
     * Remover membro (moderadoras)
     */
    public function removeMember($groupId, $memberId) {
        try {
            $user = AuthMiddleware::required();
            $groupId = (int)$groupId;
            $memberId = (int)$memberId;

            $userType = $user['tipo'] ?? null;

            if (!$this->isModerator($groupId, $user['id'], $userType)) {
                echo Helper::jsonResponse(false, 'Somente moderadoras podem remover integrantes', [], 403);
                return;
            }

            $membership = $this->db->fetch(
                'SELECT id, papel FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ? AND status = "ativo"',
                [$groupId, $memberId]
            );

            if (!$membership) {
                echo Helper::jsonResponse(false, 'Usuária não encontrada no grupo', [], 404);
                return;
            }

            if ($membership['papel'] === 'owner') {
                echo Helper::jsonResponse(false, 'Não é possível remover a criadora', [], 400);
                return;
            }

            $this->db->execute('DELETE FROM grupo_membros WHERE id = ?', [$membership['id']]);
            $this->refreshMemberCount($groupId);
            $this->db->execute('UPDATE grupos SET ultima_atividade = NOW() WHERE id = ?', [$groupId]);

            NotificationController::createNotification(
                $memberId,
                $user['id'],
                'group',
                null,
                null,
                'Você foi removida do grupo',
                $groupId,
                'grupos',
                ['action' => 'removed']
            );

            echo Helper::jsonResponse(true, 'Membro removido');
        } catch (Exception $e) {
            Helper::logError('Remove group member error: ' . $e->getMessage(), ['group_id' => $groupId, 'member_id' => $memberId]);
            echo Helper::jsonResponse(false, 'Erro ao remover integrante', [], 500);
        }
    }

    /**
     * Buscar posts dos grupos que o usuário participa
     */
    public function getMyGroupsPosts() {
        try {
            $user = AuthMiddleware::required();
            $userId = (int)$user['id'];

            $tableCheck = $this->db->fetch("SHOW TABLES LIKE 'grupo_posts'");
            if (!$tableCheck) {
                echo Helper::jsonResponse(true, 'Posts carregados', [
                    'posts' => [],
                    'pagination' => [
                        'page' => 1,
                        'limit' => 20,
                        'total' => 0,
                        'pages' => 0
                    ]
                ]);
                return;
            }

            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(50, max(5, (int)($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;

            $sql = "SELECT 
                        p.*,
                        u.nome as autor,
                        u.username,
                        u.avatar_url as avatar,
                        g.nome as grupo_nome,
                        g.slug as grupo_slug,
                        g.imagem as grupo_imagem,
                        g.imagem_capa as grupo_capa,
                        COUNT(DISTINCT l.id) as likes,
                        COUNT(DISTINCT c.id) as comentarios,
                        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as user_liked,
                        EXISTS(SELECT 1 FROM post_saves WHERE post_id = p.id AND user_id = ?) as user_saved,
                        EXISTS(SELECT 1 FROM user_follows WHERE follower_id = ? AND followed_id = p.user_id) as isFollowed
                    FROM grupo_posts gp
                    INNER JOIN grupos g ON g.id = gp.grupo_id AND g.ativo = 1
                    INNER JOIN grupo_membros gm ON gm.grupo_id = g.id AND gm.usuario_id = ? AND gm.status = 'ativo'
                    INNER JOIN posts p ON p.id = gp.post_id
                    INNER JOIN usuarios u ON u.id = p.user_id
                    LEFT JOIN post_likes l ON l.post_id = p.id
                    LEFT JOIN post_comentarios c ON c.post_id = p.id
                    GROUP BY p.id, g.id
                    ORDER BY p.created_at DESC
                    LIMIT $limit OFFSET $offset";

            $posts = $this->db->fetchAll($sql, [$userId, $userId, $userId, $userId]);

            $formattedPosts = array_map(function ($row) use ($userId) {
                $row['media_files'] = $row['media_files'] ?? [];
                return Helper::formatPost($row, $userId);
            }, $posts);

            $count = $this->db->fetch(
                'SELECT COUNT(DISTINCT gp.post_id) as total
                 FROM grupo_posts gp
                 INNER JOIN grupo_membros gm ON gm.grupo_id = gp.grupo_id AND gm.usuario_id = ? AND gm.status = "ativo"',
                [$userId]
            );
            $total = (int)($count['total'] ?? 0);

            echo Helper::jsonResponse(true, 'Posts carregados', [
                'posts' => $formattedPosts,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => $limit ? (int)ceil($total / $limit) : 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Get my groups posts error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar posts', [], 500);
        }
    }

    /**
     * Buscar posts de um grupo específico
     */
    public function getGroupPosts($groupId) {
        try {
            $user = AuthMiddleware::required();
            $userId = (int)$user['id'];
            $userType = $user['tipo'] ?? null;
            $groupId = (int)$groupId;

            $tableCheck = $this->db->fetch("SHOW TABLES LIKE 'grupo_posts'");
            if (!$tableCheck) {
                echo Helper::jsonResponse(true, 'Posts carregados', [
                    'posts' => [],
                    'pagination' => [
                        'page' => 1,
                        'limit' => 20,
                        'total' => 0,
                        'pages' => 0
                    ]
                ]);
                return;
            }

            $group = $this->db->fetch('SELECT * FROM grupos WHERE id = ? AND ativo = 1', [$groupId]);
            if (!$group) {
                echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
                return;
            }

            $isAdmin = $userType === 'admin';
            if (!$isAdmin) {
                $membership = $this->db->fetch(
                    'SELECT status FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?',
                    [$groupId, $userId]
                );

                if (!$membership || $membership['status'] !== 'ativo') {
                    echo Helper::jsonResponse(false, 'Você precisa ser membro do grupo para ver os posts', [], 403);
                    return;
                }
            }

            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(50, max(5, (int)($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;

            $sql = "SELECT 
                        p.*,
                        u.nome as autor,
                        u.username,
                        u.avatar_url as avatar,
                        g.nome as grupo_nome,
                        g.slug as grupo_slug,
                        g.imagem as grupo_imagem,
                        g.imagem_capa as grupo_capa,
                        COUNT(DISTINCT l.id) as likes,
                        COUNT(DISTINCT c.id) as comentarios,
                        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as user_liked,
                        EXISTS(SELECT 1 FROM post_saves WHERE post_id = p.id AND user_id = ?) as user_saved,
                        EXISTS(SELECT 1 FROM user_follows WHERE follower_id = ? AND followed_id = p.user_id) as isFollowed
                    FROM grupo_posts gp
                    INNER JOIN posts p ON p.id = gp.post_id
                    INNER JOIN usuarios u ON u.id = p.user_id
                    LEFT JOIN grupos g ON g.id = gp.grupo_id
                    LEFT JOIN post_likes l ON l.post_id = p.id
                    LEFT JOIN post_comentarios c ON c.post_id = p.id
                    WHERE gp.grupo_id = ?
                    GROUP BY p.id
                    ORDER BY p.created_at DESC
                    LIMIT $limit OFFSET $offset";

            $posts = $this->db->fetchAll($sql, [$userId, $userId, $userId, $groupId]);

            $formattedPosts = array_map(function ($row) use ($userId) {
                $row['media_files'] = $row['media_files'] ?? [];
                return Helper::formatPost($row, $userId);
            }, $posts);

            $count = $this->db->fetch(
                'SELECT COUNT(*) as total FROM grupo_posts WHERE grupo_id = ?',
                [$groupId]
            );
            $total = (int)($count['total'] ?? 0);

            echo Helper::jsonResponse(true, 'Posts carregados', [
                'posts' => $formattedPosts,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => $limit ? (int)ceil($total / $limit) : 1
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Get group posts error: ' . $e->getMessage(), ['group_id' => $groupId ?? null]);
            echo Helper::jsonResponse(false, 'Erro ao carregar posts', [], 500);
        }
    }

    /**
     * Helpers privados
     */
    private function fetchGroup(int $groupId, ?int $currentUserId = null) {
        $params = [];
        $select = 'SELECT g.*, stats.total_membros';
        $from = ' FROM grupos g'
            . ' LEFT JOIN (
                    SELECT grupo_id, COUNT(*) as total_membros
                    FROM grupo_membros
                    WHERE status = "ativo"
                    GROUP BY grupo_id
                ) stats ON stats.grupo_id = g.id';
        if ($currentUserId) {
            $select .= ', gm.status as membership_status, gm.papel as membership_role';
            $from .= ' LEFT JOIN grupo_membros gm ON gm.grupo_id = g.id AND gm.usuario_id = ?';
            $params[] = $currentUserId;
        } else {
            $select .= ', NULL as membership_status, NULL as membership_role';
        }

        $params[] = $groupId;

        $row = $this->db->fetch(
            $select . $from . ' WHERE g.id = ? AND g.ativo = 1',
            $params
        );

        return $row ? $this->formatGroup($row, $currentUserId) : null;
    }

    private function formatGroup(array $row, ?int $currentUserId = null): array {
        $tags = $row['tags'] ? (is_array($row['tags']) ? $row['tags'] : json_decode($row['tags'], true)) : [];
        if (!is_array($tags)) {
            $tags = [];
        }

        return [
            'id' => (int)$row['id'],
            'nome' => $row['nome'],
            'slug' => $row['slug'],
            'descricao' => $row['descricao'],
            'categoria' => $row['categoria'],
            'tags' => $tags,
            'regras' => $row['regras'],
            'privacidade' => $row['privacidade'],
            'moderacao_nivel' => $row['moderacao_nivel'],
            'imagem' => $row['imagem'],
            'imagem_capa' => $row['imagem_capa'],
            'membros' => (int)($row['total_membros'] ?? $row['membros'] ?? 0),
            'ultima_atividade' => $row['ultima_atividade'],
            'created_at' => $row['created_at'] ?? null,
            'updated_at' => $row['updated_at'] ?? null,
            'criador_id' => isset($row['criador_id']) ? (int)$row['criador_id'] : null,
            'membership' => [
                'status' => $row['membership_status'] ?? null,
                'role' => $row['membership_role'] ?? null
            ]
        ];
    }

    private function generateUniqueSlug(string $name): string {
        $base = $this->slugify($name);
        if (strlen($base) < 3) {
            $base = $base . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
        }

        $slug = $base;
        $counter = 1;
        while (true) {
            $exists = $this->db->fetch('SELECT id FROM grupos WHERE slug = ?', [$slug]);
            if (!$exists) {
                return $slug;
            }
            $slug = $base . '-' . $counter;
            $counter++;
        }
    }

    private function slugify(string $text): string {
        $text = strtolower(trim($text));
        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'ASCII//TRANSLIT', $text);
            if ($converted !== false) {
                $text = $converted;
            }
        }
        $text = preg_replace('/[^a-z0-9]+/i', '-', $text);
        $text = trim($text, '-');
        return $text ?: 'grupo';
    }

    private function validateEnum(string $value, array $allowed): string {
        $value = strtolower(trim($value));
        if (!in_array($value, $allowed, true)) {
            return $allowed[0];
        }
        return $value;
    }

    private function normalizeTags($tags) {
        if (is_string($tags)) {
            $tags = array_filter(array_map('trim', explode(',', $tags)));
        }
        if (!is_array($tags)) {
            return null;
        }
        $tags = array_values(array_unique(array_map(function ($tag) {
            $tag = Helper::sanitizeString($tag);
            return strtolower($tag);
        }, $tags)));
        return $tags ? json_encode($tags, JSON_UNESCAPED_UNICODE) : null;
    }

    private function activateMembership(int $groupId, int $userId, ?array $existingMembership = null): void {
        $pdo = $this->db->getConnection();
        $pdo->beginTransaction();

        try {
            if ($existingMembership) {
                if ($existingMembership['status'] !== 'ativo') {
                    $this->db->execute(
                        'UPDATE grupo_membros SET status = "ativo", joined_at = NOW(), last_seen_at = NOW() WHERE id = ?',
                        [$existingMembership['id']]
                    );
                    $this->refreshMemberCount($groupId);
                }
            } else {
                $this->db->insert(
                    'INSERT INTO grupo_membros (grupo_id, usuario_id, papel, status, joined_at, last_seen_at)
                     VALUES (?, ?, "membro", "ativo", NOW(), NOW())',
                    [$groupId, $userId]
                );
                $this->refreshMemberCount($groupId);
            }

            $this->db->execute('UPDATE grupos SET ultima_atividade = NOW() WHERE id = ?', [$groupId]);

            $this->notifyGroupOwners($groupId, $userId, 'entrou no grupo');

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    private function notifyGroupOwners(int $groupId, int $actorId, string $message): void {
        $owners = $this->db->fetchAll(
            'SELECT usuario_id FROM grupo_membros WHERE grupo_id = ? AND papel IN ("owner","moderador") AND status = "ativo"',
            [$groupId]
        );

        foreach ($owners as $owner) {
            if ((int)$owner['usuario_id'] === $actorId) {
                continue;
            }
            NotificationController::createNotification(
                (int)$owner['usuario_id'],
                $actorId,
                'group',
                null,
                null,
                $message,
                $groupId,
                'grupos'
            );
        }
    }

    private function refreshMemberCount(int $groupId): void {
        $count = $this->db->fetch(
            'SELECT COUNT(*) as total FROM grupo_membros WHERE grupo_id = ? AND status = "ativo"',
            [$groupId]
        );
        $this->db->execute('UPDATE grupos SET membros = ? WHERE id = ?', [(int)($count['total'] ?? 0), $groupId]);
    }

    private function isModerator(int $groupId, int $userId, ?string $userType = null): bool {
        if ($userType === 'admin') {
            return true;
        }

        $row = $this->db->fetch(
            'SELECT papel FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ? AND status = "ativo"',
            [$groupId, $userId]
        );
        if (!$row) {
            return false;
        }
        return in_array($row['papel'], ['owner', 'moderador'], true);
    }
}
