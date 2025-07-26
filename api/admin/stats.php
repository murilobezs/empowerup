<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../db.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Estatísticas gerais
    $stats = [];
    
    // Total de usuários
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM usuarios");
    $stmt->execute();
    $stats['total_usuarios'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Usuários por tipo
    $stmt = $db->prepare("SELECT tipo, COUNT(*) as count FROM usuarios GROUP BY tipo");
    $stmt->execute();
    $usuarios_por_tipo = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $usuarios_por_tipo[$row['tipo']] = $row['count'];
    }
    $stats['usuarios_por_tipo'] = $usuarios_por_tipo;
    
    // Total de posts
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM posts");
    $stmt->execute();
    $stats['total_posts'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Posts por categoria
    $stmt = $db->prepare("SELECT categoria, COUNT(*) as count FROM posts GROUP BY categoria");
    $stmt->execute();
    $posts_por_categoria = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $posts_por_categoria[$row['categoria']] = $row['count'];
    }
    $stats['posts_por_categoria'] = $posts_por_categoria;
    
    // Total de grupos
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM grupos");
    $stmt->execute();
    $stats['total_grupos'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Grupos por categoria
    $stmt = $db->prepare("SELECT categoria, COUNT(*) as count FROM grupos GROUP BY categoria");
    $stmt->execute();
    $grupos_por_categoria = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $grupos_por_categoria[$row['categoria']] = $row['count'];
    }
    $stats['grupos_por_categoria'] = $grupos_por_categoria;
    
    // Usuários registrados nos últimos 30 dias
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM usuarios WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $stmt->execute();
    $stats['usuarios_ultimos_30_dias'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Posts criados nos últimos 30 dias
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM posts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $stmt->execute();
    $stats['posts_ultimos_30_dias'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Grupos criados nos últimos 30 dias
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM grupos WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $stmt->execute();
    $stats['grupos_ultimos_30_dias'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Engagement (likes, comentários, compartilhamentos)
    $stmt = $db->prepare("SELECT SUM(likes) as total_likes, SUM(comentarios) as total_comentarios, SUM(compartilhamentos) as total_compartilhamentos FROM posts");
    $stmt->execute();
    $engagement = $stmt->fetch(PDO::FETCH_ASSOC);
    $stats['engagement'] = $engagement;
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar estatísticas: ' . $e->getMessage()
    ]);
}
?>
