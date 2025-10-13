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
        $formatted = [
            'id' => (int)$user['id'],
            'nome' => $user['nome'] ?? '',
            'username' => $user['username'] ?? '',
            'email' => $user['email'] ?? '',
            // These fields may not be present in all contexts
            'telefone' => $user['telefone'] ?? null,
            'bio' => $user['bio'] ?? null,
            'website' => $user['website'] ?? null,
            'localizacao' => $user['localizacao'] ?? null,
            'tipo' => $user['tipo'] ?? '',
            'avatar_url' => $user['avatar_url'] ?? '/placeholder.svg?height=40&width=40',
            'capa_url' => $user['capa_url'] ?? null,
            'created_at' => $user['created_at'] ?? null,
            'updated_at' => $user['updated_at'] ?? null
        ];

        $formatted['subscription'] = $user['subscription'] ?? null;
        $formatted['is_premium'] = isset($user['is_premium']) ? (bool)$user['is_premium'] : false;

        return $formatted;
    }

    public static function formatSubscriptionSummary($subscription) {
        if (!$subscription) {
            return null;
        }

        return [
            'id' => isset($subscription['id']) ? (int)$subscription['id'] : 0,
            'plan_slug' => $subscription['plan_slug'] ?? null,
            'plan_nome' => $subscription['plan_nome'] ?? null,
            'plan_descricao' => $subscription['plan_descricao'] ?? null,
            'status' => $subscription['status'] ?? null,
            'starts_at' => $subscription['starts_at'] ?? null,
            'expires_at' => $subscription['expires_at'] ?? null,
            'auto_renova' => isset($subscription['auto_renova']) ? (bool)$subscription['auto_renova'] : null,
            'acesso_grupos' => isset($subscription['acesso_grupos']) ? (bool)$subscription['acesso_grupos'] : null,
            'acesso_cursos' => isset($subscription['acesso_cursos']) ? (bool)$subscription['acesso_cursos'] : null,
            'anuncios_promovidos' => isset($subscription['anuncios_promovidos']) ? (bool)$subscription['anuncios_promovidos'] : null,
            'valor_mensal' => isset($subscription['valor_mensal']) ? (float)$subscription['valor_mensal'] : null,
            'moeda' => $subscription['moeda'] ?? null,
            'beneficios' => $subscription['beneficios'] ?? [],
            'metadata' => $subscription['metadata'] ?? null
        ];
    }

    public static function isPremiumFromSubscription($subscription) {
        if (!$subscription) {
            return false;
        }

        if (!empty($subscription['plan_slug']) && $subscription['plan_slug'] === 'plano-premium') {
            return true;
        }

        if (isset($subscription['acesso_grupos']) && $subscription['acesso_grupos']) {
            return true;
        }

        return false;
    }

    public static function mergeUserSubscriptionData(array $user, $subscription) {
        $user['subscription'] = self::formatSubscriptionSummary($subscription);
        $user['is_premium'] = self::isPremiumFromSubscription($subscription);
        return $user;
    }

    public static function buildCoursesUrl(string $path = ''): string {
        $base = $_ENV['COURSES_APP_URL'] ?? $_ENV['COURSES_URL'] ?? '';

        if (!$base) {
            $base = APP_BASE_URL ?: '';
        }

        if (!$base) {
            $base = FRONTEND_URL ?: '';
        }

        if (!$base) {
            $base = 'https://cursos.empowerup.com.br';
        }

        $base = rtrim($base, '/');

        if ($path !== '') {
            $cleanPath = '/' . ltrim($path, '/');
            return $base . $cleanPath;
        }

        return $base;
    }
    
    /**
     * Formatar post para resposta
     */
    public static function formatPost($post, $currentUserId = null) {
        $avatarPath = $post['avatar']
            ?? $post['avatar_url']
            ?? $post['foto_perfil']
            ?? ($post['usuario_avatar'] ?? null);

        $tags = $post['tags'] ?? '[]';
        if (is_array($tags)) {
            $parsedTags = $tags;
        } else {
            $parsedTags = json_decode($tags, true);
            if (!is_array($parsedTags)) {
                $parsedTags = [];
            }
        }

    $groupId = isset($post['grupo_id']) && $post['grupo_id'] !== null ? (int)$post['grupo_id'] : null;
    $groupPayload = null;
        if ($groupId) {
            $groupPayload = [
                'id' => $groupId,
                'nome' => $post['grupo_nome'] ?? null,
                'slug' => $post['grupo_slug'] ?? null,
                'imagem' => $post['grupo_imagem'] ?? null,
                'capa' => $post['grupo_capa'] ?? null
            ];
        }

        $formatted = [
            'id' => (int)$post['id'],
            'user_id' => (int)$post['user_id'],
            'autor' => $post['autor'] ?? '',
            'username' => $post['username'] ?? '',
            'avatar' => $avatarPath,
            'avatar_url' => $avatarPath,
            'conteudo' => $post['conteudo'] ?? '',
            'imagem' => $post['imagem'] ?? $post['imagem_url'] ?? null,
            'categoria' => $post['categoria'] ?? null,
            'tags' => $parsedTags,
            'likes' => (int)($post['likes'] ?? 0),
            'likes_count' => (int)($post['likes'] ?? 0),
            'comentarios' => (int)($post['comentarios'] ?? 0),
            'compartilhamentos' => (int)($post['compartilhamentos'] ?? 0),
            'created_at' => $post['created_at'] ?? null,
            'timeAgo' => isset($post['created_at']) ? self::timeAgo($post['created_at']) : null,
            'imagem_url' => $post['imagem_url'] ?? null,
            'video_url' => $post['video_url'] ?? null,
            'gif_url' => $post['gif_url'] ?? null,
            'tipo_midia' => $post['tipo_midia'] ?? 'none',
            'user_liked' => isset($post['isLiked']) ? (bool)$post['isLiked'] : (isset($post['user_liked']) ? (bool)$post['user_liked'] : false),
            'isLiked' => isset($post['isLiked']) ? (bool)$post['isLiked'] : (isset($post['user_liked']) ? (bool)$post['user_liked'] : false),
            'isFollowed' => isset($post['isFollowed']) ? (bool)$post['isFollowed'] : false,
            'isOwner' => $currentUserId ? (int)$post['user_id'] === (int)$currentUserId : false,
            'media_files' => $post['media_files'] ?? [],
            'escopo_visibilidade' => $post['escopo_visibilidade'] ?? 'publico',
            'grupo_id' => $groupId,
            'grupo_nome' => $post['grupo_nome'] ?? null,
            'grupo_slug' => $post['grupo_slug'] ?? null,
            'grupo_imagem' => $post['grupo_imagem'] ?? null,
            'grupo_capa' => $post['grupo_capa'] ?? null,
            'grupo' => $groupPayload
        ];

        $isPromoted = isset($post['is_promovido']) ? (bool)$post['is_promovido'] : false;
        $adCampaignId = array_key_exists('ad_campaign_id', $post) && $post['ad_campaign_id'] !== null
            ? (int)$post['ad_campaign_id']
            : null;

        if ($isPromoted || $adCampaignId !== null) {
            $formatted['is_promovido'] = $isPromoted;
            $formatted['ad_campaign_id'] = $adCampaignId;
            $formatted['promocao_status'] = $post['promocao_status'] ?? null;
            $formatted['promocao_expira_em'] = $post['promocao_expira_em'] ?? null;

            if (isset($post['promocao_metadata'])) {
                if (is_array($post['promocao_metadata'])) {
                    $formatted['promocao_metadata'] = $post['promocao_metadata'];
                } elseif (is_string($post['promocao_metadata'])) {
                    $decoded = json_decode($post['promocao_metadata'], true);
                    $formatted['promocao_metadata'] = json_last_error() === JSON_ERROR_NONE
                        ? $decoded
                        : $post['promocao_metadata'];
                }
            }
        }

        $hasCampaignData = isset($post['campaign_id']);
        if ($hasCampaignData) {
            $formatted['sponsored'] = true;
            $formatted['sponsored_badge'] = 'Patrocinado';
            $formatted['sponsored_frequency'] = 10;
            $formatted['sponsored_campaign'] = [
                'id' => (int)$post['campaign_id'],
                'titulo' => $post['campaign_titulo'] ?? null,
                'objetivo' => $post['campaign_objetivo'] ?? null,
                'status' => $post['campaign_status'] ?? null,
                'data_inicio' => $post['campaign_data_inicio'] ?? ($post['data_inicio'] ?? null),
                'data_fim' => $post['campaign_data_fim'] ?? ($post['data_fim'] ?? null),
            ];
        } elseif (!isset($formatted['sponsored']) && $isPromoted) {
            $formatted['sponsored'] = true;
            $formatted['sponsored_badge'] = 'Patrocinado';
            $formatted['sponsored_frequency'] = 10;
        } else {
            $formatted['sponsored'] = $formatted['sponsored'] ?? false;
        }

        return $formatted;
    }
    
    /**
     * Formatar comentário para resposta
     */
    public static function formatComment($comment, $currentUserId = null) {
        $avatarPath = $comment['avatar'] ?? $comment['avatar_url'] ?? $comment['foto_perfil'] ?? '';

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
            'avatar' => $avatarPath,
            'avatar_url' => $avatarPath,
            'foto_perfil' => $comment['foto_perfil'] ?? null,
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
        switch ($type) {
            case 'video':
                $subfolder = 'videos/posts/';
                break;
            case 'avatar':
                $subfolder = 'pfp/user/';
                break;
            case 'cover':
                $subfolder = 'covers/user/';
                break;
            default:
                $subfolder = 'posts/';
        }
        
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
