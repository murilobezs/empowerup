# EmpowerUp API

API em PHP que alimenta a plataforma EmpowerUp. Este README explica em detalhes como a base está organizada, a função de cada componente e um panorama completo das rotas disponíveis para facilitar avaliações e futuras manutenções.

## Visão Geral Rápida

| Item | Detalhe |
|------|---------|
| Versão | 2.0.0 |
| Padrão arquitetural | MVC com camadas de serviço e utilidades compartilhadas |
| Linguagem/Runtime | PHP 8+ recomendado |
| Autenticação | JWT + cookies seguros |
| Total de rotas públicas | **114 endpoints** registrados em `index.php` |
| Organização das rotas | 12 blocos agrupados por domínio funcional + 2 endpoints com validação customizada |

### Distribuição das rotas

| Bloco funcional | Qtde de rotas | Responsabilidade principal |
|-----------------|---------------|----------------------------|
| Autenticação | 9 | Registro, login, refresh e gerenciamento de credenciais |
| Administração | 16 | Painel administrativo, gestão de usuárias, posts, eventos e campanhas |
| Usuárias | 9 | Perfil, follow, avatar/capa e buscas |
| Feed & Explorar | 11 | CRUD de posts e exploração de conteúdo |
| Interações (comentários/likes/saves/shares) | 11 | Engajamento e bookmarking |
| Notificações | 3 | Central de notificações e marcação de leitura |
| Assinaturas & Monetização | 5 | Planos, limites e uso de anúncios |
| Cursos | 5 | Catálogo, matrículas e progresso educacional |
| Campanhas Promovidas | 7 | Gestão de campanhas pagas e posts impulsionados |
| Eventos | 9 | Agenda, inscrições e administração de eventos |
| Comunidades & Grupos | 15 | Grupos, convites, membros e conteúdo interno |
| Relacionamentos & Mensagens | 12 | Redes de contato e mensagens privadas/grupais |
| Endpoints com validação especial | 2 | `GET/POST /mensagens` exigem checagem manual do `conversa_id` |

## Estrutura Detalhada

```
api/
├── config/
│   ├── config.php
│   └── Database.php
├── controllers/
├── middleware/
├── services/
├── utils/
├── cache/
├── logs/
├── migrations/
├── notifications/
├── posts/
├── index.php
└── README.md (este arquivo)
```

### Configuração (`config/`)
| Arquivo | Função |
|---------|--------|
| `config.php` | Define constantes de ambiente (DB, JWT, diretórios, flags de debug) e inicializa configurações globais. |
| `Database.php` | Singleton de conexão PDO com pooling simples, suporte a prepared statements e logging de erros SQL. |

### Camada de Controladores (`controllers/`)
Cada controller implementa o fluxo HTTP → serviço → resposta JSON. A tabela abaixo resume suas responsabilidades e principais rotas relacionadas.

| Controller | Descrição | Rotas relacionadas |
|------------|-----------|--------------------|
| `AuthController.php` | Registro, login, refresh, recuperação de senha e atualização de username | `/auth/*` |
| `AdminAuthController.php` | Autenticação exclusiva do painel administrativo | `/admin/login`, `/admin/profile` |
| `AdminController.php` | Dashboard, gestão de usuárias, posts, eventos, campanhas e monetização | `/admin/*` (exceto login/profile) |
| `UserController.php` | Perfil público, follow/unfollow, uploads de avatar e capa, buscas | `/users/*`, `/usuarios*` |
| `PostController.php` | Feed principal, métricas, busca e CRUD de posts | `/posts*` |
| `ExploreController.php` | Página de exploração (overview, trending e busca unificada) | `/explore*` |
| `CommentController.php` | CRUD de comentários em posts | `/comments/*` |
| `LikeController.php` | Likes e compartilhamentos (inclui contadores) | `/likes/*`, `/shares/*` |
| `SaveController.php` | Lista, toggle e verificação de posts salvos | `/saves/*` |
| `NotificationController.php` | Listagem e marcação de notificações | `/notifications*` |
| `SubscriptionController.php` | Planos, assinatura ativa, consumo de anúncios | `/subscriptions/*` |
| `CourseController.php` | Catálogo de cursos, matrícula e progresso | `/courses/*` |
| `AdCampaignController.php` | Campanhas promovidas e vinculação de posts | `/ads/campaigns*` |
| `EventController.php` | Eventos públicos e administrativos, incluindo inscrições | `/events*`, `/eventos` |
| `GroupController.php` | Comunidades, convites, membros e posts de grupo | `/grupos*` |
| `MessageController.php` | Conversas privadas, mensagens, grupos de chat | `/conversas*`, `/mensagens` |

### Middlewares (`middleware/`)
| Arquivo | Descrição |
|---------|-----------|
| `CorsMiddleware.php` | Aplica CORS dinâmico, headers de segurança e opções de preflight. Invocado em `index.php`. |
| `AuthMiddleware.php` | Helper para proteger endpoints com JWT (usado internamente pelos controllers). |
| `AdminAuthMiddleware.php` | Validação adicional para endpoints administrativos sensíveis. |

### Serviços de Domínio (`services/`)
| Arquivo | O que abstrai |
|---------|---------------|
| `AdCampaignService.php` | Regras de negócios de campanhas promovidas (planos, limites, métricas). |
| `CourseService.php` | Integrações e cálculos relacionados aos cursos (progresso, matrícula). |
| `SubscriptionService.php` | Cálculos de quotas, billing e elegibilidade de recursos premium. |

### Utilidades (`utils/`)
| Arquivo | Responsabilidade |
|---------|------------------|
| `Helper.php` | Respostas JSON padronizadas, logging, manipulação de datas, sanitização e helpers de upload. |
| `JWT.php` | Emissão e validação de tokens JWT com suporte a refresh. |
| `Validator.php` | Validações de payload reutilizáveis (strings, e-mail, arquivos etc.). |
| `Mailer.php` & `EmailTemplates.php` | Envio de e-mails transacionais e templates HTML. |


### Outras pastas relevantes
| Diretório | Conteúdo |
|-----------|----------|
| `cache/` | Arquivos de cache (ex.: controle de rate limiting). |
| `logs/` | `app_errors.log`, `database_errors.log` e outros logs rotacionáveis. |
| `notifications/` e `posts/` | Endpoints legados em PHP procedural (mantidos por compatibilidade com integrações antigas). No fluxo atual todos os novos endpoints passam pelos controllers MVC. |

##  index.php: 

- Inicializa autoload, configurações, middleware de segurança e tratadores de erro.
- Define a classe `Router`, responsável por casar método HTTP, path e parâmetros de rota.
- Usa o helper `$registerRoutes` para registrar blocos de endpoints de maneira declarativa, agrupando por domínio com comentários visuais.
- Mantém dois endpoints (`GET/POST /mensagens`) fora do helper porque executam validação manual de `conversa_id` antes de delegar ao controller.

Esta abordagem facilita auditorias, pois cada grupo de rotas está em um bloco coeso e comentado.

##Resumo dos Controllers x Rotas

| Controller | Rotas atendidas |
|------------|-----------------|
| AuthController | 9 |
| AdminAuthController | 2 |
| AdminController | 14 |
| UserController | 12 |
| ExploreController | 3 |
| PostController | 8 |
| CommentController | 4 |
| LikeController | 4 |
| SaveController | 3 |
| NotificationController | 3 |
| SubscriptionController | 5 |
| CourseController | 5 |
| AdCampaignController | 7 |
| EventController | 9 |
| GroupController | 15 |
| MessageController | 18 (incluindo endpoints de conversas e mensagens) |

> **Total geral:** 114 rotas.

##Configuração e ambiente

1. Copie `config/config.php` e ajuste credenciais de banco, segredos JWT e endpoints de serviços externos.
2. Garanta que `cache/` e `logs/` tenham permissão de escrita pelo usuário do servidor web.
3. Importe as migrações iniciais (`migrations/`) ou configure o banco com `migrate.php`.
4. Apache: habilite `mod_rewrite` e mantenha o `.htaccess` da pasta para redirecionar todas as chamadas para `index.php`.



## Autenticação & Segurança

- Tokens JWT emitidos por `AuthController`, validados em `AuthMiddleware`.
- Cookies (`SameSite=Lax`, `secure=true`) para permitir uso no subdomínio `cursos.empowerup.com.br`.
- Headers de segurança definidos em `CorsMiddleware`.
- Rate limiting configurável via cache (pode ser ligado/desligado conforme ambiente).

## Testes rápidos de API

```bash
# Testar saúde da API
curl https://www.empowerup.com.br/api/

# Login
curl -X POST https://www.empowerup.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuaria@teste.com","senha":"123456"}'

# Listar posts com token
curl -H "Authorization: Bearer <TOKEN>" \
  https://www.empowerup.com.br/api/posts?page=1&limit=10
```

