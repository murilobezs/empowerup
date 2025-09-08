<?php
/**
 * Classe de utilidades e helpers
 */

class Helper {
    
    /**
     * Calcular tempo decorrido
     */
    public static function timeAgo($datetime) {
        $time = time() - strtotime($datetime);
        
        if ($time < 60) return 'agora';
        if ($time < 3600) return floor($time/60) . 'min';
        if ($time < 86400) return floor($time/3600) . 'h';
        if ($time < 2592000) return floor($time/86400) . 'd';
        if ($time < 31536000) return floor($time/2592000) . 'M';
        
        return floor($time/31536000) . 'a';
    }
    
    /**
     * Gerar username único
     */
    public static function generateUsername($nome) {
        // Remove espaços, acentos e caracteres especiais
        $username = strtolower($nome);
        $username = preg_replace('/[àáâãäå]/u', 'a', $username);
        $username = preg_replace('/[èéêë]/u', 'e', $username);
        $username = preg_replace('/[ìíîï]/u', 'i', $username);
        $username = preg_replace('/[òóôõö]/u', 'o', $username);
        $username = preg_replace('/[ùúûü]/u', 'u', $username);
        $username = preg_replace('/[ç]/u', 'c', $username);
        $username = preg_replace('/[^a-z0-9]/', '', $username);
        
        // Adiciona números aleatórios se necessário
        if (strlen($username) < 3) {
            $username .= rand(100, 999);
        }
        
        return $username;
    }
    
    /**
     * Validar email
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Validar senha
     */
    public static function validatePassword($password) {
        return strlen($password) >= PASSWORD_MIN_LENGTH;
    }
    
    /**
     * Validar username
     */
    public static function validateUsername($username) {
        $length = strlen($username);
        return $length >= USERNAME_MIN_LENGTH && 
               $length <= USERNAME_MAX_LENGTH && 
               preg_match('/^[a-zA-Z0-9_]+$/', $username);
    }
    
    /**
     * Gerar hash da senha
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    /**
     * Verificar senha
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Sanitizar string
     */
    public static function sanitizeString($string) {
        return htmlspecialchars(trim($string), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Formatar usuário para resposta
     */
    public static function formatUser($user) {
        return [
            'id' => (int)$user['id'],
            'nome' => $user['nome'],
            'username' => $user['username'],
            'email' => $user['email'],
            // These fields may not be present in all contexts
            'telefone' => $user['telefone'] ?? null,
            'bio' => $user['bio'] ?? null,
            'tipo' => $user['tipo'],
            'avatar_url' => $user['avatar_url'],
            'created_at' => $user['created_at'] ?? null,
            'updated_at' => $user['updated_at'] ?? null
        ];
    }
    
    /**
     * Formatar post para resposta
     */
    public static function formatPost($post, $currentUserId = null) {
        return [
            'id' => (int)$post['id'],
            'user_id' => (int)$post['user_id'],
            'autor' => $post['autor'],
            'username' => $post['username'],
            'avatar' => $post['avatar'],
            'conteudo' => $post['conteudo'],
            'imagem' => $post['imagem'],
            'categoria' => $post['categoria'],
            'tags' => json_decode($post['tags'] ?? '[]', true),
            'likes' => (int)($post['likes'] ?? 0),
            'comentarios' => (int)($post['comentarios'] ?? 0),
            'compartilhamentos' => (int)($post['compartilhamentos'] ?? 0),
            'created_at' => $post['created_at'],
            'timeAgo' => self::timeAgo($post['created_at']),
            'imagem_url' => $post['imagem_url'],
            'video_url' => $post['video_url'],
            'gif_url' => $post['gif_url'],
            'tipo_midia' => $post['tipo_midia'] ?? 'none',
            'isLiked' => isset($post['isLiked']) ? (bool)$post['isLiked'] : false,
            'isFollowed' => isset($post['isFollowed']) ? (bool)$post['isFollowed'] : false,
            'isOwner' => $currentUserId ? (int)$post['user_id'] === (int)$currentUserId : false
        ];
    }
    
    /**
     * Formatar comentário para resposta
     */
    public static function formatComment($comment, $currentUserId = null) {
        return [
            'id' => (int)$comment['id'],
            'post_id' => (int)$comment['post_id'],
            'user_id' => (int)$comment['user_id'],
            'conteudo' => $comment['conteudo'],
            'parent_id' => $comment['parent_id'] ? (int)$comment['parent_id'] : null,
            'created_at' => $comment['created_at'],
            'updated_at' => $comment['updated_at'],
            'timeAgo' => self::timeAgo($comment['created_at']),
            'autor' => $comment['autor'] ?? '',
            'username' => $comment['username'] ?? '',
            'avatar' => $comment['avatar'] ?? '',
            'isOwner' => $currentUserId ? (int)$comment['user_id'] === (int)$currentUserId : false,
            'replies' => $comment['replies'] ?? []
        ];
    }
    
    /**
     * Processar upload de arquivo
     */
    public static function processUpload($file, $type = 'image') {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Erro no upload do arquivo');
        }
        
        // Verificar tamanho
        if ($file['size'] > MAX_FILE_SIZE) {
            throw new Exception('Arquivo muito grande. Máximo: ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB');
        }
        
        // Verificar extensão
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = $type === 'video' ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_EXTENSIONS;
        
        if (!in_array($extension, $allowedExtensions)) {
            throw new Exception('Tipo de arquivo não permitido');
        }
        
        // Gerar nome único
        $filename = uniqid() . '_' . time() . '.' . $extension;
        
        // Definir pasta de destino
        $subfolder = $type === 'video' ? 'videos/posts/' : 
                    ($type === 'avatar' ? 'pfp/user/' : 'posts/');
        
        $uploadDir = UPLOAD_PATH . $subfolder;
        
        // Criar diretório se não existir
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $uploadPath = $uploadDir . $filename;
        
        // Mover arquivo
        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            throw new Exception('Erro ao salvar arquivo');
        }
        
        return '/images/' . $subfolder . $filename;
    }

    /**
     * Salvar mídia no banco de dados como BLOB (post_media)
     * Retorna array com metadata do arquivo salvo
     */
    public static function saveMediaToDb($postId, $file) {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Erro no upload do arquivo');
        }

        // Verificar tamanho
        if ($file['size'] > MAX_FILE_SIZE) {
            throw new Exception('Arquivo muito grande. Máximo: ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB');
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $mime = $file['type'] ?? mime_content_type($file['tmp_name']);
        $allowedExtensions = in_array($extension, ALLOWED_VIDEO_EXTENSIONS) ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_EXTENSIONS;

        if (!in_array($extension, $allowedExtensions)) {
            throw new Exception('Tipo de arquivo não permitido');
        }

        $filename = uniqid() . '_' . time() . '.' . $extension;

        $data = file_get_contents($file['tmp_name']);

        // Inserir no banco usando PDO diretamente para bind de LOB
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $sql = 'INSERT INTO post_media (post_id, media_filename, media_type, data, created_at) VALUES (?, ?, ?, ?, NOW())';
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(1, $postId, PDO::PARAM_INT);
        $stmt->bindValue(2, $filename);
        $stmt->bindValue(3, $mime);
        $stmt->bindValue(4, $data, PDO::PARAM_LOB);

        if (!$stmt->execute()) {
            throw new Exception('Erro ao salvar mídia no banco');
        }

        $mediaId = $pdo->lastInsertId();

        return [
            'id' => (int)$mediaId,
            'media_filename' => $filename,
            'media_type' => $mime
        ];
    }
    
    /**
     * Log de erro
     */
    public static function logError($message, $context = []) {
        $logFile = __DIR__ . '/../logs/app_errors.log';
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' Context: ' . json_encode($context) : '';
        $logMessage = "[{$timestamp}] {$message}{$contextStr}" . PHP_EOL;
        
        file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Gerar resposta JSON padronizada
     */
    public static function jsonResponse($success, $message = '', $data = [], $statusCode = 200) {
        http_response_code($statusCode);
        
        $response = [
            'success' => $success,
            'message' => $message
        ];
        
        if (!empty($data)) {
            $response = array_merge($response, $data);
        }
        
        return json_encode($response, JSON_UNESCAPED_UNICODE);
    }
}
