<?php
/**
 * Controlador de Mensagens
 */
 class MensagensController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Listar mensagens iniciais de uma conversa
    public function getMensagens($conversaId) {
        $user = AuthMiddleware::required();

        $mensagens = $this->db->fetchAll(
            "SELECT m.id, m.conteudo, m.usuario_id, u.nome as autor, m.enviada_em
             FROM mensagens m
             INNER JOIN usuarios u ON m.usuario_id = u.id
             WHERE m.conversa_id = ?
             ORDER BY m.id ASC",
            [$conversaId]
        );

        echo Helper::jsonResponse(true, '', ['mensagens' => $mensagens]);
    }

    // Enviar mensagem
    public function enviarMensagem($conversaId) {
        $user = AuthMiddleware::required();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['conteudo']) || empty(trim($data['conteudo']))) {
            echo Helper::jsonResponse(false, 'Conteúdo obrigatório', [], 400);
            return;
        }

        $conteudo = Helper::sanitizeString($data['conteudo']);

        $mensagemId = $this->db->insert(
            "INSERT INTO mensagens (conversa_id, usuario_id, conteudo) VALUES (?, ?, ?)",
            [$conversaId, $user['id'], $conteudo]
        );

        $mensagem = $this->db->fetch(
            "SELECT m.id, m.conteudo, m.usuario_id, u.nome as autor, m.enviada_em
             FROM mensagens m
             INNER JOIN usuarios u ON m.usuario_id = u.id
             WHERE m.id = ?",
            [$mensagemId]
        );

        echo Helper::jsonResponse(true, 'Mensagem enviada', ['mensagem' => $mensagem], 201);
    }
 }