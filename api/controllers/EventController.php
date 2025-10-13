<?php
/**
 * Controlador de Eventos
 */

class EventController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Listar eventos
     */
    public function getEvents() {
        try {
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 12);
            $offset = ($page - 1) * $limit;
            $tipo = $_GET['tipo'] ?? null;
            $status = $_GET['status'] ?? 'ativo';
            $futuro = $_GET['futuro'] ?? 'true'; // Apenas eventos futuros por padrão
            $period = strtolower($_GET['period'] ?? '');
            
            $currentUser = AuthMiddleware::optional();
            $currentUserId = $currentUser ? $currentUser['id'] : null;
            
            // Query base
            $query = "
                SELECT e.*, 
                       u.nome as criador_nome,
                       u.username as criador_username,
                       (SELECT COUNT(*) FROM evento_inscricoes ei WHERE ei.evento_id = e.id AND ei.status = 'confirmada') as inscricoes_confirmadas,
                       (SELECT COUNT(*) FROM evento_inscricoes ei WHERE ei.evento_id = e.id AND ei.status = 'lista_espera') as lista_espera
            ";

            if ($currentUserId) {
                $query .= ",
                       (
                           SELECT ei.status
                           FROM evento_inscricoes ei
                           WHERE ei.evento_id = e.id AND ei.user_id = ?
                           ORDER BY FIELD(ei.status, 'confirmada', 'lista_espera', 'cancelada', 'pendente'), ei.data_inscricao DESC
                           LIMIT 1
                       ) as inscricao_status,
                       (
                           SELECT ei.data_inscricao
                           FROM evento_inscricoes ei
                           WHERE ei.evento_id = e.id AND ei.user_id = ?
                           ORDER BY ei.data_inscricao DESC
                           LIMIT 1
                       ) as inscricao_data
                ";
            } else {
                $query .= ", NULL as inscricao_status, NULL as inscricao_data";
            }

            $query .= "
                FROM eventos e
                INNER JOIN usuarios u ON e.criado_por = u.id
            ";

            $conditions = [];
            $params = [];

            if ($currentUserId) {
                $params[] = $currentUserId;
                $params[] = $currentUserId;
            }

            if ($status) {
                $conditions[] = 'e.status = ?';
                $params[] = $status;
            }

            if ($tipo) {
                $conditions[] = 'e.tipo = ?';
                $params[] = $tipo;
            }

            $applyUpcomingFilter = true;
            if ($period === 'past') {
                $applyUpcomingFilter = false;
                $conditions[] = 'e.data_evento < NOW()';
            } elseif ($period === 'all') {
                $applyUpcomingFilter = false;
            } elseif ($period === 'upcoming') {
                $applyUpcomingFilter = true;
            } elseif ($futuro === 'false') {
                $applyUpcomingFilter = false;
            }

            if ($applyUpcomingFilter) {
                $conditions[] = '(
                    DATE(e.data_evento) >= CURDATE()
                    OR (
                        e.data_fim IS NOT NULL
                        AND DATE(e.data_fim) >= CURDATE()
                    )
                )';
            }

            if (!empty($conditions)) {
                $query .= ' WHERE ' . implode(' AND ', $conditions);
            }

            $query .= ' ORDER BY e.data_evento ASC LIMIT ? OFFSET ?';
            $params[] = $limit;
            $params[] = $offset;

            $events = $this->db->fetchAll($query, $params);
            
            // Buscar total
            $countQuery = 'SELECT COUNT(*) as total FROM eventos e';
            $countParams = [];
            $countConditions = [];

            if ($status) {
                $countConditions[] = 'status = ?';
                $countParams[] = $status;
            }

            if ($tipo) {
                $countConditions[] = 'tipo = ?';
                $countParams[] = $tipo;
            }

            $applyUpcomingCount = $applyUpcomingFilter;
            if ($period === 'past') {
                $applyUpcomingCount = false;
                $countConditions[] = 'data_evento < NOW()';
            } elseif ($period === 'all') {
                $applyUpcomingCount = false;
            } elseif ($period === 'upcoming') {
                $applyUpcomingCount = true;
            } elseif ($futuro === 'false') {
                $applyUpcomingCount = false;
            }

            if ($applyUpcomingCount) {
                $countConditions[] = '(
                    DATE(data_evento) >= CURDATE()
                    OR (
                        data_fim IS NOT NULL
                        AND DATE(data_fim) >= CURDATE()
                    )
                )';
            }

            if (!empty($countConditions)) {
                $countQuery .= ' WHERE ' . implode(' AND ', $countConditions);
            }
            
            $totalResult = $this->db->fetch($countQuery, $countParams);
            $total = $totalResult['total'];
            
            // Formatar eventos
            $formattedEvents = array_map(function($event) {
                $inscricaoStatus = $event['inscricao_status'] ?? null;
                $inscricaoData = $event['inscricao_data'] ?? null;
                $inscrito = !empty($inscricaoStatus);
                $participou = false;

                if ($inscrito && $inscricaoStatus === 'confirmada') {
                    try {
                        $eventDate = new DateTime($event['data_evento']);
                        $now = new DateTime();
                        $participou = $eventDate < $now;
                    } catch (Exception $ignore) {
                        $participou = false;
                    }
                }

                return [
                    'id' => (int)$event['id'],
                    'titulo' => $event['titulo'],
                    'descricao' => $event['descricao'],
                    'tipo' => $event['tipo'],
                    'data_evento' => $event['data_evento'],
                    'data_fim' => $event['data_fim'],
                    'local' => $event['local'],
                    'endereco' => $event['endereco'],
                    'capacidade_maxima' => (int)$event['capacidade_maxima'],
                    'valor' => (float)$event['valor'],
                    'eh_gratuito' => (bool)$event['eh_gratuito'],
                    'instrutor_nome' => $event['instrutor_nome'],
                    'instrutor_bio' => $event['instrutor_bio'],
                    'instrutor_foto' => $event['instrutor_foto'],
                    'requisitos' => $event['requisitos'],
                    'material_necessario' => $event['material_necessario'],
                    'certificado' => (bool)$event['certificado'],
                    'status' => $event['status'],
                    'imagem_url' => $event['imagem_url'],
                    'link_online' => $event['link_online'],
                    'eh_online' => (bool)$event['eh_online'],
                    'inscricoes_confirmadas' => (int)$event['inscricoes_confirmadas'],
                    'lista_espera' => (int)$event['lista_espera'],
                    'inscrito' => $inscrito,
                    'inscricao_status' => $inscricaoStatus,
                    'inscricao_data' => $inscricaoData,
                    'participou' => $participou,
                    'vagas_disponiveis' => max(0, (int)$event['capacidade_maxima'] - (int)$event['inscricoes_confirmadas']),
                    'criador' => [
                        'nome' => $event['criador_nome'],
                        'username' => $event['criador_username']
                    ],
                    'created_at' => $event['created_at']
                ];
            }, $events);
            
            echo Helper::jsonResponse(true, '', [
                'events' => $formattedEvents,
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($total / $limit),
                    'totalEvents' => (int)$total,
                    'hasNextPage' => ($page * $limit) < $total,
                    'hasPrevPage' => $page > 1
                ]
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Get events error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao buscar eventos', [], 500);
        }
    }
    
    /**
     * Criar evento (apenas admin)
     */
    public function createEvent() {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se é admin
            if (!$user['is_admin']) {
                echo Helper::jsonResponse(false, 'Acesso negado. Apenas administradores podem criar eventos.', [], 403);
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }
            
            // Validar dados obrigatórios
            $validator = new Validator($data);
            $validator
                ->required('titulo', 'Título é obrigatório')
                ->required('tipo', 'Tipo de evento é obrigatório')
                ->required('data_evento', 'Data do evento é obrigatória')
                ->max('titulo', 255, 'Título deve ter no máximo 255 caracteres')
                ->in('tipo', ['workshop', 'palestra', 'curso', 'meetup', 'networking'], 'Tipo de evento inválido');
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            // Inserir evento
            $eventId = $this->db->insert(
                'INSERT INTO eventos (
                    titulo, descricao, tipo, data_evento, data_fim, local, endereco,
                    capacidade_maxima, valor, eh_gratuito, instrutor_nome, instrutor_bio,
                    instrutor_foto, requisitos, material_necessario, certificado,
                    imagem_url, link_online, eh_online, criado_por
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    Helper::sanitizeString($data['titulo']),
                    Helper::sanitizeString($data['descricao'] ?? ''),
                    $data['tipo'],
                    $data['data_evento'],
                    $data['data_fim'] ?? null,
                    Helper::sanitizeString($data['local'] ?? ''),
                    Helper::sanitizeString($data['endereco'] ?? ''),
                    intval($data['capacidade_maxima'] ?? 50),
                    floatval($data['valor'] ?? 0.00),
                    (bool)($data['eh_gratuito'] ?? true),
                    Helper::sanitizeString($data['instrutor_nome'] ?? ''),
                    Helper::sanitizeString($data['instrutor_bio'] ?? ''),
                    Helper::sanitizeString($data['instrutor_foto'] ?? ''),
                    Helper::sanitizeString($data['requisitos'] ?? ''),
                    Helper::sanitizeString($data['material_necessario'] ?? ''),
                    (bool)($data['certificado'] ?? false),
                    Helper::sanitizeString($data['imagem_url'] ?? ''),
                    Helper::sanitizeString($data['link_online'] ?? ''),
                    (bool)($data['eh_online'] ?? false),
                    $user['id']
                ]
            );
            
            // Buscar evento criado
            $newEvent = $this->db->fetch(
                'SELECT e.*, u.nome as criador_nome, u.username as criador_username
                 FROM eventos e
                 INNER JOIN usuarios u ON e.criado_por = u.id
                 WHERE e.id = ?',
                [$eventId]
            );
            
            echo Helper::jsonResponse(true, 'Evento criado com sucesso!', [
                'event' => $this->formatEvent($newEvent)
            ], 201);
            
        } catch (Exception $e) {
            Helper::logError('Create event error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao criar evento', [], 500);
        }
    }
    
    /**
     * Inscrever-se em evento
     */
    public function subscribeToEvent($eventId) {
        try {
            $user = AuthMiddleware::required();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo Helper::jsonResponse(false, 'Dados inválidos', [], 400);
                return;
            }
            
            // Verificar se evento existe
            $event = $this->db->fetch('SELECT * FROM eventos WHERE id = ? AND status = "ativo"', [$eventId]);
            
            if (!$event) {
                echo Helper::jsonResponse(false, 'Evento não encontrado', [], 404);
                return;
            }
            
            // Verificar se já está inscrito
            $existingSubscription = $this->db->fetch(
                'SELECT * FROM evento_inscricoes WHERE evento_id = ? AND user_id = ?',
                [$eventId, $user['id']]
            );
            
            if ($existingSubscription) {
                echo Helper::jsonResponse(false, 'Você já está inscrito neste evento', [], 400);
                return;
            }
            
            // Verificar vagas disponíveis
            $inscricoes = $this->db->fetch(
                'SELECT COUNT(*) as total FROM evento_inscricoes WHERE evento_id = ? AND status = "confirmada"',
                [$eventId]
            );
            
            $status = 'confirmada';
            if ($inscricoes['total'] >= $event['capacidade_maxima']) {
                $status = 'lista_espera';
            }
            
            // Validar dados da inscrição
            $validator = new Validator($data);
            $validator
                ->required('nome_completo', 'Nome completo é obrigatório')
                ->required('telefone', 'Telefone é obrigatório')
                ->max('nome_completo', 255, 'Nome deve ter no máximo 255 caracteres')
                ->max('telefone', 20, 'Telefone deve ter no máximo 20 caracteres');
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            // Inserir inscrição
            $inscricaoId = $this->db->insert(
                'INSERT INTO evento_inscricoes (evento_id, user_id, nome_completo, telefone, email, observacoes, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    $eventId,
                    $user['id'],
                    Helper::sanitizeString($data['nome_completo']),
                    Helper::sanitizeString($data['telefone']),
                    Helper::sanitizeString($data['email'] ?? $user['email']),
                    Helper::sanitizeString($data['observacoes'] ?? ''),
                    $status
                ]
            );
            
            $message = $status === 'confirmada' ? 
                'Inscrição realizada com sucesso!' : 
                'Evento lotado! Você foi adicionada à lista de espera.';
            
            // Enviar email de confirmação
            try {
                require_once __DIR__ . '/../utils/EmailTemplates.php';
                
                $eventDate = new DateTime($event['data_evento']);
                $emailData = [
                    'user_name' => $user['nome'] ?? Helper::sanitizeString($data['nome_completo']),
                    'event_title' => $event['titulo'],
                    'event_date' => $eventDate->format('d/m/Y'),
                    'event_time' => $eventDate->format('H:i'),
                    'event_location' => $event['eh_online'] ? 'Online' : ($event['local'] ?? 'A definir'),
                    'event_type' => ucfirst($event['tipo']),
                    'is_online' => (bool)$event['eh_online'],
                    'link_online' => $event['link_online'] ?? '',
                    'instrutor' => $event['instrutor_nome'] ?? '',
                    'valor' => $event['valor'] ?? 0,
                    'eh_gratuito' => (bool)$event['eh_gratuito'],
                    'certificado' => (bool)$event['certificado'],
                    'status' => $status
                ];
                
                $emailHtml = EmailTemplates::eventSubscriptionConfirmation($emailData);
                $emailSubject = $status === 'confirmada' 
                    ? '✓ Inscrição Confirmada: ' . $event['titulo']
                    : '⏳ Lista de Espera: ' . $event['titulo'];
                
                Mailer::send(
                    Helper::sanitizeString($data['email'] ?? $user['email']),
                    $emailSubject,
                    $emailHtml
                );
            } catch (Exception $emailError) {
                Helper::logError('Failed to send event confirmation email: ' . $emailError->getMessage());
                // Não falhar a inscrição se o email falhar
            }
            
            echo Helper::jsonResponse(true, $message, [
                'inscricao_id' => $inscricaoId,
                'status' => $status
            ], 201);
            
        } catch (Exception $e) {
            Helper::logError('Subscribe to event error: ' . $e->getMessage(), ['event_id' => $eventId]);
            echo Helper::jsonResponse(false, 'Erro ao realizar inscrição', [], 500);
        }
    }
    
    /**
     * Cancelar inscrição
     */
    public function unsubscribeFromEvent($eventId) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se está inscrito
            $subscription = $this->db->fetch(
                'SELECT * FROM evento_inscricoes WHERE evento_id = ? AND user_id = ?',
                [$eventId, $user['id']]
            );
            
            if (!$subscription) {
                echo Helper::jsonResponse(false, 'Você não está inscrito neste evento', [], 400);
                return;
            }
            
            // Cancelar inscrição
            $this->db->execute(
                'UPDATE evento_inscricoes SET status = "cancelada" WHERE evento_id = ? AND user_id = ?',
                [$eventId, $user['id']]
            );
            
            // Se havia lista de espera, promover o próximo
            if ($subscription['status'] === 'confirmada') {
                $nextInLine = $this->db->fetch(
                    'SELECT * FROM evento_inscricoes 
                     WHERE evento_id = ? AND status = "lista_espera"
                     ORDER BY data_inscricao ASC
                     LIMIT 1',
                    [$eventId]
                );
                
                if ($nextInLine) {
                    $this->db->execute(
                        'UPDATE evento_inscricoes SET status = "confirmada" WHERE id = ?',
                        [$nextInLine['id']]
                    );
                }
            }
            
            echo Helper::jsonResponse(true, 'Inscrição cancelada com sucesso!');
            
        } catch (Exception $e) {
            Helper::logError('Unsubscribe from event error: ' . $e->getMessage(), ['event_id' => $eventId]);
            echo Helper::jsonResponse(false, 'Erro ao cancelar inscrição', [], 500);
        }
    }
    
    /**
     * Formatar evento para resposta
     */
    private function formatEvent($event) {
        return [
            'id' => (int)$event['id'],
            'titulo' => $event['titulo'],
            'descricao' => $event['descricao'],
            'tipo' => $event['tipo'],
            'data_evento' => $event['data_evento'],
            'data_fim' => $event['data_fim'],
            'local' => $event['local'],
            'endereco' => $event['endereco'],
            'capacidade_maxima' => (int)$event['capacidade_maxima'],
            'valor' => (float)$event['valor'],
            'eh_gratuito' => (bool)$event['eh_gratuito'],
            'instrutor_nome' => $event['instrutor_nome'],
            'instrutor_bio' => $event['instrutor_bio'],
            'instrutor_foto' => $event['instrutor_foto'],
            'requisitos' => $event['requisitos'],
            'material_necessario' => $event['material_necessario'],
            'certificado' => (bool)$event['certificado'],
            'status' => $event['status'],
            'imagem_url' => $event['imagem_url'],
            'link_online' => $event['link_online'],
            'eh_online' => (bool)$event['eh_online'],
            'criador' => [
                'nome' => $event['criador_nome'] ?? '',
                'username' => $event['criador_username'] ?? ''
            ],
            'created_at' => $event['created_at']
        ];
    }
    
    /**
     * Buscar evento específico
     */
    public function getEvent($eventId) {
        try {
            $currentUser = AuthMiddleware::optional();
            $currentUserId = $currentUser ? $currentUser['id'] : null;
            
            $query = "
                SELECT e.*, 
                       u.nome as criador_nome,
                       u.username as criador_username,
                       (SELECT COUNT(*) FROM evento_inscricoes ei WHERE ei.evento_id = e.id AND ei.status = 'confirmada') as inscricoes_confirmadas,
                       (SELECT COUNT(*) FROM evento_inscricoes ei WHERE ei.evento_id = e.id AND ei.status = 'lista_espera') as lista_espera
            ";
            
            if ($currentUserId) {
                $query .= ",
                       (SELECT COUNT(*) FROM evento_inscricoes ei WHERE ei.evento_id = e.id AND ei.user_id = ?) as inscrito
                ";
            } else {
                $query .= ", 0 as inscrito";
            }
            
            $query .= "
                FROM eventos e
                INNER JOIN usuarios u ON e.criado_por = u.id
                WHERE e.id = ?
            ";
            
            $params = $currentUserId ? [$currentUserId, $eventId] : [$eventId];
            
            $event = $this->db->fetch($query, $params);
            
            if (!$event) {
                echo Helper::jsonResponse(false, 'Evento não encontrado', [], 404);
                return;
            }
            
            echo Helper::jsonResponse(true, 'Evento encontrado', [
                'event' => $this->formatEvent($event)
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Erro ao buscar evento: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao buscar evento', [], 500);
        }
    }
    
    /**
     * Atualizar evento
     */
    public function updateEvent($eventId) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se é admin ou criador do evento
            $event = $this->db->fetch("SELECT criado_por FROM eventos WHERE id = ?", [$eventId]);
            
            if (!$event) {
                echo Helper::jsonResponse(false, 'Evento não encontrado', [], 404);
                return;
            }
            
            if ($event['criado_por'] != $user['id'] && !$user['is_admin']) {
                echo Helper::jsonResponse(false, 'Sem permissão para editar este evento', [], 403);
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validação
            $validator = new Validator($input);
            $validator
                ->required('titulo', 'Título é obrigatório')
                ->required('tipo', 'Tipo de evento é obrigatório')
                ->required('data_evento', 'Data do evento é obrigatória')
                ->max('titulo', 255, 'Título deve ter no máximo 255 caracteres')
                ->in('tipo', ['workshop', 'palestra', 'curso', 'meetup', 'networking'], 'Tipo de evento inválido');
            
            if ($validator->hasErrors()) {
                echo Helper::jsonResponse(false, 'Dados inválidos', ['errors' => $validator->getErrors()], 400);
                return;
            }
            
            $query = "
                UPDATE eventos SET 
                    titulo = ?, descricao = ?, tipo = ?, data_evento = ?, data_fim = ?,
                    local = ?, endereco = ?, capacidade_maxima = ?, valor = ?, eh_gratuito = ?,
                    instrutor_nome = ?, instrutor_bio = ?, instrutor_foto = ?, requisitos = ?,
                    material_necessario = ?, certificado = ?, imagem_url = ?, link_online = ?,
                    eh_online = ?, updated_at = NOW()
                WHERE id = ?
            ";
            
            $params = [
                Helper::sanitizeString($input['titulo']),
                Helper::sanitizeString($input['descricao'] ?? ''),
                $input['tipo'],
                $input['data_evento'],
                $input['data_fim'] ?? null,
                Helper::sanitizeString($input['local'] ?? ''),
                Helper::sanitizeString($input['endereco'] ?? ''),
                intval($input['capacidade_maxima'] ?? 50),
                floatval($input['valor'] ?? 0),
                (bool)($input['eh_gratuito'] ?? true),
                Helper::sanitizeString($input['instrutor_nome'] ?? ''),
                Helper::sanitizeString($input['instrutor_bio'] ?? ''),
                Helper::sanitizeString($input['instrutor_foto'] ?? ''),
                Helper::sanitizeString($input['requisitos'] ?? ''),
                Helper::sanitizeString($input['material_necessario'] ?? ''),
                (bool)($input['certificado'] ?? false),
                Helper::sanitizeString($input['imagem_url'] ?? ''),
                Helper::sanitizeString($input['link_online'] ?? ''),
                (bool)($input['eh_online'] ?? false),
                $eventId
            ];
            
            if ($this->db->execute($query, $params)) {
                echo Helper::jsonResponse(true, 'Evento atualizado com sucesso');
            } else {
                throw new Exception('Erro ao atualizar evento no banco de dados');
            }
            
        } catch (Exception $e) {
            Helper::logError('Erro ao atualizar evento: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao atualizar evento', [], 500);
        }
    }
    
    /**
     * Excluir evento
     */
    public function deleteEvent($eventId) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se é admin ou criador do evento
            $event = $this->db->fetch("SELECT criado_por FROM eventos WHERE id = ?", [$eventId]);
            
            if (!$event) {
                echo Helper::jsonResponse(false, 'Evento não encontrado', [], 404);
                return;
            }
            
            if ($event['criado_por'] != $user['id'] && !$user['is_admin']) {
                echo Helper::jsonResponse(false, 'Sem permissão para excluir este evento', [], 403);
                return;
            }
            
            // Verificar se há inscrições confirmadas
            $inscricoes = $this->db->fetch("SELECT COUNT(*) as total FROM evento_inscricoes WHERE evento_id = ? AND status = 'confirmada'", [$eventId]);
            
            if ($inscricoes['total'] > 0) {
                echo Helper::jsonResponse(false, 'Não é possível excluir evento com inscrições confirmadas', [], 400);
                return;
            }
            
            // Excluir inscrições primeiro
            $this->db->execute("DELETE FROM evento_inscricoes WHERE evento_id = ?", [$eventId]);
            
            // Excluir evento
            if ($this->db->execute("DELETE FROM eventos WHERE id = ?", [$eventId])) {
                echo Helper::jsonResponse(true, 'Evento excluído com sucesso');
            } else {
                throw new Exception('Erro ao excluir evento do banco de dados');
            }
            
        } catch (Exception $e) {
            Helper::logError('Erro ao excluir evento: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao excluir evento', [], 500);
        }
    }
    
    /**
     * Listar inscrições de um evento (admin)
     */
    public function getEventSubscriptions($eventId) {
        try {
            $user = AuthMiddleware::required();
            
            // Verificar se é admin ou criador do evento
            $event = $this->db->fetch("SELECT criado_por FROM eventos WHERE id = ?", [$eventId]);
            
            if (!$event) {
                echo Helper::jsonResponse(false, 'Evento não encontrado', [], 404);
                return;
            }
            
            if ($event['criado_por'] != $user['id'] && !$user['is_admin']) {
                echo Helper::jsonResponse(false, 'Sem permissão para ver inscrições deste evento', [], 403);
                return;
            }
            
            $query = "
                SELECT ei.*, u.nome as usuario_nome, u.email as usuario_email
                FROM evento_inscricoes ei
                INNER JOIN usuarios u ON ei.user_id = u.id  
                WHERE ei.evento_id = ?
                ORDER BY ei.data_inscricao DESC
            ";
            
            $subscriptions = $this->db->fetchAll($query, [$eventId]);
            
            echo Helper::jsonResponse(true, 'Inscrições encontradas', [
                'subscriptions' => $subscriptions
            ]);
            
        } catch (Exception $e) {
            Helper::logError('Erro ao buscar inscrições: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao buscar inscrições', [], 500);
        }
    }
}
