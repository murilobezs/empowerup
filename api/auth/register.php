<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../db.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Conexão com o banco de dados falhou");
    }

    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        throw new Exception("Dados inválidos");
    }

    if (
        empty($data->nome) ||
        empty($data->email) ||
        empty($data->senha) ||
        empty($data->tipo)
    ) {
        throw new Exception("Dados incompletos");
    }

    // Verificar se email já existe
    $check_query = "SELECT id FROM usuarios WHERE email = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindValue(1, $data->email);
    $check_stmt->execute();
    
    if ($check_stmt->fetch()) {
        throw new Exception("Email já cadastrado");
    }

    $query = "INSERT INTO usuarios (nome, email, senha, telefone, bio, tipo) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);

    if (!$stmt) {
        throw new Exception("Erro ao preparar a query");
    }

    $senha_hash = password_hash($data->senha, PASSWORD_DEFAULT);

    $stmt->bindValue(1, $data->nome);
    $stmt->bindValue(2, $data->email);
    $stmt->bindValue(3, $senha_hash);
    $stmt->bindValue(4, $data->telefone ?? '');
    $stmt->bindValue(5, $data->bio ?? '');
    $stmt->bindValue(6, $data->tipo);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array(
            "success" => true,
            "message" => "Usuário criado com sucesso"
        ));
    } else {
        throw new Exception("Erro ao executar a query: " . implode(" ", $stmt->errorInfo()));
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => $e->getMessage()
    ));
}
?>
