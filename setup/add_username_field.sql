-- Atualização do banco de dados para adicionar campo username
USE empowerup;

-- Adicionar campo username na tabela usuarios
ALTER TABLE usuarios ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL DEFAULT '';

-- Adicionar campo user_id na tabela posts para relacionar com usuario
ALTER TABLE posts ADD COLUMN user_id INT(11) NULL;

-- Adicionar chave estrangeira
ALTER TABLE posts ADD CONSTRAINT fk_posts_user_id FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Atualizar posts existentes para usar o novo sistema
UPDATE posts SET user_id = 1 WHERE user_id IS NULL;

-- Criar índices para melhor performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_usuarios_username ON usuarios(username);
