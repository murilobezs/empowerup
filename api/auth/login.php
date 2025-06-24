<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    include_once '../db.php';

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Conexão com o banco de dados falhou");
    }

    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        throw new Exception("Dados inválidos");
    }

    if (empty($data->email) || empty($data->senha)) {
        throw new Exception("Email e senha são obrigatórios");
    }

    $query = "SELECT id, nome, email, senha, tipo, avatar_url FROM usuarios WHERE email = :email";
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Erro ao preparar a query");
    }

    $stmt->bindParam(':email', $data->email);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar a query");
    }

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$row) {
        throw new Exception("Usuário não encontrado");
    }

    if (!password_verify($data->senha, $row['senha'])) {
        throw new Exception("Senha incorreta");
    }

    unset($row['senha']);
    
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "message" => "Login bem sucedido",
        "user" => $row
    ));

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => $e->getMessage()
    ));
}
?>
