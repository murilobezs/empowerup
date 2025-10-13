<?php
/**
 * Controlador de Mensagens e Conversas
 */

class MessageController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Buscar conversas do usuário autenticado com resumo e contagem de não lidas
     */
    public function getConversasUsuario() {
        try {
            $user = AuthMiddleware::required();

            $conversas = $this->db->fetchAll(
                'SELECT c.id, c.tipo, c.nome, c.descricao, c.imagem, c.privacidade,
                        c.criador_id, c.ultima_mensagem_id, c.ultima_mensagem_em,
                        c.criado_em,
                        cp.papel, cp.silenciado, cp.favorito, cp.ultimo_visto_em,
                                                COALESCE((
                                                        SELECT COUNT(1)
                                                        FROM mensagens m
                                                        WHERE m.conversa_id = c.id
                                                            AND m.usuario_id != cp.usuario_id
                                                              AND m.enviada_em > IFNULL(cp.ultimo_visto_em, \'1970-01-01\')
                                                ), 0) as unread_count,
                        m.conteudo as ultima_mensagem_conteudo,
                        m.tipo as ultima_mensagem_tipo,
                        m.enviada_em as ultima_mensagem_enviada_em,
                        m.usuario_id as ultima_mensagem_user_id,
                        u.nome as ultima_mensagem_user_nome,
                        u.username as ultima_mensagem_user_username,
                        u.avatar_url as ultima_mensagem_user_avatar
                 FROM conversa_participantes cp
                 INNER JOIN conversas c ON cp.conversa_id = c.id
                 LEFT JOIN mensagens m ON c.ultima_mensagem_id = m.id
                 LEFT JOIN usuarios u ON m.usuario_id = u.id
                 WHERE cp.usuario_id = ?
                 ORDER BY c.ultima_mensagem_em DESC, c.criado_em DESC',
                [$user['id']]
            );

            $conversationIds = array_map(fn($row) => (int)$row['id'], $conversas);
            $participantsByConversation = $this->getParticipantsMap($conversationIds);

            $payload = array_map(function ($row) use ($participantsByConversation, $user) {
                $participants = $participantsByConversation[$row['id']] ?? [];
                $otherParticipants = array_values(array_filter($participants, fn($p) => (int)$p['id'] !== (int)$user['id']));
                $primaryOther = $otherParticipants[0] ?? null;

                $displayName = $row['tipo'] === 'privada' && $primaryOther
                    ? $primaryOther['nome']
                    : ($row['nome'] ?? 'Conversa');

                $avatarUrl = $row['tipo'] === 'privada'
                    ? ($primaryOther['avatar_url'] ?? null)
                    : ($row['imagem'] ?? null);

                $lastMessage = null;
                if ($row['ultima_mensagem_id']) {
                    $lastMessageData = [
                        'id' => $row['ultima_mensagem_id'],
                        'conversa_id' => $row['id'],
                        'usuario_id' => $row['ultima_mensagem_user_id'],
                        'conteudo' => $row['ultima_mensagem_conteudo'],
                        'tipo' => $row['ultima_mensagem_tipo'],
                        'metadata' => null,
                        'reply_to_id' => null,
                        'anexo' => null,
                        'lida' => null,
                        'enviada_em' => $row['ultima_mensagem_enviada_em'],
                        'autor' => $row['ultima_mensagem_user_nome'],
                        'username' => $row['ultima_mensagem_user_username'],
                        'avatar_url' => $row['ultima_mensagem_user_avatar']
                    ];
                    $lastMessage = $this->formatMessage($lastMessageData, $user['id'], $participants);
                }

                return [
                    'id' => (int)$row['id'],
                    'tipo' => $row['tipo'],
                    'nome' => $displayName,
                    'descricao' => $row['descricao'],
                    'imagem' => $row['imagem'],
                    'avatar_url' => $avatarUrl,
                    'privacidade' => $row['privacidade'],
                    'papel' => $row['papel'],
                    'silenciado' => (bool)$row['silenciado'],
                    'favorito' => (bool)$row['favorito'],
                    'unread_count' => (int)$row['unread_count'],
                    'ultimo_visto_em' => $row['ultimo_visto_em'],
                    'ultima_mensagem' => $lastMessage,
                    'participantes' => $participants,
                    'outro_usuario' => $primaryOther
                ];
            }, $conversas);

            echo Helper::jsonResponse(true, '', [
                'conversas' => $payload
            ]);
        } catch (Exception $e) {
            Helper::logError('Get user conversations error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao buscar conversas', [], 500);
        }
    }

    /**
     * Buscar mensagens de uma conversa
     */
    public function getMensagens($conversaId) {
        try {
            $user = AuthMiddleware::required();
            $conversaId = (int)$conversaId;

            $conversation = $this->getConversation($conversaId);
            if (!$conversation) {
                echo Helper::jsonResponse(false, 'Conversa não encontrada', [], 404);
                return;
            }

            if (!$this->isParticipant($conversaId, $user['id'])) {
                echo Helper::jsonResponse(false, 'Você não participa desta conversa', [], 403);
                return;
            }

            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(max((int)($_GET['limit'] ?? 50), 10), 200);
            $offset = ($page - 1) * $limit;

            $participantsMap = $this->getParticipantsMap([$conversaId]);
            $participants = $participantsMap[$conversaId] ?? [];

            $messages = $this->db->fetchAll(
                'SELECT m.*, u.nome as autor, u.username, u.avatar_url
                 FROM mensagens m
                 INNER JOIN usuarios u ON m.usuario_id = u.id
                 WHERE m.conversa_id = ?
                 ORDER BY m.id ASC
                 LIMIT ? OFFSET ?',
                [$conversaId, $limit, $offset]
            );

            $formatted = array_map(fn($row) => $this->formatMessage($row, $user['id'], $participants), $messages);

            $total = $this->db->fetch(
                'SELECT COUNT(*) as total FROM mensagens WHERE conversa_id = ?',
                [$conversaId]
            );

            // Atualizar último visto para o usuário
            $this->db->execute(
                'UPDATE conversa_participantes SET ultimo_visto_em = NOW() WHERE conversa_id = ? AND usuario_id = ?',
                [$conversaId, $user['id']]
            );

            // Sincronizar informação local
            $now = date('Y-m-d H:i:s');
            foreach ($participants as &$participant) {
                if ((int)$participant['id'] === (int)$user['id']) {
                    $participant['ultimo_visto_em'] = $now;
                }
            }
            unset($participant);

            // Marcar mensagens recebidas como lidas para próximas consultas
            try {
                $this->db->execute(
                    'UPDATE mensagens SET lida = 1, lida_em = NOW() WHERE conversa_id = ? AND usuario_id != ? AND lida = 0',
                    [$conversaId, $user['id']]
                );
            } catch (Exception $e) {
                // Column lida_em pode não existir em alguns ambientes legacy
                $this->db->execute(
                    'UPDATE mensagens SET lida = 1 WHERE conversa_id = ? AND usuario_id != ? AND lida = 0',
                    [$conversaId, $user['id']]
                );
            }

            try {
                $this->db->execute(
                    'UPDATE mensagens SET recebida_em = IF(recebida_em IS NULL, NOW(), recebida_em) WHERE conversa_id = ? AND usuario_id != ?',
                    [$conversaId, $user['id']]
                );
            } catch (Exception $e) {
                // Silenciar se coluna não existe
            }

            echo Helper::jsonResponse(true, '', [
                'conversation' => $this->formatConversationDetails($conversation, $user['id'], $participants),
                'mensagens' => $formatted,
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => $limit > 0 ? ceil(($total['total'] ?? 0) / $limit) : 1,
                    'total' => (int)($total['total'] ?? 0)
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Get messages error: ' . $e->getMessage(), ['conversa_id' => $conversaId ?? null]);
            echo Helper::jsonResponse(false, 'Erro ao buscar mensagens', [], 500);
        }
    }

    /**
     * Enviar nova mensagem na conversa
     */
    public function enviarMensagem($conversaId) {
        try {
            $user = AuthMiddleware::required();
            $conversaId = (int)$conversaId;

            $conversation = $this->getConversation($conversaId);
            if (!$conversation) {
                echo Helper::jsonResponse(false, 'Conversa não encontrada', [], 404);
                return;
            }

            if (!$this->isParticipant($conversaId, $user['id'])) {
                echo Helper::jsonResponse(false, 'Você não participa desta conversa', [], 403);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || empty(trim($data['conteudo'] ?? ''))) {
                echo Helper::jsonResponse(false, 'Conteúdo obrigatório', [], 400);
                return;
            }

            $conteudo = Helper::sanitizeString($data['conteudo']);
            $tipo = $data['tipo'] ?? 'texto';
            $metadata = isset($data['metadata']) ? json_encode($data['metadata'], JSON_UNESCAPED_UNICODE) : null;
            $replyTo = isset($data['reply_to_id']) ? (int)$data['reply_to_id'] : null;

            $mensagemId = $this->db->insert(
                'INSERT INTO mensagens (conversa_id, usuario_id, conteudo, tipo, metadata, reply_to_id, lida) VALUES (?, ?, ?, ?, ?, ?, 0)',
                [$conversaId, $user['id'], $conteudo, $tipo, $metadata, $replyTo]
            );

            $this->db->execute(
                'UPDATE conversas SET ultima_mensagem_id = ?, ultima_mensagem_em = NOW() WHERE id = ?',
                [$mensagemId, $conversaId]
            );

            // Atualizar visualização do remetente
            $this->db->execute(
                'UPDATE conversa_participantes SET ultimo_visto_em = NOW() WHERE conversa_id = ? AND usuario_id = ?',
                [$conversaId, $user['id']]
            );

            // Buscar mensagem criada
            $mensagem = $this->db->fetch(
                'SELECT m.*, u.nome as autor, u.username, u.avatar_url
                 FROM mensagens m
                 INNER JOIN usuarios u ON m.usuario_id = u.id
                 WHERE m.id = ?',
                [$mensagemId]
            );

            $participantsMap = $this->getParticipantsMap([$conversaId]);
            $participants = $participantsMap[$conversaId] ?? [];

            $this->notifyParticipants($conversaId, $user['id'], $mensagemId, $conteudo);

            echo Helper::jsonResponse(true, 'Mensagem enviada', [
                'mensagem' => $this->formatMessage($mensagem, $user['id'], $participants)
            ], 201);
        } catch (Exception $e) {
            Helper::logError('Send message error: ' . $e->getMessage(), ['conversa_id' => $conversaId ?? null]);
            echo Helper::jsonResponse(false, 'Erro ao enviar mensagem', [], 500);
        }
    }

    /**
     * Criar conversa privada ou retornar existente
     */
    public function iniciarConversa($targetUserId) {
        try {
            $user = AuthMiddleware::required();
            $targetUserId = (int)$targetUserId;

            if ($user['id'] === $targetUserId) {
                echo Helper::jsonResponse(false, 'Não é possível conversar consigo mesma', [], 400);
                return;
            }

            $targetUser = $this->db->fetch(
                'SELECT id, nome, username, avatar_url FROM usuarios WHERE id = ?',
                [$targetUserId]
            );

            if (!$targetUser) {
                echo Helper::jsonResponse(false, 'Usuário não encontrado', [], 404);
                return;
            }

            $conversaId = $this->getOrCreatePrivateConversation($user['id'], $targetUserId);
            $mensagensResponse = $this->db->fetchAll(
                'SELECT m.*, u.nome as autor, u.username, u.avatar_url
                 FROM mensagens m
                 INNER JOIN usuarios u ON m.usuario_id = u.id
                 WHERE m.conversa_id = ?
                 ORDER BY m.id ASC
                 LIMIT 100',
                [$conversaId]
            );

            $participantsMap = $this->getParticipantsMap([$conversaId]);
            $participants = $participantsMap[$conversaId] ?? [];

            $formattedMessages = array_map(fn($row) => $this->formatMessage($row, $user['id'], $participants), $mensagensResponse);

            echo Helper::jsonResponse(true, 'Conversa iniciada', [
                'conversa_id' => $conversaId,
                'usuario' => Helper::formatUser($targetUser),
                'mensagens' => $formattedMessages
            ]);
        } catch (Exception $e) {
            Helper::logError('Start conversation error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao iniciar conversa', [], 500);
        }
    }

    /**
     * Criar um grupo de mensagens
     */
    public function createGrupo() {
        try {
            $user = AuthMiddleware::required();
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data || empty(trim($data['nome'] ?? ''))) {
                echo Helper::jsonResponse(false, 'Nome do grupo é obrigatório', [], 400);
                return;
            }

            $participantes = array_unique(array_map('intval', $data['participantes'] ?? []));
            $participantes = array_values(array_filter($participantes, fn($id) => $id !== $user['id']));

            $pdo = $this->db->getConnection();
            $pdo->beginTransaction();

            $conversaId = $this->db->insert(
                'INSERT INTO conversas (tipo, nome, descricao, imagem, privacidade, criador_id, ultima_mensagem_em) VALUES ("grupo", ?, ?, ?, ?, ?, NOW())',
                [
                    Helper::sanitizeString($data['nome']),
                    Helper::sanitizeString($data['descricao'] ?? ''),
                    Helper::sanitizeString($data['imagem'] ?? ''),
                    $data['privacidade'] ?? 'privada',
                    $user['id']
                ]
            );

            $this->db->insert(
                'INSERT INTO conversa_participantes (conversa_id, usuario_id, papel, status, joined_at) VALUES (?, ?, "owner", "ativo", NOW())',
                [$conversaId, $user['id']]
            );

            foreach ($participantes as $participanteId) {
                $this->db->insert(
                    'INSERT INTO conversa_participantes (conversa_id, usuario_id, papel, status, joined_at) VALUES (?, ?, "member", "ativo", NOW())',
                    [$conversaId, $participanteId]
                );
            }

            $pdo->commit();

            echo Helper::jsonResponse(true, 'Grupo criado com sucesso', [
                'conversa_id' => $conversaId
            ], 201);
        } catch (Exception $e) {
            if ($this->db->getConnection()->inTransaction()) {
                $this->db->getConnection()->rollBack();
            }
            Helper::logError('Create group conversation error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao criar grupo', [], 500);
        }
    }

    /**
     * Atualizar informações do grupo
     */
    public function updateGrupo($conversaId) {
        try {
            $user = AuthMiddleware::required();
            $conversaId = (int)$conversaId;

            $conversation = $this->getConversation($conversaId);
            if (!$conversation || $conversation['tipo'] !== 'grupo') {
                echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
                return;
            }

            if ((int)$conversation['criador_id'] !== (int)$user['id']) {
                echo Helper::jsonResponse(false, 'Somente a criadora pode editar o grupo', [], 403);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }

            $updates = [];
            $params = [];

            if (isset($data['nome'])) {
                $updates[] = 'nome = ?';
                $params[] = Helper::sanitizeString($data['nome']);
            }
            if (isset($data['descricao'])) {
                $updates[] = 'descricao = ?';
                $params[] = Helper::sanitizeString($data['descricao']);
            }
            if (isset($data['imagem'])) {
                $updates[] = 'imagem = ?';
                $params[] = Helper::sanitizeString($data['imagem']);
            }
            if (isset($data['privacidade'])) {
                $updates[] = 'privacidade = ?';
                $params[] = $data['privacidade'];
            }

            if (empty($updates)) {
                echo Helper::jsonResponse(false, 'Nenhum campo para atualizar', [], 400);
                return;
            }

            $params[] = $conversaId;
            $this->db->execute('UPDATE conversas SET ' . implode(', ', $updates) . ' WHERE id = ?', $params);

            echo Helper::jsonResponse(true, 'Grupo atualizado com sucesso');
        } catch (Exception $e) {
            Helper::logError('Update group error: ' . $e->getMessage(), ['conversa_id' => $conversaId ?? null]);
            echo Helper::jsonResponse(false, 'Erro ao atualizar grupo', [], 500);
        }
    }

    /**
     * Adicionar participante ao grupo
     */
    public function addParticipante($conversaId) {
        try {
            $user = AuthMiddleware::required();
            $conversaId = (int)$conversaId;

            $conversation = $this->getConversation($conversaId);
            if (!$conversation || $conversation['tipo'] !== 'grupo') {
                echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
                return;
            }

            if ((int)$conversation['criador_id'] !== (int)$user['id']) {
                echo Helper::jsonResponse(false, 'Somente a criadora pode adicionar participantes', [], 403);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $novoParticipante = (int)($data['usuario_id'] ?? 0);
            if ($novoParticipante <= 0) {
                echo Helper::jsonResponse(false, 'Usuário inválido', [], 400);
                return;
            }

            $this->db->insert(
                'INSERT INTO conversa_participantes (conversa_id, usuario_id, papel, status, joined_at) VALUES (?, ?, "member", "ativo", NOW())
                 ON DUPLICATE KEY UPDATE status = "ativo", joined_at = joined_at',
                [$conversaId, $novoParticipante]
            );

            echo Helper::jsonResponse(true, 'Participante adicionado');
        } catch (Exception $e) {
            Helper::logError('Add participant error: ' . $e->getMessage(), ['conversa_id' => $conversaId ?? null]);
            echo Helper::jsonResponse(false, 'Erro ao adicionar participante', [], 500);
        }
    }

    /**
     * Remover participante do grupo
     */
    public function removerParticipante($conversaId, $participanteId) {
        try {
            $user = AuthMiddleware::required();
            $conversaId = (int)$conversaId;
            $participanteId = (int)$participanteId;

            $conversation = $this->getConversation($conversaId);
            if (!$conversation || $conversation['tipo'] !== 'grupo') {
                echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
                return;
            }

            if ((int)$conversation['criador_id'] !== (int)$user['id'] && $participanteId !== $user['id']) {
                echo Helper::jsonResponse(false, 'Sem permissão para remover participantes', [], 403);
                return;
            }

            $this->db->execute(
                'DELETE FROM conversa_participantes WHERE conversa_id = ? AND usuario_id = ?',
                [$conversaId, $participanteId]
            );

            echo Helper::jsonResponse(true, 'Participante removido');
        } catch (Exception $e) {
            Helper::logError('Remove participant error: ' . $e->getMessage(), ['conversa_id' => $conversaId ?? null]);
            echo Helper::jsonResponse(false, 'Erro ao remover participante', [], 500);
        }
    }

    /**
     * Sair de um grupo
     */
    public function sairGrupo($conversaId) {
        try {
            $user = AuthMiddleware::required();
            $conversaId = (int)$conversaId;

            $conversation = $this->getConversation($conversaId);
            if (!$conversation || $conversation['tipo'] !== 'grupo') {
                echo Helper::jsonResponse(false, 'Grupo não encontrado', [], 404);
                return;
            }

            if ((int)$conversation['criador_id'] === (int)$user['id']) {
                echo Helper::jsonResponse(false, 'A criadora não pode sair do grupo. Transfira a posse antes.', [], 400);
                return;
            }

            $this->db->execute(
                'DELETE FROM conversa_participantes WHERE conversa_id = ? AND usuario_id = ?',
                [$conversaId, $user['id']]
            );

            echo Helper::jsonResponse(true, 'Você saiu do grupo');
        } catch (Exception $e) {
            Helper::logError('Leave group error: ' . $e->getMessage(), ['conversa_id' => $conversaId ?? null]);
            echo Helper::jsonResponse(false, 'Erro ao sair do grupo', [], 500);
        }
    }

    /**
     * Resumo de não lidas para badge
     */
    public function unreadSummary() {
        try {
            $user = AuthMiddleware::required();

            $summary = $this->db->fetch(
                'SELECT COUNT(1) as total_conversas,
                        COALESCE(SUM(
                            CASE
                                WHEN mensagens_novas > 0 THEN 1
                                ELSE 0
                            END
                        ), 0) as conversas_com_novas,
                        COALESCE(SUM(mensagens_novas), 0) as total_mensagens
                 FROM (
                    SELECT c.id,
                           (
                               SELECT COUNT(*) FROM mensagens m
                               WHERE m.conversa_id = c.id
                                 AND m.usuario_id != cp.usuario_id
                                 AND m.enviada_em > IFNULL(cp.ultimo_visto_em, \'1970-01-01\')
                           ) as mensagens_novas
                    FROM conversa_participantes cp
                    INNER JOIN conversas c ON cp.conversa_id = c.id
                    WHERE cp.usuario_id = ?
                 ) t',
                [$user['id']]
            );

            echo Helper::jsonResponse(true, '', [
                'summary' => [
                    'total_conversas' => (int)($summary['total_conversas'] ?? 0),
                    'conversas_com_novas' => (int)($summary['conversas_com_novas'] ?? 0),
                    'total_mensagens' => (int)($summary['total_mensagens'] ?? 0)
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Unread summary error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao buscar resumo de mensagens', [], 500);
        }
    }

    /**
     * Helpers privates
     */
    private function getConversation(int $conversaId) {
        return $this->db->fetch('SELECT * FROM conversas WHERE id = ?', [$conversaId]);
    }

    private function isParticipant(int $conversaId, int $userId): bool {
        $row = $this->db->fetch(
            'SELECT id FROM conversa_participantes WHERE conversa_id = ? AND usuario_id = ? AND status = "ativo"',
            [$conversaId, $userId]
        );
        return (bool)$row;
    }

    private function getOrCreatePrivateConversation(int $userId1, int $userId2): int {
        $existing = $this->db->fetch(
            'SELECT c.id
             FROM conversas c
             INNER JOIN conversa_participantes cp1 ON c.id = cp1.conversa_id AND cp1.usuario_id = ?
             INNER JOIN conversa_participantes cp2 ON c.id = cp2.conversa_id AND cp2.usuario_id = ?
             WHERE c.tipo = "privada"',
            [$userId1, $userId2]
        );

        if ($existing) {
            return (int)$existing['id'];
        }

        $pdo = $this->db->getConnection();
        $pdo->beginTransaction();

        $conversaId = $this->db->insert(
            'INSERT INTO conversas (tipo, nome, privacidade, criador_id, ultima_mensagem_em) VALUES ("privada", NULL, "privada", ?, NOW())',
            [$userId1]
        );

        $this->db->insert(
            'INSERT INTO conversa_participantes (conversa_id, usuario_id, papel, status, joined_at) VALUES (?, ?, "member", "ativo", NOW())',
            [$conversaId, $userId1]
        );
        $this->db->insert(
            'INSERT INTO conversa_participantes (conversa_id, usuario_id, papel, status, joined_at) VALUES (?, ?, "member", "ativo", NOW())',
            [$conversaId, $userId2]
        );

        $pdo->commit();

        return (int)$conversaId;
    }

    private function formatMessage(array $row, int $currentUserId, array $participants = []): array {
        $metadata = $row['metadata'] ?? null;
        if (is_string($metadata)) {
            $decoded = json_decode($metadata, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $metadata = $decoded;
            }
        }

    $replyTo = $row['reply_to_id'] ?? null;
    $isMine = (int)($row['usuario_id'] ?? 0) === $currentUserId;
    $isRead = false;
    $isRead = $this->inferMessageReadState($row, $currentUserId, $participants, $isMine);

        return [
            'id' => (int)$row['id'],
            'conversa_id' => (int)$row['conversa_id'],
            'usuario_id' => (int)$row['usuario_id'],
            'conteudo' => $row['conteudo'],
            'tipo' => $row['tipo'] ?? 'texto',
            'metadata' => $metadata,
            'reply_to_id' => $replyTo ? (int)$replyTo : null,
            'anexo' => $row['anexo'] ?? null,
            'lida' => $isRead,
            'enviada_em' => $row['enviada_em'],
            'autor' => [
                'id' => (int)$row['usuario_id'],
                'nome' => $row['autor'] ?? ($row['autor_nome'] ?? ''),
                'username' => $row['username'] ?? ($row['autor_username'] ?? ''),
                'avatar_url' => $row['avatar_url'] ?? ($row['autor_avatar_url'] ?? null)
            ],
            'isMine' => $isMine,
            'status' => $this->buildMessageStatus($row, $currentUserId, $participants, $isRead),
            'is_unread' => !$isMine && !$isRead
        ];
    }

    private function buildMessageStatus(array $row, int $currentUserId, array $participants, bool $isRead): array {
        $messageTime = $row['enviada_em'] ?? null;
        $status = [
            'key' => 'sent',
            'label' => 'Enviada',
            'timestamp' => $messageTime,
            'read_by' => []
        ];

        $isMine = (int)($row['usuario_id'] ?? 0) === $currentUserId;
        if ($isMine) {
            $others = array_values(array_filter($participants, fn($p) => (int)$p['id'] !== $currentUserId));
            if (empty($others)) {
                return $status;
            }

            $delivered = false;
            $readers = [];

            foreach ($others as $participant) {
                $lastSeen = $participant['ultimo_visto_em'] ?? null;
                if ($lastSeen && $messageTime && $lastSeen >= $messageTime) {
                    $readers[] = [
                        'id' => $participant['id'],
                        'nome' => $participant['nome'],
                        'username' => $participant['username'],
                        'avatar_url' => $participant['avatar_url'],
                        'timestamp' => $lastSeen
                    ];
                }

                if (!$delivered) {
                    $delivered = !empty($participant['ultimo_visto_em']) || !empty($participant['joined_at']);
                }
            }

            if (!empty($readers)) {
                $status['key'] = 'read';
                $status['label'] = 'Lida';
                $status['timestamp'] = max(array_map(fn($reader) => $reader['timestamp'], $readers));
                $status['read_by'] = $readers;
            } elseif ($delivered) {
                $status['key'] = 'delivered';
                $status['label'] = 'Entregue';
            }

            return $status;
        }

        $status['key'] = $isRead ? 'seen' : 'received';
        $status['label'] = $isRead ? 'Visualizada' : 'Recebida';
        $status['timestamp'] = $isRead
            ? ($row['lida_em'] ?? $messageTime)
            : ($row['recebida_em'] ?? $messageTime);

        return $status;
    }

    private function inferMessageReadState(array $row, int $currentUserId, array $participants, bool $isMine): bool {
        if (array_key_exists('lida', $row)) {
            return (bool)$row['lida'];
        }

        $messageTime = $row['enviada_em'] ?? null;
        if (!$messageTime) {
            return false;
        }

        if ($isMine) {
            foreach ($participants as $participant) {
                if ((int)$participant['id'] === $currentUserId) {
                    continue;
                }
                $lastSeen = $participant['ultimo_visto_em'] ?? null;
                if ($lastSeen && $lastSeen >= $messageTime) {
                    return true;
                }
            }
            return false;
        }

        foreach ($participants as $participant) {
            if ((int)$participant['id'] === $currentUserId) {
                $lastSeen = $participant['ultimo_visto_em'] ?? null;
                return $lastSeen && $lastSeen >= $messageTime;
            }
        }

        return false;
    }

    private function formatConversationDetails(array $conversation, int $currentUserId, array $preloadedParticipants = null): array {
        if ($preloadedParticipants === null) {
            $participantsMap = $this->getParticipantsMap([$conversation['id']]);
            $participantList = $participantsMap[$conversation['id']] ?? [];
        } else {
            $participantList = $preloadedParticipants;
        }
        $otherParticipants = array_values(array_filter($participantList, fn($p) => (int)$p['id'] !== $currentUserId));
        $primaryOther = $otherParticipants[0] ?? null;

        return [
            'id' => (int)$conversation['id'],
            'tipo' => $conversation['tipo'],
            'nome' => $conversation['tipo'] === 'privada' && $primaryOther
                ? $primaryOther['nome']
                : ($conversation['nome'] ?? 'Conversa'),
            'descricao' => $conversation['descricao'],
            'imagem' => $conversation['imagem'],
            'privacidade' => $conversation['privacidade'],
            'avatar_url' => $conversation['tipo'] === 'privada'
                ? ($primaryOther['avatar_url'] ?? null)
                : ($conversation['imagem'] ?? null),
            'participantes' => $participantList,
            'outro_usuario' => $primaryOther
        ];
    }

    private function getParticipantsMap(array $conversationIds): array {
        if (empty($conversationIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($conversationIds), '?'));
        $rows = $this->db->fetchAll(
            "SELECT cp.conversa_id, u.id, u.nome, u.username, u.avatar_url, cp.papel, cp.status,\n                    cp.joined_at, cp.ultimo_visto_em, cp.silenciado, cp.favorito\n             FROM conversa_participantes cp\n             INNER JOIN usuarios u ON cp.usuario_id = u.id\n             WHERE cp.conversa_id IN ({$placeholders})",
            $conversationIds
        );

        $map = [];
        foreach ($rows as $row) {
            $map[$row['conversa_id']][] = [
                'id' => (int)$row['id'],
                'nome' => $row['nome'],
                'username' => $row['username'],
                'avatar_url' => $row['avatar_url'],
                'papel' => $row['papel'] ?? null,
                'status' => $row['status'] ?? null,
                'joined_at' => $row['joined_at'] ?? null,
                'ultimo_visto_em' => $row['ultimo_visto_em'] ?? null,
                'silenciado' => isset($row['silenciado']) ? (bool)$row['silenciado'] : false,
                'favorito' => isset($row['favorito']) ? (bool)$row['favorito'] : false
            ];
        }

        return $map;
    }

    private function notifyParticipants(int $conversaId, int $senderId, int $mensagemId, string $conteudoPreview): void {
        $participants = $this->db->fetchAll(
            'SELECT usuario_id FROM conversa_participantes WHERE conversa_id = ? AND status = "ativo" AND usuario_id != ?',
            [$conversaId, $senderId]
        );

        $preview = mb_substr($conteudoPreview, 0, 120);
        foreach ($participants as $participant) {
            NotificationController::createNotification(
                (int)$participant['usuario_id'],
                $senderId,
                'message',
                null,
                null,
                $preview,
                $conversaId,
                'mensagem',
                [
                    'mensagem_id' => $mensagemId,
                    'preview' => $preview
                ]
            );
        }
    }
}
