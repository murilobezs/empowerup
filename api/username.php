<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    
    if ($method === 'POST' && empty($action)) {
        $data = json_decode(file_get_contents('php://input'));
        $action = $data->action ?? '';
    }
    
    switch($action) {
        case 'check_username':
            checkUsername($db);
            break;
        case 'generate_username':
            generateUsername($db);
            break;
        case 'update_username':
            updateUsername($db);
            break;
        case 'get_user_profile':
            getUserProfile($db);
            break;
        case 'get_user_posts':
            getUserPosts($db);
            break;
        case 'set_username':
            setUsername($db);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Ação não especificada']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $e->getMessage()]);
}

function checkUsername($db) {
    $username = $_GET['username'] ?? $_POST['username'] ?? '';
    
    if (empty($username)) {
        echo json_encode(['success' => false, 'message' => 'Username não fornecido']);
        return;
    }
    
    // Validar formato do username
    if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
        echo json_encode([
            'success' => false, 
            'available' => false,
            'message' => 'Username deve ter entre 3-20 caracteres e conter apenas letras, números e underscore'
        ]);
        return;
    }
    
    // Verificar se username já existe
    $stmt = $db->prepare("SELECT COUNT(*) FROM usuarios WHERE username = ?");
    $stmt->execute([$username]);
    $exists = $stmt->fetchColumn() > 0;
    
    echo json_encode([
        'success' => true,
        'available' => !$exists,
        'message' => $exists ? 'Username já está em uso' : 'Username disponível'
    ]);
}

function setUsername($db) {
    $data = json_decode(file_get_contents('php://input'));
    $userId = $data->user_id ?? '';
    $username = $data->username ?? '';
    
    if (empty($userId) || empty($username)) {
        echo json_encode(['success' => false, 'message' => 'ID do usuário e username são obrigatórios']);
        return;
    }
    
    // Validar formato do username
    if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
        echo json_encode(['success' => false, 'message' => 'Username deve ter entre 3-20 caracteres e conter apenas letras, números e _']);
        return;
    }
    
    try {
        $sql = "UPDATE usuarios SET username = :username WHERE id = :user_id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':user_id', $userId);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Username definido com sucesso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao definir username']);
        }
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            echo json_encode(['success' => false, 'message' => 'Username já está em uso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro no banco de dados']);
        }
    }
}

function getUserProfile($db) {
    $username = $_GET['username'] ?? '';
    $userId = $_GET['user_id'] ?? '';
    
    if (empty($username) && empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'Username ou ID do usuário é obrigatório']);
        return;
    }
    
    $whereClause = !empty($username) ? 'username = :identifier' : 'id = :identifier';
    $identifier = !empty($username) ? $username : $userId;
    
    $sql = "SELECT id, nome, email, telefone, bio, tipo, avatar_url, username, created_at FROM usuarios WHERE $whereClause";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':identifier', $identifier);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Buscar estatísticas do usuário
        $statsQuery = "SELECT COUNT(*) as total_posts FROM posts WHERE user_id = :user_id";
        $statsStmt = $db->prepare($statsQuery);
        $statsStmt->bindParam(':user_id', $user['id']);
        $statsStmt->execute();
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
        
        $user['total_posts'] = $stats['total_posts'];
        $user['membro_desde'] = date('d/m/Y', strtotime($user['created_at']));
        
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
    }
}

function getUserPosts($db) {
    $username = $_GET['username'] ?? '';
    $userId = $_GET['user_id'] ?? '';
    $limit = $_GET['limit'] ?? 10;
    
    if (empty($username) && empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'Username ou ID do usuário é obrigatório']);
        return;
    }
    
    if (!empty($username)) {
        // Buscar ID do usuário pelo username
        $userQuery = "SELECT id FROM usuarios WHERE username = :username";
        $userStmt = $db->prepare($userQuery);
        $userStmt->bindParam(':username', $username);
        $userStmt->execute();
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
            return;
        }
        
        $userId = $user['id'];
    }
    
    $sql = "SELECT p.*, u.nome as autor_nome, u.username, u.avatar_url 
            FROM posts p 
            JOIN usuarios u ON p.user_id = u.id 
            WHERE p.user_id = :user_id 
            ORDER BY p.created_at DESC 
            LIMIT :limit";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatar posts
    $formattedPosts = array_map(function($post) {
        $post['tags'] = json_decode($post['tags'] ?? '[]');
        $post['autor'] = $post['autor_nome'];
        $post['avatar'] = $post['avatar_url'];
        $post['username'] = '@' . $post['username'];
        return $post;
    }, $posts);
    
    echo json_encode(['success' => true, 'posts' => $formattedPosts]);
}

function generateUsername($db) {
    $nome = $_GET['nome'] ?? $_POST['nome'] ?? '';
    $email = $_GET['email'] ?? $_POST['email'] ?? '';
    
    if (empty($nome) && empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Nome ou email deve ser fornecido']);
        return;
    }
    
    $baseUsername = createUsernameFromName($nome, $email);
    $username = $baseUsername;
    $counter = 1;
    
    // Gerar username único
    while (usernameExists($db, $username)) {
        $username = $baseUsername . $counter;
        $counter++;
    }
    
    echo json_encode([
        'success' => true,
        'username' => $username,
        'message' => 'Username gerado com sucesso'
    ]);
}

function updateUsername($db) {
    $userId = $_POST['user_id'] ?? '';
    $newUsername = $_POST['username'] ?? '';
    
    if (empty($userId) || empty($newUsername)) {
        echo json_encode(['success' => false, 'message' => 'ID do usuário e username são obrigatórios']);
        return;
    }
    
    // Validar formato do username
    if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $newUsername)) {
        echo json_encode([
            'success' => false,
            'message' => 'Username deve ter entre 3-20 caracteres e conter apenas letras, números e underscore'
        ]);
        return;
    }
    
    // Verificar se username já existe para outro usuário
    $stmt = $db->prepare("SELECT COUNT(*) FROM usuarios WHERE username = ? AND id != ?");
    $stmt->execute([$newUsername, $userId]);
    
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'message' => 'Username já está em uso']);
        return;
    }
    
    // Atualizar username
    $stmt = $db->prepare("UPDATE usuarios SET username = ? WHERE id = ?");
    $stmt->execute([$newUsername, $userId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Username atualizado com sucesso'
    ]);
}

function createUsernameFromName($nome, $email) {
    // Remover acentos e caracteres especiais do nome
    $nome = iconv('UTF-8', 'ASCII//TRANSLIT', $nome);
    $nome = preg_replace('/[^a-zA-Z0-9]/', '', $nome);
    $nome = strtolower($nome);
    
    // Se o nome estiver vazio, usar parte do email
    if (empty($nome)) {
        $emailParts = explode('@', $email);
        $nome = preg_replace('/[^a-zA-Z0-9]/', '', $emailParts[0]);
        $nome = strtolower($nome);
    }
    
    // Limitar o tamanho do username
    return substr($nome, 0, 15);
}

function usernameExists($db, $username) {
    $stmt = $db->prepare("SELECT COUNT(*) FROM usuarios WHERE username = ?");
    $stmt->execute([$username]);
    return $stmt->fetchColumn() > 0;
}
?>
