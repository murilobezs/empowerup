import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import {
  Users,
  MessageCircle,
  Users2,
  Heart,
  Edit2,
  Trash2,
  BarChart3,
  Shield,
  LogOut,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Calendar
} from 'lucide-react';
import adminApi from '../services/admin-api';
import { AdminEventManagement } from '../components/admin/AdminEventManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [posts, setPosts] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingItem, setEditingItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [postSearch, setPostSearch] = useState('');
  const [postCategoryFilter, setPostCategoryFilter] = useState('all');
  const [postSort, setPostSort] = useState('likes');
  const [groupSearch, setGroupSearch] = useState('');
  const [groupStatusFilter, setGroupStatusFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [monetization, setMonetization] = useState(null);
  const [loadingMonetization, setLoadingMonetization] = useState(true);

  const formatNumber = (value) => {
    const number = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR').format(number);
  };

  const formatCurrency = (value) => {
    const number = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  };

  const formatDateTime = (value) => {
    if (!value) return '--';
    return new Date(value).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (!parts.length) return 'EU';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const getTrend = (value) => {
    if (value === undefined || value === null) return null;
    const direction = value >= 0 ? 'up' : 'down';
    const label = `${value >= 0 ? '+' : '-'}${formatNumber(Math.abs(value))} nos últimos 30 dias`;
    return { direction, label };
  };

  const normalizePostForUi = useCallback((post = {}) => {
    const metricas = post.metricas || {};
    const autorInfo = post.autor || {};

    return {
      id: post.id,
      conteudo: post.conteudo || '',
      categoria: post.categoria || 'Geral',
      created_at: post.created_at || null,
      autor: autorInfo.nome || autorInfo.username || post.autor || 'Autor desconhecido',
      autorInfo,
      likes: metricas.likes ?? post.likes ?? 0,
      comentarios: metricas.comentarios ?? post.comentarios ?? 0,
      compartilhamentos: metricas.compartilhamentos ?? post.compartilhamentos ?? 0,
      salvos: metricas.salvos ?? post.salvos ?? 0,
      is_promovido: post.is_promovido ?? false,
      promocao_status: post.promocao_status ?? null
    };
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await adminApi.getDashboard();
      const totals = data?.totals || {};
      const growth = data?.growth || {};
      const engagement30d = growth.engajamento30d || {};
      const engagementTotals = {
        total_likes: totals.likes ?? engagement30d.likes ?? 0,
        total_comentarios: totals.comentarios ?? engagement30d.comentarios ?? 0,
        total_compartilhamentos: totals.compartilhamentos ?? engagement30d.compartilhamentos ?? 0
      };

      setStats({
        totals,
        growth,
        trends: data?.trends || {},
        topPosts: (data?.topPosts || []).map(normalizePostForUi),
        topCreators: data?.topCreators || [],
        contentMix: data?.contentMix || [],
        recentActivity: data?.recentActivity || [],
        systemHealth: data?.systemHealth || {},
        engagement: engagementTotals,
        recentEngagement: engagement30d
      });
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [normalizePostForUi]);

  const fetchUsuarios = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await adminApi.getUsers({ limit: 50, order: 'engagement' });
      const items = data?.users || [];
      setUsuarios(items.map((user) => ({
        ...user,
        nome: user?.nome || user?.username || 'Usuário'
      })));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const data = await adminApi.getPosts({ limit: 50 });
      setPosts((data?.posts || []).map(normalizePostForUi));
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  }, [normalizePostForUi]);

  const fetchGrupos = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const data = await adminApi.getGroups({ limit: 50 });
      setGrupos(data?.grupos || []);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const fetchMonetization = useCallback(async () => {
    setLoadingMonetization(true);
    try {
      const data = await adminApi.getMonetization();
      setMonetization(data || null);
    } catch (error) {
      console.error('Erro ao buscar monetização:', error);
      setMonetization(null);
    } finally {
      setLoadingMonetization(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchUsuarios(),
      fetchPosts(),
      fetchGrupos(),
      fetchMonetization()
    ]);
  }, [fetchStats, fetchUsuarios, fetchPosts, fetchGrupos, fetchMonetization]);

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      if (!adminApi.isAuthenticated()) {
        navigate('/admin/login');
        return;
      }

      try {
        await adminApi.validateSession();
      } catch (error) {
        console.warn('Sessão administrativa inválida:', error);
        navigate('/admin/login');
        return;
      }

      if (mounted) {
        handleRefresh();
      }
    };

    initializeDashboard();

    return () => {
      mounted = false;
    };
  }, [navigate, handleRefresh]);

  const handleLogout = () => {
    adminApi.logout();
    navigate('/admin/login');
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;

    try {
      if (type === 'posts') {
        await adminApi.deletePost(id);
        await Promise.all([fetchPosts(), fetchStats()]);
        alert('Post removido com sucesso!');
      } else {
        alert('Remoção disponível apenas para posts no momento.');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert(error.message || 'Erro ao excluir item');
    }
  };

  const handleEdit = (item, type) => {
    if (type === 'grupos') {
      alert('Edição de grupos estará disponível em breve.');
      return;
    }
    setEditingItem({ ...item, type });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      if (editingItem.type === 'usuarios') {
        const payload = {
          nome: editingItem.nome,
          email: editingItem.email,
          telefone: editingItem.telefone,
          bio: editingItem.bio,
          tipo: editingItem.tipo,
          verified: editingItem.verified
        };
        await adminApi.updateUser(editingItem.id, payload);
        await fetchUsuarios();
      } else if (editingItem.type === 'posts') {
        const payload = {
          conteudo: editingItem.conteudo,
          categoria: editingItem.categoria,
          is_promovido: editingItem.is_promovido,
          promocao_status: editingItem.promocao_status
        };
        await adminApi.updatePost(editingItem.id, payload);
        await fetchPosts();
      } else {
        alert('Edição disponível apenas para usuários e posts no momento.');
        return;
      }

      await fetchStats();
      setEditDialogOpen(false);
      setEditingItem(null);
      alert('Item atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert(error.message || 'Erro ao atualizar item');
    }
  };

  const totals = stats?.totals || {};
  const engagementTotals = stats?.engagement || {};

  const totalInteractions = useMemo(() => {
    return (
      (engagementTotals.total_likes || 0) +
      (engagementTotals.total_comentarios || 0) +
      (engagementTotals.total_compartilhamentos || 0)
    );
  }, [engagementTotals]);

  const engagementPerPost = useMemo(() => {
    const totalPosts = totals.posts || 0;
    if (!totalPosts) return 0;
    return (totalInteractions / totalPosts).toFixed(1);
  }, [totals, totalInteractions]);

  const postsGrowthPercent = useMemo(() => {
    const totalPosts = totals.posts || 0;
    if (!totalPosts) return 0;
    const recentPosts = totals.postsNovos30d || 0;
    return Math.min(100, Math.round((recentPosts / totalPosts) * 100));
  }, [totals]);

  const groupsActiveCount = useMemo(() => {
    return grupos.filter((grupo) => grupo?.ativo === 1 || grupo?.ativo === '1' || grupo?.ativo === true).length;
  }, [grupos]);

  const statHighlights = useMemo(() => ([
    {
      title: 'Total de Usuários',
      value: totals.usuarios,
      icon: Users,
      trend: getTrend(totals.usuariosNovos30d),
      accent: 'from-coral to-rose-400'
    },
    {
      title: 'Total de Posts',
      value: totals.posts,
      icon: MessageCircle,
      trend: getTrend(totals.postsNovos30d),
      accent: 'from-sage to-emerald-400'
    },
    {
      title: 'Total de Grupos',
      value: totals.grupos,
      icon: Users2,
      trend: null,
      accent: 'from-indigo-400 to-purple-500'
    },
    {
      title: 'Interações Totais',
      value: totalInteractions,
      icon: Heart,
      trend: null,
      accent: 'from-orange-400 to-red-500'
    }
  ]), [totals, totalInteractions]);

  const userTypes = useMemo(() => {
    const types = new Set();
    usuarios.forEach((usuario) => {
      if (usuario?.tipo) types.add(usuario.tipo);
    });
    return Array.from(types);
  }, [usuarios]);

  const filteredUsuarios = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      const matchesSearch = term
        ? (usuario?.nome || '').toLowerCase().includes(term) || (usuario?.email || '').toLowerCase().includes(term)
        : true;
      const matchesType = userTypeFilter === 'all' ? true : usuario?.tipo === userTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [usuarios, userSearch, userTypeFilter]);

  const sortedUsuarios = useMemo(() => {
    return [...filteredUsuarios].sort((a, b) => (a?.nome || '').localeCompare(b?.nome || '', 'pt-BR'));
  }, [filteredUsuarios]);

  const postCategories = useMemo(() => {
    const categories = new Set();
    posts.forEach((post) => {
      if (post?.categoria) categories.add(post.categoria);
    });
    return Array.from(categories);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const term = postSearch.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSearch = term
        ? (post?.conteudo || '').toLowerCase().includes(term) || (post?.autor || '').toLowerCase().includes(term) || (post?.categoria || '').toLowerCase().includes(term)
        : true;
      const matchesCategory = postCategoryFilter === 'all' ? true : post?.categoria === postCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [posts, postSearch, postCategoryFilter]);

  const sortedPosts = useMemo(() => {
    const data = [...filteredPosts];
    if (postSort === 'likes') {
      data.sort((a, b) => (b?.likes || 0) - (a?.likes || 0));
    } else if (postSort === 'comentarios') {
      data.sort((a, b) => (b?.comentarios || 0) - (a?.comentarios || 0));
    }
    return data;
  }, [filteredPosts, postSort]);

  const filteredGrupos = useMemo(() => {
    const term = groupSearch.trim().toLowerCase();
    return grupos.filter((grupo) => {
      const matchesSearch = term
        ? (grupo?.nome || '').toLowerCase().includes(term) || (grupo?.descricao || '').toLowerCase().includes(term)
        : true;
      const isActive = grupo?.ativo === 1 || grupo?.ativo === '1' || grupo?.ativo === true;
      const matchesStatus =
        groupStatusFilter === 'all' ? true : groupStatusFilter === 'active' ? isActive : !isActive;
      return matchesSearch && matchesStatus;
    });
  }, [grupos, groupSearch, groupStatusFilter]);

  const sortedGrupos = useMemo(() => {
    return [...filteredGrupos].sort((a, b) => (b?.membros || 0) - (a?.membros || 0));
  }, [filteredGrupos]);

  const topPosts = useMemo(() => {
    const source = stats?.topPosts && stats.topPosts.length ? stats.topPosts : posts;
    return [...source]
      .sort((a, b) => (b?.likes || 0) - (a?.likes || 0))
      .slice(0, 3);
  }, [stats, posts]);

  const topGroups = useMemo(() => {
    return [...grupos]
      .sort((a, b) => (b?.membros || 0) - (a?.membros || 0))
      .slice(0, 3);
  }, [grupos]);

  const groupActivePercent = useMemo(() => {
    const total = totals.grupos || 0;
    if (!total) return 0;
    return Math.round((groupsActiveCount / total) * 100);
  }, [totals, groupsActiveCount]);

  const insights = useMemo(() => ([
    {
      label: 'Novos usuários',
      value: totals.usuariosNovos30d || 0,
      caption: 'Últimos 30 dias',
      progress: totals.usuarios ? Math.min(100, Math.round(((totals.usuariosNovos30d || 0) / totals.usuarios) * 100)) : 0
    },
    {
      label: 'Novos posts',
      value: totals.postsNovos30d || 0,
      caption: `${postsGrowthPercent}% da base total`,
      progress: postsGrowthPercent
    },
    {
      label: 'Grupos ativos',
      value: groupsActiveCount,
      caption: `${groupActivePercent}% ativos`,
      progress: groupActivePercent
    }
  ]), [totals, postsGrowthPercent, groupsActiveCount, groupActivePercent]);

  const StatCard = ({ title, value, icon: Icon, trend, accent, loading }) => (
    <Card className="relative overflow-hidden border-none bg-white/80 shadow-lg ring-1 ring-black/5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {loading ? <Skeleton className="h-8 w-24" /> : formatNumber(value)}
            </div>
          </div>
          <div className="rounded-full bg-coral/10 p-2 text-coral">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="mt-3 h-3 w-24" />
        ) : (
          trend && (
            <div
              className={`mt-3 flex items-center text-xs font-semibold ${
                trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {trend.direction === 'up' ? (
                <ArrowUpRight className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4" />
              )}
              {trend.label}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, onClick }) => (
    <Button
      variant="ghost"
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-xl border border-dashed border-coral/40 bg-white/70 px-4 py-3 text-left transition hover:border-coral hover:bg-white"
    >
      <span className="text-left">
        <span className="block text-sm font-semibold text-gray-900">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/10 text-coral transition group-hover:bg-coral group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light via-white to-sage/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-cream-dark/40 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-coral">
              <Shield className="h-5 w-5" />
              Central de Administração
            </div>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Painel EmpowerUp</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Acompanhe métricas, modere a comunidade e mantenha os eventos sempre atualizados.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="flex items-center gap-2 border-coral/40 text-coral hover:bg-coral hover:text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Atualizar dados
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Última atualização: {formatDateTime(lastUpdated)}
              </span>
            )}
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6 w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-full bg-white/80 p-1 shadow-inner">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-coral">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="data-[state=active]:bg-white data-[state=active]:text-coral">
              Usuários
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-white data-[state=active]:text-coral">
              Posts
            </TabsTrigger>
            <TabsTrigger value="grupos" className="data-[state=active]:bg-white data-[state=active]:text-coral">
              Grupos
            </TabsTrigger>
            <TabsTrigger value="eventos" className="data-[state=active]:bg-white data-[state=active]:text-coral">
              Eventos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 pt-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statHighlights.map((stat) => (
                <StatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value || 0}
                  icon={stat.icon}
                  trend={stat.trend}
                  accent={stat.accent}
                  loading={loadingStats}
                />
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 border-none bg-white/80 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Insights da Comunidade</CardTitle>
                      <CardDescription>Acompanhe a evolução recente da base e do conteúdo.</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-coral/10 text-coral">
                      Últimos 30 dias
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {insights.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-sm font-semibold text-gray-900">{item.label}</span>
                          <span className="text-xs text-muted-foreground">{item.caption}</span>
                        </div>
                        <span className="text-2xl font-semibold text-gray-900">
                          {loadingStats ? <Skeleton className="h-7 w-16" /> : formatNumber(item.value)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        {loadingStats ? (
                          <Skeleton className="h-2 w-1/2" />
                        ) : (
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-coral to-rose-400"
                            style={{ width: `${Math.min(100, item.progress || 0)}%` }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-none bg-white/80 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Ações rápidas</CardTitle>
                  <CardDescription>Otimize sua rotina administrativa com acessos diretos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <QuickActionCard
                    title="Gerenciar usuários"
                    description="Ative, suspenda e visualize perfis detalhados."
                    icon={Users}
                    onClick={() => setActiveTab('usuarios')}
                  />
                  <QuickActionCard
                    title="Moderar posts"
                    description="Revise conteúdo com maior engajamento e denúncias."
                    icon={MessageCircle}
                    onClick={() => setActiveTab('posts')}
                  />
                  <QuickActionCard
                    title="Eventos e cursos"
                    description="Programe workshops e acompanhe inscrições."
                    icon={Calendar}
                    onClick={() => setActiveTab('eventos')}
                  />
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <Card className="border-none bg-white/80 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Top Posts</CardTitle>
                    <Badge variant="secondary" className="bg-sage/20 text-sage-dark">
                      {posts.length} ativos
                    </Badge>
                  </div>
                  <CardDescription>Conteúdo mais engajado da plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingPosts ? (
                    [1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)
                  ) : topPosts.length ? (
                    topPosts.map((post) => (
                      <div key={post.id} className="rounded-xl border border-transparent bg-white/70 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{post.autor || 'Autor desconhecido'}</p>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.conteudo}</p>
                          </div>
                          <Badge variant="secondary" className="bg-coral/10 text-coral">
                            {post.categoria || 'Geral'}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                          <span>{formatNumber(post.likes)} likes</span>
                          <span>•</span>
                          <span>{formatNumber(post.comentarios)} comentários</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Nenhum post disponível no momento.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none bg-white/80 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Destaques de grupos</CardTitle>
                    <Badge variant="secondary" className="bg-olive/10 text-olive-dark">
                      {grupos.length} comunidades
                    </Badge>
                  </div>
                  <CardDescription>Grupos com maior engajamento de membros.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingGroups ? (
                    [1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)
                  ) : topGroups.length ? (
                    topGroups.map((grupo) => {
                      const isActive = grupo?.ativo === 1 || grupo?.ativo === '1' || grupo?.ativo === true;
                      return (
                        <div key={grupo.id} className="rounded-xl border border-transparent bg-white/70 p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{grupo.nome}</p>
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{grupo.descricao}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant="info">{grupo.categoria || 'Geral'}</Badge>
                              <Badge variant={isActive ? 'success' : 'warning'}>
                                {isActive ? 'Ativo' : 'Pausado'}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-3 text-xs font-semibold text-muted-foreground">
                            {formatNumber(grupo.membros)} membros
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Nenhum grupo disponível no momento.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none bg-white/80 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Panorama de engajamento</CardTitle>
                  <CardDescription>Números consolidados de interações.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">Interações totais</span>
                      <p className="text-xs text-muted-foreground">Likes + comentários + compartilhamentos</p>
                    </div>
                    <span className="text-2xl font-semibold text-gray-900">
                      {loadingStats ? <Skeleton className="h-7 w-16" /> : formatNumber(totalInteractions)}
                    </span>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
                      <BarChart3 className="h-5 w-5 text-coral" />
                      Média por post
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">
                      {loadingStats ? <Skeleton className="h-8 w-20" /> : formatNumber(engagementPerPost)}
                    </div>
                    <p className="text-xs text-muted-foreground">Interações em média por publicação.</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Likes</span>
                      <span className="font-semibold text-gray-900">
                        {loadingStats ? <Skeleton className="h-5 w-12" /> : formatNumber(stats?.engagement?.total_likes || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Comentários</span>
                      <span className="font-semibold text-gray-900">
                        {loadingStats ? <Skeleton className="h-5 w-12" /> : formatNumber(stats?.engagement?.total_comentarios || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Compartilhamentos</span>
                      <span className="font-semibold text-gray-900">
                        {loadingStats ? <Skeleton className="h-5 w-12" /> : formatNumber(stats?.engagement?.total_compartilhamentos || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card className="border-none bg-white/80 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Receitas e assinaturas</CardTitle>
                      <CardDescription>Resumo financeiro dos produtos premium.</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-sage/20 text-sage-dark">
                      Atualizado automaticamente
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl bg-muted/60 p-4">
                      <span className="text-xs uppercase text-muted-foreground">Receita total</span>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {loadingMonetization ? <Skeleton className="h-8 w-24" /> : formatCurrency(monetization?.receitaTotal)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-4">
                      <span className="text-xs uppercase text-muted-foreground">Últimos 30 dias</span>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {loadingMonetization ? <Skeleton className="h-8 w-24" /> : formatCurrency(monetization?.receita30d)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-4">
                      <span className="text-xs uppercase text-muted-foreground">Assinaturas ativas</span>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {loadingMonetization ? <Skeleton className="h-8 w-16" /> : formatNumber(monetization?.assinaturasAtivas || 0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/80 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Portfólio premium</CardTitle>
                  <CardDescription>Visão rápida de cursos e campanhas ativas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-dashed border-olive/40 bg-olive/10 p-3 text-center">
                      <span className="text-xs uppercase text-olive-dark">Cursos</span>
                      <div className="mt-1 text-xl font-semibold text-olive-dark">
                        {loadingMonetization ? <Skeleton className="mx-auto h-6 w-10" /> : formatNumber(monetization?.cursosPublicados || 0)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-dashed border-coral/40 bg-coral/10 p-3 text-center">
                      <span className="text-xs uppercase text-coral">Matrículas</span>
                      <div className="mt-1 text-xl font-semibold text-coral">
                        {loadingMonetization ? <Skeleton className="mx-auto h-6 w-10" /> : formatNumber(monetization?.matriculas || 0)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-dashed border-indigo-400/40 bg-indigo-50 p-3 text-center">
                      <span className="text-xs uppercase text-indigo-600">Campanhas</span>
                      <div className="mt-1 text-xl font-semibold text-indigo-600">
                        {loadingMonetization ? <Skeleton className="mx-auto h-6 w-10" /> : formatNumber(monetization?.campanhasAtivas || 0)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Planos favoritos</h3>
                    <p className="text-xs text-muted-foreground">Ranking de planos com mais assinaturas ativas.</p>
                    <div className="mt-3 space-y-2">
                      {loadingMonetization ? (
                        [1, 2, 3].map((item) => <Skeleton key={item} className="h-10 w-full" />)
                      ) : monetization?.topPlanos?.length ? (
                        monetization.topPlanos.map((plano) => (
                          <div key={plano.slug || plano.nome} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 text-sm">
                            <div>
                              <span className="font-semibold text-gray-900">{plano.nome || 'Plano'}</span>
                              <span className="ml-2 text-xs text-muted-foreground">{plano.slug}</span>
                            </div>
                            <Badge variant="secondary" className="bg-coral/10 text-coral">
                              {formatNumber(plano.assinaturas || 0)} assinaturas
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center text-xs text-muted-foreground">
                          Nenhum plano com dados suficientes.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-4">
            <Card className="border-none bg-white/80 shadow-lg ring-1 ring-black/5">
              <CardHeader className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Gerenciar usuários</CardTitle>
                    <CardDescription>Visualize, edite informações e mantenha a comunidade saudável.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-sage/20 text-sage-dark">
                    {usuarios.length} usuários
                  </Badge>
                </div>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                      placeholder="Buscar por nome ou e-mail"
                      className="pl-9"
                    />
                  </div>
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-full lg:w-56">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {userTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="space-y-3 p-6">
                    {[1, 2, 3, 4].map((item) => (
                      <Skeleton key={item} className="h-20 w-full" />
                    ))}
                  </div>
                ) : sortedUsuarios.length ? (
                  <div className="divide-y">
                    {sortedUsuarios.map((usuario) => (
                      <div key={usuario.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            {usuario.avatar_url ? (
                              <AvatarImage src={usuario.avatar_url} alt={usuario.nome} />
                            ) : (
                              <AvatarFallback>{getInitials(usuario.nome)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{usuario.nome}</p>
                            <p className="text-sm text-muted-foreground">{usuario.email}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              {usuario.tipo && (
                                <Badge variant="info">{usuario.tipo}</Badge>
                              )}
                              {usuario.telefone && (
                                <Badge variant="outline">{usuario.telefone}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(usuario, 'usuarios')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete('usuarios', usuario.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card className="border-none bg-white/80 shadow-lg ring-1 ring-black/5">
              <CardHeader className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Gerenciar posts</CardTitle>
                    <CardDescription>Analise engajamento e mantenha o feed em alta qualidade.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-coral/10 text-coral">
                    {posts.length} publicações
                  </Badge>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="relative col-span-1 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={postSearch}
                      onChange={(event) => setPostSearch(event.target.value)}
                      placeholder="Buscar por autor ou conteúdo"
                      className="pl-9"
                    />
                  </div>
                  <Select value={postCategoryFilter} onValueChange={setPostCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {postCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={postSort} onValueChange={setPostSort}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="likes">Maior número de likes</SelectItem>
                      <SelectItem value="comentarios">Mais comentados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingPosts ? (
                  <div className="space-y-3 p-6">
                    {[1, 2, 3, 4].map((item) => (
                      <Skeleton key={item} className="h-24 w-full" />
                    ))}
                  </div>
                ) : sortedPosts.length ? (
                  <div className="divide-y">
                    {sortedPosts.map((post) => (
                      <div key={post.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-1 items-start gap-4">
                          <div className="hidden rounded-full bg-sage/40 p-2 text-sage-dark sm:block">
                            <MessageCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{post.autor}</p>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{post.conteudo}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                              {post.categoria && (
                                <Badge variant="secondary" className="bg-coral/10 text-coral">
                                  {post.categoria}
                                </Badge>
                              )}
                              <span>{formatNumber(post.likes)} likes</span>
                              <span>•</span>
                              <span>{formatNumber(post.comentarios)} comentários</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(post, 'posts')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete('posts', post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum post encontrado com os filtros aplicados.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grupos" className="space-y-4">
            <Card className="border-none bg-white/80 shadow-lg ring-1 ring-black/5">
              <CardHeader className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Gerenciar grupos</CardTitle>
                    <CardDescription>Fortaleça comunidades acompanhando saúde e participação.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-olive/10 text-olive-dark">
                    {grupos.length} grupos
                  </Badge>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="relative col-span-1 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={groupSearch}
                      onChange={(event) => setGroupSearch(event.target.value)}
                      placeholder="Buscar por nome ou descrição"
                      className="pl-9"
                    />
                  </div>
                  <Select value={groupStatusFilter} onValueChange={setGroupStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Somente ativos</SelectItem>
                      <SelectItem value="inactive">Somente pausados</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm">
                    <span className="font-semibold text-gray-900">{groupsActiveCount}</span>
                    <span className="text-muted-foreground"> grupos ativos agora</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingGroups ? (
                  <div className="space-y-3 p-6">
                    {[1, 2, 3, 4].map((item) => (
                      <Skeleton key={item} className="h-24 w-full" />
                    ))}
                  </div>
                ) : sortedGrupos.length ? (
                  <div className="divide-y">
                    {sortedGrupos.map((grupo) => {
                      const isActive = grupo?.ativo === 1 || grupo?.ativo === '1' || grupo?.ativo === true;
                      return (
                        <div key={grupo.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex flex-1 items-start gap-4">
                            <div className="hidden rounded-full bg-olive/20 p-2 text-olive-dark sm:block">
                              <Users2 className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{grupo.nome}</p>
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{grupo.descricao}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                                {grupo.categoria && (
                                  <Badge variant="secondary" className="bg-olive/10 text-olive-dark">
                                    {grupo.categoria}
                                  </Badge>
                                )}
                                <span>{formatNumber(grupo.membros)} membros</span>
                                <span>•</span>
                                <Badge variant={isActive ? 'success' : 'warning'}>
                                  {isActive ? 'Ativo' : 'Pausado'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(grupo, 'grupos')}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('grupos', grupo.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum grupo encontrado com os filtros aplicados.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Eventos */}
          <TabsContent value="eventos" className="space-y-4">
            <AdminEventManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Editar {editingItem?.type === 'usuarios' ? 'usuário' : editingItem?.type === 'posts' ? 'post' : 'grupo'}
            </DialogTitle>
            <DialogDescription>Atualize as informações e confirme para salvar suas alterações.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingItem && (
              <>
                {editingItem.type === 'usuarios' && (
                  <>
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={editingItem.nome || ''}
                        onChange={(e) => setEditingItem({...editingItem, nome: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editingItem.email || ''}
                        onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={editingItem.telefone || ''}
                        onChange={(e) => setEditingItem({...editingItem, telefone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editingItem.bio || ''}
                        onChange={(e) => setEditingItem({...editingItem, bio: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {editingItem.type === 'posts' && (
                  <>
                    <div>
                      <Label htmlFor="conteudo">Conteúdo</Label>
                      <Textarea
                        id="conteudo"
                        value={editingItem.conteudo || ''}
                        onChange={(e) => setEditingItem({...editingItem, conteudo: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Input
                        id="categoria"
                        value={editingItem.categoria || ''}
                        onChange={(e) => setEditingItem({...editingItem, categoria: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {editingItem.type === 'grupos' && (
                  <>
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={editingItem.nome || ''}
                        onChange={(e) => setEditingItem({...editingItem, nome: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={editingItem.descricao || ''}
                        onChange={(e) => setEditingItem({...editingItem, descricao: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Input
                        id="categoria"
                        value={editingItem.categoria || ''}
                        onChange={(e) => setEditingItem({...editingItem, categoria: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Salvar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
