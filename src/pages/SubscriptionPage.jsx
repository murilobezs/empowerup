import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { useToast } from '../components/ui/toast';
import apiService from '../services/api';
import { cn } from '../lib/utils';
import {
  ArrowRight,
  Calendar,
  Check,
  Crown,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

const formatCurrency = (value, currency = 'BRL') => {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch (error) {
    return `${value} ${currency}`;
  }
};

const SubscriptionPage = () => {
  const { addToast } = useToast();
  const addToastRef = useRef(addToast);

  useEffect(() => {
    addToastRef.current = addToast;
  }, [addToast]);

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [adUsage, setAdUsage] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [processingPlan, setProcessingPlan] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const response = await apiService.getSubscriptionPlans();
      if (response?.success) {
        setPlans(response.plans || []);
      } else {
        addToastRef.current?.(response?.message || 'Não foi possível carregar os planos.', 'error');
      }
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
      addToastRef.current?.(err?.message || 'Erro inesperado ao carregar planos.', 'error');
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const fetchCurrentSubscription = useCallback(async () => {
    setLoadingSubscription(true);
    try {
      const response = await apiService.getCurrentSubscription();
      if (response?.success) {
        setCurrentSubscription(response.subscription || null);
        if (response.ad_usage) {
          setAdUsage(response.ad_usage);
        }
      } else {
        addToastRef.current?.(response?.message || 'Não foi possível verificar sua assinatura.', 'error');
      }
    } catch (err) {
      console.error('Erro ao buscar assinatura atual:', err);
      addToastRef.current?.(err?.message || 'Erro ao carregar assinatura atual.', 'error');
    } finally {
      setLoadingSubscription(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, [fetchPlans, fetchCurrentSubscription]);

  const handleStartSubscription = async (plan) => {
    if (!plan) return;
    setProcessingPlan(plan.slug || String(plan.id));
    try {
      const response = await apiService.startSubscription({
        plan_id: plan.id,
        auto_renova: autoRenew,
      });

      if (response?.success) {
        addToast('Plano ativado com sucesso! 🎉', 'success');
        await fetchCurrentSubscription();
      } else {
        addToast(response?.message || 'Não foi possível ativar este plano.', 'error');
      }
    } catch (err) {
      console.error('Erro ao iniciar assinatura:', err);
      addToast(err?.message || 'Erro ao iniciar assinatura.', 'error');
    } finally {
      setProcessingPlan('');
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    const confirmed = window.confirm('Tem certeza que deseja cancelar sua assinatura? Você poderá reativar a qualquer momento.');
    if (!confirmed) return;

    setCanceling(true);
    try {
      const response = await apiService.cancelSubscription(currentSubscription.id);
      if (response?.success) {
        addToast('Assinatura cancelada com sucesso.', 'success');
        await fetchCurrentSubscription();
      } else {
        addToast(response?.message || 'Não foi possível cancelar agora.', 'error');
      }
    } catch (err) {
      console.error('Erro ao cancelar assinatura:', err);
      addToast(err?.message || 'Erro ao cancelar assinatura.', 'error');
    } finally {
      setCanceling(false);
    }
  };

  const isPlanActive = useCallback(
    (plan) => {
      if (!currentSubscription || !plan) return false;
      return plan.id === currentSubscription.plan_id || plan.slug === currentSubscription.plan_slug;
    },
    [currentSubscription]
  );

  useEffect(() => {
    if (currentSubscription?.auto_renova !== undefined) {
      const normalizedAutoRenew = ['1', 1, true, 'true', 'sim'].includes(currentSubscription.auto_renova);
      setAutoRenew(normalizedAutoRenew);
    }
  }, [currentSubscription?.auto_renova]);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => Number(b.destaque) - Number(a.destaque));
  }, [plans]);

  return (
    <PageLayout
      title="Planos e Assinaturas"
      subtitle="Escolha o plano ideal para acelerar o crescimento do seu negócio e destravar recursos exclusivos."
      breadcrumbs={[
        { label: 'Início', href: '/' },
        { label: 'Planos e assinaturas' },
      ]}
    >
      <div className="space-y-10">
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-start">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3 text-coral">
                <ShieldCheck className="h-6 w-6" />
                <h2 className="text-xl font-semibold text-gray-900">Status da assinatura</h2>
              </div>
              <p className="text-sm text-gray-600">
                Gerencie seu plano atual, verifique benefícios ativos e fique por dentro do uso de anúncios promovidos.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingSubscription ? (
                <div className="space-y-3">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-24 animate-pulse rounded bg-gray-100" />
                </div>
              ) : currentSubscription ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {currentSubscription.status === 'ativa' ? 'Plano ativo' : currentSubscription.status}
                    </Badge>
                    {currentSubscription.auto_renova ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        <RefreshCw className="h-3.5 w-3.5" /> Renovação automática ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        Renovação manual
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-white to-emerald-50 p-5">
                    <div className="flex flex-col gap-2 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Plano atual</p>
                        <p className="text-lg font-semibold text-gray-900">{currentSubscription.plan_nome}</p>
                        <p className="text-sm text-gray-600">
                          {currentSubscription.plan_descricao || 'Plano ativo na EmpowerUp'}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-1 text-sm text-gray-600 sm:items-end">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-coral" />
                          Expira em{' '}
                          {currentSubscription.expires_at
                            ? new Date(currentSubscription.expires_at).toLocaleDateString('pt-BR')
                            : 'indefinido'}
                        </span>
                        <span className="inline-flex items-center gap-2 text-gray-500">
                          {formatCurrency(currentSubscription.valor_mensal || 0, currentSubscription.moeda || 'BRL')} / mês
                        </span>
                      </div>
                    </div>
                  </div>

                  {adUsage ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex items-center justify-between text-sm font-medium text-blue-800">
                        <span className="inline-flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" /> Uso de campanhas promovidas nesta semana
                        </span>
                        {adUsage.limit ? (
                          <span>
                            {adUsage.used}/{adUsage.limit} campanhas
                          </span>
                        ) : (
                          <span>Uso ilimitado</span>
                        )}
                      </div>
                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/80">
                        <div
                          className="h-full rounded-full bg-coral transition-all"
                          style={{
                            width: adUsage.limit
                              ? `${Math.min(100, Math.round((adUsage.used / adUsage.limit) * 100))}%`
                              : '100%',
                          }}
                        />
                      </div>
                      <p className="mt-3 text-xs text-blue-900">
                        Período iniciado em {adUsage.start_period ? new Date(adUsage.start_period).toLocaleDateString('pt-BR') : 'esta semana'}.
                      </p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      disabled={canceling}
                      onClick={handleCancelSubscription}
                    >
                      {canceling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancelar assinatura'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-coral" />
                    <h3 className="mt-3 text-lg font-semibold text-gray-900">Você ainda não possui um plano ativo</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Escolha um plano abaixo para desbloquear recursos exclusivos como cursos completos, grupos privados e campanhas promovidas.
                    </p>
                  </div>
                  <Button asChild className="bg-coral hover:bg-coral/90">
                    <a href="#planos">Ver planos disponíveis</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-coral">
                <Zap className="h-5 w-5" />
                <h3 className="text-lg font-semibold text-gray-900">Benefícios Premium</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <p>
                As assinantes EmpowerUp destravam experiências completas, participam de mentorias ao vivo, compartilham
                aprendizados na comunidade e potencializam sua marca com campanhas patrocinadas.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>
                    Acesso ilimitado a {plans.length ? plans.reduce((acc, plan) => (plan.acesso_cursos ? acc + 1 : acc), 0) : 'todos os'} cursos, trilhas
                    de aprendizado e certificados exclusivos.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>Entrada em grupos fechados para networking estratégico entre empreendedoras.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>Crie campanhas promovidas com destaque no feed e alcance resultados mais rápidos.</span>
                </li>
              </ul>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800">
                <p className="text-sm font-semibold">Dica EmpowerUp</p>
                <p className="mt-1 text-sm">
                  Combine os cursos com eventos temáticos e grupos ativos para construir autoridade na sua área em poucas semanas.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="planos" className="space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-gray-900">Compare os planos</h2>
            <p className="text-sm text-gray-600">
              Selecione a opção que mais combina com seus objetivos. Você pode alterar ou cancelar seu plano quando quiser.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Renovação automática</p>
              <p className="text-xs text-gray-600">
                Mantemos sua assinatura ativa todo mês automaticamente. Desative para renovar manualmente quando quiser.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wide text-gray-500">{autoRenew ? 'Ativa' : 'Desativada'}</span>
              <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
            </div>
          </div>

          {loadingPlans ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-gray-200 bg-white p-6">
                  <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="mt-3 h-8 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 4 }).map((__, itemIdx) => (
                      <div key={itemIdx} className="h-3.5 w-full animate-pulse rounded bg-gray-100" />
                    ))}
                  </div>
                  <div className="mt-6 h-10 w-full animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedPlans.map((plan) => {
                const isActivePlan = isPlanActive(plan);
                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      'relative flex h-full flex-col justify-between border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg',
                      plan.destaque && 'border-coral shadow-lg shadow-coral/10'
                    )}
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-coral/80">
                            Plano
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">{plan.nome}</h3>
                        </div>
                        {plan.destaque && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white shadow">
                            <Crown className="h-3.5 w-3.5" /> Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {plan.valor_mensal > 0 ? formatCurrency(plan.valor_mensal, plan.moeda || 'BRL') : 'Gratuito'}
                        </span>
                        {plan.valor_mensal > 0 && (
                          <span className="mb-1 text-sm text-gray-500">/ mês</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {plan.descricao || 'Plano desenhado para impulsionar o seu negócio.'}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between space-y-6">
                      <div className="space-y-3 text-sm text-gray-600">
                        {plan.beneficios?.length ? (
                          <ul className="space-y-2">
                            {plan.beneficios.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                              <span>{plan.acesso_cursos ? 'Acesso completo aos cursos e certificações' : 'Conteúdos selecionados gratuitos'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                              <span>
                                {plan.acesso_grupos
                                  ? 'Networking em grupos privados e eventos exclusivos'
                                  : 'Participação na comunidade aberta'}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                              <span>
                                {plan.anuncios_promovidos
                                  ? plan.limite_anuncios_semana
                                    ? `${plan.limite_anuncios_semana} campanhas promovidas por semana`
                                    : 'Campanhas promovidas ilimitadas'
                                  : 'Acesso aos impulsionamentos com upgrade'}
                              </span>
                            </li>
                          </ul>
                        )}
                      </div>

                      <div className="pt-4">
                        {isActivePlan ? (
                          <Button disabled variant="outline" className="w-full border-emerald-200 text-emerald-700">
                            <Check className="mr-2 h-4 w-4" /> Seu plano atual
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-coral hover:bg-coral/90"
                            disabled={Boolean(processingPlan) && processingPlan !== (plan.slug || String(plan.id))}
                            onClick={() => handleStartSubscription(plan)}
                          >
                            {processingPlan === (plan.slug || String(plan.id)) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                Escolher plano <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}
                        <p className="mt-3 text-xs text-gray-500">
                          Cancele ou troque de plano quando quiser.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-emerald-500 to-coral px-6 py-10 text-white shadow-lg">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Pronta para avançar de nível?</h2>
              <p className="text-white/90">
                Combine cursos, eventos e campanhas para criar uma presença marcante. O plano Premium garante acesso às mentorias, grupos privados e impulsionamentos semanais.
              </p>
              <Button asChild variant="secondary" className="bg-white text-emerald-600 hover:bg-white/90">
                <Link to="/campanhas">Explorar campanhas promovidas</Link>
              </Button>
            </div>
            <div className="rounded-2xl bg-white/15 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-wide text-white/80">Visão rápida do seu plano</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Cursos completos</span>
                  <strong>{currentSubscription?.acesso_cursos ? 'Liberados' : 'Limitado'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Grupos privados</span>
                  <strong>{currentSubscription?.acesso_grupos ? 'Liberados' : 'Limitado'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Campanhas promovidas</span>
                  <strong>
                    {currentSubscription?.anuncios_promovidos
                      ? adUsage?.limit
                        ? `${adUsage.used || 0}/${adUsage.limit} semana`
                        : 'Ilimitadas'
                      : 'Não incluso'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default SubscriptionPage;
