<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
        // Buscar comentários de um post
        if (isset($_GET['post_id'])) {
            $post_id = $_GET['post_id'];
            
            try {
                // Buscar comentários principais (não são respostas)
                $sql = "SELECT c.*, u.nome, u.username, u.avatar_url,
                              (SELECT COUNT(*) FROM post_comentarios WHERE parent_id = c.id) as total_respostas
                       FROM post_comentarios c 
                       JOIN usuarios u ON c.user_id = u.id 
                       WHERE c.post_id = :post_id AND c.parent_id IS NULL
                       ORDER BY c.created_at ASC";
                
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $stmt->execute();
                
                $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Para cada comentário, buscar suas respostas
                foreach ($comentarios as &$comentario) {
                    $respostas_sql = "SELECT c.*, u.nome, u.username, u.avatar_url
                                     FROM post_comentarios c 
                                     JOIN usuarios u ON c.user_id = u.id 
                                     WHERE c.parent_id = :parent_id
                                     ORDER BY c.created_at ASC";
                    
                    $respostas_stmt = $db->prepare($respostas_sql);
                    $respostas_stmt->bindParam(':parent_id', $comentario['id'], PDO::PARAM_INT);
                    $respostas_stmt->execute();
                    
                    $comentario['respostas'] = $respostas_stmt->fetchAll(PDO::FETCH_ASSOC);
                }
                
                // Buscar contagem total de comentários
                $count_sql = "SELECT COUNT(*) as total FROM post_comentarios WHERE post_id = :post_id";
                $count_stmt = $db->prepare($count_sql);
                $count_stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $count_stmt->execute();
                $count_result = $count_stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'comentarios' => $comentarios,
                    'total' => $count_result['total']
                ]);
                
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro ao buscar comentários: ' . $e->getMessage()
                ]);
            }
        }
        break;

    case 'POST':
        // Adicionar comentário
        if (!$input || !isset($input['post_id']) || !isset($input['user_id']) || !isset($input['conteudo'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Dados obrigatórios: post_id, user_id, conteudo'
            ]);
            break;
        }
        
        try {
            $post_id = $input['post_id'];
            $user_id = $input['user_id'];
            $conteudo = trim($input['conteudo']);
            $parent_id = isset($input['parent_id']) ? $input['parent_id'] : null;
            
            if (empty($conteudo)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Conteúdo do comentário não pode estar vazio'
                ]);
                break;
            }
            
            // Verificar se o post existe
            $post_check_sql = "SELECT id FROM posts WHERE id = :post_id";
            $post_check_stmt = $db->prepare($post_check_sql);
            $post_check_stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
            $post_check_stmt->execute();
            
            if (!$post_check_stmt->fetch()) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Post não encontrado'
                ]);
                break;
            }
            
            // Se é uma resposta, verificar se o comentário pai existe
            if ($parent_id) {
                $parent_check_sql = "SELECT id FROM post_comentarios WHERE id = :parent_id AND post_id = :post_id";
                $parent_check_stmt = $db->prepare($parent_check_sql);
                $parent_check_stmt->bindParam(':parent_id', $parent_id, PDO::PARAM_INT);
                $parent_check_stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $parent_check_stmt->execute();
                
                if (!$parent_check_stmt->fetch()) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Comentário pai não encontrado'
                    ]);
                    break;
                }
            }
            
            // Inserir comentário
            $sql = "INSERT INTO post_comentarios (post_id, user_id, conteudo, parent_id) 
                   VALUES (:post_id, :user_id, :conteudo, :parent_id)";
            
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->bindParam(':conteudo', $conteudo, PDO::PARAM_STR);
            $stmt->bindParam(':parent_id', $parent_id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                $comentario_id = $db->lastInsertId();
                
                // Buscar o comentário criado com dados do usuário
                $fetch_sql = "SELECT c.*, u.nome, u.username, u.avatar_url
                             FROM post_comentarios c 
                             JOIN usuarios u ON c.user_id = u.id 
                             WHERE c.id = :comentario_id";
                
                $fetch_stmt = $db->prepare($fetch_sql);
                $fetch_stmt->bindParam(':comentario_id', $comentario_id, PDO::PARAM_INT);
                $fetch_stmt->execute();
                
                $comentario = $fetch_stmt->fetch(PDO::FETCH_ASSOC);
                
                // Buscar nova contagem total
                $count_sql = "SELECT COUNT(*) as total FROM post_comentarios WHERE post_id = :post_id";
                $count_stmt = $db->prepare($count_sql);
                $count_stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $count_stmt->execute();
                $count_result = $count_stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Comentário adicionado com sucesso',
                    'comentario' => $comentario,
                    'total_comentarios' => $count_result['total']
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro ao adicionar comentário'
                ]);
            }
            
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Erro: ' . $e->getMessage()
            ]);
        }
        break;

    case 'PUT':
        // Editar comentário
        if (!$input || !isset($input['comentario_id']) || !isset($input['user_id']) || !isset($input['conteudo'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Dados obrigatórios: comentario_id, user_id, conteudo'
            ]);
            break;
        }
        
        try {
            $comentario_id = $input['comentario_id'];
            $user_id = $input['user_id'];
            $conteudo = trim($input['conteudo']);
            
            if (empty($conteudo)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Conteúdo do comentário não pode estar vazio'
                ]);
                break;
            }
            
            // Verificar se o comentário pertence ao usuário
            $check_sql = "SELECT user_id FROM post_comentarios WHERE id = :comentario_id";
            $check_stmt = $db->prepare($check_sql);
            $check_stmt->bindParam(':comentario_id', $comentario_id, PDO::PARAM_INT);
            $check_stmt->execute();
            
            $comentario_data = $check_stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$comentario_data) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Comentário não encontrado'
                ]);
                break;
            }
            
            if ($comentario_data['user_id'] != $user_id) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Você só pode editar seus próprios comentários'
                ]);
                break;
            }
            
            // Atualizar comentário
            $sql = "UPDATE post_comentarios SET conteudo = :conteudo, updated_at = CURRENT_TIMESTAMP WHERE id = :comentario_id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':conteudo', $conteudo, PDO::PARAM_STR);
            $stmt->bindParam(':comentario_id', $comentario_id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Comentário atualizado com sucesso'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro ao atualizar comentário'
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
        // Deletar comentário
        if (!$input || !isset($input['comentario_id']) || !isset($input['user_id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Dados obrigatórios: comentario_id, user_id'
            ]);
            break;
        }
        
        try {
            $comentario_id = $input['comentario_id'];
            $user_id = $input['user_id'];
            
            // Verificar se o comentário pertence ao usuário
            $check_sql = "SELECT user_id, post_id FROM post_comentarios WHERE id = :comentario_id";
            $check_stmt = $db->prepare($check_sql);
            $check_stmt->bindParam(':comentario_id', $comentario_id, PDO::PARAM_INT);
            $check_stmt->execute();
            
            $comentario_data = $check_stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$comentario_data) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Comentário não encontrado'
                ]);
                break;
            }
            
            if ($comentario_data['user_id'] != $user_id) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Você só pode deletar seus próprios comentários'
                ]);
                break;
            }
            
            // Deletar comentário (e suas respostas por cascata)
            $sql = "DELETE FROM post_comentarios WHERE id = :comentario_id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':comentario_id', $comentario_id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                // Buscar nova contagem
                $count_sql = "SELECT COUNT(*) as total FROM post_comentarios WHERE post_id = :post_id";
                $count_stmt = $db->prepare($count_sql);
                $count_stmt->bindParam(':post_id', $comentario_data['post_id'], PDO::PARAM_INT);
                $count_stmt->execute();
                $count_result = $count_stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Comentário deletado com sucesso',
                    'total_comentarios' => $count_result['total']
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro ao deletar comentário'
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
