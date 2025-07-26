<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }

    if (!isset($_FILES['media']) || !isset($_POST['upload_type'])) {
        throw new Exception('Arquivo de mídia e tipo de upload são obrigatórios');
    }

    $upload_type = $_POST['upload_type']; // 'post_image', 'post_video', 'post_gif'
    $user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;
    
    if (!$user_id) {
        throw new Exception('ID do usuário é obrigatório');
    }

    $file = $_FILES['media'];
    
    // Verificar se houve erro no upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Erro no upload do arquivo');
    }

    // Definir tipos permitidos baseado no tipo de upload
    $allowed_types = [];
    $max_size = 0;
    $upload_dir = '';

    switch ($upload_type) {
        case 'post_image':
            $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            $max_size = 5 * 1024 * 1024; // 5MB
            $upload_dir = '../../public/images/posts/';
            break;
        case 'post_video':
            $allowed_types = ['video/mp4', 'video/webm', 'video/ogg'];
            $max_size = 50 * 1024 * 1024; // 50MB
            $upload_dir = '../../public/videos/posts/';
            break;
        case 'post_gif':
            $allowed_types = ['image/gif'];
            $max_size = 10 * 1024 * 1024; // 10MB
            $upload_dir = '../../public/images/gifs/';
            break;
        default:
            throw new Exception('Tipo de upload inválido');
    }

    // Verificar tipo do arquivo
    $file_type = $file['type'];
    if (!in_array($file_type, $allowed_types)) {
        throw new Exception('Tipo de arquivo não permitido');
    }

    // Verificar tamanho do arquivo
    if ($file['size'] > $max_size) {
        $max_size_mb = $max_size / (1024 * 1024);
        throw new Exception("Arquivo muito grande. Tamanho máximo: {$max_size_mb}MB");
    }

    // Criar diretório se não existir
    if (!file_exists($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            throw new Exception('Erro ao criar diretório de upload');
        }
    }

    // Gerar nome único para o arquivo
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $unique_name = uniqid() . '_' . time() . '.' . $file_extension;
    $file_path = $upload_dir . $unique_name;

    // Fazer upload do arquivo
    if (!move_uploaded_file($file['tmp_name'], $file_path)) {
        throw new Exception('Erro ao salvar arquivo');
    }

    // Gerar URL relativa para retornar
    $relative_path = '';
    switch ($upload_type) {
        case 'post_image':
            $relative_path = '/images/posts/' . $unique_name;
            break;
        case 'post_video':
            $relative_path = '/videos/posts/' . $unique_name;
            break;
        case 'post_gif':
            $relative_path = '/images/gifs/' . $unique_name;
            break;
    }

    // Se for imagem, obter dimensões
    $width = null;
    $height = null;
    if ($upload_type === 'post_image' || $upload_type === 'post_gif') {
        $image_info = getimagesize($file_path);
        if ($image_info) {
            $width = $image_info[0];
            $height = $image_info[1];
        }
    }

    // Se for vídeo, tentar obter duração (requer FFmpeg - opcional)
    $duration = null;
    if ($upload_type === 'post_video' && extension_loaded('ffmpeg')) {
        // Código para obter duração do vídeo seria aqui
        // Por enquanto, deixamos como null
    }

    echo json_encode([
        'success' => true,
        'message' => 'Upload realizado com sucesso',
        'file_path' => $relative_path,
        'file_name' => $unique_name,
        'file_size' => $file['size'],
        'file_type' => $file_type,
        'upload_type' => $upload_type,
        'width' => $width,
        'height' => $height,
        'duration' => $duration
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
