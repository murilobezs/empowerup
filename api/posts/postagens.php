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
        $sql = "SELECT * FROM posts ORDER BY created_at DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure tags are properly formatted for each post
        $formattedPosts = array_map(function($post) {
            $post['tags'] = json_decode($post['tags'] ?? '[]');
            return $post;
        }, $posts);
        
        echo json_encode($formattedPosts);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'));
        
        // Ensure tags is a JSON string
        $tags = is_array($data->tags) ? json_encode($data->tags) : '[]';
        
        $sql = "INSERT INTO posts (autor, username, avatar, conteudo, categoria, tags) 
                VALUES (:autor, :username, :avatar, :conteudo, :categoria, :tags)";
        
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam(':autor', $data->autor);
        $stmt->bindParam(':username', $data->username);
        $stmt->bindParam(':avatar', $data->avatar);
        $stmt->bindParam(':conteudo', $data->conteudo);
        $stmt->bindParam(':categoria', $data->categoria);
        $stmt->bindParam(':tags', $tags);
        
        if($stmt->execute()) {
            $post = [
                'id' => $db->lastInsertId(),
                'autor' => $data->autor,
                'username' => $data->username,
                'avatar' => $data->avatar,
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
