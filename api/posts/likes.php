<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        // Buscar likes de um post específico
        if (isset($_GET['post_id'])) {
            $post_id = $_GET['post_id'];
            
            try {
                // Buscar todos os likes do post
                $sql = "SELECT pl.*, u.nome, u.username, u.avatar_url 
                       FROM post_likes pl 
                       JOIN usuarios u ON pl.user_id = u.id 
                       WHERE pl.post_id = :post_id 
                       ORDER BY pl.created_at DESC";
                
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $stmt->execute();
                
                $likes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Buscar contagem total
                $count_sql = "SELECT COUNT(*) as total FROM post_likes WHERE post_id = :post_id";
                $count_stmt = $db->prepare($count_sql);
                $count_stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $count_stmt->execute();
                $count_result = $count_stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'likes' => $likes,
                    'total' => $count_result['total']
                ]);
                
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro ao buscar likes: ' . $e->getMessage()
                ]);
            }
        }
        // Verificar se usuário curtiu um post específico
        else if (isset($_GET['post_id']) && isset($_GET['user_id'])) {
            $post_id = $_GET['post_id'];
            $user_id = $_GET['user_id'];
            
            try {
                $sql = "SELECT COUNT(*) as liked FROM post_likes WHERE post_id = :post_id AND user_id = :user_id";
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $stmt->execute();
                
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'liked' => $result['liked'] > 0
                ]);
                
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro ao verificar like: ' . $e->getMessage()
                ]);
            }
        }
        break;

    case 'POST':
        // Adicionar like
        if (!$input || !isset($input['post_id']) || !isset($input['user_id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Dados obrigatórios: post_id, user_id'
            ]);
            break;
        }
        
        try {
            $post_id = $input['post_id'];
            $user_id = $input['user_id'];
            
            // Verificar se já curtiu
            $check_sql = "SELECT id FROM post_likes WHERE post_id = :post_id AND user_id = :user_id";
            $check_stmt = $db->prepare($check_sql);
            $check_stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
            $check_stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $check_stmt->execute();
            
            if ($check_stmt->fetch()) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Usuário já curtiu este post'
                ]);
                break;
            }
            
            // Adicionar like
            $sql = "INSERT INTO post_likes (post_id, user_id) VALUES (:post_id, :user_id)";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                // Buscar nova contagem
                $count_sql = "SELECT COUNT(*) as total FROM post_likes WHERE post_id = :post_id";
                $count_stmt = $db->prepare($count_sql);
                $count_stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $count_stmt->execute();
                $count_result = $count_stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Like adicionado com sucesso',
                    'total_likes' => $count_result['total']
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro ao adicionar like'
                ]);
            }
            
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Erro: ' . $e->getMessage()
            ]);
        }
        break;

    case 'DELETE':
        // Remover like
        if (!$input || !isset($input['post_id']) || !isset($input['user_id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Dados obrigatórios: post_id, user_id'
            ]);
            break;
        }
        
        try {
            $post_id = $input['post_id'];
            $user_id = $input['user_id'];
            
            $sql = "DELETE FROM post_likes WHERE post_id = :post_id AND user_id = :user_id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            
            if ($stmt->execute() && $stmt->rowCount() > 0) {
                // Buscar nova contagem
                $count_sql = "SELECT COUNT(*) as total FROM post_likes WHERE post_id = :post_id";
                $count_stmt = $db->prepare($count_sql);
                $count_stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $count_stmt->execute();
                $count_result = $count_stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Like removido com sucesso',
                    'total_likes' => $count_result['total']
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Like não encontrado'
                ]);
            }
            
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Erro: ' . $e->getMessage()
            ]);
        }
        break;

    default:
        echo json_encode([
            'success' => false,
            'message' => 'Método não permitido'
        ]);
        break;
}
?>
