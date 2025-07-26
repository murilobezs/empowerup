<?php
header('Content-Type: text/plain; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuração do banco de dados
$host = 'localhost';
$dbname = 'empowerup';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $action = $_GET['action'] ?? '';
    
    switch($action) {
        case 'update_usuarios':
            updateUsuarios($pdo);
            break;
        case 'update_posts':
            updatePosts($pdo);
            break;
        case 'update_grupos':
            updateGrupos($pdo);
            break;
        case 'create_folders':
            createImageFolders();
            break;
        default:
            echo "Ação não reconhecida. Use: update_usuarios, update_posts, update_grupos, create_folders";
    }
    
} catch(PDOException $e) {
    echo "Erro de conexão: " . $e->getMessage();
}

function updateUsuarios($pdo) {
    echo "=== ATUALIZANDO TABELA DE USUÁRIOS ===\n";
    
    try {
        // Verificar se a coluna username já existe
        $checkColumn = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'username'");
        if ($checkColumn->rowCount() == 0) {
            echo "Adicionando coluna 'username' à tabela usuarios...\n";
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN username VARCHAR(50) UNIQUE AFTER nome");
            echo "✅ Coluna 'username' adicionada com sucesso!\n";
        } else {
            echo "⚠️ Coluna 'username' já existe.\n";
        }
        
        // Gerar usernames únicos para usuários existentes que não têm username
        $users = $pdo->query("SELECT id, nome, email FROM usuarios WHERE username IS NULL OR username = ''")->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($users) > 0) {
            echo "Gerando usernames únicos para " . count($users) . " usuários...\n";
            
            $stmt = $pdo->prepare("UPDATE usuarios SET username = ? WHERE id = ?");
            
            foreach ($users as $user) {
                $baseUsername = generateUsername($user['nome'], $user['email']);
                $username = $baseUsername;
                $counter = 1;
                
                // Verificar se o username já existe e gerar um único
                while (usernameExists($pdo, $username)) {
                    $username = $baseUsername . $counter;
                    $counter++;
                }
                
                $stmt->execute([$username, $user['id']]);
                echo "🎯 Usuário ID {$user['id']} ({$user['nome']}): @$username\n";
            }
        } else {
            echo "✅ Todos os usuários já possuem username.\n";
        }
        
        echo "=== USUÁRIOS ATUALIZADOS COM SUCESSO! ===\n";
        
    } catch(PDOException $e) {
        echo "❌ Erro ao atualizar usuários: " . $e->getMessage() . "\n";
    }
}

function updatePosts($pdo) {
    echo "=== ATUALIZANDO TABELA DE POSTS ===\n";
    
    try {
        // Verificar se a coluna imagem já existe
        $checkColumn = $pdo->query("SHOW COLUMNS FROM posts LIKE 'imagem'");
        if ($checkColumn->rowCount() == 0) {
            echo "Adicionando coluna 'imagem' à tabela posts...\n";
            $pdo->exec("ALTER TABLE posts ADD COLUMN imagem VARCHAR(255) NULL AFTER conteudo");
            echo "✅ Coluna 'imagem' adicionada com sucesso!\n";
        } else {
            echo "⚠️ Coluna 'imagem' já existe.\n";
        }
        
        // Verificar se a coluna user_id já existe para fazer referência ao usuário
        $checkColumn = $pdo->query("SHOW COLUMNS FROM posts LIKE 'user_id'");
        if ($checkColumn->rowCount() == 0) {
            echo "Adicionando coluna 'user_id' à tabela posts...\n";
            $pdo->exec("ALTER TABLE posts ADD COLUMN user_id INT NULL AFTER id");
            echo "✅ Coluna 'user_id' adicionada com sucesso!\n";
            
            // Criar índice para melhor performance
            $pdo->exec("ALTER TABLE posts ADD INDEX idx_user_id (user_id)");
            echo "✅ Índice para 'user_id' criado!\n";
        } else {
            echo "⚠️ Coluna 'user_id' já existe.\n";
        }
        
        echo "=== POSTS ATUALIZADOS COM SUCESSO! ===\n";
        
    } catch(PDOException $e) {
        echo "❌ Erro ao atualizar posts: " . $e->getMessage() . "\n";
    }
}

function updateGrupos($pdo) {
    echo "=== ATUALIZANDO TABELA DE GRUPOS ===\n";
    
    try {
        // Verificar se a coluna criador_id já existe
        $checkColumn = $pdo->query("SHOW COLUMNS FROM grupos LIKE 'criador_id'");
        if ($checkColumn->rowCount() == 0) {
            echo "Adicionando coluna 'criador_id' à tabela grupos...\n";
            $pdo->exec("ALTER TABLE grupos ADD COLUMN criador_id INT NULL AFTER id");
            echo "✅ Coluna 'criador_id' adicionada com sucesso!\n";
            
            // Criar índice para melhor performance
            $pdo->exec("ALTER TABLE grupos ADD INDEX idx_criador_id (criador_id)");
            echo "✅ Índice para 'criador_id' criado!\n";
        } else {
            echo "⚠️ Coluna 'criador_id' já existe.\n";
        }
        
        // Verificar se a coluna imagem_capa já existe
        $checkColumn = $pdo->query("SHOW COLUMNS FROM grupos LIKE 'imagem_capa'");
        if ($checkColumn->rowCount() == 0) {
            echo "Adicionando coluna 'imagem_capa' à tabela grupos...\n";
            $pdo->exec("ALTER TABLE grupos ADD COLUMN imagem_capa VARCHAR(255) NULL AFTER imagem");
            echo "✅ Coluna 'imagem_capa' adicionada com sucesso!\n";
        } else {
            echo "⚠️ Coluna 'imagem_capa' já existe.\n";
        }
        
        echo "=== GRUPOS ATUALIZADOS COM SUCESSO! ===\n";
        
    } catch(PDOException $e) {
        echo "❌ Erro ao atualizar grupos: " . $e->getMessage() . "\n";
    }
}

function createImageFolders() {
    echo "=== CRIANDO ESTRUTURA DE PASTAS PARA IMAGENS ===\n";
    
    $basePath = dirname(__DIR__) . '/public/images/';
    
    $folders = [
        'pfp/user',
        'pfp/groups',
        'posts',
        'groups/covers',
        'temp'
    ];
    
    foreach ($folders as $folder) {
        $fullPath = $basePath . $folder;
        if (!is_dir($fullPath)) {
            if (mkdir($fullPath, 0755, true)) {
                echo "✅ Pasta criada: $fullPath\n";
            } else {
                echo "❌ Erro ao criar pasta: $fullPath\n";
            }
        } else {
            echo "⚠️ Pasta já existe: $fullPath\n";
        }
    }
    
    // Criar arquivo .htaccess para proteção
    $htaccessContent = "# Proteção contra execução de scripts\n";
    $htaccessContent .= "php_flag engine off\n";
    $htaccessContent .= "AddType text/plain .php .php3 .phtml .pht\n";
    $htaccessContent .= "\n# Permitir apenas tipos de arquivo específicos\n";
    $htaccessContent .= "<FilesMatch \"\\.(jpg|jpeg|png|gif|webp)$\">\n";
    $htaccessContent .= "    Order allow,deny\n";
    $htaccessContent .= "    Allow from all\n";
    $htaccessContent .= "</FilesMatch>\n";
    $htaccessContent .= "\n# Negar acesso a outros tipos de arquivo\n";
    $htaccessContent .= "<FilesMatch \"\\.(php|php3|phtml|pht|pl|py|jsp|asp|sh|cgi)$\">\n";
    $htaccessContent .= "    Order deny,allow\n";
    $htaccessContent .= "    Deny from all\n";
    $htaccessContent .= "</FilesMatch>\n";
    
    file_put_contents($basePath . '.htaccess', $htaccessContent);
    echo "✅ Arquivo .htaccess criado para proteção!\n";
    
    echo "=== ESTRUTURA DE PASTAS CRIADA COM SUCESSO! ===\n";
}

function generateUsername($nome, $email) {
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
    return substr($nome, 0, 20);
}

function usernameExists($pdo, $username) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE username = ?");
    $stmt->execute([$username]);
    return $stmt->fetchColumn() > 0;
}
?>
