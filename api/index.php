<?php
/**
 * EmpowerUp API - Arquivo principal de inicialização
 * Versão: 2.0.0
 */

// Configurações iniciais
header('Content-Type: application/json; charset=utf-8');

// Autoload das classes
spl_autoload_register(function ($class) {
    $directories = [
        __DIR__ . '/config/',
        __DIR__ . '/utils/',
        __DIR__ . '/middleware/',
        __DIR__ . '/services/',
        __DIR__ . '/controllers/'
    ];
    
    foreach ($directories as $directory) {
        $file = $directory . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Carregar configurações
require_once __DIR__ . '/config/config.php';

// Executar migrações automaticamente (se habilitado)
MigrationRunner::runPendingMigrations();

// Configurar middleware CORS e segurança
CorsMiddleware::handle();
CorsMiddleware::securityHeaders();

// Rate limiting removed globally (disabled per user request)

// Tratamento de erros
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    
    Helper::logError("PHP Error: {$message} in {$file} on line {$line}");
    
    if (DEBUG_MODE) {
        echo Helper::jsonResponse(false, "Erro: {$message}", [], 500);
    } else {
        echo Helper::jsonResponse(false, 'Erro interno do servidor', [], 500);
    }
    exit;
});

set_exception_handler(function($exception) {
    Helper::logError('Uncaught exception: ' . $exception->getMessage());
    
    if (DEBUG_MODE) {
        echo Helper::jsonResponse(false, 'Exception: ' . $exception->getMessage(), [], 500);
    } else {
        echo Helper::jsonResponse(false, 'Erro interno do servidor', [], 500);
    }
    exit;
});

/**
 * Classe principal de roteamento
 */
class Router {
    private $routes = [];
    private $method;
    private $path;
    
    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
    // Remover base path da aplicação e index.php dinamicamente
    $basePath = dirname($_SERVER['SCRIPT_NAME']);
    // Normalizar barras e remover barra final
    $basePath = rtrim(str_replace('\\', '/', $basePath), '/');
    // Remover /basePath e opcional /index.php
    $this->path = preg_replace('#^' . preg_quote($basePath, '#') . '(?:/index\.php)?#', '', $this->path);
        
        // Remover barra final
        $this->path = rtrim($this->path, '/');
        if ($this->path === '') {
            $this->path = '/';
        }
    }
    
    public function get($pattern, $callback) {
        $this->addRoute('GET', $pattern, $callback);
    }
    
    public function post($pattern, $callback) {
        $this->addRoute('POST', $pattern, $callback);
    }
    
    public function put($pattern, $callback) {
        $this->addRoute('PUT', $pattern, $callback);
    }
    
    public function delete($pattern, $callback) {
        $this->addRoute('DELETE', $pattern, $callback);
    }
    
    private function addRoute($method, $pattern, $callback) {
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'callback' => $callback
        ];
    }
    
    public function run() {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $this->method) {
                continue;
            }
            
            $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $route['pattern']);
            $pattern = '/^' . str_replace('/', '\/', $pattern) . '$/';
            
            if (preg_match($pattern, $this->path, $matches)) {
                array_shift($matches); // Remove full match
                
                try {
                    call_user_func_array($route['callback'], $matches);
                    return;
                } catch (Exception $e) {
                    Helper::logError('Route callback error: ' . $e->getMessage());
                    echo Helper::jsonResponse(false, 'Erro interno do servidor', [], 500);
                    return;
                }
            }
        }
        
        // Rota não encontrada
        http_response_code(404);
        echo Helper::jsonResponse(false, 'Endpoint não encontrado', [], 404);
    }
}

// Inicializar router
$router = new Router();

// Health check
$router->get('/', function() {
    echo Helper::jsonResponse(true, 'EmpowerUp API está funcionando!', [
        'version' => API_VERSION,
        'timestamp' => date('c'),
        'environment' => DEBUG_MODE ? 'development' : 'production'
    ]);
});

// Helper para registrar rotas padronizadas agrupadas por domínio funcional
$registerRoutes = function(array $routes) use ($router) {
    foreach ($routes as $route) {
        [$method, $pattern, $controller, $action] = $route;
        $method = strtolower($method);

        if (!method_exists($router, $method)) {
            throw new InvalidArgumentException("Método HTTP não suportado: {$method}");
        }

        $router->$method($pattern, static function (...$params) use ($controller, $action) {
            $instance = new $controller();
            call_user_func_array([$instance, $action], $params);
        });
    }
};


// Rotas de Autenticação

$registerRoutes([
    ['POST', '/auth/register', AuthController::class, 'register'],
    ['POST', '/auth/login', AuthController::class, 'login'],
    ['GET', '/auth/verify', AuthController::class, 'verifyEmail'],
    ['POST', '/auth/forgot-password', AuthController::class, 'forgotPassword'],
    ['POST', '/auth/reset-password', AuthController::class, 'resetPassword'],
    ['POST', '/auth/logout', AuthController::class, 'logout'],
    ['PUT', '/auth/username', AuthController::class, 'updateUsername'],
    ['GET', '/auth/profile', AuthController::class, 'profile'],
    ['POST', '/auth/refresh', AuthController::class, 'refreshToken'],
]);


// Rotas Administrativas

$registerRoutes([
    ['POST', '/admin/login', AdminAuthController::class, 'login'],
    ['GET', '/admin/profile', AdminAuthController::class, 'profile'],
    ['GET', '/admin/dashboard', AdminController::class, 'dashboard'],
    ['GET', '/admin/users', AdminController::class, 'listUsers'],
    ['PUT', '/admin/users/{id}', AdminController::class, 'updateUser'],
    ['GET', '/admin/posts', AdminController::class, 'listPosts'],
    ['PUT', '/admin/posts/{id}', AdminController::class, 'updatePost'],
    ['DELETE', '/admin/posts/{id}', AdminController::class, 'deletePost'],
    ['GET', '/admin/groups', AdminController::class, 'listGroups'],
    ['GET', '/admin/events', AdminController::class, 'listEvents'],
    ['POST', '/admin/events', AdminController::class, 'createEvent'],
    ['PUT', '/admin/events/{id}', AdminController::class, 'updateEvent'],
    ['DELETE', '/admin/events/{id}', AdminController::class, 'deleteEvent'],
    ['GET', '/admin/events/{id}/subscriptions', AdminController::class, 'listEventSubscriptions'],
    ['GET', '/admin/monetization', AdminController::class, 'monetization'],
    ['GET', '/admin/campaigns', AdminController::class, 'listCampaigns'],
]);


// Rotas de Usuários

$registerRoutes([
    ['GET', '/users/search', UserController::class, 'searchUsers'],
    ['GET', '/users/check-username/{username}', UserController::class, 'checkUsername'],
    ['GET', '/users/{id}', UserController::class, 'getUser'],
    ['POST', '/users/{id}/follow', UserController::class, 'toggleFollow'],
    ['GET', '/users/{id}/followers', UserController::class, 'getFollowers'],
    ['GET', '/users/{id}/following', UserController::class, 'getFollowing'],
    ['PUT', '/users/profile', UserController::class, 'updateProfile'],
    ['POST', '/users/avatar', UserController::class, 'updateAvatar'],
    ['POST', '/users/cover', UserController::class, 'updateCover'],
]);


//  Rotas de Exploração e Feed

$registerRoutes([
    ['GET', '/posts', PostController::class, 'getPosts'],
    ['GET', '/posts/unread_count', PostController::class, 'unreadCount'],
    ['GET', '/posts/liked', PostController::class, 'getLikedPosts'],
    ['GET', '/posts/search', PostController::class, 'searchPosts'],
    ['GET', '/posts/{id}', PostController::class, 'getPost'],
    ['POST', '/posts', PostController::class, 'createPost'],
    ['PUT', '/posts/{id}', PostController::class, 'updatePost'],
    ['DELETE', '/posts/{id}', PostController::class, 'deletePost'],
    ['GET', '/explore', ExploreController::class, 'overview'],
    ['GET', '/explore/search', ExploreController::class, 'search'],
    ['GET', '/explore/trending', ExploreController::class, 'trending'],
]);


// Rotas de Interação (comentários, likes, saves, shares)

$registerRoutes([
    ['GET', '/comments/posts/{postId}', CommentController::class, 'getComments'],
    ['POST', '/comments/posts/{postId}', CommentController::class, 'createComment'],
    ['PUT', '/comments/{commentId}', CommentController::class, 'updateComment'],
    ['DELETE', '/comments/{commentId}', CommentController::class, 'deleteComment'],
    ['GET', '/likes/posts/{postId}', LikeController::class, 'getLikes'],
    ['POST', '/likes/posts/{postId}', LikeController::class, 'toggleLike'],
    ['GET', '/shares/posts/{postId}', LikeController::class, 'getShares'],
    ['POST', '/shares/posts/{postId}', LikeController::class, 'sharePost'],
    ['GET', '/saves/posts', SaveController::class, 'getSavedPosts'],
    ['POST', '/saves/posts/{postId}', SaveController::class, 'toggleSave'],
    ['GET', '/saves/posts/{postId}/check', SaveController::class, 'isPostSaved'],
]);


// Rotas de Notificações

$registerRoutes([
    ['GET', '/notifications', NotificationController::class, 'getNotifications'],
    ['PUT', '/notifications/{notificationId}/read', NotificationController::class, 'markAsRead'],
    ['PUT', '/notifications/read-all', NotificationController::class, 'markAllAsRead'],
]);


// Rotas de Assinaturas e Monetização

$registerRoutes([
    ['GET', '/subscriptions/plans', SubscriptionController::class, 'listPlans'],
    ['GET', '/subscriptions/current', SubscriptionController::class, 'current'],
    ['POST', '/subscriptions/start', SubscriptionController::class, 'start'],
    ['POST', '/subscriptions/{id}/cancel', SubscriptionController::class, 'cancel'],
    ['GET', '/subscriptions/ad-usage', SubscriptionController::class, 'adUsage'],
]);


// Rotas de Cursos

$registerRoutes([
    ['GET', '/courses', CourseController::class, 'listCourses'],
    ['GET', '/courses/{identifier}', CourseController::class, 'getCourse'],
    ['POST', '/courses/{identifier}/enroll', CourseController::class, 'enroll'],
    ['GET', '/courses/{identifier}/progress', CourseController::class, 'getProgress'],
    ['POST', '/courses/{identifier}/lessons/{lessonId}/progress', CourseController::class, 'updateLessonProgress'],
]);


// 📣 Rotas de Campanhas Promovidas
$registerRoutes([
    ['GET', '/ads/campaigns', AdCampaignController::class, 'listCampaigns'],
    ['GET', '/ads/campaigns/{campaignId}', AdCampaignController::class, 'getCampaign'],
    ['POST', '/ads/campaigns', AdCampaignController::class, 'createCampaign'],
    ['PUT', '/ads/campaigns/{campaignId}', AdCampaignController::class, 'updateCampaign'],
    ['POST', '/ads/campaigns/{campaignId}/posts', AdCampaignController::class, 'addPost'],
    ['DELETE', '/ads/campaigns/{campaignId}/posts/{postId}', AdCampaignController::class, 'removePost'],
    ['DELETE', '/ads/campaigns/{campaignId}', AdCampaignController::class, 'deleteCampaign'],
]);


// Rotas de Eventos

$registerRoutes([
    ['GET', '/eventos', EventController::class, 'getEvents'], // alias em PT-BR
    ['GET', '/events', EventController::class, 'getEvents'],
    ['POST', '/events', EventController::class, 'createEvent'],
    ['POST', '/events/{id}/subscribe', EventController::class, 'subscribeToEvent'],
    ['DELETE', '/events/{id}/subscribe', EventController::class, 'unsubscribeFromEvent'],
    ['GET', '/events/{id}', EventController::class, 'getEvent'],
    ['PUT', '/events/{id}', EventController::class, 'updateEvent'],
    ['DELETE', '/events/{id}', EventController::class, 'deleteEvent'],
    ['GET', '/events/{id}/subscriptions', EventController::class, 'getEventSubscriptions'],
]);


// Rotas de Grupos e Comunidades

$registerRoutes([
    ['GET', '/grupos', GroupController::class, 'listGroups'],
    ['GET', '/grupos/meus-posts', GroupController::class, 'getMyGroupsPosts'],
    ['GET', '/grupos/slug/{slug}', GroupController::class, 'getGroupBySlug'],
    ['POST', '/grupos', GroupController::class, 'createGroup'],
    ['GET', '/grupos/{groupId}', GroupController::class, 'getGroup'],
    ['PUT', '/grupos/{groupId}', GroupController::class, 'updateGroup'],
    ['GET', '/grupos/{groupId}/membros', GroupController::class, 'listMembers'],
    ['POST', '/grupos/{groupId}/participar', GroupController::class, 'joinGroup'],
    ['POST', '/grupos/{groupId}/sair', GroupController::class, 'leaveGroup'],
    ['GET', '/grupos/{groupId}/solicitacoes', GroupController::class, 'listRequests'],
    ['PUT', '/grupos/{groupId}/solicitacoes/{requestId}', GroupController::class, 'handleRequest'],
    ['POST', '/grupos/{groupId}/convites', GroupController::class, 'createInvite'],
    ['POST', '/grupos/{groupId}/convites/{token}/aceitar', GroupController::class, 'acceptInvite'],
    ['DELETE', '/grupos/{groupId}/membros/{memberId}', GroupController::class, 'removeMember'],
    ['GET', '/grupos/{groupId}/posts', GroupController::class, 'getGroupPosts'],
]);


// Rotas de Relacionamento e Mensagens
$registerRoutes([
    ['GET', '/usuarios/seguindo', UserController::class, 'getFollowingUsers'],
    ['GET', '/usuarios', UserController::class, 'getAllUsers'],
    ['GET', '/conversas', MessageController::class, 'getConversasUsuario'],
    ['GET', '/conversas/unread-summary', MessageController::class, 'unreadSummary'],
    ['GET', '/conversas/{conversaId}/mensagens', MessageController::class, 'getMensagens'],
    ['POST', '/conversas/{conversaId}/mensagens', MessageController::class, 'enviarMensagem'],
    ['POST', '/conversas/iniciar/{userId}', MessageController::class, 'iniciarConversa'],
    ['POST', '/conversas/grupos', MessageController::class, 'createGrupo'],
    ['PUT', '/conversas/{conversaId}', MessageController::class, 'updateGrupo'],
    ['POST', '/conversas/{conversaId}/participantes', MessageController::class, 'addParticipante'],
    ['DELETE', '/conversas/{conversaId}/participantes/{participanteId}', MessageController::class, 'removerParticipante'],
    ['POST', '/conversas/{conversaId}/sair', MessageController::class, 'sairGrupo'],
]);

// Endpoints de mensagens que exigem validação customizada de payload/query
$router->get('/mensagens', static function() {
    $conversaId = $_GET['conversa_id'] ?? null;
    if (!$conversaId) {
        echo Helper::jsonResponse(false, 'conversa_id é obrigatório', [], 400);
        return;
    }

    $controller = new MessageController();
    $controller->getMensagens($conversaId);
});

$router->post('/mensagens', static function() {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $conversaId = $data['conversa_id'] ?? null;
    if (!$conversaId) {
        echo Helper::jsonResponse(false, 'conversa_id é obrigatório', [], 400);
        return;
    }

    $controller = new MessageController();
    $controller->enviarMensagem($conversaId);
});

// Executar roteamento
$router->run();
