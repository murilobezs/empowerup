<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include_once '../db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT 
                id,
                nome,
                descricao,
                categoria,
                membros,
                imagem,
                ativo,
                CASE
                    WHEN TIMESTAMPDIFF(MINUTE, ultima_atividade, NOW()) < 60 
                    THEN CONCAT(TIMESTAMPDIFF(MINUTE, ultima_atividade, NOW()), ' min atrás')
                    ELSE CONCAT(TIMESTAMPDIFF(HOUR, ultima_atividade, NOW()), ' horas atrás')
                END as ultima_atividade
                FROM grupos 
                ORDER BY ultima_atividade DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($grupos);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'));
        
        $sql = "INSERT INTO grupos (nome, descricao, categoria, membros, imagem, ativo) 
                VALUES (:nome, :descricao, :categoria, :membros, :imagem, :ativo)";
        
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam(':nome', $data->nome);
        $stmt->bindParam(':descricao', $data->descricao);
        $stmt->bindParam(':categoria', $data->categoria);
        $stmt->bindParam(':membros', $data->membros);
        $stmt->bindParam(':imagem', $data->imagem);
        $stmt->bindParam(':ativo', $data->ativo);
        
        if($stmt->execute()) {
            $grupo = [
                'id' => $db->lastInsertId(),
                'nome' => $data->nome,
                'descricao' => $data->descricao,
                'categoria' => $data->categoria,
                'membros' => $data->membros,
                'imagem' => $data->imagem,
                'ativo' => $data->ativo,
                'ultima_atividade' => 'agora'
            ];
            
            echo json_encode(['success' => true, 'message' => 'Grupo criado com sucesso', 'grupo' => $grupo]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao criar grupo']);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if($id) {
            $sql = "DELETE FROM grupos WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id', $id);
            
            if($stmt->execute()) {
                echo json_encode(['message' => 'Grupo deletado com sucesso']);
            } else {
                echo json_encode(['message' => 'Erro ao deletar grupo']);
            }
        }
        break;
}
?>
