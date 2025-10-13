import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useToast } from '../components/ui/toast';
import apiService from '../services/api';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  Loader2,
  Megaphone,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Rocket,
  Shield,
  Trash2,
} from 'lucide-react';

const STATUS_LABELS = {
  rascunho: 'Rascunho',
  ativo: 'Ativa',
  pausado: 'Pausada',
  encerrado: 'Encerrada',
};

const STATUS_COLORS = {
  rascunho: 'bg-amber-100 text-amber-700',
  ativo: 'bg-emerald-100 text-emerald-700',
  pausado: 'bg-blue-100 text-blue-700',
  encerrado: 'bg-gray-200 text-gray-600',
};

const OBJECTIVE_OPTIONS = [
  { value: 'alcance', label: 'Alcance' },
  { value: 'cliques', label: 'Cliques' },
  { value: 'conversao', label: 'Conversões' },
  { value: 'engajamento', label: 'Engajamento' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'ativo', label: 'Ativas' },
  { value: 'pausado', label: 'Pausadas' },
  { value: 'rascunho', label: 'Rascunhos' },
  { value: 'encerrado', label: 'Encerradas' },
];

const DEFAULT_FORM = {
  titulo: '',
  objetivo: 'alcance',
  status: 'rascunho',
  orcamento_total: '',
  orcamento_diario: '',
  data_inicio: '',
  data_fim: '',
};

const DEFAULT_AUDIENCE = {
  interests: '',
  location: '',
  ageMin: '',
  ageMax: '',
  description: '',
};

const MAX_PROMOTED_POSTS = 3;

const AdCampaignsPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [adUsage, setAdUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessRestriction, setAccessRestriction] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [audience, setAudience] = useState(DEFAULT_AUDIENCE);
  const [availablePosts, setAvailablePosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postSearch, setPostSearch] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(0);
  const [deletingId, setDeletingId] = useState(0);

  const fetchAvailablePosts = useCallback(async () => {
    if (!user?.id) {
      setAvailablePosts([]);
      return;
    }

    setPostsLoading(true);
    try {
      const response = await apiService.getPosts({ user_id: user.id, limit: 40 });
      if (response?.success) {
        setAvailablePosts(response.posts || []);
      } else {
        setAvailablePosts([]);
      }
    } catch (err) {
      console.error('Erro ao carregar posts disponíveis para campanha:', err);
      setAvailablePosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [user?.id]);

  const hasActiveFeature = Boolean(adUsage?.subscription?.anuncios_promovidos);

  const filteredPosts = useMemo(() => {
    if (!postSearch.trim()) {
      return availablePosts;
    }

    const normalized = postSearch.trim().toLowerCase();
    return availablePosts.filter((post) => {
      const content = (post.conteudo || '').toString().toLowerCase();
      return content.includes(normalized) || `#${post.id}`.includes(normalized);
    });
  }, [availablePosts, postSearch]);

  const togglePostSelection = useCallback((postId) => {
    setSelectedPosts((prev) => {
      if (prev.includes(postId)) {
        return prev.filter((id) => id !== postId);
      }

      if (prev.length >= MAX_PROMOTED_POSTS) {
        addToast(`Selecione no máximo ${MAX_PROMOTED_POSTS} posts por campanha`, 'warning');
        return prev;
      }

      return [...prev, postId];
    });
  }, [addToast]);

  const handleDialogToggle = useCallback((value) => {
    setDialogOpen(value);
    if (!value) {
      setFormData(DEFAULT_FORM);
      setAudience(DEFAULT_AUDIENCE);
      setSelectedPosts([]);
      setPostSearch('');
    }
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      fetchAvailablePosts();
      setPostSearch('');
    }
  }, [dialogOpen, fetchAvailablePosts]);

  const fetchCampaigns = useCallback(
    async (statusFilter) => {
      setLoading(true);
      setError('');
      setAccessRestriction('');
      try {
        const response = await apiService.listAdCampaigns(
          statusFilter ? { status: statusFilter } : {}
        );

        if (response?.success) {
          setCampaigns(response.campaigns || []);
          if (response.ad_usage) {
            setAdUsage(response.ad_usage);
          }
        } else {
          setError(response?.message || 'Não foi possível carregar as campanhas.');
        }
      } catch (err) {
        console.error('Erro ao carregar campanhas:', err);
        if (err?.status === 403) {
          setAccessRestriction(err?.data?.message || 'Seu plano atual não permite gerenciar campanhas promovidas.');
          if (err?.data?.ad_usage) {
            setAdUsage(err.data.ad_usage);
          }
        } else {
          setError(err?.message || 'Erro inesperado ao carregar campanhas.');
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const statusParam = filterStatus === 'all' ? undefined : filterStatus;
    fetchCampaigns(statusParam);
  }, [fetchCampaigns, filterStatus]);

  const handleCreateCampaign = async () => {
    if (!formData.titulo.trim()) {
      addToast('Defina um título para a campanha', 'warning');
      return;
    }

    if (selectedPosts.length === 0) {
      addToast('Selecione ao menos um post para promover', 'warning');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        titulo: formData.titulo.trim(),
        objetivo: formData.objetivo,
        status: formData.status,
        data_inicio: formData.data_inicio || undefined,
        data_fim: formData.data_fim || undefined,
        orcamento_total: formData.orcamento_total ? Number(formData.orcamento_total) : undefined,
        orcamento_diario: formData.orcamento_diario ? Number(formData.orcamento_diario) : undefined,
      };

      const audiencePayload = {};
      if (audience.interests.trim()) {
        audiencePayload.interesses = audience.interests
          .split(',')
          .map((interest) => interest.trim())
          .filter(Boolean);
      }

      if (audience.location.trim()) {
        audiencePayload.localizacao = audience.location.trim();
      }

      if (audience.ageMin || audience.ageMax) {
        const faixa = {};
        if (audience.ageMin) faixa.min = Number(audience.ageMin);
        if (audience.ageMax) faixa.max = Number(audience.ageMax);
        audiencePayload.faixa_etaria = faixa;
      }

      if (audience.description.trim()) {
        audiencePayload.descricao = audience.description.trim();
      }

      if (Object.keys(audiencePayload).length > 0) {
        payload.publico_alvo = audiencePayload;
      }

      if (selectedPosts.length === 1) {
        payload.post_id = selectedPosts[0];
      } else if (selectedPosts.length > 1) {
        payload.post_ids = selectedPosts;
      }

      const response = await apiService.createAdCampaign(payload);
      if (response?.success) {
        addToast('Campanha criada com sucesso!', 'success');
        setFormData(DEFAULT_FORM);
        setAudience(DEFAULT_AUDIENCE);
        setSelectedPosts([]);
        setDialogOpen(false);
        setCampaigns((prev) => [response.campaign, ...prev]);
        if (response.ad_usage) {
          setAdUsage(response.ad_usage);
        } else {
          fetchCampaigns(filterStatus === 'all' ? undefined : filterStatus);
        }
      } else {
        addToast(response?.message || 'Não foi possível criar a campanha.', 'error');
      }
    } catch (err) {
      console.error('Erro ao criar campanha:', err);
      addToast(err?.message || 'Erro inesperado ao criar campanha.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (campaign, action) => {
    if (!campaign) return;
    let nextStatus = campaign.status;
    if (action === 'activate') {
      nextStatus = 'ativo';
    } else if (action === 'pause') {
      nextStatus = 'pausado';
    } else if (action === 'finish') {
      nextStatus = 'encerrado';
    }

    setUpdatingStatus(campaign.id);
    try {
      const response = await apiService.updateAdCampaign(campaign.id, { status: nextStatus });
      if (response?.success) {
        addToast('Status atualizado.', 'success');
        setCampaigns((prev) =>
          prev.map((item) => (item.id === campaign.id ? { ...item, status: nextStatus } : item))
        );
      } else {
        addToast(response?.message || 'Não foi possível atualizar o status.', 'error');
      }
    } catch (err) {
      console.error('Erro ao atualizar status da campanha:', err);
      addToast(err?.message || 'Erro ao atualizar o status da campanha.', 'error');
    } finally {
      setUpdatingStatus(0);
    }
  };

  const handleDeleteCampaign = async (campaign) => {
    if (!campaign) return;
    const confirmed = window.confirm('Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.');
    if (!confirmed) return;

    setDeletingId(campaign.id);
    try {
      const response = await apiService.deleteAdCampaign(campaign.id);
      if (response?.success) {
        addToast('Campanha excluída com sucesso.', 'success');
        setCampaigns((prev) => prev.filter((item) => item.id !== campaign.id));
        if (response.ad_usage) {
          setAdUsage(response.ad_usage);
        }
      } else {
        addToast(response?.message || 'Não foi possível excluir a campanha.', 'error');
      }
    } catch (err) {
      console.error('Erro ao excluir campanha:', err);
      addToast(err?.message || 'Erro ao excluir campanha.', 'error');
    } finally {
      setDeletingId(0);
    }
  };

  const filteredCampaigns = useMemo(() => {
    if (filterStatus === 'all') return campaigns;
    return campaigns.filter((campaign) => campaign.status === filterStatus);
  }, [campaigns, filterStatus]);

  const usageSummary = useMemo(() => {
    if (!adUsage) return null;
    const limit = adUsage.limit ?? null;
    const used = adUsage.used ?? 0;
    return {
      limit,
      used,
      remaining: limit !== null ? Math.max(0, limit - used) : null,
      subscriptionName: adUsage.subscription?.plan_nome ?? null,
    };
  }, [adUsage]);

  const renderAccessRestriction = () => (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center shadow-sm">
      <Shield className="mx-auto h-12 w-12 text-amber-500" />
      <h2 className="mt-6 text-2xl font-semibold text-gray-900">Recurso exclusivo das assinaturas premium</h2>
      <p className="mt-3 text-sm text-gray-600">
        {accessRestriction || 'Atualize seu plano para desbloquear a criação de campanhas promovidas e destacar seus conteúdos no feed.'}
      </p>
      <div className="mt-6 flex justify-center">
        <Button asChild className="bg-coral hover:bg-coral/90">
          <Link to="/planos">Conhecer planos</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Campanhas Promovidas"
      subtitle="Gerencie anúncios impulsionados, acompanhe resultados e destaque sua marca para a comunidade EmpowerUp."
      breadcrumbs={[
        { label: 'Início', href: '/' },
        { label: 'Campanhas promovidas' },
      ]}
    >
      <div className="space-y-10">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertTriangle className="mr-2 inline-block h-4 w-4" /> {error}
          </div>
        )}

        {accessRestriction ? (
          renderAccessRestriction()
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-start">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 text-coral">
                    <Megaphone className="h-6 w-6" />
                    <h2 className="text-xl font-semibold text-gray-900">Painel de campanhas</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Crie, ative e acompanhe campanhas promovidas para impulsionar seus posts mais importantes.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Campanhas cadastradas</p>
                      <p className="text-2xl font-semibold text-gray-900">{loading ? '—' : campaigns.length}</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={handleDialogToggle}>
                      <DialogTrigger asChild>
                        <Button className="bg-coral hover:bg-coral/90" disabled={!hasActiveFeature}>
                          <Plus className="mr-2 h-4 w-4" /> Nova campanha
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Criar campanha promovida</DialogTitle>
                          <DialogDescription>
                            Preencha os dados principais da sua campanha. Você poderá editar posteriormente.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="titulo">Título da campanha</Label>
                            <Input
                              id="titulo"
                              placeholder="Ex.: Lançamento da nova coleção"
                              value={formData.titulo}
                              onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Objetivo</Label>
                              <Select
                                value={formData.objetivo}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, objetivo: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um objetivo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {OBJECTIVE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Status inicial</Label>
                              <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {['rascunho', 'ativo', 'pausado'].map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {STATUS_LABELS[status]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="data_inicio">Início</Label>
                              <Input
                                id="data_inicio"
                                type="datetime-local"
                                value={formData.data_inicio}
                                onChange={(e) => setFormData((prev) => ({ ...prev, data_inicio: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="data_fim">Término (opcional)</Label>
                              <Input
                                id="data_fim"
                                type="datetime-local"
                                value={formData.data_fim}
                                onChange={(e) => setFormData((prev) => ({ ...prev, data_fim: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="orcamento_total">Orçamento total (R$)</Label>
                              <Input
                                id="orcamento_total"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Opcional"
                                value={formData.orcamento_total}
                                onChange={(e) => setFormData((prev) => ({ ...prev, orcamento_total: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="orcamento_diario">Orçamento diário (R$)</Label>
                              <Input
                                id="orcamento_diario"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Opcional"
                                value={formData.orcamento_diario}
                                onChange={(e) => setFormData((prev) => ({ ...prev, orcamento_diario: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex flex-col gap-1">
                              <h4 className="text-sm font-semibold text-gray-900">Público ideal</h4>
                              <p className="text-xs text-gray-600">
                                Descreva quem deve ver seus anúncios. Use linguagem natural e nós traduzimos para a segmentação correta.
                              </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="audience_interests">Interesses principais</Label>
                                <Input
                                  id="audience_interests"
                                  placeholder="Ex.: moda, marketing digital, wellness"
                                  value={audience.interests}
                                  onChange={(e) => setAudience((prev) => ({ ...prev, interests: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="audience_location">Localização (opcional)</Label>
                                <Input
                                  id="audience_location"
                                  placeholder="Cidade, estado ou país"
                                  value={audience.location}
                                  onChange={(e) => setAudience((prev) => ({ ...prev, location: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="audience_age_min">Idade mínima</Label>
                                <Input
                                  id="audience_age_min"
                                  type="number"
                                  min="0"
                                  placeholder="Opcional"
                                  value={audience.ageMin}
                                  onChange={(e) => setAudience((prev) => ({ ...prev, ageMin: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="audience_age_max">Idade máxima</Label>
                                <Input
                                  id="audience_age_max"
                                  type="number"
                                  min="0"
                                  placeholder="Opcional"
                                  value={audience.ageMax}
                                  onChange={(e) => setAudience((prev) => ({ ...prev, ageMax: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="audience_description">Observações sobre o público</Label>
                              <Textarea
                                id="audience_description"
                                rows={3}
                                placeholder="Ex.: Empreendedoras que estão lançando produtos digitais e querem aumentar o alcance do perfil."
                                value={audience.description}
                                onChange={(e) => setAudience((prev) => ({ ...prev, description: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">Escolha os posts promovidos</h4>
                                <p className="text-xs text-gray-600">
                                  Selecione até {MAX_PROMOTED_POSTS} posts para aparecerem como patrocinados no feed.
                                </p>
                              </div>
                              <Input
                                placeholder="Buscar pelo conteúdo ou ID"
                                value={postSearch}
                                onChange={(e) => setPostSearch(e.target.value)}
                                className="max-w-sm"
                              />
                            </div>
                            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                              {postsLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                  <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                                ))
                              ) : filteredPosts.length === 0 ? (
                                <p className="text-xs text-gray-500">
                                  {availablePosts.length === 0
                                    ? 'Crie um post na comunidade para promovê-lo aqui.'
                                    : 'Nenhum post corresponde à busca. Tente outros termos.'}
                                </p>
                              ) : (
                                filteredPosts.map((postItem) => {
                                  const isChecked = selectedPosts.includes(postItem.id);
                                  return (
                                    <label
                                      key={postItem.id}
                                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition hover:border-coral ${
                                        isChecked ? 'border-coral bg-coral/5' : 'border-gray-200 bg-gray-50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 text-coral"
                                        checked={isChecked}
                                        onChange={() => togglePostSelection(postItem.id)}
                                      />
                                      <div className="min-w-0 flex-1 space-y-1">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                          {postItem.conteudo || 'Post sem descrição'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                          <span>ID #{postItem.id}</span>
                                          {postItem.timeAgo && <span>• {postItem.timeAgo}</span>}
                                          {postItem.categoria && <span>• {postItem.categoria}</span>}
                                        </div>
                                        {postItem.imagem_url && (
                                          <img
                                            src={postItem.imagem_url}
                                            alt="Prévia do post"
                                            className="mt-2 h-20 w-full rounded-lg object-cover"
                                          />
                                        )}
                                      </div>
                                    </label>
                                  );
                                })
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Selecionados: {selectedPosts.length}/{MAX_PROMOTED_POSTS}
                            </p>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => handleDialogToggle(false)} disabled={creating}>
                              Cancelar
                            </Button>
                            <Button
                              className="bg-coral hover:bg-coral/90"
                              onClick={handleCreateCampaign}
                              disabled={creating || !formData.titulo.trim() || selectedPosts.length === 0}
                            >
                              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar campanha'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {usageSummary && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" /> Limite semanal de campanhas ativas
                        </span>
                        <span className="font-semibold">
                          {usageSummary.limit !== null
                            ? `${usageSummary.used}/${usageSummary.limit}`
                            : 'Uso ilimitado'}
                        </span>
                      </div>
                      {usageSummary.limit !== null && (
                        <p className="mt-2 text-xs">
                          Restam {usageSummary.remaining} campanhas nesta semana. Limite reinicia toda segunda-feira.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2 text-coral">
                    <Rocket className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-gray-900">Como as campanhas ajudam</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                  <p>
                    As campanhas promovidas destacam seus principais conteúdos no feed da comunidade, alcançando novas clientes
                    e gerando resultados mensuráveis.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>Ative e pause campanhas a qualquer momento conforme sua estratégia.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>Direcione o público certo definindo interesses e localização.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>Monitore orçamento e resultados sem sair da plataforma.</span>
                    </li>
                  </ul>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/planos">
                      {hasActiveFeature ? 'Gerenciar plano' : 'Assine para liberar campanhas'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Suas campanhas</h2>
                  <p className="text-sm text-gray-600">Visualize o status, orçamento e posts promovidos.</p>
                </div>
                <div className="w-full max-w-xs">
                  <Label className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Filtrar por status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FILTERS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                      <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                      <div className="mt-3 h-4 w-64 animate-pulse rounded bg-gray-100" />
                      <div className="mt-6 grid gap-3 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((__, idx) => (
                          <div key={idx} className="h-16 animate-pulse rounded bg-gray-100" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                  Nenhuma campanha encontrada para o filtro selecionado.
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="border border-gray-200 shadow-sm">
                      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-semibold text-gray-900">{campaign.titulo}</h3>
                            <Badge className={cn('uppercase', STATUS_COLORS[campaign.status] || 'bg-gray-200 text-gray-600')}>
                              {STATUS_LABELS[campaign.status] || campaign.status}
                            </Badge>
                            <Badge variant="outline" className="border-coral text-coral">
                              Objetivo: {OBJECTIVE_OPTIONS.find((opt) => opt.value === campaign.objetivo)?.label || campaign.objetivo}
                            </Badge>
                          </div>
                          {campaign.plan_nome && (
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              Vinculada ao plano {campaign.plan_nome}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Início: {campaign.data_inicio ? new Date(campaign.data_inicio).toLocaleDateString('pt-BR') : '—'}
                          </span>
                          {campaign.data_fim && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Fim: {new Date(campaign.data_fim).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Orçamento total</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                              {campaign.orcamento_total ? `R$ ${campaign.orcamento_total.toFixed(2)}` : 'Não definido'}
                            </p>
                          </div>
                          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Orçamento diário</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                              {campaign.orcamento_diario ? `R$ ${campaign.orcamento_diario.toFixed(2)}` : 'Não definido'}
                            </p>
                          </div>
                          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Posts promovidos</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{campaign.posts?.length || 0}</p>
                          </div>
                        </div>

                        {campaign.posts?.length ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900">Posts vinculados</p>
                            <div className="grid gap-3 md:grid-cols-2">
                              {campaign.posts.map((item) => (
                                <div key={item.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                                  <p className="line-clamp-2 text-gray-700">{item.post?.conteudo || 'Post sem descrição'}</p>
                                  {item.post?.imagem_url && (
                                    <img
                                      src={item.post.imagem_url}
                                      alt="Preview do post"
                                      className="mt-3 h-32 w-full rounded-lg object-cover"
                                    />
                                  )}
                                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                    <span>ID #{item.post_id}</span>
                                    <span className="inline-flex items-center gap-1 text-coral">
                                      <ArrowRight className="h-3.5 w-3.5" /> Feed
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                            Nenhum post promovido nesta campanha ainda.
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                          {(campaign.status === 'rascunho' || campaign.status === 'pausado') && (
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-500/90"
                              onClick={() => handleUpdateStatus(campaign, 'activate')}
                              disabled={updatingStatus === campaign.id}
                            >
                              {updatingStatus === campaign.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <PlayCircle className="mr-2 h-4 w-4" /> Ativar campanha
                                </>
                              )}
                            </Button>
                          )}

                          {campaign.status === 'ativo' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleUpdateStatus(campaign, 'pause')}
                              disabled={updatingStatus === campaign.id}
                            >
                              {updatingStatus === campaign.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <PauseCircle className="mr-2 h-4 w-4" /> Pausar
                                </>
                              )}
                            </Button>
                          )}

                          {campaign.status !== 'encerrado' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-200 text-gray-700 hover:bg-gray-100"
                              onClick={() => handleUpdateStatus(campaign, 'finish')}
                              disabled={updatingStatus === campaign.id}
                            >
                              {updatingStatus === campaign.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" /> Encerrar
                                </>
                              )}
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteCampaign(campaign)}
                            disabled={deletingId === campaign.id}
                          >
                            {deletingId === campaign.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default AdCampaignsPage;
