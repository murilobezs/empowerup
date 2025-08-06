<?php
/**
 * EmpowerUp API - Arquivo principal de inicialização
 * Versão: 2.0.0
 * 
 * API moderna e profissional para a plataforma EmpowerUp
 */

// Configurações iniciais
header('Content-Type: application/json; charset=utf-8');

// Autoload das classes
spl_autoload_register(function ($class) {
    $directories = [
        __DIR__ . '/config/',
        __DIR__ . '/utils/',
        __DIR__ . '/middleware/',
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

// Configurar middleware CORS e segurança
CorsMiddleware::handle();
CorsMiddleware::securityHeaders();

// Rate limiting global
AuthMiddleware::rateLimit();

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
        
        // Remover prefixo da aplicação se existir (/empowerup/api)
        $this->path = preg_replace('/^\/empowerup\/api/', '', $this->path);
        
        // Remover trailing slash
        $this->path = rtrim($this->path, '/');
        
        if (empty($this->path)) {
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

// Rotas de autenticação
$router->post('/auth/register', function() {
    AuthMiddleware::rateLimit(5, 900); // Mais restritivo para registro
    $controller = new AuthController();
    $controller->register();
});

$router->post('/auth/login', function() {
    AuthMiddleware::rateLimit(5, 900); // Mais restritivo para login
    $controller = new AuthController();
    $controller->login();
});

$router->get('/auth/profile', function() {
    $controller = new AuthController();
    $controller->profile();
});

$router->post('/auth/refresh', function() {
    $controller = new AuthController();
    $controller->refreshToken();
});

// Rotas de usuários
$router->get('/users/search', function() {
    $controller = new UserController();
    $controller->searchUsers();
});

$router->get('/users/check-username/{username}', function($username) {
    $controller = new UserController();
    $controller->checkUsername($username);
});

$router->get('/users/{id}', function($id) {
    $controller = new UserController();
    $controller->getUser($id);
});

$router->put('/users/profile', function() {
    $controller = new UserController();
    $controller->updateProfile();
});

$router->post('/users/avatar', function() {
    $controller = new UserController();
    $controller->updateAvatar();
});

// Rotas de posts
$router->get('/posts', function() {
    $controller = new PostController();
    $controller->getPosts();
});

$router->get('/posts/search', function() {
    $controller = new PostController();
    $controller->searchPosts();
});

$router->get('/posts/{id}', function($id) {
    $controller = new PostController();
    $controller->getPost($id);
});

$router->post('/posts', function() {
    $controller = new PostController();
    $controller->createPost();
});

$router->put('/posts/{id}', function($id) {
    $controller = new PostController();
    $controller->updatePost($id);
});

$router->delete('/posts/{id}', function($id) {
    $controller = new PostController();
    $controller->deletePost($id);
});

// Rotas de comentários
$router->get('/comments/posts/{postId}', function($postId) {
    $controller = new CommentController();
    $controller->getComments($postId);
});

$router->post('/comments/posts/{postId}', function($postId) {
    $controller = new CommentController();
    $controller->createComment($postId);
});

$router->put('/comments/{commentId}', function($commentId) {
    $controller = new CommentController();
    $controller->updateComment($commentId);
});

$router->delete('/comments/{commentId}', function($commentId) {
    $controller = new CommentController();
    $controller->deleteComment($commentId);
});

// Rotas de likes
$router->get('/likes/posts/{postId}', function($postId) {
    $controller = new LikeController();
    $controller->getLikes($postId);
});

$router->post('/likes/posts/{postId}', function($postId) {
    $controller = new LikeController();
    $controller->toggleLike($postId);
});

// Rotas de compartilhamentos
$router->get('/shares/posts/{postId}', function($postId) {
    $controller = new LikeController();
    $controller->getShares($postId);
});

$router->post('/shares/posts/{postId}', function($postId) {
    $controller = new LikeController();
    $controller->sharePost($postId);
});

// Executar roteamento
$router->run();
