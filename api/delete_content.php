<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuração do banco de dados
$host = 'localhost';
$dbname = 'empowerup';
$username = 'root';
$password = '';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    
    switch($action) {
        case 'delete_post':
            deletePost($pdo);
            break;
        case 'delete_image':
            deleteImage($pdo);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Ação não especificada']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $e->getMessage()]);
}

function deletePost($pdo) {
    $postId = $_POST['post_id'] ?? '';
    $userId = $_POST['user_id'] ?? '';
    
    if (empty($postId)) {
        echo json_encode(['success' => false, 'message' => 'ID do post não fornecido']);
        return;
    }
    
    try {
        // Buscar informações do post
        $stmt = $pdo->prepare("SELECT imagem, user_id FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$post) {
            echo json_encode(['success' => false, 'message' => 'Post não encontrado']);
            return;
        }
        
        // Verificar se o usuário tem permissão para deletar (opcional)
        if (!empty($userId) && $post['user_id'] != $userId) {
            echo json_encode(['success' => false, 'message' => 'Você não tem permissão para deletar este post']);
            return;
        }
        
        // Deletar imagem do sistema de arquivos se existir
        if (!empty($post['imagem'])) {
            $imagePath = '../public' . $post['imagem'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
        
        // Deletar post do banco de dados
        $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Post deletado com sucesso'
        ]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao deletar post: ' . $e->getMessage()]);
    }
}

function deleteImage($pdo) {
    $imageType = $_POST['image_type'] ?? ''; // 'post', 'user', 'group'
    $itemId = $_POST['item_id'] ?? '';
    $userId = $_POST['user_id'] ?? '';
    
    if (empty($imageType) || empty($itemId)) {
        echo json_encode(['success' => false, 'message' => 'Tipo de imagem e ID do item são obrigatórios']);
        return;
    }
    
    try {
        switch($imageType) {
            case 'post':
                deletePostImage($pdo, $itemId, $userId);
                break;
            case 'user':
                deleteUserImage($pdo, $itemId, $userId);
                break;
            case 'group':
                deleteGroupImage($pdo, $itemId, $userId);
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Tipo de imagem inválido']);
        }
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao deletar imagem: ' . $e->getMessage()]);
    }
}

function deletePostImage($pdo, $postId, $userId) {
    // Buscar imagem do post
    $stmt = $pdo->prepare("SELECT imagem, user_id FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        echo json_encode(['success' => false, 'message' => 'Post não encontrado']);
        return;
    }
    
    // Verificar permissão
    if (!empty($userId) && $post['user_id'] != $userId) {
        echo json_encode(['success' => false, 'message' => 'Você não tem permissão para deletar esta imagem']);
        return;
    }
    
    // Deletar arquivo físico
    if (!empty($post['imagem'])) {
        $imagePath = '../public' . $post['imagem'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
    
    // Remover referência da imagem no banco
    $stmt = $pdo->prepare("UPDATE posts SET imagem = NULL WHERE id = ?");
    $stmt->execute([$postId]);
    
    echo json_encode(['success' => true, 'message' => 'Imagem do post deletada com sucesso']);
}

function deleteUserImage($pdo, $userId, $currentUserId) {
    // Verificar permissão
    if ($userId != $currentUserId) {
        echo json_encode(['success' => false, 'message' => 'Você não tem permissão para deletar esta imagem']);
        return;
    }
    
    // Buscar avatar atual
    $stmt = $pdo->prepare("SELECT avatar_url FROM usuarios WHERE id = ?");
    $stmt->execute([$userId]);
    $avatar = $stmt->fetchColumn();
    
    if (!$avatar) {
        echo json_encode(['success' => false, 'message' => 'Usuário não possui avatar']);
        return;
    }
    
    // Deletar arquivo físico
    $imagePath = '../public' . $avatar;
    if (file_exists($imagePath)) {
        unlink($imagePath);
    }
    
    // Remover referência no banco
    $stmt = $pdo->prepare("UPDATE usuarios SET avatar_url = NULL WHERE id = ?");
    $stmt->execute([$userId]);
    
    echo json_encode(['success' => true, 'message' => 'Avatar deletado com sucesso']);
}

function deleteGroupImage($pdo, $groupId, $userId) {
    // Buscar informações do grupo
    $stmt = $pdo->prepare("SELECT imagem_capa, criador_id FROM grupos WHERE id = ?");
    $stmt->execute([$groupId]);
    $group = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$group) {
        echo json_encode(['success' => false, 'message' => 'Grupo não encontrado']);
        return;
    }
    
    // Verificar permissão (apenas criador pode deletar)
    if (!empty($userId) && $group['criador_id'] != $userId) {
        echo json_encode(['success' => false, 'message' => 'Apenas o criador do grupo pode deletar a imagem de capa']);
        return;
    }
    
    // Deletar arquivo físico
    if (!empty($group['imagem_capa'])) {
        $imagePath = '../public' . $group['imagem_capa'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
    
    // Remover referência no banco
    $stmt = $pdo->prepare("UPDATE grupos SET imagem_capa = NULL WHERE id = ?");
    $stmt->execute([$groupId]);
    
    echo json_encode(['success' => true, 'message' => 'Imagem de capa do grupo deletada com sucesso']);
}
?>
