<?php
// Teste de conectividade e permissões para upload de imagens

echo "<h2>🔧 Teste de Sistema de Upload - EmpowerUp</h2>";

// Testar conexão com banco
echo "<h3>1. Testando Conexão com Banco de Dados</h3>";
try {
    $pdo = new PDO("mysql:host=localhost;dbname=empowerup;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexão com banco: <strong>OK</strong><br>";
} catch(PDOException $e) {
    echo "❌ Erro na conexão: " . $e->getMessage() . "<br>";
}

// Testar estrutura de pastas
echo "<h3>2. Testando Estrutura de Pastas</h3>";
$folders = [
    '../public/images/',
    '../public/images/pfp/',
    '../public/images/pfp/user/',
    '../public/images/pfp/groups/',
    '../public/images/posts/',
    '../public/images/groups/',
    '../public/images/groups/covers/',
    '../public/images/temp/'
];

foreach ($folders as $folder) {
    if (!is_dir($folder)) {
        if (mkdir($folder, 0755, true)) {
            echo "✅ Pasta criada: <strong>{$folder}</strong><br>";
        } else {
            echo "❌ Erro ao criar pasta: <strong>{$folder}</strong><br>";
        }
    } else {
        echo "✅ Pasta existe: <strong>{$folder}</strong><br>";
    }
}

// Testar permissões de escrita
echo "<h3>3. Testando Permissões de Escrita</h3>";
foreach ($folders as $folder) {
    if (is_writable($folder)) {
        echo "✅ Permissão de escrita: <strong>{$folder}</strong><br>";
    } else {
        echo "❌ Sem permissão de escrita: <strong>{$folder}</strong><br>";
    }
}

// Testar upload de imagem de teste
echo "<h3>4. Testando Upload de Arquivo</h3>";
$testFile = '../public/images/temp/test_' . time() . '.txt';
if (file_put_contents($testFile, 'Teste de upload')) {
    echo "✅ Upload de teste: <strong>OK</strong><br>";
    unlink($testFile); // Remover arquivo de teste
} else {
    echo "❌ Erro no upload de teste<br>";
}

// Verificar configurações PHP
echo "<h3>5. Configurações PHP</h3>";
echo "Upload máximo: <strong>" . ini_get('upload_max_filesize') . "</strong><br>";
echo "Post máximo: <strong>" . ini_get('post_max_size') . "</strong><br>";
echo "Uploads habilitados: <strong>" . (ini_get('file_uploads') ? 'Sim' : 'Não') . "</strong><br>";
echo "Pasta temporária: <strong>" . sys_get_temp_dir() . "</strong><br>";

// Testar extensões necessárias
echo "<h3>6. Extensões PHP</h3>";
$extensions = ['gd', 'fileinfo', 'json'];
foreach ($extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ Extensão {$ext}: <strong>OK</strong><br>";
    } else {
        echo "❌ Extensão {$ext}: <strong>Não encontrada</strong><br>";
    }
}

echo "<h3>7. Informações do Sistema</h3>";
echo "Sistema Operacional: <strong>" . PHP_OS . "</strong><br>";
echo "Versão PHP: <strong>" . PHP_VERSION . "</strong><br>";
echo "Servidor: <strong>" . $_SERVER['SERVER_SOFTWARE'] . "</strong><br>";

echo "<hr>";
echo "<p><strong>✨ Se todos os testes passaram, o sistema de upload deve funcionar!</strong></p>";
echo "<p>Acesse: <a href='http://localhost/empowerup/src/index.html' target='_blank'>http://localhost/empowerup/</a></p>";
?>
