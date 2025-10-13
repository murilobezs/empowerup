<?php
/**
 * Controlador de campanhas promocionais e anúncios
 */

class AdCampaignController {
    private $campaignService;
    private $subscriptionService;

    public function __construct() {
        $this->campaignService = new AdCampaignService();
        $this->subscriptionService = new SubscriptionService();
    }

    /**
     * Listar campanhas do usuário autenticado
     */
    public function listCampaigns(): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'anuncios_promovidos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite gerenciar campanhas promocionais', [], 403);
                return;
            }

            $filters = [];
            if (!empty($_GET['status'])) {
                $filters['status'] = Helper::sanitizeString($_GET['status']);
            }

            $campaigns = $this->campaignService->listCampaigns($user['id'], $filters);
            $adUsage = $this->subscriptionService->getAdUsage($user['id']);

            echo Helper::jsonResponse(true, '', [
                'campaigns' => $campaigns,
                'ad_usage' => $adUsage
            ]);
        } catch (Exception $e) {
            Helper::logError('List campaigns error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao listar campanhas', [], 500);
        }
    }

    /**
     * Obter detalhes da campanha
     */
    public function getCampaign($campaignId): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'anuncios_promovidos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite visualizar campanhas promocionais', [], 403);
                return;
            }

            $campaign = $this->campaignService->getCampaign($user['id'], (int)$campaignId);
            if (!$campaign) {
                echo Helper::jsonResponse(false, 'Campanha não encontrada', [], 404);
                return;
            }

            echo Helper::jsonResponse(true, '', ['campaign' => $campaign]);
        } catch (Exception $e) {
            Helper::logError('Get campaign error: ' . $e->getMessage(), ['campaign' => $campaignId]);
            echo Helper::jsonResponse(false, 'Erro ao buscar campanha', [], 500);
        }
    }

    /**
     * Criar nova campanha promovida
     */
    public function createCampaign(): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'anuncios_promovidos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite criar campanhas promocionais', [], 403);
                return;
            }

            $adUsage = $this->subscriptionService->getAdUsage($user['id']);
            if ($adUsage['limit'] !== null && $adUsage['used'] >= $adUsage['limit']) {
                echo Helper::jsonResponse(false, 'Limite semanal de campanhas atingido para o seu plano', [
                    'ad_usage' => $adUsage
                ], 403);
                return;
            }

            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            $plan = $adUsage['subscription'];

            $campaignId = $this->campaignService->createCampaign($user['id'], $payload, $plan);

            $postIds = [];
            if (isset($payload['post_id'])) {
                $postIds[] = (int)$payload['post_id'];
            }
            if (!empty($payload['post_ids']) && is_array($payload['post_ids'])) {
                foreach ($payload['post_ids'] as $postId) {
                    $postIds[] = (int)$postId;
                }
            }

            $postIds = array_filter(array_unique($postIds));
            foreach ($postIds as $postId) {
                $this->campaignService->addPostToCampaign($user['id'], $campaignId, $postId);
            }

            $campaign = $this->campaignService->getCampaign($user['id'], $campaignId);
            echo Helper::jsonResponse(true, 'Campanha criada com sucesso', [
                'campaign' => $campaign,
                'ad_usage' => $this->subscriptionService->getAdUsage($user['id'])
            ], 201);
        } catch (Exception $e) {
            Helper::logError('Create campaign error: ' . $e->getMessage());

            $message = 'Erro ao criar campanha';
            $status = 500;
            $extra = [];

            if (stripos($e->getMessage(), 'fk_campaigns_plan') !== false) {
                $message = 'Não foi possível vincular sua campanha ao plano atual. Verifique sua assinatura ou tente novamente em instantes.';
                $status = 400;
                $extra['ad_usage'] = $this->subscriptionService->getAdUsage($user['id']);
            }

            echo Helper::jsonResponse(false, $message, $extra, $status);
        }
    }

    /**
     * Atualizar dados da campanha
     */
    public function updateCampaign($campaignId): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'anuncios_promovidos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite editar campanhas promocionais', [], 403);
                return;
            }

            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            $this->campaignService->updateCampaign($user['id'], (int)$campaignId, $payload);

            $campaign = $this->campaignService->getCampaign($user['id'], (int)$campaignId);
            echo Helper::jsonResponse(true, 'Campanha atualizada', ['campaign' => $campaign]);
        } catch (Exception $e) {
            Helper::logError('Update campaign error: ' . $e->getMessage(), ['campaign' => $campaignId]);
            $message = strpos($e->getMessage(), 'não encontrada') !== false ? $e->getMessage() : 'Erro ao atualizar campanha';
            $status = strpos($e->getMessage(), 'não encontrada') !== false ? 404 : 500;
            echo Helper::jsonResponse(false, $message, [], $status);
        }
    }

    /**
     * Adicionar post à campanha
     */
    public function addPost($campaignId): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'anuncios_promovidos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite gerenciar posts promovidos', [], 403);
                return;
            }

            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            $postId = isset($payload['post_id']) ? (int)$payload['post_id'] : 0;
            if ($postId <= 0) {
                echo Helper::jsonResponse(false, 'Post inválido', [], 400);
                return;
            }

            $this->campaignService->addPostToCampaign($user['id'], (int)$campaignId, $postId);
            $campaign = $this->campaignService->getCampaign($user['id'], (int)$campaignId);

            echo Helper::jsonResponse(true, 'Post adicionado à campanha', ['campaign' => $campaign]);
        } catch (Exception $e) {
            Helper::logError('Add post to campaign error: ' . $e->getMessage(), [
                'campaign' => $campaignId
            ]);
            $message = strpos($e->getMessage(), 'não encontrada') !== false ? $e->getMessage() : 'Erro ao adicionar post à campanha';
            $status = strpos($e->getMessage(), 'não encontrada') !== false ? 404 : 500;
            echo Helper::jsonResponse(false, $message, [], $status);
        }
    }

    /**
     * Remover post da campanha
     */
    public function removePost($campaignId, $postId): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'anuncios_promovidos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite gerenciar posts promovidos', [], 403);
                return;
            }

            $this->campaignService->removePostFromCampaign($user['id'], (int)$campaignId, (int)$postId);
            $campaign = $this->campaignService->getCampaign($user['id'], (int)$campaignId);

            echo Helper::jsonResponse(true, 'Post removido da campanha', ['campaign' => $campaign]);
        } catch (Exception $e) {
            Helper::logError('Remove post from campaign error: ' . $e->getMessage(), [
                'campaign' => $campaignId,
                'post' => $postId
            ]);
            echo Helper::jsonResponse(false, 'Erro ao remover post da campanha', [], 500);
        }
    }

    /**
     * Excluir campanha
     */
    public function deleteCampaign($campaignId): void {
        try {
            $user = AuthMiddleware::required();

            if (!$this->subscriptionService->userHasFeature($user['id'], 'anuncios_promovidos')) {
                echo Helper::jsonResponse(false, 'Seu plano não permite excluir campanhas', [], 403);
                return;
            }

            $this->campaignService->deleteCampaign($user['id'], (int)$campaignId);
            echo Helper::jsonResponse(true, 'Campanha excluída com sucesso', [
                'ad_usage' => $this->subscriptionService->getAdUsage($user['id'])
            ]);
        } catch (Exception $e) {
            Helper::logError('Delete campaign error: ' . $e->getMessage(), ['campaign' => $campaignId]);
            echo Helper::jsonResponse(false, 'Erro ao excluir campanha', [], 500);
        }
    }
}
