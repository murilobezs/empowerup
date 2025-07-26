<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include_once '../db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

switch($method) {
    case 'GET':
        try {
            // Query melhorada para incluir dados do usuário e verificar likes
            $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
            
            $sql = "SELECT p.*, u.nome as autor_nome, u.username, u.avatar_url";
            
            if ($user_id) {
                $sql .= ", (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = :user_id) as user_liked";
            }
            
            $sql .= " FROM posts p 
                     LEFT JOIN usuarios u ON p.user_id = u.id 
                     ORDER BY p.created_at DESC";
            
            $stmt = $db->prepare($sql);
            
            if ($user_id) {
                $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Formatar dados dos posts
            $formattedPosts = array_map(function($post) {
                $post['tags'] = json_decode($post['tags'] ?? '[]');
                $post['user_liked'] = isset($post['user_liked']) ? $post['user_liked'] > 0 : false;
                
                // Garantir que o autor tenha um nome
                if (!empty($post['autor_nome'])) {
                    $post['autor'] = $post['autor_nome'];
                }
                
                // Formatar avatar
                $post['avatar'] = $post['avatar_url'] ? $post['avatar_url'] : '/placeholder.svg?height=40&width=40';
                
                // Formatar username
                if ($post['username']) {
                    $post['username'] = '@' . $post['username'];
                }
                
                // Formatar data
                $post['tempo'] = timeAgo($post['created_at']);
                
                return $post;
            }, $posts);
            
            echo json_encode($formattedPosts);
            
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar posts: ' . $e->getMessage()
            ]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'));
        
        // Buscar dados do usuário
        $userQuery = "SELECT id, nome, username, avatar_url FROM usuarios WHERE id = :user_id";
        $userStmt = $db->prepare($userQuery);
        $userStmt->bindParam(':user_id', $data->user_id);
        $userStmt->execute();
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
            break;
        }
        
        // Ensure tags is a JSON string
        $tags = is_array($data->tags) ? json_encode($data->tags) : '[]';
        
        $sql = "INSERT INTO posts (user_id, autor, username, avatar, conteudo, categoria, tags) 
                VALUES (:user_id, :autor, :username, :avatar, :conteudo, :categoria, :tags)";
        
        $stmt = $db->prepare($sql);
        
        $username = '@' . $user['username'];
        $avatar = $user['avatar_url'] ?? '/placeholder.svg?height=40&width=40';
        
        $stmt->bindParam(':user_id', $data->user_id);
        $stmt->bindParam(':autor', $user['nome']);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':avatar', $avatar);
        $stmt->bindParam(':conteudo', $data->conteudo);
        $stmt->bindParam(':categoria', $data->categoria);
        $stmt->bindParam(':tags', $tags);
        
        if($stmt->execute()) {
            $post = [
                'id' => $db->lastInsertId(),
                'user_id' => $data->user_id,
                'autor' => $user['nome'],
                'username' => $username,
                'avatar' => $avatar,
                'conteudo' => $data->conteudo,
                'categoria' => $data->categoria,
                'tags' => json_decode($tags),
                'likes' => 0,
                'comentarios' => 0,
                'compartilhamentos' => 0,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            echo json_encode(['success' => true, 'message' => 'Post criado com sucesso', 'post' => $post]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao criar post']);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if($id) {
            $sql = "DELETE FROM posts WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id', $id);
            
            if($stmt->execute()) {
                echo json_encode(['message' => 'Post deletado com sucesso']);
            } else {
                echo json_encode(['message' => 'Erro ao deletar post']);
            }
        }
        break;
}
?>
