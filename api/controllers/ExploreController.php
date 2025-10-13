<?php
/**
 * Controlador de Explore / Descoberta
 */

class ExploreController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Retorna visão geral com posts em destaque, perfis recomendados e tendências
     */
    public function overview() {
        try {
            $currentUser = AuthMiddleware::optional();
            $currentUserId = $currentUser ? $currentUser['id'] : null;

            $postsLimit = max(3, min(intval($_GET['posts_limit'] ?? 6), 20));
            $usersLimit = max(3, min(intval($_GET['users_limit'] ?? 5), 20));
            $daysWindow = max(1, min(intval($_GET['days'] ?? 7), 30));
            $sinceDate = date('Y-m-d H:i:s', strtotime("-{$daysWindow} days"));

            $trendingPosts = $this->fetchTrendingPosts($sinceDate, $postsLimit, $currentUserId);
            $recommendedUsers = $this->fetchRecommendedUsers($usersLimit, $currentUserId);
            $trendingHashtags = $this->compileTrendingHashtags($sinceDate, 10);
            $trendingCategories = $this->compileTrendingCategories($sinceDate, 8);
            $freshVoices = $this->fetchFreshVoices($usersLimit, $currentUserId);

            echo Helper::jsonResponse(true, '', [
                'trendingPosts' => $trendingPosts,
                'recommendedUsers' => $recommendedUsers,
                'trendingHashtags' => $trendingHashtags,
                'trendingCategories' => $trendingCategories,
                'freshVoices' => $freshVoices
            ]);
        } catch (Exception $e) {
            Helper::logError('Explore overview error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar destaques do explorar', [], 500);
        }
    }

    /**
     * Pesquisa posts, usuários, grupos e hashtags para a busca do explorar
     */
    public function search() {
        try {
            $query = trim($_GET['q'] ?? '');
            $activeTab = $_GET['tab'] ?? 'all';
            $dateRange = $_GET['dateRange'] ?? 'all';
            $mediaType = $_GET['mediaType'] ?? 'all';
            $category = $_GET['category'] ?? 'all';
            $limit = max(5, min(intval($_GET['limit'] ?? 12), 40));

            if (strlen($query) < 2) {
                echo Helper::jsonResponse(true, '', [
                    'results' => [
                        'posts' => [],
                        'users' => [],
                        'groups' => [],
                        'hashtags' => []
                    ],
                    'meta' => [
                        'query' => $query,
                        'filters' => compact('dateRange', 'mediaType', 'category', 'activeTab')
                    ]
                ]);
                return;
            }

            $currentUser = AuthMiddleware::optional();
            $currentUserId = $currentUser ? $currentUser['id'] : null;

            $posts = $this->searchPosts($query, $dateRange, $mediaType, $category, $limit, $currentUserId);
            $users = $this->searchUsers($query, $limit, $currentUserId);
            $groups = $this->searchGroups($query, $limit);
            $hashtags = $this->searchHashtags($query, $dateRange, $limit);

            echo Helper::jsonResponse(true, '', [
                'results' => [
                    'posts' => $posts,
                    'users' => $users,
                    'groups' => $groups,
                    'hashtags' => $hashtags
                ],
                'meta' => [
                    'query' => $query,
                    'filters' => compact('dateRange', 'mediaType', 'category', 'activeTab'),
                    'totals' => [
                        'posts' => count($posts),
                        'users' => count($users),
                        'groups' => count($groups),
                        'hashtags' => count($hashtags)
                    ]
                ]
            ]);
        } catch (Exception $e) {
            Helper::logError('Explore search error: ' . $e->getMessage(), ['query' => $_GET]);
            echo Helper::jsonResponse(false, 'Erro ao realizar a busca', [], 500);
        }
    }

    /**
     * Tendências rápidas para autocomplete
     */
    public function trending() {
        try {
            $limit = max(3, min(intval($_GET['limit'] ?? 8), 20));
            $daysWindow = max(1, min(intval($_GET['days'] ?? 7), 30));
            $sinceDate = date('Y-m-d H:i:s', strtotime("-{$daysWindow} days"));

            $trendingHashtags = $this->compileTrendingHashtags($sinceDate, $limit);

            echo Helper::jsonResponse(true, '', [
                'trending' => $trendingHashtags
            ]);
        } catch (Exception $e) {
            Helper::logError('Explore trending error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao carregar tendências', [], 500);
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function fetchTrendingPosts(string $sinceDate, int $limit, ?int $currentUserId) {
        $params = [];
        $selectExtras = '';

        if ($currentUserId) {
            $selectExtras = ',
                (SELECT COUNT(*) FROM post_likes pl2 WHERE pl2.post_id = p.id AND pl2.user_id = ?) as isLiked,
                (SELECT COUNT(*) FROM user_follows uf WHERE uf.follower_id = ? AND uf.followed_id = p.user_id) as isFollowed';
            $params[] = $currentUserId;
            $params[] = $currentUserId;
        } else {
            $selectExtras = ', 0 as isLiked, 0 as isFollowed';
        }

        $query = "
            SELECT p.*, 
                   u.nome as autor,
                   u.username,
                   u.avatar_url as avatar,
                   COALESCE(p.likes, 0) as likes,
                   COALESCE(p.comentarios, 0) as comentarios,
                   COALESCE(p.compartilhamentos, 0) as compartilhamentos
                   {$selectExtras}
            FROM posts p
            INNER JOIN usuarios u ON u.id = p.user_id
            WHERE p.created_at >= ?
            ORDER BY p.likes DESC, p.comentarios DESC, p.created_at DESC
            LIMIT ?
        ";

        $params[] = $sinceDate;
        $params[] = $limit;

        $rows = $this->db->fetchAll($query, $params);

        if (empty($rows)) {
            $fallbackParams = [];
            if ($currentUserId) {
                $fallbackParams[] = $currentUserId;
                $fallbackParams[] = $currentUserId;
            }
            $fallbackParams[] = $limit;

            $fallbackQuery = "
                SELECT p.*, 
                       u.nome as autor,
                       u.username,
                       u.avatar_url as avatar,
                       COALESCE(p.likes, 0) as likes,
                       COALESCE(p.comentarios, 0) as comentarios,
                       COALESCE(p.compartilhamentos, 0) as compartilhamentos
                       {$selectExtras}
                FROM posts p
                INNER JOIN usuarios u ON u.id = p.user_id
                ORDER BY p.created_at DESC
                LIMIT ?
            ";

            $rows = $this->db->fetchAll($fallbackQuery, $fallbackParams);
        }

        foreach ($rows as &$row) {
            if (!isset($row['media_files'])) {
                $row['media_files'] = [];
            }
        }

        return array_map(function ($post) use ($currentUserId) {
            return Helper::formatPost($post, $currentUserId);
        }, $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function fetchRecommendedUsers(int $limit, ?int $currentUserId) {
        $params = [$limit];
        $excludeClause = '';

        if ($currentUserId) {
            $excludeClause = 'AND u.id <> ?';
            array_unshift($params, $currentUserId);
        }

        $query = "
            SELECT u.*, 
                   COALESCE(f.followers, 0) as followers,
                   COALESCE(p.posts_count, 0) as posts_count
            FROM usuarios u
            LEFT JOIN (
                SELECT followed_id, COUNT(*) as followers
                FROM user_follows
                GROUP BY followed_id
            ) f ON f.followed_id = u.id
            LEFT JOIN (
                SELECT user_id, COUNT(*) as posts_count
                FROM posts
                GROUP BY user_id
            ) p ON p.user_id = u.id
            WHERE u.username IS NOT NULL {$excludeClause}
            ORDER BY followers DESC, posts_count DESC, u.created_at DESC
            LIMIT ?
        ";

        $rows = $this->db->fetchAll($query, $params);

        return array_map(function ($user) {
            $formatted = Helper::formatUser($user);
            $formatted['followers'] = (int)($user['followers'] ?? 0);
            $formatted['posts_count'] = (int)($user['posts_count'] ?? 0);
            return $formatted;
        }, $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function fetchFreshVoices(int $limit, ?int $currentUserId) {
        $params = [$limit];
        $excludeClause = '';

        if ($currentUserId) {
            $excludeClause = 'WHERE u.id <> ?';
            array_unshift($params, $currentUserId);
        }

        $query = "
            SELECT u.*, COALESCE(p.posts_count, 0) as posts_count
            FROM usuarios u
            LEFT JOIN (
                SELECT user_id, COUNT(*) as posts_count
                FROM posts
                GROUP BY user_id
            ) p ON p.user_id = u.id
            {$excludeClause}
            ORDER BY u.created_at DESC
            LIMIT ?
        ";

        $rows = $this->db->fetchAll($query, $params);

        return array_map(function ($user) {
            $formatted = Helper::formatUser($user);
            $formatted['posts_count'] = (int)($user['posts_count'] ?? 0);
            return $formatted;
        }, $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function compileTrendingCategories(string $sinceDate, int $limit) {
        $query = "
            SELECT categoria, COUNT(*) as total
            FROM posts
            WHERE categoria IS NOT NULL AND categoria <> '' AND created_at >= ?
            GROUP BY categoria
            ORDER BY total DESC
            LIMIT ?
        ";

        $rows = $this->db->fetchAll($query, [$sinceDate, $limit]);

        return array_map(function ($row) {
            return [
                'label' => $row['categoria'],
                'value' => $this->slugify($row['categoria']),
                'count' => (int)$row['total']
            ];
        }, $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function compileTrendingHashtags(string $sinceDate, int $limit) {
        $rows = $this->db->fetchAll(
            'SELECT tags FROM posts WHERE tags IS NOT NULL AND tags <> "" AND created_at >= ?',
            [$sinceDate]
        );

        $tagCounts = [];

        foreach ($rows as $row) {
            $tags = json_decode($row['tags'], true);
            if (!is_array($tags)) {
                continue;
            }

            foreach ($tags as $tag) {
                $normalized = ltrim(trim($tag), '#');
                if ($normalized === '') {
                    continue;
                }
                $normalizedLower = mb_strtolower($normalized, 'UTF-8');
                if (!isset($tagCounts[$normalizedLower])) {
                    $tagCounts[$normalizedLower] = [
                        'tag' => $normalized,
                        'count' => 0
                    ];
                }
                $tagCounts[$normalizedLower]['count']++;
            }
        }

        usort($tagCounts, function ($a, $b) {
            if ($a['count'] === $b['count']) {
                return strcmp($a['tag'], $b['tag']);
            }
            return $b['count'] <=> $a['count'];
        });

        return array_slice(array_values($tagCounts), 0, $limit);
    }

    /** @return array<int, array<string, mixed>> */
    private function searchPosts(string $query, string $dateRange, string $mediaType, string $category, int $limit, ?int $currentUserId) {
        $conditions = [];
        $params = [];

        $likeTerm = '%' . $query . '%';
        $conditions[] = '(p.conteudo LIKE ? OR u.nome LIKE ? OR u.username LIKE ? OR p.categoria LIKE ? OR p.tags LIKE ?)';
        $params = array_merge($params, [$likeTerm, $likeTerm, $likeTerm, $likeTerm, $likeTerm]);

        if ($dateRange !== 'all') {
            if ($dateRange === 'today') {
                $conditions[] = 'DATE(p.created_at) = CURRENT_DATE';
            } elseif ($dateRange === 'week') {
                $conditions[] = 'p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
            } elseif ($dateRange === 'month') {
                $conditions[] = 'p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
            }
        }

        if ($mediaType === 'images') {
            $conditions[] = "(p.tipo_midia = 'imagem' OR p.imagem_url IS NOT NULL)";
        } elseif ($mediaType === 'videos') {
            $conditions[] = "(p.tipo_midia = 'video' OR p.video_url IS NOT NULL)";
        }

        if ($category !== 'all') {
            $conditions[] = 'LOWER(p.categoria) = LOWER(?)';
            $params[] = $category;
        }

        $selectExtras = '';
        if ($currentUserId) {
            $selectExtras = ',
                (SELECT COUNT(*) FROM post_likes pl2 WHERE pl2.post_id = p.id AND pl2.user_id = ?) as isLiked,
                (SELECT COUNT(*) FROM user_follows uf WHERE uf.follower_id = ? AND uf.followed_id = p.user_id) as isFollowed';
            $params = array_merge([$currentUserId, $currentUserId], $params);
        } else {
            $selectExtras = ', 0 as isLiked, 0 as isFollowed';
        }

        $whereClause = implode(' AND ', $conditions);

        $querySql = "
            SELECT p.*, 
                   u.nome as autor, 
                   u.username, 
                   u.avatar_url as avatar,
                   COALESCE(p.likes, 0) as likes,
                   COALESCE(p.comentarios, 0) as comentarios,
                   COALESCE(p.compartilhamentos, 0) as compartilhamentos
                   {$selectExtras}
            FROM posts p
            INNER JOIN usuarios u ON u.id = p.user_id
            WHERE {$whereClause}
            ORDER BY p.created_at DESC
            LIMIT ?
        ";

        $params[] = $limit;

        $rows = $this->db->fetchAll($querySql, $params);

        foreach ($rows as &$row) {
            if (!isset($row['media_files'])) {
                $row['media_files'] = [];
            }
        }

        return array_map(function ($post) use ($currentUserId) {
            return Helper::formatPost($post, $currentUserId);
        }, $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function searchUsers(string $query, int $limit, ?int $currentUserId) {
        $likeTerm = '%' . $query . '%';
        $params = [$likeTerm, $likeTerm, $likeTerm];

        $excludeClause = '';
        if ($currentUserId) {
            $excludeClause = 'AND u.id <> ?';
            $params[] = $currentUserId;
        }

        $params[] = $limit;

        $querySql = "
            SELECT u.*, COALESCE(f.followers, 0) as followers
            FROM usuarios u
            LEFT JOIN (
                SELECT followed_id, COUNT(*) as followers
                FROM user_follows
                GROUP BY followed_id
            ) f ON f.followed_id = u.id
            WHERE (u.nome LIKE ? OR u.username LIKE ? OR u.bio LIKE ?)
              {$excludeClause}
            ORDER BY followers DESC, u.created_at DESC
            LIMIT ?
        ";

        $rows = $this->db->fetchAll($querySql, $params);

        return array_map(function ($user) {
            $formatted = Helper::formatUser($user);
            $formatted['followers'] = (int)($user['followers'] ?? 0);
            return $formatted;
        }, $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function searchGroups(string $query, int $limit) {
        $likeTerm = '%' . $query . '%';
        $params = [$likeTerm, $likeTerm, $likeTerm, $limit];

        $rows = $this->db->fetchAll(
            "SELECT g.* FROM grupos g
             WHERE g.nome LIKE ? OR g.descricao LIKE ? OR g.categoria LIKE ?
             ORDER BY g.membros DESC, g.ultima_atividade DESC
             LIMIT ?",
            $params
        );

        return array_map(function ($group) {
            return [
                'id' => (int)$group['id'],
                'nome' => $group['nome'],
                'descricao' => $group['descricao'],
                'categoria' => $group['categoria'],
                'membros' => (int)($group['membros'] ?? 0),
                'imagem' => $group['imagem'],
                'imagem_capa' => $group['imagem_capa'],
                'ultima_atividade' => $group['ultima_atividade'],
                'created_at' => $group['created_at']
            ];
        }, $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function searchHashtags(string $query, string $dateRange, int $limit) {
        $sinceDate = null;
        if ($dateRange === 'today') {
            $sinceDate = date('Y-m-d 00:00:00');
        } elseif ($dateRange === 'week') {
            $sinceDate = date('Y-m-d H:i:s', strtotime('-7 days'));
        } elseif ($dateRange === 'month') {
            $sinceDate = date('Y-m-d H:i:s', strtotime('-30 days'));
        }

        $rows = [];
        if ($sinceDate) {
            $rows = $this->db->fetchAll(
                'SELECT tags FROM posts WHERE tags IS NOT NULL AND tags <> "" AND created_at >= ?',
                [$sinceDate]
            );
        } else {
            $rows = $this->db->fetchAll(
                'SELECT tags FROM posts WHERE tags IS NOT NULL AND tags <> ""'
            );
        }

        $term = ltrim($query, '#');
        $term = mb_strtolower($term, 'UTF-8');

        $tagCounts = [];

        foreach ($rows as $row) {
            $tags = json_decode($row['tags'], true);
            if (!is_array($tags)) {
                continue;
            }

            foreach ($tags as $tag) {
                $normalized = ltrim(trim($tag), '#');
                if ($normalized === '') {
                    continue;
                }
                $normalizedLower = mb_strtolower($normalized, 'UTF-8');
                if ($term && strpos($normalizedLower, $term) === false) {
                    continue;
                }
                if (!isset($tagCounts[$normalizedLower])) {
                    $tagCounts[$normalizedLower] = [
                        'tag' => $normalized,
                        'count' => 0
                    ];
                }
                $tagCounts[$normalizedLower]['count']++;
            }
        }

        usort($tagCounts, function ($a, $b) {
            if ($a['count'] === $b['count']) {
                return strcmp($a['tag'], $b['tag']);
            }
            return $b['count'] <=> $a['count'];
        });

        return array_slice(array_values($tagCounts), 0, $limit);
    }

    private function slugify(string $value): string {
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT', $value);
        if ($normalized === false) {
            $normalized = $value;
        }
        $normalized = strtolower($normalized);
        $normalized = preg_replace('/[^a-z0-9]+/', '-', $normalized);
        return trim($normalized, '-');
    }
}
