import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Users,
  Lock,
  Globe,
  Loader2,
  Crown,
  Filter,
  ArrowRight,
  Search,
  Shield,
  Tag,
  Clock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { CreateGroupModal } from "../components/create-group-modal";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ui/toast";
import apiService from "../services/api";
import CommunityLeftSidebar from "../components/layout/CommunityLeftSidebar";
import config from "../config/config";

export function GroupsHeader({ user, logout }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/logo-sem-fundo.png" alt="EmpowerUp" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Users className="w-6 h-6 text-coral" />
            Grupos
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar_url ? config.getPublicUrl(user.avatar_url) : ""} />
              <AvatarFallback className="bg-coral text-white text-sm font-medium">
                {user?.nome?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-900 hidden sm:block">{user?.nome}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuItem onClick={() => navigate('/perfil')} className="cursor-pointer">
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="cursor-pointer text-red-600"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

const FILTER_OPTIONS = [
  { value: "todos", label: "Todos os grupos" },
  { value: "joined", label: "Onde participo" },
  { value: "managed", label: "Eu modero" },
  { value: "discover", label: "Descobrir" },
];

const TAG_COLORS = [
  "bg-olive/10 text-olive",
  "bg-coral/10 text-coral",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
];

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // ignorar erro de parse
    }
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function resolveInitials(name = "") {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function GroupSkeleton() {
  return (
    <Card className="border-dashed">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-9 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

function GroupCard({ group, onJoin, isJoining, onNavigate }) {
  if (!group) return null;

  const isPrivate = group.privacidade && group.privacidade !== "publico";
  const tags = normalizeTags(group.tags).slice(0, 3);
  const membershipStatus = group?.membership?.status;
  const membershipRole = group?.membership?.role;
  const isMember = membershipStatus === "ativo";
  const isPending = membershipStatus === "pendente";
  const lastActivity = formatDate(group.ultima_atividade);

  const membershipLabel =
    membershipRole === "owner"
      ? "Você criou"
      : membershipRole === "moderador"
      ? "Você modera"
      : "Você participa";

  return (
    <Card className="h-full border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={group.imagem || undefined} alt={group.nome} />
            <AvatarFallback className="bg-olive/10 text-olive font-semibold">
              {resolveInitials(group.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-gray-900" title={group.nome}>
                {group.nome}
              </h3>
              {isPrivate ? (
                <Lock className="h-4 w-4 text-gray-400" />
              ) : (
                <Globe className="h-4 w-4 text-gray-400" />
              )}
            </div>
            {group.categoria && (
              <Badge variant="secondary" className="bg-olive/10 text-olive">
                {group.categoria}
              </Badge>
            )}
            {isMember && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                {membershipLabel}
              </Badge>
            )}
            {isPending && (
              <Badge variant="outline" className="border-amber-200 text-amber-700">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Solicitação pendente
              </Badge>
            )}
          </div>
        </div>

        <p className="line-clamp-3 flex-1 text-sm text-gray-600">
          {group.descricao ||
            "Comunidade exclusiva para empreendedoras compartilharem aprendizados e oportunidades."}
        </p>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={tag}
              variant="outline"
              className={`${TAG_COLORS[index % TAG_COLORS.length]} border-none`}
            >
              <Tag className="mr-1.5 h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {group.membros || 0} integrantes
          </span>
          {lastActivity && <span>Ativo em {lastActivity}</span>}
        </div>

        <div className="flex gap-2 border-t pt-4">
          {isMember ? (
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => onNavigate(group)}
            >
              Acessar grupo
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onJoin(group)}
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar no grupo"
              )}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onNavigate(group)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ModerationCard({ group, pendingCount = 0, onNavigate }) {
  const tags = normalizeTags(group.tags).slice(0, 2);
  const isPrivate = group.privacidade && group.privacidade !== "publico";

  return (
    <Card className="border border-olive/20 bg-olive/5 shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">{group.nome}</h3>
              {isPrivate ? (
                <Lock className="h-4 w-4 text-gray-400" />
              ) : (
                <Globe className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {group.descricao
                ? group.descricao.slice(0, 100)
                : "Mantenha a comunidade ativa aprovando novas participantes e atualizando os conteúdos."}
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700">
              {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {group.membros || 0} integrantes
          </span>
          <Button size="sm" variant="secondary" onClick={() => onNavigate(group)}>
            Gerenciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GroupsPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const [managedGroups, setManagedGroups] = useState([]);
  const [managedLoading, setManagedLoading] = useState(false);
  const [managedRequestCounts, setManagedRequestCounts] = useState({});

  const canCreateGroup = useMemo(() => {
    if (!user) return false;
    if (user.tipo === "admin") return true;
    if (user.subscription?.acesso_grupos) return true;
    if (user.subscription?.plan_slug === "plano-premium") return true;
    if (user.is_premium) return true;
    return false;
  }, [user]);

  const isPremiumUser = useMemo(() => {
    if (!user) return false;
    if (user.tipo === "admin") return true;
    if (user.subscription?.acesso_grupos) return true;
    if (user.subscription?.plan_slug === "plano-premium") return true;
    if (user.is_premium) return true;
    return false;
  }, [user]);

  const handleBackToCommunity = useCallback(() => {
    navigate("/comunidade");
  }, [navigate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 30 };
      if (filter && filter !== "todos") {
        params.filter = filter;
      }
      if (debouncedSearch) {
        params.q = debouncedSearch;
      }
      console.log('🔍 Buscando grupos com params:', params);
      const response = await apiService.listGroups(params);
      console.log('📦 Resposta da API de grupos:', response);
      if (response?.success) {
        const groupsList = response.groups ||
            response.grupos ||
            response.data?.groups ||
            response.data?.grupos ||
            [];
        console.log('✅ Grupos carregados:', groupsList.length, groupsList);
        setGroups(groupsList);
      } else {
        console.warn('⚠️ Resposta sem success:', response);
        setGroups([]);
        if (response?.message) {
          addToast(response.message, "error");
        }
      }
    } catch (error) {
      console.error("Erro ao buscar grupos", error);
      addToast("Não foi possível carregar os grupos", "error");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch]); // Removido addToast para evitar loop infinito

  const loadManagedGroups = useCallback(async () => {
    if (!user) {
      setManagedGroups([]);
      setManagedRequestCounts({});
      return;
    }
    setManagedLoading(true);
    try {
      console.log('🔍 Buscando grupos gerenciados...');
      const response = await apiService.listGroups({ filter: "managed", limit: 15 });
      console.log('📦 Resposta de grupos gerenciados:', response);
      if (response?.success) {
        const managed =
          response.groups ||
          response.grupos ||
          response.data?.groups ||
          response.data?.grupos ||
          [];
        console.log('✅ Grupos gerenciados:', managed.length, managed);
        setManagedGroups(managed);

        if (managed.length > 0) {
          const requestCounts = {};
          await Promise.all(
            managed.map(async (group) => {
              try {
                const reqResponse = await apiService.listGroupRequests(group.id);
                if (reqResponse?.success) {
                  requestCounts[group.id] = reqResponse.requests ? reqResponse.requests.length : 0;
                } else {
                  requestCounts[group.id] = 0;
                }
              } catch (error) {
                requestCounts[group.id] = 0;
              }
            })
          );
          setManagedRequestCounts(requestCounts);
        } else {
          setManagedRequestCounts({});
        }
      } else {
        setManagedGroups([]);
        setManagedRequestCounts({});
      }
    } catch (error) {
      console.error("Erro ao carregar grupos moderados", error);
      setManagedGroups([]);
      setManagedRequestCounts({});
    } finally {
      setManagedLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (user) {
      loadManagedGroups();
    } else {
      setManagedGroups([]);
      setManagedRequestCounts({});
    }
  }, [user, loadManagedGroups]);

  const handleJoinGroup = useCallback(
    async (group) => {
      const groupId = group?.id;
      if (!groupId || joiningGroupId === groupId) {
        return;
      }
      setJoiningGroupId(groupId);
      try {
        const response = await apiService.joinGroup(groupId);
        if (response?.success) {
          addToast(response.message || "Solicitação enviada", "success");
          
          // Se a usuária entrou no grupo (status ativo), redirecionar para a página do grupo
          const groupSlug = response.data?.group?.slug;
          if (response.data?.membership?.status === 'ativo' && groupSlug) {
            navigate(`/grupos/${groupSlug}`);
          } else {
            // Se foi apenas solicitação pendente, recarregar a lista
            await Promise.all([loadGroups(), loadManagedGroups()]);
          }
        } else {
          addToast(response?.message || "Não foi possível participar do grupo", "error");
        }
      } catch (error) {
        addToast(error?.message || "Não foi possível participar do grupo", "error");
      } finally {
        setJoiningGroupId(null);
      }
    },
    [joiningGroupId, loadGroups, loadManagedGroups, navigate]
  );

  const handleCreateGroup = useCallback(
    async (formData) => {
      if (!canCreateGroup) {
        addToast("Disponível apenas para assinantes Premium ou administradoras.", "warning");
        return { success: false };
      }

      setCreatingGroup(true);
      try {
        const payload = {
          nome: formData.nome,
          descricao: formData.descricao,
          categoria: formData.categoria,
          imagem: formData.imagem || null,
          privacidade: formData.privacidade || "privado",
          moderacao_nivel: formData.moderacao_nivel || "moderado",
          tags: formData.tags || [],
        };

        const response = await apiService.createGroup(payload);
        if (response?.success) {
          addToast("Grupo criado com sucesso! 🎉", "success");
          await Promise.all([loadGroups(), loadManagedGroups()]);
          if (response.slug) {
            navigate(`/grupos/${response.slug}`);
          } else if (response.group_id) {
            navigate(`/grupos/${response.group_id}`);
          }
          return { success: true };
        }

        addToast(response?.message || "Não foi possível criar o grupo", "error");
        return { success: false };
      } catch (error) {
        console.error("Erro ao criar grupo", error);
        addToast(error?.message || "Não foi possível criar o grupo", "error");
        return { success: false };
      } finally {
        setCreatingGroup(false);
      }
    },
    [canCreateGroup, addToast, loadGroups, loadManagedGroups, navigate]
  );

  const heroAction = useMemo(() => {
    if (canCreateGroup) {
      return (
        <CreateGroupModal
          onCreateGroup={handleCreateGroup}
          triggerButtonProps={{
            className: "bg-coral hover:bg-coral/90 px-5 py-2",
            disabled: creatingGroup,
          }}
        />
      );
    }

    return (
      <Button className="bg-coral hover:bg-coral/90" onClick={() => navigate("/planos")}>
        <Crown className="mr-2 h-4 w-4" />
        Assine o plano Premium
      </Button>
    );
  }, [canCreateGroup, handleCreateGroup, creatingGroup, navigate]);

  const trendingTags = useMemo(() => {
    const counts = new Map();
    groups.forEach((group) => {
      normalizeTags(group.tags).forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [groups]);

  const showModerationPanel = managedGroups.length > 0;
  const isLoading = loading;
  const hasGroups = groups.length > 0;

  console.log('🎨 Estado do render:', {
    loading,
    isLoading,
    groupsLength: groups.length,
    hasGroups,
    groups
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral/5 to-olive/5 text-gray-800 overflow-x-hidden">
      <GroupsHeader user={user} logout={logout} />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <CommunityLeftSidebar active="grupos" />

          <section className="lg:col-span-9">
            <div className="space-y-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToCommunity}
                  className="w-full justify-start gap-2 sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para a comunidade
                </Button>
          {user && (
            <Badge
              variant={isPremiumUser ? "default" : "outline"}
              className={
                isPremiumUser
                  ? "bg-olive text-white"
                  : "border-dashed border-coral/60 text-coral"
              }
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              {isPremiumUser ? "Plano Premium ativo" : "Plano gratuito - aproveite para fazer upgrade"}
            </Badge>
          )}
        </div>

        <section className="rounded-3xl bg-gradient-to-br from-rose-50 via-white to-amber-50 p-8 shadow-sm ring-1 ring-rose-100/60">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge className="bg-coral/10 text-coral">Comunidades exclusivas</Badge>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Construa conexões poderosas com outras empreendedoras
              </h1>
              <p className="max-w-2xl text-base text-gray-600">
                Organize mentorias, desafios semanais e lançamentos colaborativos em grupos escolhidos a dedo para o estágio do seu negócio.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              {heroAction}
              {!canCreateGroup && (
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <Crown className="h-3.5 w-3.5" />
                  Criar e moderar grupos é um benefício do plano Premium.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Explorar grupos</h2>
            <p className="text-sm text-gray-500">
              Filtre por grupos que você já participa ou descubra novas comunidades alinhadas ao seu momento.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome, categoria ou tag..."
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar grupos" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {trendingTags.length > 0 && (
          <section className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Tag className="h-4 w-4 text-coral" />
              Temas em destaque
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
              {trendingTags.map(([tag, count], index) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`${TAG_COLORS[index % TAG_COLORS.length]} border-none`}
                >
                  #{tag} • {count}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {showModerationPanel && (
          <section className="space-y-4 rounded-3xl border border-olive/20 bg-olive/5 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-olive" />
                  Painel das suas comunidades
                </h2>
                <p className="text-sm text-gray-500">
                  Aprove solicitações pendentes, acompanhe o engajamento e mantenha a comunidade acolhedora.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => loadManagedGroups()} disabled={managedLoading}>
                {managedLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando
                  </>
                ) : (
                  "Atualizar"
                )}
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {managedLoading && managedGroups.length === 0 ? (
                <>
                  <GroupSkeleton />
                  <GroupSkeleton />
                </>
              ) : (
                managedGroups.map((group) => (
                  <ModerationCard
                    key={group.id}
                    group={group}
                    pendingCount={managedRequestCounts[group.id] || 0}
                    onNavigate={(selected) => navigate(`/grupos/${selected.slug || selected.id}`)}
                  />
                ))
              )}
            </div>
          </section>
        )}

        <section>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((placeholder) => (
                <GroupSkeleton key={placeholder} />
              ))}
            </div>
          ) : hasGroups ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={handleJoinGroup}
                  isJoining={joiningGroupId === group.id}
                  onNavigate={(selected) => navigate(`/grupos/${selected.slug || selected.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Ainda não encontramos grupos com esses filtros
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Explore outros temas ou aproveite para criar uma comunidade exclusiva para mentorias, desafios e trocas estratégicas.
              </p>
              <div className="mt-6">{heroAction}</div>
            </div>
          )}
        </section>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
