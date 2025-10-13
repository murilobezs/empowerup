<?php
/**
 * Serviço para gerenciar planos e assinaturas
 */

class SubscriptionService {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Listar planos ativos
     */
    public function getPlans(bool $includeInactive = false): array {
        $query = 'SELECT * FROM subscription_plans';
        $params = [];
        if (!$includeInactive) {
            $query .= ' WHERE ativo = 1';
        }
        $query .= ' ORDER BY destaque DESC, ordem ASC, valor_mensal ASC';

        $rows = $this->db->fetchAll($query, $params);
        return array_map([$this, 'formatPlan'], $rows);
    }

    /**
     * Obter plano por ID ou slug
     */
    public function getPlanByIdentifier($identifier, bool $onlyActive = true): ?array {
        if (is_numeric($identifier)) {
            $plan = $this->db->fetch(
                'SELECT * FROM subscription_plans WHERE id = ?' . ($onlyActive ? ' AND ativo = 1' : ''),
                [$identifier]
            );
        } else {
            $plan = $this->db->fetch(
                'SELECT * FROM subscription_plans WHERE slug = ?' . ($onlyActive ? ' AND ativo = 1' : ''),
                [$identifier]
            );
        }

        return $plan ? $this->formatPlan($plan) : null;
    }

    /**
     * Obter assinatura ativa da usuária
     */
    public function getActiveSubscription(int $userId): ?array {
        $row = $this->db->fetch(
            'SELECT us.*, sp.nome as plan_nome, sp.slug as plan_slug, sp.descricao as plan_descricao,
                    sp.valor_mensal, sp.moeda, sp.limite_anuncios_semana, sp.acesso_grupos,
                    sp.acesso_cursos, sp.anuncios_promovidos, sp.beneficios, sp.destaque
             FROM user_subscriptions us
             INNER JOIN subscription_plans sp ON sp.id = us.plan_id
             WHERE us.user_id = ? AND us.status = "ativa" AND us.expires_at > NOW()
             ORDER BY us.expires_at DESC
             LIMIT 1',
            [$userId]
        );

        if (!$row) {
            return null;
        }

        $row['beneficios'] = $row['beneficios'] ? json_decode($row['beneficios'], true) : [];
        $row['metadata'] = $row['metadata'] ? json_decode($row['metadata'], true) : null;
        return $row;
    }

    /**
     * Criar/renovar assinatura
     */
    public function startSubscription(int $userId, $planIdentifier, bool $autoRenova = true, array $metadata = []): array {
        $plan = $this->getPlanByIdentifier($planIdentifier);
        if (!$plan) {
            throw new Exception('Plano não encontrado ou inativo');
        }

        $pdo = $this->db->getConnection();
        $pdo->beginTransaction();

        try {
            $active = $this->getActiveSubscription($userId);
            if ($active) {
                $this->db->execute(
                    'UPDATE user_subscriptions SET status = "cancelada", auto_renova = 0, canceled_at = NOW() WHERE id = ?',
                    [$active['id']]
                );
            }

            $startsAt = date('Y-m-d H:i:s');
            $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

            $subscriptionId = $this->db->insert(
                'INSERT INTO user_subscriptions (user_id, plan_id, status, starts_at, expires_at, auto_renova, metadata)
                 VALUES (?, ?, "ativa", ?, ?, ?, ?)',
                [
                    $userId,
                    $plan['id'],
                    $startsAt,
                    $expiresAt,
                    $autoRenova ? 1 : 0,
                    $metadata ? json_encode($metadata, JSON_UNESCAPED_UNICODE) : null
                ]
            );

            $this->db->insert(
                'INSERT INTO subscription_transactions (subscription_id, user_id, plan_id, valor, moeda, status, payload)
                 VALUES (?, ?, ?, ?, ?, "pago", ?)',
                [
                    $subscriptionId,
                    $userId,
                    $plan['id'],
                    $plan['valor_mensal'],
                    $plan['moeda'] ?? 'BRL',
                    json_encode(['auto_renova' => $autoRenova], JSON_UNESCAPED_UNICODE)
                ]
            );

            $pdo->commit();

            $subscription = $this->getActiveSubscription($userId);
            if ($subscription) {
                NotificationController::createNotification(
                    $userId,
                    null,
                    'system',
                    null,
                    null,
                    'Assinatura ativada: ' . $plan['nome'],
                    null,
                    'sistema',
                    ['plan' => $plan['slug']]
                );
            }

            return $subscription ?? [];
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Cancelar assinatura
     */
    public function cancelSubscription(int $userId, int $subscriptionId): void {
        $subscription = $this->db->fetch(
            'SELECT id FROM user_subscriptions WHERE id = ? AND user_id = ? AND status = "ativa"',
            [$subscriptionId, $userId]
        );

        if (!$subscription) {
            throw new Exception('Assinatura não encontrada ou já cancelada');
        }

        $this->db->execute(
            'UPDATE user_subscriptions SET status = "cancelada", auto_renova = 0, cancel_requested_at = NOW(), canceled_at = NOW() WHERE id = ?',
            [$subscriptionId]
        );
    }

    /**
     * Resumo do uso de anúncios com base no plano
     */
    public function getAdUsage(int $userId): array {
        $subscription = $this->getActiveSubscription($userId);
        $limit = $subscription['limite_anuncios_semana'] ?? null;

        $startOfWeek = new DateTime('monday this week');
        $startOfWeek->setTime(0, 0, 0);
        $start = $startOfWeek->format('Y-m-d H:i:s');

        $usage = $this->db->fetch(
            "SELECT COUNT(*) as total
             FROM ad_campaigns c
             WHERE c.user_id = ?
               AND c.status IN ('ativo','pausado','rascunho')
               AND c.created_at >= ?",
            [$userId, $start]
        );

        return [
            'limit' => $limit !== null ? (int)$limit : null,
            'used' => (int)($usage['total'] ?? 0),
            'start_period' => $start,
            'subscription' => $subscription
        ];
    }

    /**
     * Verificar se usuária tem acesso a determinado recurso do plano
     */
    public function userHasFeature(int $userId, string $feature): bool {
        $subscription = $this->getActiveSubscription($userId);
        if (!$subscription) {
            return false;
        }

        switch ($feature) {
            case 'acesso_cursos':
                return (bool)$subscription['acesso_cursos'];
            case 'anuncios_promovidos':
                return (bool)$subscription['anuncios_promovidos'];
            case 'acesso_grupos':
                return (bool)$subscription['acesso_grupos'];
            default:
                return false;
        }
    }

    private function formatPlan(array $plan): array {
        $plan['valor_mensal'] = (float)$plan['valor_mensal'];
        $plan['limite_anuncios_semana'] = $plan['limite_anuncios_semana'] !== null ? (int)$plan['limite_anuncios_semana'] : null;
        $plan['acesso_grupos'] = (bool)$plan['acesso_grupos'];
        $plan['acesso_cursos'] = (bool)$plan['acesso_cursos'];
        $plan['anuncios_promovidos'] = (bool)$plan['anuncios_promovidos'];
        $plan['destaque'] = (bool)$plan['destaque'];
        $plan['ativo'] = (bool)$plan['ativo'];
        $plan['beneficios'] = $plan['beneficios'] ? json_decode($plan['beneficios'], true) : [];
        return $plan;
    }
}
