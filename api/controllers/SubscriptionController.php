<?php
/**
 * Controlador de Assinaturas e Planos
 */

class SubscriptionController {
    private $subscriptionService;

    public function __construct() {
        $this->subscriptionService = new SubscriptionService();
    }

    /**
     * Listar planos disponíveis
     */
    public function listPlans(): void {
        try {
            $includeInactive = isset($_GET['includeInactive']) && in_array(strtolower((string)$_GET['includeInactive']), ['1', 'true', 'yes'], true);
            $plans = $this->subscriptionService->getPlans($includeInactive);

            echo Helper::jsonResponse(true, '', ['plans' => $plans]);
        } catch (Exception $e) {
            Helper::logError('List plans error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao listar planos', [], 500);
        }
    }

    /**
     * Obter assinatura ativa da usuária
     */
    public function current(): void {
        try {
            $user = AuthMiddleware::required();

            $subscription = $this->subscriptionService->getActiveSubscription($user['id']);
            $adUsage = $this->subscriptionService->getAdUsage($user['id']);

            echo Helper::jsonResponse(true, '', [
                'subscription' => $subscription,
                'ad_usage' => $adUsage
            ]);
        } catch (Exception $e) {
            Helper::logError('Current subscription error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao obter assinatura atual', [], 500);
        }
    }

    /**
     * Iniciar ou renovar assinatura
     */
    public function start(): void {
        try {
            $user = AuthMiddleware::required();
            $payload = json_decode(file_get_contents('php://input'), true) ?? [];

            $planIdentifier = $payload['plan_id'] ?? $payload['plan_slug'] ?? $payload['plan'] ?? null;
            if (!$planIdentifier) {
                echo Helper::jsonResponse(false, 'Plano inválido', ['errors' => ['plan_id' => 'Plano é obrigatório']], 400);
                return;
            }

            $autoRenova = !isset($payload['auto_renova']) ? true : (bool)$payload['auto_renova'];
            $metadata = isset($payload['metadata']) && is_array($payload['metadata']) ? $payload['metadata'] : [];

            $subscription = $this->subscriptionService->startSubscription($user['id'], $planIdentifier, $autoRenova, $metadata);

            // Enviar email de confirmação de assinatura
            try {
                $planDetails = $this->subscriptionService->getPlanByIdentifier($subscription['plan_id'], false);
                
                if ($planDetails) {
                    // Preparar lista de recursos do plano
                    $features = [];
                    if (!empty($planDetails['max_ads'])) {
                        $features[] = $planDetails['max_ads'] . ' anúncios promocionais por mês';
                    }
                    if (!empty($planDetails['recursos'])) {
                        $recursosArray = is_string($planDetails['recursos']) ? json_decode($planDetails['recursos'], true) : $planDetails['recursos'];
                        if (is_array($recursosArray)) {
                            $features = array_merge($features, $recursosArray);
                        }
                    }
                    
                    // Features padrão se não houver nenhuma
                    if (empty($features)) {
                        $features = [
                            'Acesso completo à plataforma',
                            'Suporte prioritário',
                            'Participação em eventos exclusivos',
                            'Networking com empreendedoras'
                        ];
                    }
                    
                    $emailHtml = EmailTemplates::subscriptionConfirmation([
                        'user_name' => $user['nome'],
                        'plan_name' => $planDetails['nome'] ?? 'Plano Premium',
                        'plan_price' => 'R$ ' . number_format($planDetails['valor_mensal'] ?? 0, 2, ',', '.') . '/mês',
                        'start_date' => date('d/m/Y', strtotime($subscription['inicio'])),
                        'end_date' => date('d/m/Y', strtotime($subscription['fim'])),
                        'features' => $features
                    ]);
                    
                    Mailer::send(
                        $user['email'],
                        'Parabéns! Sua assinatura está ativa 🎉 - EmpowerUp',
                        $emailHtml
                    );
                }
            } catch (Exception $emailError) {
                // Log do erro mas não falha a requisição
                Helper::logError('Subscription confirmation email error: ' . $emailError->getMessage());
            }

            echo Helper::jsonResponse(true, 'Assinatura ativada com sucesso', [
                'subscription' => $subscription,
                'ad_usage' => $this->subscriptionService->getAdUsage($user['id'])
            ], 201);
        } catch (Exception $e) {
            Helper::logError('Start subscription error: ' . $e->getMessage());
            $message = strpos($e->getMessage(), 'Plano não encontrado') !== false ? $e->getMessage() : 'Erro ao iniciar assinatura';
            $status = strpos($e->getMessage(), 'Plano não encontrado') !== false ? 404 : 500;
            echo Helper::jsonResponse(false, $message, [], $status);
        }
    }

    /**
     * Cancelar assinatura
     */
    public function cancel($subscriptionId): void {
        try {
            $user = AuthMiddleware::required();
            $id = (int)$subscriptionId;
            if ($id <= 0) {
                echo Helper::jsonResponse(false, 'Assinatura inválida', [], 400);
                return;
            }

            $this->subscriptionService->cancelSubscription($user['id'], $id);

            echo Helper::jsonResponse(true, 'Assinatura cancelada com sucesso', [
                'ad_usage' => $this->subscriptionService->getAdUsage($user['id'])
            ]);
        } catch (Exception $e) {
            Helper::logError('Cancel subscription error: ' . $e->getMessage());
            $message = strpos($e->getMessage(), 'não encontrada') !== false ? $e->getMessage() : 'Erro ao cancelar assinatura';
            $status = strpos($e->getMessage(), 'não encontrada') !== false ? 404 : 500;
            echo Helper::jsonResponse(false, $message, [], $status);
        }
    }

    /**
     * Obter uso de anúncios conforme o plano
     */
    public function adUsage(): void {
        try {
            $user = AuthMiddleware::required();
            $usage = $this->subscriptionService->getAdUsage($user['id']);

            echo Helper::jsonResponse(true, '', ['ad_usage' => $usage]);
        } catch (Exception $e) {
            Helper::logError('Ad usage error: ' . $e->getMessage());
            echo Helper::jsonResponse(false, 'Erro ao consultar uso de anúncios', [], 500);
        }
    }
}
