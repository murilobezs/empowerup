<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            // Buscar grupos com paginação
            $stmt = $db->prepare("
                SELECT id, nome, descricao, categoria, membros, imagem, 
                       ativo, ultima_atividade, created_at
                FROM grupos 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset
            ");
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Contar total de grupos
            $stmt = $db->prepare("SELECT COUNT(*) as total FROM grupos");
            $stmt->execute();
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            echo json_encode([
                'success' => true,
                'data' => $grupos,
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            break;
            
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('ID do grupo é obrigatório');
            }
            
            $stmt = $db->prepare("DELETE FROM grupos WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'Grupo removido com sucesso'
            ]);
            break;
            
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? null;
            
            if (!$id) {
                throw new Exception('ID do grupo é obrigatório');
            }
            
            $campos = [];
            $valores = [];
            
            if (isset($input['nome'])) {
                $campos[] = 'nome = :nome';
                $valores[':nome'] = $input['nome'];
            }
            
            if (isset($input['descricao'])) {
                $campos[] = 'descricao = :descricao';
                $valores[':descricao'] = $input['descricao'];
            }
            
            if (isset($input['categoria'])) {
                $campos[] = 'categoria = :categoria';
                $valores[':categoria'] = $input['categoria'];
            }
            
            if (isset($input['ativo'])) {
                $campos[] = 'ativo = :ativo';
                $valores[':ativo'] = $input['ativo'];
            }
            
            if (empty($campos)) {
                throw new Exception('Nenhum campo para atualizar');
            }
            
            $sql = "UPDATE grupos SET " . implode(', ', $campos) . " WHERE id = :id";
            $valores[':id'] = $id;
            
            $stmt = $db->prepare($sql);
            $stmt->execute($valores);
            
            echo json_encode([
                'success' => true,
                'message' => 'Grupo atualizado com sucesso'
            ]);
            break;
            
        default:
            throw new Exception('Método não permitido');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}
?>
