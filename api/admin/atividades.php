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
    // Atividades recentes
    $atividades = [];
    
    // Últimos usuários registrados
    $stmt = $db->prepare("
        SELECT 'usuario' as tipo, nome as titulo, email as descricao, created_at as data
        FROM usuarios 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    $stmt->execute();
    $usuarios_recentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Últimos posts criados
    $stmt = $db->prepare("
        SELECT 'post' as tipo, autor as titulo, 
               SUBSTRING(conteudo, 1, 50) as descricao, created_at as data
        FROM posts 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    $stmt->execute();
    $posts_recentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Últimos grupos criados
    $stmt = $db->prepare("
        SELECT 'grupo' as tipo, nome as titulo, 
               SUBSTRING(descricao, 1, 50) as descricao, created_at as data
        FROM grupos 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    $stmt->execute();
    $grupos_recentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Combinar todas as atividades
    $atividades = array_merge($usuarios_recentes, $posts_recentes, $grupos_recentes);
    
    // Ordenar por data
    usort($atividades, function($a, $b) {
        return strtotime($b['data']) - strtotime($a['data']);
    });
    
    // Limitar a 20 atividades mais recentes
    $atividades = array_slice($atividades, 0, 20);
    
    // Dados para gráficos
    $grafico_usuarios = [];
    $grafico_posts = [];
    
    // Usuários por mês (últimos 6 meses)
    for ($i = 5; $i >= 0; $i--) {
        $mes = date('Y-m', strtotime("-$i months"));
        $stmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM usuarios 
            WHERE DATE_FORMAT(created_at, '%Y-%m') = ?
        ");
        $stmt->execute([$mes]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $grafico_usuarios[] = [
            'mes' => date('M/Y', strtotime("-$i months")),
            'count' => $count
        ];
    }
    
    // Posts por mês (últimos 6 meses)
    for ($i = 5; $i >= 0; $i--) {
        $mes = date('Y-m', strtotime("-$i months"));
        $stmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM posts 
            WHERE DATE_FORMAT(created_at, '%Y-%m') = ?
        ");
        $stmt->execute([$mes]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $grafico_posts[] = [
            'mes' => date('M/Y', strtotime("-$i months")),
            'count' => $count
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'atividades' => $atividades,
            'grafico_usuarios' => $grafico_usuarios,
            'grafico_posts' => $grafico_posts
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar atividades: ' . $e->getMessage()
    ]);
}
?>
