<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuração do banco de dados
$host = 'localhost';
$dbname = 'empowerup';
$username = 'root';
$password = '';

// Configurações de upload
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const UPLOAD_BASE_PATH = '../public/images/';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $uploadType = $_POST['upload_type'] ?? '';
    $userId = $_POST['user_id'] ?? '';
    $postId = $_POST['post_id'] ?? '';
    $groupId = $_POST['group_id'] ?? '';
    
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Nenhuma imagem foi enviada ou ocorreu um erro no upload');
    }
    
    $file = $_FILES['image'];
    
    // Validar tamanho do arquivo
    if ($file['size'] > MAX_FILE_SIZE) {
        throw new Exception('Arquivo muito grande! O tamanho máximo é de 5MB');
    }
    
    // Validar tipo de arquivo
    $fileInfo = pathinfo($file['name']);
    $extension = strtolower($fileInfo['extension']);
    
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        throw new Exception('Tipo de arquivo não permitido! Use apenas: ' . implode(', ', ALLOWED_EXTENSIONS));
    }
    
    // Validar se é realmente uma imagem
    $imageInfo = getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        throw new Exception('Arquivo inválido! Não é uma imagem válida');
    }
    
    // Gerar nome único para o arquivo
    $fileName = uniqid() . '_' . time() . '.' . $extension;
    
    // Determinar pasta de destino baseada no tipo de upload
    switch ($uploadType) {
        case 'user_avatar':
            $destinationFolder = 'pfp/user/';
            break;
        case 'group_cover':
            $destinationFolder = 'groups/covers/';
            break;
        case 'post_image':
            $destinationFolder = 'posts/';
            break;
        default:
            throw new Exception('Tipo de upload não especificado');
    }
    
    $uploadPath = UPLOAD_BASE_PATH . $destinationFolder;
    
    // Criar pasta se não existir
    if (!is_dir($uploadPath)) {
        mkdir($uploadPath, 0755, true);
    }
    
    $fullPath = $uploadPath . $fileName;
    
    // Mover arquivo para destino final
    if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
        throw new Exception('Erro ao salvar arquivo');
    }
    
    // Caminho relativo para salvar no banco
    $relativePath = '/images/' . $destinationFolder . $fileName;
    
    // Atualizar banco de dados baseado no tipo de upload
    switch ($uploadType) {
        case 'user_avatar':
            updateUserAvatar($pdo, $userId, $relativePath);
            break;
        case 'group_cover':
            updateGroupCover($pdo, $groupId, $relativePath);
            break;
        case 'post_image':
            updatePostImage($pdo, $postId, $relativePath);
            break;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Imagem enviada com sucesso!',
        'image_path' => $relativePath,
        'file_name' => $fileName
    ]);
    
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function updateUserAvatar($pdo, $userId, $imagePath) {
    if (empty($userId)) {
        throw new Exception('ID do usuário não fornecido');
    }
    
    // Buscar avatar atual para deletar
    $stmt = $pdo->prepare("SELECT avatar_url FROM usuarios WHERE id = ?");
    $stmt->execute([$userId]);
    $currentAvatar = $stmt->fetchColumn();
    
    // Deletar arquivo anterior se existir
    if ($currentAvatar && file_exists('../public' . $currentAvatar)) {
        unlink('../public' . $currentAvatar);
    }
    
    // Atualizar avatar no banco
    $stmt = $pdo->prepare("UPDATE usuarios SET avatar_url = ? WHERE id = ?");
    $stmt->execute([$imagePath, $userId]);
}

function updateGroupCover($pdo, $groupId, $imagePath) {
    if (empty($groupId)) {
        throw new Exception('ID do grupo não fornecido');
    }
    
    // Buscar imagem atual para deletar
    $stmt = $pdo->prepare("SELECT imagem_capa FROM grupos WHERE id = ?");
    $stmt->execute([$groupId]);
    $currentImage = $stmt->fetchColumn();
    
    // Deletar arquivo anterior se existir
    if ($currentImage && file_exists('../public' . $currentImage)) {
        unlink('../public' . $currentImage);
    }
    
    // Atualizar imagem no banco
    $stmt = $pdo->prepare("UPDATE grupos SET imagem_capa = ? WHERE id = ?");
    $stmt->execute([$imagePath, $groupId]);
}

function updatePostImage($pdo, $postId, $imagePath) {
    if (empty($postId)) {
        throw new Exception('ID do post não fornecido');
    }
    
    // Buscar imagem atual para deletar
    $stmt = $pdo->prepare("SELECT imagem FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $currentImage = $stmt->fetchColumn();
    
    // Deletar arquivo anterior se existir
    if ($currentImage && file_exists('../public' . $currentImage)) {
        unlink('../public' . $currentImage);
    }
    
    // Atualizar imagem no banco
    $stmt = $pdo->prepare("UPDATE posts SET imagem = ? WHERE id = ?");
    $stmt->execute([$imagePath, $postId]);
}
?>
