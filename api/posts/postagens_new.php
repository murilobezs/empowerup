<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../db.php';

// Função para calcular tempo decorrido
function timeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return 'agora';
    if ($time < 3600) return floor($time/60) . 'min';
    if ($time < 86400) return floor($time/3600) . 'h';
    if ($time < 2592000) return floor($time/86400) . 'd';
    if ($time < 31536000) return floor($time/2592000) . 'M';
    
    return floor($time/31536000) . 'a';
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

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
                } else {
                    $post['autor'] = $post['autor'] ?? 'Usuário';
                }
                
                // Formatar avatar
                $post['avatar'] = $post['avatar_url'] ? $post['avatar_url'] : '/placeholder.svg?height=40&width=40';
                
                // Formatar username
                if ($post['username']) {
                    $post['username'] = '@' . $post['username'];
                } else {
                    $post['username'] = '@usuario';
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
        try {
            $data = json_decode(file_get_contents('php://input'));
            
            if (!$data) {
                throw new Exception('Dados inválidos');
            }
            
            // Validar campos obrigatórios
            if (empty($data->conteudo)) {
                throw new Exception('Conteúdo é obrigatório');
            }
            
            if (empty($data->user_id)) {
                throw new Exception('ID do usuário é obrigatório');
            }
            
            // Preparar dados para inserção
            $tags = is_array($data->tags ?? []) ? json_encode($data->tags) : '[]';
            
            // Campos de mídia
            $imagem_url = $data->imagem_url ?? null;
            $video_url = $data->video_url ?? null;
            $gif_url = $data->gif_url ?? null;
            
            // Determinar tipo de mídia
            $tipo_midia = 'none';
            if ($imagem_url) $tipo_midia = 'imagem';
            else if ($video_url) $tipo_midia = 'video';
            else if ($gif_url) $tipo_midia = 'gif';
            
            $sql = "INSERT INTO posts (user_id, conteudo, categoria, tags, imagem_url, video_url, gif_url, tipo_midia, autor, username, avatar) 
                    VALUES (:user_id, :conteudo, :categoria, :tags, :imagem_url, :video_url, :gif_url, :tipo_midia, :autor, :username, :avatar)";
            
            $stmt = $db->prepare($sql);
            
            $stmt->bindParam(':user_id', $data->user_id);
            $stmt->bindParam(':conteudo', $data->conteudo);
            $stmt->bindParam(':categoria', $data->categoria ?? 'Geral');
            $stmt->bindParam(':tags', $tags);
            $stmt->bindParam(':imagem_url', $imagem_url);
            $stmt->bindParam(':video_url', $video_url);
            $stmt->bindParam(':gif_url', $gif_url);
            $stmt->bindParam(':tipo_midia', $tipo_midia);
            $stmt->bindParam(':autor', $data->autor ?? 'Usuário');
            $stmt->bindParam(':username', $data->username ?? '@usuario');
            $stmt->bindParam(':avatar', $data->avatar ?? '/placeholder.svg?height=40&width=40');
            
            if ($stmt->execute()) {
                $post_id = $db->lastInsertId();
                
                // Buscar o post criado
                $fetch_sql = "SELECT p.*, u.nome as autor_nome, u.username as user_username, u.avatar_url 
                             FROM posts p 
                             LEFT JOIN usuarios u ON p.user_id = u.id 
                             WHERE p.id = :post_id";
                
                $fetch_stmt = $db->prepare($fetch_sql);
                $fetch_stmt->bindParam(':post_id', $post_id);
                $fetch_stmt->execute();
                
                $new_post = $fetch_stmt->fetch(PDO::FETCH_ASSOC);
                $new_post['tags'] = json_decode($new_post['tags']);
                $new_post['tempo'] = timeAgo($new_post['created_at']);
                $new_post['user_liked'] = false;
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Post criado com sucesso',
                    'post' => $new_post
                ]);
            } else {
                throw new Exception('Erro ao criar post');
            }
            
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        break;

    case 'DELETE':
        try {
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$id) {
                throw new Exception('ID do post é obrigatório');
            }
            
            $sql = "DELETE FROM posts WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute() && $stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Post deletado com sucesso'
                ]);
            } else {
                throw new Exception('Post não encontrado');
            }
            
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
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
