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
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch($action) {
        case 'check':
            checkDatabaseStatus($pdo);
            break;
        case 'update':
            runDatabaseUpdate($pdo);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Ação não especificada']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $e->getMessage()]);
}

function checkDatabaseStatus($pdo) {
    $checks = [];
    
    // Verificar se campo username existe
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'username'");
        $usernameExists = $stmt->rowCount() > 0;
        $checks[] = "Campo 'username' na tabela usuarios: " . ($usernameExists ? "✅ Existe" : "❌ Não existe");
    } catch (Exception $e) {
        $checks[] = "Campo 'username': ❌ Erro ao verificar - " . $e->getMessage();
    }
    
    // Verificar se campo user_id existe em posts
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM posts LIKE 'user_id'");
        $userIdExists = $stmt->rowCount() > 0;
        $checks[] = "Campo 'user_id' na tabela posts: " . ($userIdExists ? "✅ Existe" : "❌ Não existe");
    } catch (Exception $e) {
        $checks[] = "Campo 'user_id': ❌ Erro ao verificar - " . $e->getMessage();
    }
    
    // Verificar chave estrangeira
    try {
        $stmt = $pdo->query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'empowerup' AND TABLE_NAME = 'posts' AND CONSTRAINT_NAME = 'fk_posts_user_id'");
        $fkExists = $stmt->rowCount() > 0;
        $checks[] = "Chave estrangeira 'fk_posts_user_id': " . ($fkExists ? "✅ Existe" : "❌ Não existe");
    } catch (Exception $e) {
        $checks[] = "Chave estrangeira: ❌ Erro ao verificar - " . $e->getMessage();
    }
    
    // Verificar índices
    try {
        $stmt = $pdo->query("SHOW INDEX FROM posts WHERE Key_name = 'idx_posts_user_id'");
        $indexExists = $stmt->rowCount() > 0;
        $checks[] = "Índice 'idx_posts_user_id': " . ($indexExists ? "✅ Existe" : "❌ Não existe");
    } catch (Exception $e) {
        $checks[] = "Índice posts: ❌ Erro ao verificar - " . $e->getMessage();
    }
    
    // Contar posts com user_id
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total, COUNT(user_id) as with_user_id FROM posts");
        $counts = $stmt->fetch(PDO::FETCH_ASSOC);
        $checks[] = "Posts: {$counts['total']} total, {$counts['with_user_id']} com user_id definido";
    } catch (Exception $e) {
        $checks[] = "Posts: ❌ Erro ao verificar - " . $e->getMessage();
    }
    
    // Contar usuários com username
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total, COUNT(CASE WHEN username != '' THEN 1 END) as with_username FROM usuarios");
        $counts = $stmt->fetch(PDO::FETCH_ASSOC);
        $checks[] = "Usuários: {$counts['total']} total, {$counts['with_username']} com username definido";
    } catch (Exception $e) {
        $checks[] = "Usuários: ❌ Erro ao verificar - " . $e->getMessage();
    }
    
    echo json_encode([
        'success' => true, 
        'message' => implode('<br>', $checks)
    ]);
}

function runDatabaseUpdate($pdo) {
    $updates = [];
    $errors = [];
    
    try {
        // 1. Adicionar campo username se não existir
        try {
            $stmt = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'username'");
            if ($stmt->rowCount() == 0) {
                $pdo->exec("ALTER TABLE usuarios ADD COLUMN username VARCHAR(50) UNIQUE DEFAULT ''");
                $updates[] = "✅ Campo 'username' adicionado na tabela usuarios";
            } else {
                $updates[] = "ℹ️ Campo 'username' já existe na tabela usuarios";
            }
        } catch (Exception $e) {
            $errors[] = "❌ Erro ao adicionar campo username: " . $e->getMessage();
        }
        
        // 2. Adicionar campo user_id se não existir
        try {
            $stmt = $pdo->query("SHOW COLUMNS FROM posts LIKE 'user_id'");
            if ($stmt->rowCount() == 0) {
                $pdo->exec("ALTER TABLE posts ADD COLUMN user_id INT(11) NULL");
                $updates[] = "✅ Campo 'user_id' adicionado na tabela posts";
            } else {
                $updates[] = "ℹ️ Campo 'user_id' já existe na tabela posts";
            }
        } catch (Exception $e) {
            $errors[] = "❌ Erro ao adicionar campo user_id: " . $e->getMessage();
        }
        
        // 3. Atualizar posts existentes sem user_id
        try {
            $stmt = $pdo->exec("UPDATE posts SET user_id = 1 WHERE user_id IS NULL");
            $updates[] = "✅ $stmt posts atualizados com user_id = 1";
        } catch (Exception $e) {
            $errors[] = "❌ Erro ao atualizar posts: " . $e->getMessage();
        }
        
        // 4. Adicionar chave estrangeira se não existir
        try {
            $stmt = $pdo->query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'empowerup' AND TABLE_NAME = 'posts' AND CONSTRAINT_NAME = 'fk_posts_user_id'");
            if ($stmt->rowCount() == 0) {
                $pdo->exec("ALTER TABLE posts ADD CONSTRAINT fk_posts_user_id FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE");
                $updates[] = "✅ Chave estrangeira 'fk_posts_user_id' criada";
            } else {
                $updates[] = "ℹ️ Chave estrangeira 'fk_posts_user_id' já existe";
            }
        } catch (Exception $e) {
            $errors[] = "❌ Erro ao criar chave estrangeira: " . $e->getMessage();
        }
        
        // 5. Criar índices se não existirem
        $indexes = [
            'idx_posts_user_id' => 'CREATE INDEX idx_posts_user_id ON posts(user_id)',
            'idx_posts_created_at' => 'CREATE INDEX idx_posts_created_at ON posts(created_at)',
            'idx_usuarios_username' => 'CREATE INDEX idx_usuarios_username ON usuarios(username)'
        ];
        
        foreach ($indexes as $indexName => $sql) {
            try {
                $stmt = $pdo->query("SHOW INDEX FROM " . (strpos($indexName, 'posts') !== false ? 'posts' : 'usuarios') . " WHERE Key_name = '$indexName'");
                if ($stmt->rowCount() == 0) {
                    $pdo->exec($sql);
                    $updates[] = "✅ Índice '$indexName' criado";
                } else {
                    $updates[] = "ℹ️ Índice '$indexName' já existe";
                }
            } catch (Exception $e) {
                $errors[] = "❌ Erro ao criar índice $indexName: " . $e->getMessage();
            }
        }
        
        $message = implode('<br>', array_merge($updates, $errors));
        $success = empty($errors);
        
        echo json_encode([
            'success' => $success,
            'message' => $message
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro geral na atualização: ' . $e->getMessage()
        ]);
    }
}
?>
