<?php
/**
 * Migração: Adicionar campos de website e localização ao perfil do usuário
 */

return function ($pdo) {
    try {
        echo "Adicionando campos website e localizacao à tabela usuarios...\n";
        
        // Verificar se as colunas já existem
        $stmt = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'website'");
        $websiteExists = $stmt->rowCount() > 0;
        
        $stmt = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'localizacao'");
        $localizacaoExists = $stmt->rowCount() > 0;
        
        // Adicionar coluna website se não existir
        if (!$websiteExists) {
            $pdo->exec("
                ALTER TABLE usuarios 
                ADD COLUMN website VARCHAR(255) NULL AFTER bio
            ");
            echo "✓ Coluna 'website' adicionada\n";
        } else {
            echo "✓ Coluna 'website' já existe\n";
        }
        
        // Adicionar coluna localizacao se não existir
        if (!$localizacaoExists) {
            $pdo->exec("
                ALTER TABLE usuarios 
                ADD COLUMN localizacao VARCHAR(255) NULL AFTER website
            ");
            echo "✓ Coluna 'localizacao' adicionada\n";
        } else {
            echo "✓ Coluna 'localizacao' já existe\n";
        }
        
        echo "Migração concluída com sucesso!\n";
        
    } catch (Exception $e) {
        throw new Exception("Erro na migração: " . $e->getMessage());
    }
};
