<?php
/**
 * Migration para criar sistema de eventos
 */

require_once __DIR__ . '/../config/Database.php';

$migration = function() {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    try {
        // Tabela de eventos
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS eventos (
                id INT PRIMARY KEY AUTO_INCREMENT,
                titulo VARCHAR(255) NOT NULL,
                descricao TEXT,
                tipo ENUM('workshop', 'palestra', 'curso', 'meetup', 'networking') NOT NULL,
                data_evento DATETIME NOT NULL,
                data_fim DATETIME,
                local VARCHAR(255),
                endereco TEXT,
                capacidade_maxima INT DEFAULT 50,
                valor DECIMAL(10,2) DEFAULT 0.00,
                eh_gratuito BOOLEAN DEFAULT TRUE,
                instrutor_nome VARCHAR(255),
                instrutor_bio TEXT,
                instrutor_foto VARCHAR(255),
                requisitos TEXT,
                material_necessario TEXT,
                certificado BOOLEAN DEFAULT FALSE,
                status ENUM('ativo', 'cancelado', 'finalizado') DEFAULT 'ativo',
                imagem_url VARCHAR(500),
                link_online VARCHAR(500),
                eh_online BOOLEAN DEFAULT FALSE,
                criado_por INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
        
        // Tabela de inscrições em eventos
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS evento_inscricoes (
                id INT PRIMARY KEY AUTO_INCREMENT,
                evento_id INT NOT NULL,
                user_id INT NOT NULL,
                nome_completo VARCHAR(255) NOT NULL,
                telefone VARCHAR(20) NOT NULL,
                email VARCHAR(255),
                observacoes TEXT,
                status ENUM('confirmada', 'lista_espera', 'cancelada') DEFAULT 'confirmada',
                data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_presenca TIMESTAMP NULL,
                compareceu BOOLEAN DEFAULT FALSE,
                avaliacao INT CHECK (avaliacao >= 1 AND avaliacao <= 5),
                feedback TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                UNIQUE KEY unique_inscricao (evento_id, user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
        
        // Tabela de categorias de eventos (opcional para futuro)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS evento_categorias (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nome VARCHAR(100) NOT NULL UNIQUE,
                descricao TEXT,
                cor VARCHAR(7) DEFAULT '#2563eb',
                icone VARCHAR(50),
                ativo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
        
        // Inserir categorias padrão
        $pdo->exec("
            INSERT IGNORE INTO evento_categorias (nome, descricao, cor, icone) VALUES
            ('Empreendedorismo', 'Eventos sobre empreendedorismo e negócios', '#2563eb', 'briefcase'),
            ('Tecnologia', 'Workshops e palestras sobre tecnologia', '#7c3aed', 'laptop'),
            ('Marketing', 'Estratégias de marketing e vendas', '#dc2626', 'megaphone'),
            ('Finanças', 'Educação financeira e investimentos', '#059669', 'dollar-sign'),
            ('Desenvolvimento Pessoal', 'Crescimento pessoal e profissional', '#ea580c', 'user'),
            ('Networking', 'Eventos para conexões e networking', '#0891b2', 'users')
        ");
        
        // Índices para performance
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_evento)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos(status)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_inscricoes_evento ON evento_inscricoes(evento_id)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_inscricoes_user ON evento_inscricoes(user_id)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON evento_inscricoes(status)");
        
        echo "✅ Tabelas do sistema de eventos criadas com sucesso!\n";
        
    } catch (Exception $e) {
        echo "❌ Erro ao criar tabelas: " . $e->getMessage() . "\n";
        throw $e;
    }
};

// Executar se chamado diretamente
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    $migration();
}

return $migration;
