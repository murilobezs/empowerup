<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("../db.php");

try {
    $stmt = $pdo->query("SELECT e.*, u.nome AS organizador FROM events e JOIN users u ON e.organizador_id = u.id");
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($eventos);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao buscar eventos: " . $e->getMessage()]);
}