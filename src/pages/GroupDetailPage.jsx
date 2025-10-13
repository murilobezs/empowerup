import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loading } from '../components/common';
import { useToast } from '../components/ui/toast';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import GroupSettingsDialog from '../components/groups/GroupSettingsDialog';
import SocialPost from '../components/SocialPost';
import EmpowerUpCreatePost from '../components/EmpowerUpCreatePost';
import EditPostModal from '../components/EditPostModal';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Settings2,
  Lock,
  Globe,
  Tag,
  AlertCircle,
  Loader2,
  UserMinus,
  MailCheck,
} from 'lucide-react';

const GROUP_TABS = [
  { value: 'overview', label: 'Visão geral' },
  { value: 'discussions', label: 'Discussões' },
  { value: 'members', label: 'Membros' },
];

const POSTS_PAGE_SIZE = 10;

function resolveInitials(name = '') {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatTagList(tags) {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === 'string' && tags.trim()) {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // ignore JSON parse error
    }
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

export default function GroupDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const addToastRef = useRef(addToast);

  useEffect(() => {
    addToastRef.current = addToast;
  }, [addToast]);

  const showToast = useCallback((message, type = 'info') => {
    if (typeof addToastRef.current === 'function') {
      addToastRef.current(message, type);
    }
  }, []);

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [postsPagination, setPostsPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: POSTS_PAGE_SIZE,
  });
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadGroup = useCallback(async () => {
    if (!slug) {
      setGroup(null);
      setMembers([]);
      setPendingRequests(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const numericSlug = /^\d+$/.test(slug);

    try {
      let response = null;

      if (numericSlug) {
        response = await apiService.getGroup(slug);
      } else {
        try {
          response = await apiService.getGroupBySlug(slug);
        } catch (error) {
          if (error?.status === 404 && /^\d+$/.test(slug)) {
            response = await apiService.getGroup(slug);
          } else {
            throw error;
          }
        }
      }

      if (response?.success) {
        setGroup(response.group);
        setMembers(response.members || []);
        setPendingRequests(response.pending_requests || 0);
      } else {
        showToast(response?.message || 'Grupo não encontrado', 'error');
        setGroup(null);
        setMembers([]);
        setPendingRequests(0);
      }
    } catch (error) {
      console.error('Erro ao carregar grupo', error);
      showToast(error?.message || 'Não foi possível carregar o grupo', 'error');
      setGroup(null);
      setMembers([]);
      setPendingRequests(0);
    } finally {
      setLoading(false);
    }
  }, [slug, showToast]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const canModerate = !!group?.permissions?.can_moderate;
  const canEdit = !!group?.permissions?.can_edit;
  const membershipStatus = group?.membership?.status;
  const isMember = !!group?.membership?.is_member;
  const isPending = !!group?.membership?.is_pending;
  const isAdmin = user?.tipo === 'admin';
  const canViewFeed = isAdmin || isMember;
  const canCreatePost = canViewFeed && !isPending;
  const hasMorePosts = (postsPagination.page ?? 1) < (postsPagination.pages ?? 1);
  const joinButtonLabel = useMemo(() => {
    if (!group) return 'Participar do grupo';
    if (group?.privacidade === 'somente_convidados' || group?.moderacao_nivel === 'restrito') {
      return 'Solicitar participação';
    }
    return 'Participar do grupo';
  }, [group]);

  const loadRequests = useCallback(async () => {
    if (!group?.id || !canModerate) return;
    setRequestsLoading(true);
    try {
      const response = await apiService.listGroupRequests(group.id);
      if (response?.success) {
        setRequests(response.requests || []);
        setPendingRequests(response.requests ? response.requests.length : 0);
      } else {
        showToast(response?.message || 'Erro ao carregar solicitações', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações do grupo', error);
      showToast('Falha ao carregar solicitações pendentes', 'error');
    } finally {
      setRequestsLoading(false);
    }
  }, [group?.id, canModerate, showToast]);

  useEffect(() => {
    if (canModerate) {
      loadRequests();
    }
  }, [canModerate, loadRequests]);

  const handleJoin = useCallback(async () => {
    if (!group?.id || joining) return;
    setJoining(true);
    try {
      const response = await apiService.joinGroup(group.id);
      if (response?.success) {
        showToast(response?.message || 'Você entrou no grupo!', 'success');
        await loadGroup();
        if (canModerate) {
          await loadRequests();
        }
      } else {
        showToast(response?.message || 'Não foi possível participar do grupo', 'error');
      }
    } catch (error) {
      console.error('Erro ao entrar no grupo', error);
      showToast(error?.message || 'Não foi possível participar do grupo', 'error');
    } finally {
      setJoining(false);
    }
  }, [group?.id, joining, showToast, loadGroup, canModerate, loadRequests]);

  const handleLeave = useCallback(async () => {
    if (!group?.id || leaving) return;
    if (!window.confirm('Tem certeza que deseja sair deste grupo?')) return;
    setLeaving(true);
    try {
      const response = await apiService.leaveGroup(group.id);
      if (response?.success) {
        showToast(response?.message || 'Você saiu do grupo', 'success');
        await loadGroup();
      } else {
        showToast(response?.message || 'Não foi possível sair do grupo', 'error');
      }
    } catch (error) {
      console.error('Erro ao sair do grupo', error);
      showToast(error?.message || 'Não foi possível sair do grupo', 'error');
    } finally {
      setLeaving(false);
    }
  }, [group?.id, leaving, showToast, loadGroup]);

  const handleRespondRequest = useCallback(async (requestId, status) => {
    if (!group?.id) return;
    setProcessingRequestId(requestId);
    try {
      const response = await apiService.respondGroupRequest(group.id, requestId, status);
      if (response?.success) {
        showToast('Solicitação atualizada', 'success');
        await Promise.all([loadRequests(), loadGroup()]);
      } else {
        showToast(response?.message || 'Não foi possível atualizar a solicitação', 'error');
      }
    } catch (error) {
      console.error('Erro ao atualizar solicitação', error);
      showToast(error?.message || 'Não foi possível atualizar a solicitação', 'error');
    } finally {
      setProcessingRequestId(null);
    }
  }, [group?.id, showToast, loadRequests, loadGroup]);

  const handleRemoveMember = useCallback(async (memberId) => {
    if (!group?.id || !memberId) return;
    if (!window.confirm('Remover esta integrante do grupo?')) return;
    setRemovingMemberId(memberId);
    try {
      const response = await apiService.removeGroupMember(group.id, memberId);
      if (response?.success) {
        showToast('Integrante removida', 'success');
        await loadGroup();
      } else {
        showToast(response?.message || 'Não foi possível remover a integrante', 'error');
      }
    } catch (error) {
      console.error('Erro ao remover integrante', error);
      showToast(error?.message || 'Não foi possível remover a integrante', 'error');
    } finally {
      setRemovingMemberId(null);
    }
  }, [group?.id, showToast, loadGroup]);

  const handleSaveSettings = useCallback(async (formData) => {
    if (!group?.id) return;
    setSavingSettings(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
      };

      const response = await apiService.updateGroup(group.id, payload);
      if (response?.success) {
        showToast('Configurações atualizadas', 'success');
        setSettingsOpen(false);
        await loadGroup();
      } else {
        showToast(response?.message || 'Não foi possível salvar as alterações', 'error');
      }
    } catch (error) {
      console.error('Erro ao atualizar grupo', error);
      showToast(error?.message || 'Não foi possível salvar as alterações', 'error');
    } finally {
      setSavingSettings(false);
    }
  }, [group?.id, showToast, loadGroup]);

  const loadGroupPosts = useCallback(async (page = 1, append = false) => {
    if (!group?.id || !canViewFeed) {
      return;
    }

    const limit = POSTS_PAGE_SIZE;

    if (append) {
      setLoadingMorePosts(true);
    } else {
      setPostsLoading(true);
      setPostsError(null);
    }

    try {
      const response = await apiService.getGroupPosts(group.id, { page, limit });
      if (response?.success) {
        const fetchedPosts = response.posts || [];
        let newItemsCount = 0;

        setPosts((prevPosts) => {
          if (!append) {
            return fetchedPosts;
          }

          const existingIds = new Set(prevPosts.map((post) => post.id));
          const merged = [...prevPosts];
          fetchedPosts.forEach((post) => {
            if (!existingIds.has(post.id)) {
              merged.push(post);
              newItemsCount += 1;
            }
          });

          return merged;
        });

        const paginationData = response.pagination || {};
        setPostsPagination((prev) => {
          const baseTotal = paginationData.total ?? paginationData.totalPosts;
          const nextTotal = baseTotal !== undefined
            ? baseTotal
            : (append ? (prev.total ?? 0) + newItemsCount : fetchedPosts.length);

          const nextLimit = paginationData.limit ?? paginationData.per_page ?? limit;
          const nextPages = paginationData.pages
            ?? paginationData.totalPages
            ?? (nextLimit ? Math.max(1, Math.ceil(nextTotal / nextLimit)) : prev.pages);

          return {
            page: paginationData.page ?? page,
            pages: nextPages,
            total: nextTotal,
            limit: nextLimit,
          };
        });

        setPostsError(null);
      } else {
        if (!append) {
          setPosts([]);
        }
        setPostsError(response?.message || 'Não foi possível carregar as publicações do grupo.');
      }
    } catch (error) {
      if (!append) {
        setPosts([]);
      }
      if (error?.status === 403) {
        setPostsError('Você precisa ser integrante ativa deste grupo para visualizar as discussões.');
      } else {
        setPostsError(error?.message || 'Erro ao carregar as discussões do grupo.');
        showToast('Erro ao carregar as discussões do grupo', 'error');
      }
    } finally {
      if (append) {
        setLoadingMorePosts(false);
      } else {
        setPostsLoading(false);
      }
    }
  }, [group?.id, canViewFeed, showToast]);

  const handlePostCreated = useCallback(async (postData, mediaFile) => {
    if (!group?.id) {
      return { success: false, message: 'Grupo inválido' };
    }

    try {
      const result = await apiService.createPost(
        {
          ...postData,
          grupo_id: group.id,
          escopo_visibilidade: 'grupo',
        },
        mediaFile
      );

      if (result?.success && result.post) {
        setPosts((prev) => {
          const existingIndex = prev.findIndex((item) => item.id === result.post.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated.splice(existingIndex, 1);
            return [result.post, ...updated];
          }
          return [result.post, ...prev];
        });

        setPostsPagination((prev) => ({
          ...prev,
          total: (prev.total ?? 0) + 1,
        }));

        setGroup((prev) => (prev ? { ...prev, ultima_atividade: new Date().toISOString() } : prev));
        setPostsError(null);

        return { success: true, post: result.post };
      }

      const message = result?.message || 'Não foi possível publicar no grupo.';
      showToast(message, 'error');
      return { success: false, message };
    } catch (error) {
      const message = error?.message || 'Erro ao publicar no grupo.';
      showToast(message, 'error');
      return { success: false, message };
    }
  }, [group?.id, showToast]);

  const handleLoadMorePosts = useCallback(() => {
    if (loadingMorePosts) {
      return;
    }

    const nextPage = (postsPagination.page ?? 1) + 1;
    if (nextPage <= (postsPagination.pages ?? 1)) {
      loadGroupPosts(nextPage, true);
    }
  }, [loadingMorePosts, postsPagination.page, postsPagination.pages, loadGroupPosts]);

  const handlePostLike = useCallback((postId, liked, likesCount) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likes: likesCount, likes_count: likesCount, user_liked: liked, isLiked: liked }
          : post
      )
    );
  }, []);

  const handlePostSave = useCallback((postId, saved) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, user_saved: saved, isSaved: saved } : post
      )
    );
  }, []);

  const handlePostDelete = useCallback(async (postId) => {
    if (!window.confirm('Remover esta publicação do grupo?')) {
      return;
    }

    try {
      const response = await apiService.deletePost(postId);
      if (response?.success) {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        setPostsPagination((prev) => ({
          ...prev,
          total: Math.max((prev.total ?? 1) - 1, 0),
        }));
        showToast(response?.message || 'Post removido com sucesso.', 'success');
      } else {
        throw new Error(response?.message || 'Não foi possível remover o post.');
      }
    } catch (error) {
      console.error('Erro ao remover post do grupo', error);
      showToast(error?.message || 'Não foi possível remover o post.', 'error');
    }
  }, [showToast]);

  const handleEditPost = useCallback((post) => {
    setEditingPost(post);
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingPost(null);
  }, []);

  const handleSaveEditPost = useCallback(async (postId, updatedData) => {
    const response = await apiService.updatePost(postId, updatedData);
    if (response?.success && response.post) {
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, ...response.post } : post))
      );
      return response.post;
    }

    throw new Error(response?.message || 'Não foi possível atualizar o post.');
  }, []);

  useEffect(() => {
    if (!group?.id) {
      setPosts([]);
      setPostsError(null);
      setPostsPagination({
        page: 1,
        pages: 1,
        total: 0,
        limit: POSTS_PAGE_SIZE,
      });
      return;
    }

    if (canViewFeed) {
      loadGroupPosts(1, false);
    } else {
      setPosts([]);
      setPostsPagination({
        page: 1,
        pages: 1,
        total: 0,
        limit: POSTS_PAGE_SIZE,
      });
      setPostsError(isPending
        ? 'Sua solicitação ainda está pendente. Assim que for aprovada, o feed ficará disponível.'
        : 'Entre no grupo para visualizar e participar das discussões internas.'
      );
      setPostsLoading(false);
      setLoadingMorePosts(false);
    }
  }, [group?.id, canViewFeed, isPending, loadGroupPosts]);

  const feedAccessMessage = isPending
    ? 'Sua solicitação ainda está pendente. Assim que for aprovada, o mural ficará disponível.'
    : 'Entre no grupo para visualizar e participar das discussões internas.';

  const tagList = useMemo(() => formatTagList(group?.tags), [group?.tags]);
  const postsPreview = useMemo(() => posts.slice(0, 3), [posts]);
  const formatPreviewTime = useCallback((post) => {
    if (post?.timeAgo) return post.timeAgo;
    if (post?.created_at) {
      const date = new Date(post.created_at);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      }
    }
    return '';
  }, []);

  const renderHeroActions = () => {
    if (!group) return null;

    if (isMember) {
      return (
        <div className="flex flex-wrap items-center gap-3">
          {canEdit && (
            <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
              <Settings2 className="mr-2 h-4 w-4" />
              Personalizar grupo
            </Button>
          )}
          <Button variant="outline" onClick={handleLeave} disabled={leaving}>
            {leaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saindo...
              </>
            ) : (
              <>
                <UserMinus className="mr-2 h-4 w-4" />
                Sair do grupo
              </>
            )}
          </Button>
        </div>
      );
    }

    if (isPending) {
      return (
        <Button variant="secondary" disabled className="opacity-80">
          <Clock3 className="mr-2 h-4 w-4" />
          Solicitação pendente
        </Button>
      );
    }

    return (
      <Button onClick={handleJoin} disabled={joining}>
        {joining ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <MailCheck className="mr-2 h-4 w-4" />
            {joinButtonLabel}
          </>
        )}
      </Button>
    );
  };

  const renderRequestsCard = () => {
    if (!canModerate) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-olive" />
            Solicitações pendentes
            {pendingRequests > 0 && (
              <Badge variant="secondary" className="ml-auto bg-olive/15 text-olive">
                {pendingRequests}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="animate-pulse rounded-lg border border-dashed border-gray-200 p-3">
                  <div className="h-4 w-1/3 bg-gray-200/70" />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhuma solicitação aguardando aprovação.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-gray-100 p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.usuario?.avatar_url || undefined} alt={request.usuario?.nome} />
                        <AvatarFallback>{resolveInitials(request.usuario?.nome)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{request.usuario?.nome}</p>
                        <p className="text-xs text-gray-500">@{request.usuario?.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingRequestId === request.id}
                        onClick={() => handleRespondRequest(request.id, 'rejeitado')}
                      >
                        {processingRequestId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Recusar'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        disabled={processingRequestId === request.id}
                        onClick={() => handleRespondRequest(request.id, 'aprovado')}
                      >
                        {processingRequestId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Aceitar'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderMembersList = (variant = 'grid') => {
    if (!members.length) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-sm text-gray-500">
            Ainda não há integrantes ativas além da criadora.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className={variant === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-3'}>
        {members.map((member) => {
          const isSelf = member.is_self;
          const canRemove = canModerate && member.can_be_removed && !isSelf;
          return (
            <Card key={member.id} className="overflow-hidden border border-gray-100">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url || undefined} alt={member.nome} />
                    <AvatarFallback>{resolveInitials(member.nome)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{member.nome}</p>
                    <p className="text-xs text-gray-500">@{member.username}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-olive/10 text-olive">
                        {member.papel === 'owner' ? 'Criadora' : member.papel === 'moderador' ? 'Moderadora' : 'Membro'}
                      </Badge>
                      {member.status !== 'ativo' && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          {member.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {canRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    disabled={removingMemberId === member.id}
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    {removingMemberId === member.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Remover'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loading />
        </div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-coral" />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Grupo não encontrado</h1>
          <p className="mt-2 text-sm text-gray-600">
            Talvez o link tenha expirado ou você não tenha permissão para visualizar este grupo.
          </p>
          <Button className="mt-6" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </MainLayout>
    );
  }

  const coverUrl = group.imagem_capa || '';
  const avatarUrl = group.imagem || '';

  return (
    <MainLayout>
      <div className="relative overflow-hidden bg-slate-900 text-white">
        {coverUrl ? (
          <div className="absolute inset-0">
            <img src={coverUrl} alt={`Capa do grupo ${group.nome}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/65" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}
        <div className="relative z-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div className="-mt-12 overflow-hidden rounded-2xl border-4 border-white/80 bg-white shadow-xl">
                <Avatar className="h-24 w-24 text-xl md:h-28 md:w-28">
                  <AvatarImage src={avatarUrl || undefined} alt={group.nome} />
                  <AvatarFallback className="bg-olive text-white text-xl">
                    {resolveInitials(group.nome)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{group.nome}</h1>
                  {group.membership?.role && (
                    <Badge variant="secondary" className="bg-white/15 text-white">
                      {group.membership.role === 'owner'
                        ? 'Criadora'
                        : group.membership.role === 'moderador'
                          ? 'Moderadora'
                          : 'Membro'}
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="outline" className="border-white/60 text-white">
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.membros || members.length} membros
                  </span>
                  <span className="flex items-center gap-1">
                    {group.privacidade === 'publico' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {group.privacidade === 'publico' ? 'Público' : group.privacidade === 'privado' ? 'Privado' : 'Somente convidadas'}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    {group.moderacao_nivel === 'aberto'
                      ? 'Entrada imediata'
                      : group.moderacao_nivel === 'moderado'
                        ? 'Moderado'
                        : 'Restrito'}
                  </span>
                </div>
                {tagList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {tagList.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 text-white">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 text-sm">
              {renderHeroActions()}
              {membershipStatus && (
                <p className="text-xs text-white/80">
                  Status atual: {membershipStatus === 'ativo' ? 'Participando do grupo' : membershipStatus === 'pendente' ? 'Aguardando aprovação' : membershipStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                {GROUP_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre o grupo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-gray-600">
                    <p>{group.descricao || 'Este grupo ainda não possui uma descrição detalhada.'}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Categoria</p>
                        <p className="mt-1 text-sm text-gray-700">{group.categoria || 'Não definida'}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Moderação</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {group.moderacao_nivel === 'aberto'
                            ? 'Entradas imediatas'
                            : group.moderacao_nivel === 'moderado'
                              ? 'Solicitações precisam ser aprovadas'
                              : 'Somente a criadora/moderadoras conseguem autorizar'}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Regras e combinados</p>
                      <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                        {group.regras && group.regras.trim().length > 0
                          ? group.regras
                          : 'Estabeleça as regras do grupo para manter a comunidade colaborativa e segura.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Atividade recente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!canViewFeed ? (
                      <div className="rounded-lg border border-dashed border-gray-200 p-5 text-center text-sm text-gray-600">
                        {feedAccessMessage}
                      </div>
                    ) : (
                      <>
                        {postsLoading && posts.length === 0 && (
                          <div className="flex justify-center py-6">
                            <Loading />
                          </div>
                        )}
                        {!postsLoading && postsPreview.length === 0 && (
                          <div className="rounded-lg border border-dashed border-gray-200 p-5 text-center text-sm text-gray-600">
                            Ainda não há publicações no mural deste grupo. Compartilhe a primeira ideia!
                          </div>
                        )}
                        {postsPreview.length > 0 && (
                          <>
                            <div className="space-y-3">
                              {postsPreview.map((post) => (
                                <div key={post.id} className="rounded-xl border border-gray-100 p-4 shadow-sm">
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="font-semibold text-gray-900 text-sm truncate pr-4">{post.autor}</span>
                                    <span>{formatPreviewTime(post)}</span>
                                  </div>
                                  <p className="mt-2 text-sm text-gray-700 line-clamp-3">{post.conteudo}</p>
                                </div>
                              ))}
                            </div>
                            <Button
                              variant="link"
                              className="px-0 text-coral"
                              onClick={() => setActiveTab('discussions')}
                            >
                              Acessar mural completo
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussions">
                <div className="space-y-4">
                  {canViewFeed ? (
                    <>
                      {canCreatePost && user && (
                        <EmpowerUpCreatePost
                          user={user}
                          onPostCreated={handlePostCreated}
                          groupId={group.id}
                          className="border border-gray-100 shadow-sm"
                          placeholder={`Compartilhe algo com ${group.nome}`}
                        />
                      )}

                      {postsError && (
                        <Card>
                          <CardContent className="text-sm text-gray-600">
                            {postsError}
                          </CardContent>
                        </Card>
                      )}

                      {postsLoading && posts.length === 0 && !postsError && (
                        <Card>
                          <CardContent className="flex justify-center py-10">
                            <Loading />
                          </CardContent>
                        </Card>
                      )}

                      {posts.length > 0 && (
                        <div className="space-y-4">
                          {posts.map((post) => (
                            <SocialPost
                              key={post.id}
                              post={post}
                              currentUser={user}
                              onLike={handlePostLike}
                              onSave={handlePostSave}
                              onDelete={handlePostDelete}
                              onUpdate={handleEditPost}
                              showSaveButton
                              showGroupBadge
                              groupName={group.nome}
                            />
                          ))}
                        </div>
                      )}

                      {!postsLoading && posts.length === 0 && !postsError && (
                        <Card>
                          <CardContent className="py-10 text-center text-sm text-gray-600">
                            Ainda não há discussões ativas neste grupo. Que tal iniciar uma conversa?
                          </CardContent>
                        </Card>
                      )}

                      {hasMorePosts && (
                        <div className="flex justify-center pt-2">
                          <Button
                            variant="outline"
                            onClick={handleLoadMorePosts}
                            disabled={loadingMorePosts}
                          >
                            {loadingMorePosts ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Carregando...
                              </>
                            ) : (
                              'Carregar mais publicações'
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center text-sm text-gray-600">
                        {feedAccessMessage}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Membros do grupo</CardTitle>
                    <p className="text-sm text-gray-500">{group.membros || members.length} empreendedoras participando</p>
                  </CardHeader>
                  <CardContent>{renderMembersList('list')}</CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-olive" />
                  Estatísticas do grupo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Membros ativos</span>
                  <span className="font-semibold text-gray-900">{group.membros || members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Solicitações pendentes</span>
                  <span className="font-semibold text-gray-900">{pendingRequests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Moderação</span>
                  <span className="font-semibold text-gray-900">
                    {group.moderacao_nivel === 'aberto'
                      ? 'Aberto'
                      : group.moderacao_nivel === 'moderado'
                        ? 'Moderado'
                        : 'Restrito'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {renderRequestsCard()}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-coral" />
                  Dicas de engajamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• Defina objetivos claros na descrição para atrair as pessoas certas.</p>
                <p>• Use as regras para combinar o tom das conversas e materiais permitidos.</p>
                <p>• Incentive apresentações e compartilhamento de conquistas no lançamento.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <GroupSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        group={group}
        onSubmit={handleSaveSettings}
        saving={savingSettings}
      />
      <EditPostModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        post={editingPost}
        onSave={handleSaveEditPost}
      />
    </MainLayout>
  );
}
