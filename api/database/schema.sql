CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    autor VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    conteudo TEXT NOT NULL,
    categoria VARCHAR(100),
    tags JSON,
    likes INT DEFAULT 0,
    comentarios INT DEFAULT 0,
    compartilhamentos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    membros INT DEFAULT 0,
    imagem VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    ultima_atividade TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
