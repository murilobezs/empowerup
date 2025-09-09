# EmpowerUp API

Uma API moderna e profissional desenvolvida em PHP para a plataforma EmpowerUp - uma rede social focada no empoderamento feminino.

## 🚀 Características

- **Arquitetura Moderna**: Estrutura MVC bem organizada
- **Segurança Avançada**: JWT, Rate Limiting, Headers de segurança
- **Performance**: Cache, compressão GZIP, queries otimizadas
- **Escalabilidade**: Singleton pattern, connection pooling
- **Validação Robusta**: Sistema de validação customizável
- **Logging Completo**: Sistema de logs para debugging e monitoramento

## 📁 Estrutura do Projeto

```
api/
├── config/
│   ├── config.php          # Configurações gerais
│   └── Database.php        # Classe de conexão com banco
├── controllers/
│   ├── AuthController.php  # Autenticação
│   ├── UserController.php  # Usuários
│   ├── PostController.php  # Posts
│   ├── CommentController.php # Comentários
│   └── LikeController.php  # Likes e compartilhamentos
├── middleware/
│   ├── AuthMiddleware.php  # Middleware de autenticação
│   └── CorsMiddleware.php  # Middleware CORS
├── utils/
│   ├── Helper.php          # Funções auxiliares
│   ├── JWT.php            # Manipulação JWT
│   └── Validator.php      # Sistema de validação
├── logs/                   # Logs da aplicação
├── cache/                  # Cache de rate limiting
├── .htaccess              # Configurações Apache
└── index.php              # Arquivo principal da API
```

## 🔧 Configuração

### Requisitos
- PHP 7.4+
- MySQL 5.7+
- Apache com mod_rewrite
- Extensões: PDO, JSON, OpenSSL

### Instalação
1. Clone o repositório
2. Configure o banco de dados no arquivo `config/config.php`
3. Execute o script SQL do banco de dados
4. Configure as permissões das pastas de upload

### Configurações Importantes
```php
// config/config.php
define('DB_HOST', '127.0.0.1:3306');
define('DB_NAME', 'u459313419_empowerup');
define('DB_USER', 'u459313419_empowerup');
define('DB_PASS', '');
define('JWT_SECRET', 'sua_chave_secreta_aqui');
```

## 📡 Endpoints da API

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `GET /auth/profile` - Perfil do usuário logado
- `POST /auth/refresh` - Atualizar token

### Usuários
- `GET /users/{id}` - Buscar usuário por ID
- `GET /users/search` - Buscar usuários
- `GET /users/check-username/{username}` - Verificar disponibilidade de username
- `PUT /users/profile` - Atualizar perfil
- `POST /users/avatar` - Atualizar avatar

### Posts
- `GET /posts` - Listar posts (com paginação)
- `GET /posts/{id}` - Buscar post por ID
- `GET /posts/search` - Buscar posts
- `POST /posts` - Criar post
- `PUT /posts/{id}` - Atualizar post
- `DELETE /posts/{id}` - Deletar post

### Comentários
- `GET /comments/posts/{postId}` - Listar comentários
- `POST /comments/posts/{postId}` - Criar comentário
- `PUT /comments/{commentId}` - Atualizar comentário
- `DELETE /comments/{commentId}` - Deletar comentário

### Likes e Compartilhamentos
- `GET /likes/posts/{postId}` - Listar likes
- `POST /likes/posts/{postId}` - Curtir/descurtir
- `GET /shares/posts/{postId}` - Listar compartilhamentos
- `POST /shares/posts/{postId}` - Compartilhar post

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:
```
Authorization: Bearer seu_token_aqui
```

## 📝 Exemplos de Uso

### Registrar Usuário
```bash
curl -X POST http://localhost/empowerup/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "senha": "123456",
    "tipo": "empreendedora",
    "telefone": "11999999999"
  }'
```

### Criar Post
```bash
curl -X POST http://localhost/empowerup/api/posts \
  -H "Authorization: Bearer seu_token" \
  -F "conteudo=Meu primeiro post!" \
  -F "categoria=Inspiração" \
  -F "image=@imagem.jpg"
```

### Listar Posts
```bash
curl -X GET "http://localhost/empowerup/api/posts?page=1&limit=10&categoria=Beleza"
```

## 🛡️ Segurança

### Rate Limiting
- 100 requests por 15 minutos (geral)
- 5 requests por 15 minutos (login/registro)

### Headers de Segurança
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Referrer-Policy

### Validações
- Sanitização de inputs
- Validação de tipos de arquivo
- Verificação de tamanhos de upload
- Prevenção contra SQL injection

## 📊 Monitoramento

### Logs
- `logs/app_errors.log` - Erros da aplicação
- `logs/database_errors.log` - Erros do banco de dados

### Cache
- Rate limiting cache em `cache/`
- Limpeza automática de cache antigo

## 🚦 Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `429` - Muitas tentativas
- `500` - Erro interno do servidor

## 🔄 Versionamento

Versão atual: **2.0.0**

### Changelog
- **2.0.0**: Refatoração completa da API
  - Arquitetura moderna MVC
  - Sistema de autenticação JWT
  - Rate limiting implementado
  - Validações robustas
  - Logging completo
  - Headers de segurança

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas, entre em contato através dos issues do GitHub.
