<?php
/**
 * Serviço para gerenciar campanhas promovidas
 */

class AdCampaignService {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function listCampaigns(int $userId, array $filters = []): array {
        $params = [$userId];
        $where = ['c.user_id = ?'];

        if (!empty($filters['status'])) {
            $where[] = 'c.status = ?';
            $params[] = $filters['status'];
        }

        $order = ' ORDER BY c.created_at DESC';
        $rows = $this->db->fetchAll(
            'SELECT c.*, sp.nome as plan_nome
             FROM ad_campaigns c
             LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
             WHERE ' . implode(' AND ', $where) . $order,
            $params
        );

        $campaignIds = array_column($rows, 'id');
        $postsMap = [];
        if ($campaignIds) {
            $placeholders = implode(',', array_fill(0, count($campaignIds), '?'));
            $posts = $this->db->fetchAll(
                "SELECT cp.*, p.conteudo, p.imagem_url
                 FROM ad_campaign_posts cp
                 INNER JOIN posts p ON p.id = cp.post_id
                 WHERE cp.campaign_id IN ({$placeholders})",
                $campaignIds
            );
            foreach ($posts as $post) {
                $postsMap[$post['campaign_id']][] = $this->formatCampaignPost($post);
            }
        }

        return array_map(function ($row) use ($postsMap) {
            return $this->formatCampaign($row, $postsMap[$row['id']] ?? []);
        }, $rows);
    }

    public function getCampaign(int $userId, int $campaignId): ?array {
        $row = $this->db->fetch(
            'SELECT c.*, sp.nome as plan_nome
             FROM ad_campaigns c
             LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
             WHERE c.id = ? AND c.user_id = ?',
            [$campaignId, $userId]
        );

        if (!$row) {
            return null;
        }

        $posts = $this->db->fetchAll(
            'SELECT cp.*, p.conteudo, p.imagem_url
             FROM ad_campaign_posts cp
             INNER JOIN posts p ON p.id = cp.post_id
             WHERE cp.campaign_id = ?',
            [$campaignId]
        );

        $metrics = $this->db->fetchAll(
            'SELECT data, SUM(impressoes) as impressoes, SUM(cliques) as cliques,
                    SUM(engagements) as engagements, SUM(gastos) as gastos
             FROM ad_metrics_daily WHERE campaign_id = ? GROUP BY data ORDER BY data ASC',
            [$campaignId]
        );

        $campaign = $this->formatCampaign($row, array_map([$this, 'formatCampaignPost'], $posts));
        $campaign['metrics'] = array_map(function ($row) {
            return [
                'data' => $row['data'],
                'impressoes' => (int)$row['impressoes'],
                'cliques' => (int)$row['cliques'],
                'engagements' => (int)$row['engagements'],
                'gastos' => (float)$row['gastos']
            ];
        }, $metrics);

        return $campaign;
    }

    public function createCampaign(int $userId, array $data, ?array $plan = null): int {
        $titulo = Helper::sanitizeString($data['titulo'] ?? '');
        if (trim($titulo) === '') {
            throw new Exception('Título da campanha é obrigatório');
        }

        $objetivo = $this->validateEnum($data['objetivo'] ?? 'alcance', ['alcance','cliques','conversao','engajamento']);
        $status = $this->validateEnum($data['status'] ?? 'rascunho', ['rascunho','ativo','pausado','encerrado']);
        $dataInicio = $data['data_inicio'] ?? date('Y-m-d H:i:s');
        $dataFim = $data['data_fim'] ?? null;
        $orcamentoTotal = isset($data['orcamento_total']) ? (float)$data['orcamento_total'] : null;
        $orcamentoDiario = isset($data['orcamento_diario']) ? (float)$data['orcamento_diario'] : null;
        $publicoAlvo = isset($data['publico_alvo']) ? json_encode($data['publico_alvo'], JSON_UNESCAPED_UNICODE) : null;

        return $this->db->insert(
            'INSERT INTO ad_campaigns (user_id, plan_id, titulo, objetivo, status, data_inicio, data_fim, orcamento_total, orcamento_diario, publico_alvo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $userId,
                $plan['plan_id'] ?? ($plan['id'] ?? null),
                $titulo,
                $objetivo,
                $status,
                $dataInicio,
                $dataFim,
                $orcamentoTotal,
                $orcamentoDiario,
                $publicoAlvo
            ]
        );
    }

    public function updateCampaign(int $userId, int $campaignId, array $data): void {
        $campaign = $this->db->fetch(
            'SELECT id FROM ad_campaigns WHERE id = ? AND user_id = ?',
            [$campaignId, $userId]
        );

        if (!$campaign) {
            throw new Exception('Campanha não encontrada');
        }

        $fields = [];
        $values = [];

        if (isset($data['titulo'])) {
            $fields[] = 'titulo = ?';
            $values[] = Helper::sanitizeString($data['titulo']);
        }

        if (isset($data['status'])) {
            $fields[] = 'status = ?';
            $values[] = $this->validateEnum($data['status'], ['rascunho','ativo','pausado','encerrado']);
        }

        if (isset($data['data_inicio'])) {
            $fields[] = 'data_inicio = ?';
            $values[] = $data['data_inicio'];
        }

        if (array_key_exists('data_fim', $data)) {
            $fields[] = 'data_fim = ?';
            $values[] = $data['data_fim'];
        }

        if (isset($data['orcamento_total'])) {
            $fields[] = 'orcamento_total = ?';
            $values[] = (float)$data['orcamento_total'];
        }

        if (isset($data['orcamento_diario'])) {
            $fields[] = 'orcamento_diario = ?';
            $values[] = (float)$data['orcamento_diario'];
        }

        if (isset($data['publico_alvo'])) {
            $fields[] = 'publico_alvo = ?';
            $values[] = json_encode($data['publico_alvo'], JSON_UNESCAPED_UNICODE);
        }

        if (!$fields) {
            return;
        }

        $values[] = $campaignId;
        $this->db->execute('UPDATE ad_campaigns SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = ?', $values);
    }

    public function addPostToCampaign(int $userId, int $campaignId, int $postId): void {
        $campaign = $this->db->fetch(
            'SELECT id FROM ad_campaigns WHERE id = ? AND user_id = ?',
            [$campaignId, $userId]
        );

        if (!$campaign) {
            throw new Exception('Campanha não encontrada');
        }

        $post = $this->db->fetch(
            'SELECT id, user_id FROM posts WHERE id = ?',
            [$postId]
        );

        if (!$post || (int)$post['user_id'] !== $userId) {
            throw new Exception('Somente posts próprios podem ser promovidos');
        }

        $this->db->insert(
            'INSERT INTO ad_campaign_posts (campaign_id, post_id, status, prioridade)
             VALUES (?, ?, "ativo", 0)
             ON DUPLICATE KEY UPDATE status = VALUES(status)',
            [$campaignId, $postId]
        );

        $this->db->execute(
            'UPDATE posts SET is_promovido = 1, promocao_status = "ativo", ad_campaign_id = ? WHERE id = ?',
            [$campaignId, $postId]
        );
    }

    public function removePostFromCampaign(int $userId, int $campaignId, int $postId): void {
        $campaign = $this->db->fetch(
            'SELECT id FROM ad_campaigns WHERE id = ? AND user_id = ?',
            [$campaignId, $userId]
        );

        if (!$campaign) {
            throw new Exception('Campanha não encontrada');
        }

        $this->db->execute(
            'DELETE FROM ad_campaign_posts WHERE campaign_id = ? AND post_id = ?',
            [$campaignId, $postId]
        );

        $this->db->execute(
            'UPDATE posts SET is_promovido = 0, promocao_status = "expirado", ad_campaign_id = NULL WHERE id = ? AND ad_campaign_id = ?',
            [$postId, $campaignId]
        );
    }

    public function deleteCampaign(int $userId, int $campaignId): void {
        $campaign = $this->db->fetch(
            'SELECT id FROM ad_campaigns WHERE id = ? AND user_id = ?',
            [$campaignId, $userId]
        );

        if (!$campaign) {
            throw new Exception('Campanha não encontrada');
        }

        $this->db->execute(
            'UPDATE posts SET is_promovido = 0, promocao_status = "expirado", ad_campaign_id = NULL WHERE ad_campaign_id = ?',
            [$campaignId]
        );

        $this->db->execute(
            'DELETE FROM ad_campaign_posts WHERE campaign_id = ?',
            [$campaignId]
        );

        $this->db->execute(
            'DELETE FROM ad_metrics_daily WHERE campaign_id = ?',
            [$campaignId]
        );

        $this->db->execute('DELETE FROM ad_campaigns WHERE id = ?', [$campaignId]);
    }

    public function getSponsoredFeedPosts(int $maxSlots = 1): array {
        if ($maxSlots <= 0) {
            return [];
        }

        $now = date('Y-m-d H:i:s');
        $limit = max($maxSlots, $maxSlots * 3);

        $rows = $this->db->fetchAll(
            'SELECT p.*,
                    c.id AS campaign_id,
                    c.titulo AS campaign_titulo,
                    c.objetivo AS campaign_objetivo,
                    c.status AS campaign_status,
                    c.data_inicio AS campaign_data_inicio,
                    c.data_fim AS campaign_data_fim,
                    cp.id AS campaign_post_id,
                    cp.prioridade AS campaign_prioridade,
                    u.nome AS autor_nome,
                    u.username AS autor_username,
                    u.avatar_url AS autor_avatar
             FROM ad_campaigns c
             INNER JOIN ad_campaign_posts cp ON cp.campaign_id = c.id
             INNER JOIN posts p ON p.id = cp.post_id
             INNER JOIN usuarios u ON u.id = p.user_id
             WHERE c.status = "ativo"
               AND cp.status = "ativo"
               AND p.is_promovido = 1
               AND (c.data_inicio IS NULL OR c.data_inicio <= ?)
               AND (c.data_fim IS NULL OR c.data_fim >= ?)
             ORDER BY cp.prioridade DESC, cp.criado_em DESC, c.updated_at DESC
             LIMIT ?',
            [$now, $now, $limit]
        );

        return array_map(function ($row) {
            if (empty($row['autor'])) {
                $row['autor'] = $row['autor_nome'] ?? $row['autor'];
            }
            if (empty($row['username'])) {
                $row['username'] = $row['autor_username'] ?? $row['username'];
            }
            if (empty($row['avatar'])) {
                $row['avatar'] = $row['autor_avatar'] ?? $row['avatar'];
            }
            if (empty($row['avatar_url'])) {
                $row['avatar_url'] = $row['autor_avatar'] ?? $row['avatar_url'];
            }

            return $row;
        }, $rows);
    }

    private function validateEnum(string $value, array $allowed): string {
        $value = strtolower(trim($value));
        if (!in_array($value, $allowed, true)) {
            return $allowed[0];
        }
        return $value;
    }

    private function formatCampaign(array $row, array $posts): array {
        return [
            'id' => (int)$row['id'],
            'user_id' => (int)$row['user_id'],
            'plan_id' => $row['plan_id'] !== null ? (int)$row['plan_id'] : null,
            'plan_nome' => $row['plan_nome'],
            'titulo' => $row['titulo'],
            'objetivo' => $row['objetivo'],
            'status' => $row['status'],
            'data_inicio' => $row['data_inicio'],
            'data_fim' => $row['data_fim'],
            'orcamento_total' => $row['orcamento_total'] !== null ? (float)$row['orcamento_total'] : null,
            'orcamento_diario' => $row['orcamento_diario'] !== null ? (float)$row['orcamento_diario'] : null,
            'publico_alvo' => $row['publico_alvo'] ? json_decode($row['publico_alvo'], true) : null,
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'posts' => $posts
        ];
    }

    private function formatCampaignPost(array $row): array {
        return [
            'id' => (int)$row['id'],
            'campaign_id' => (int)$row['campaign_id'],
            'post_id' => (int)$row['post_id'],
            'status' => $row['status'],
            'prioridade' => (int)$row['prioridade'],
            'criado_em' => $row['criado_em'],
            'post' => [
                'conteudo' => $row['conteudo'] ?? null,
                'imagem_url' => $row['imagem_url'] ?? null
            ]
        ];
    }
}
