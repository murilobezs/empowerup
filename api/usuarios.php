<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
        case 'get_profile':
            getProfile($pdo);
            break;
        case 'update_profile':
            updateProfile($pdo);
            break;
        case 'search_users':
            searchUsers($pdo);
            break;
        case 'get_user_posts':
            getUserPosts($pdo);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Ação não especificada']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $e->getMessage()]);
}

function getProfile($pdo) {
    $username = $_GET['username'] ?? '';
    $userId = $_GET['user_id'] ?? '';
    
    if (empty($username) && empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'Username ou ID do usuário é obrigatório']);
        return;
    }
    
    try {
        // Buscar dados do usuário
        if ($username) {
            $query = "SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, created_at FROM usuarios WHERE username = ?";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$username]);
        } else {
            $query = "SELECT id, nome, username, email, telefone, bio, tipo, avatar_url, created_at FROM usuarios WHERE id = ?";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$userId]);
        }
        
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$usuario) {
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
            return;
        }
        
        // Buscar contagem de posts
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM posts WHERE user_id = ?");
        $stmt->execute([$usuario['id']]);
        $postsCount = $stmt->fetchColumn();
        
        // Adicionar contagem de posts ao perfil
        $usuario['posts_count'] = $postsCount;
        
        // Remover dados sensíveis se não for o próprio usuário
        $currentUserId = $_GET['current_user_id'] ?? '';
        if ($currentUserId != $usuario['id']) {
            unset($usuario['email']);
            unset($usuario['telefone']);
        }
        
        echo json_encode([
            'success' => true,
            'usuario' => $usuario
        ]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao buscar perfil: ' . $e->getMessage()]);
    }
}

function updateProfile($pdo) {
    // Aceitar dados JSON do POST
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        // Fallback para dados de formulário
        $input = $_POST;
    }
    
    $userId = $input['user_id'] ?? '';
    $nome = $input['nome'] ?? '';
    $bio = $input['bio'] ?? '';
    $telefone = $input['telefone'] ?? '';
    $localizacao = $input['localizacao'] ?? '';
    $avatarUrl = $input['avatar_url'] ?? '';
    
    if (empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'ID do usuário é obrigatório']);
        return;
    }
    
    try {
        $fields = [];
        $params = [];
        
        if (!empty($nome)) {
            $fields[] = "nome = ?";
            $params[] = $nome;
        }
        
        if (isset($bio)) {
            $fields[] = "bio = ?";
            $params[] = $bio;
        }
        
        if (isset($telefone)) {
            $fields[] = "telefone = ?";
            $params[] = $telefone;
        }
        
        if (isset($localizacao)) {
            $fields[] = "localizacao = ?";
            $params[] = $localizacao;
        }
        
        if (isset($avatarUrl)) {
            $fields[] = "avatar_url = ?";
            $params[] = $avatarUrl;
        }
        
        if (empty($fields)) {
            echo json_encode(['success' => false, 'message' => 'Nenhum campo para atualizar']);
            return;
        }
        
        $fields[] = "updated_at = CURRENT_TIMESTAMP";
        $params[] = $userId;
        
        $query = "UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        
        echo json_encode([
            'success' => true,
            'message' => 'Perfil atualizado com sucesso'
        ]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar perfil: ' . $e->getMessage()]);
    }
}

function searchUsers($pdo) {
    $query = $_GET['query'] ?? '';
    $limit = $_GET['limit'] ?? 10;
    
    if (empty($query)) {
        echo json_encode(['success' => false, 'message' => 'Termo de busca é obrigatório']);
        return;
    }
    
    try {
        $searchTerm = '%' . $query . '%';
        $stmt = $pdo->prepare("
            SELECT id, nome, username, avatar_url, bio, tipo 
            FROM usuarios 
            WHERE nome LIKE ? OR username LIKE ? 
            ORDER BY nome ASC 
            LIMIT ?
        ");
        $stmt->execute([$searchTerm, $searchTerm, $limit]);
        
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'usuarios' => $usuarios
        ]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao buscar usuários: ' . $e->getMessage()]);
    }
}

function getUserPosts($pdo) {
    $userId = $_GET['user_id'] ?? '';
    $username = $_GET['username'] ?? '';
    $limit = $_GET['limit'] ?? 10;
    $offset = $_GET['offset'] ?? 0;
    
    if (empty($userId) && empty($username)) {
        echo json_encode(['success' => false, 'message' => 'ID do usuário ou username é obrigatório']);
        return;
    }
    
    try {
        // Se username foi fornecido, buscar o ID do usuário
        if ($username && empty($userId)) {
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE username = ?");
            $stmt->execute([$username]);
            $userId = $stmt->fetchColumn();
            
            if (!$userId) {
                echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
                return;
            }
        }
        
        // Buscar posts do usuário
        $stmt = $pdo->prepare("
            SELECT p.*, u.nome, u.username, u.avatar_url
            FROM posts p
            JOIN usuarios u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$userId, $limit, $offset]);
        
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'posts' => $posts
        ]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao buscar posts: ' . $e->getMessage()]);
    }
}
?>
