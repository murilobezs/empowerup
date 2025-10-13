import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfileLayout } from '../components/layout';
import { Loading, ErrorMessage, EmptyState } from '../components/common';
import SocialPost from '../components/SocialPost';
import EditPostModal from '../components/EditPostModal';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { useToast } from '../components/ui/toast';
import apiService from '../services/api';
import config from '../config/config';
import { Edit, Heart, Bookmark, Users, ShoppingBag, CheckCircle2, Circle, ArrowUpRight, Sparkles } from 'lucide-react';
import { utils } from '../utils';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateCover } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  const { addToast } = useToast();

  const isOwnProfile = !username || username === currentUser?.username;

  const toAbsoluteUrl = useCallback((value) => {
    if (!value) return null;
    if (typeof value !== 'string') return null;
    if (/^https?:\/\//.test(value)) {
      return value;
    }
    return config.getPublicUrl(value.startsWith('/') ? value.slice(1) : value);
  }, []);

  const normalizeProfileUser = useCallback((rawUser) => {
    if (!rawUser) return rawUser;
    const normalized = { ...rawUser };

    const avatarPath = rawUser.avatar_url || rawUser.foto_perfil || rawUser.avatar;
    if (avatarPath) {
      normalized.avatar_url = rawUser.avatar_url || avatarPath;
      normalized.foto_perfil = toAbsoluteUrl(avatarPath) || rawUser.foto_perfil || null;
    }

    const coverPath = rawUser.capa_url || rawUser.cover_image || rawUser.cover_url || rawUser.capa;
    if (coverPath) {
      normalized.capa_url = rawUser.capa_url || (coverPath.startsWith('/') ? coverPath : `/${coverPath}`);
      normalized.cover_image = toAbsoluteUrl(coverPath) || rawUser.cover_image || null;
    }

    return normalized;
  }, [toAbsoluteUrl]);

  useEffect(() => {
    const loadLikedPosts = async () => {
      if (!isOwnProfile) return;
      try {
        const response = await apiService.getLikedPosts();
        setLikedPosts(response.posts || []);
      } catch (e) {
        console.error('Erro ao carregar posts curtidos:', e);
      }
    };

    const loadSavedPosts = async () => {
      if (!isOwnProfile) return;
      try {
        const response = await apiService.getSavedPosts();
        setSavedPosts(response.posts || []);
      } catch (e) {
        console.error('Erro ao carregar posts salvos:', e);
      }
    };

    const loadFollowers = async (userId) => {
      try {
        setLoadingFollowers(true);
        const response = await apiService.getUserFollowers(userId);
        const followersList = response.followers || [];
        setFollowers(followersList);
        setUser(prev => prev ? {
          ...prev,
          followers_count: followersList.length
        } : prev);
      } catch (e) {
        console.error('Erro ao carregar seguidores:', e);
      } finally {
        setLoadingFollowers(false);
      }
    };

    const loadFollowing = async (userId) => {
      try {
        setLoadingFollowing(true);
        const response = await apiService.getUserFollowing(userId);
        const followingList = response.following || [];
        setFollowing(followingList);
        setUser(prev => prev ? {
          ...prev,
          following_count: followingList.length
        } : prev);
      } catch (e) {
        console.error('Erro ao carregar seguindo:', e);
      } finally {
        setLoadingFollowing(false);
      }
    };

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        let profile;
        if (isOwnProfile && currentUser) {
          const detail = await apiService.getUser(currentUser.id);
          profile = detail.user;
        } else {
          const searchData = await apiService.searchUsers(username);
          const found = Array.isArray(searchData.users)
            ? searchData.users.find(u => u.username === username)
            : null;
          if (!found) throw new Error('Usuário não encontrado');
          const detail = await apiService.getUser(found.id);
          profile = detail.user;
        }

        const normalizedProfile = normalizeProfileUser(profile);
        setUser(normalizedProfile);

        const postsData = await apiService.getPosts({ user_id: profile.id });
        setPosts(postsData.posts || postsData);

        if (isOwnProfile) {
          loadLikedPosts();
          loadSavedPosts();
        }

        if (profile.id) {
          loadFollowers(profile.id);
          loadFollowing(profile.id);
        }
      } catch (e) {
        setError(e.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, currentUser, isOwnProfile, normalizeProfileUser]);

  const handleSaveEditPost = async (postId, updatedData) => {
    try {
      const res = await apiService.updatePost(postId, updatedData);
      if (res.success) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, ...res.post }
            : p
        ));
        addToast('Post atualizado com sucesso!', 'success')
      } else {
        throw new Error(res.message || 'Erro ao atualizar post')
      }
    } catch (error) {
      console.error('Erro ao atualizar post:', error)
      addToast('Erro ao atualizar post. Tente novamente.', 'error')
      throw error
    }
  };

  const handleFollowersClick = () => {
    setShowFollowersModal(true);
  };

  const handleFollowingClick = () => {
    setShowFollowingModal(true);
  };

  const handleToggleFollow = async () => {
    if (!user) return;

    try {
      setIsLoadingFollow(true);
      const res = await apiService.toggleFollow(user.id);
      if (res.success) {
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            isFollowed: res.following,
            followers_count: res.followers_count ?? res.followersCount ?? prev.followers_count
          };
        });
      }
    } catch (e) {
      console.error('Erro ao seguir:', e);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleCoverUpload = async (file) => {
    if (!file || !isOwnProfile) return;

    if (!utils.isImage(file)) {
      addToast('Apenas imagens são permitidas para a capa.', 'error');
      return;
    }

    if (file.size > config.UPLOAD.MAX_FILE_SIZE) {
      const sizeInMb = Math.round((config.UPLOAD.MAX_FILE_SIZE / (1024 * 1024)) * 10) / 10;
      addToast(`Imagem deve ter no máximo ${sizeInMb}MB.`, 'error');
      return;
    }

    try {
      setIsCoverUploading(true);
      const result = await updateCover(file);
      if (result.success && result.user) {
        const normalized = normalizeProfileUser(result.user);
        setUser(prev => ({ ...(prev || {}), ...normalized }));
        addToast('Capa atualizada com sucesso!', 'success');
      } else {
        addToast(result.message || 'Erro ao atualizar capa.', 'error');
      }
    } catch (error) {
      console.error('Erro ao atualizar capa:', error);
      addToast('Erro ao atualizar capa. Tente novamente.', 'error');
    } finally {
      setIsCoverUploading(false);
    }
  };

  const storeUrl = useMemo(() => {
    if (!user?.website) return null;
    const trimmed = user.website.trim();
    if (!trimmed) return null;
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const validated = new URL(normalized);
      return validated.href;
    } catch (error) {
      console.warn('Website inválido para exibição:', trimmed, error);
      return null;
    }
  }, [user?.website]);

  const storeLabel = useMemo(() => {
    if (!storeUrl) return null;
    try {
      const url = new URL(storeUrl);
      const hostname = url.hostname.replace(/^www\./i, '');
      const path = url.pathname && url.pathname !== '/' ? url.pathname : '';
      return `${hostname}${path}`;
    } catch {
      return user?.website;
    }
  }, [storeUrl, user?.website]);

  const storeHighlightName = useMemo(() => {
    if (!user?.nome) return 'nossa empreendedora';
    const firstName = user.nome.trim().split(' ')[0];
    return firstName || user.nome;
  }, [user?.nome]);

  const completionItems = useMemo(() => {
    if (!isOwnProfile || !user) return [];

    const hasAvatar = Boolean(user.foto_perfil || user.avatar_url);
    const hasCover = Boolean(user.cover_image || user.capa_url);
    const hasBio = Boolean(user.bio && user.bio.trim().length >= 30);
    const hasWebsite = Boolean(storeUrl);
    const hasLocation = Boolean(user.localizacao && user.localizacao.trim().length > 0);

    return [
      {
        id: 'avatar',
        label: 'Adicione uma foto de perfil acolhedora',
        completed: hasAvatar,
      },
      {
        id: 'cover',
        label: 'Personalize a capa do seu perfil',
        completed: hasCover,
      },
      {
        id: 'bio',
        label: 'Conte sua história em pelo menos 30 caracteres',
        completed: hasBio,
      },
      {
        id: 'website',
        label: 'Conecte a sua loja do marketplace',
        completed: hasWebsite,
      },
      {
        id: 'localizacao',
        label: 'Mostre de onde você empreende',
        completed: hasLocation,
      },
    ];
  }, [
    isOwnProfile,
    storeUrl,
    user?.foto_perfil,
    user?.avatar_url,
    user?.cover_image,
    user?.capa_url,
    user?.bio,
    user?.localizacao
  ]);

  const completionProgress = useMemo(() => {
    if (!completionItems.length) return 100;
    const completed = completionItems.filter(item => item.completed).length;
    return Math.round((completed / completionItems.length) * 100);
  }, [completionItems]);

  const hasProfileGaps = useMemo(() => {
    if (!isOwnProfile) return false;
    return completionItems.some(item => !item.completed);
  }, [completionItems, isOwnProfile]);

  if (loading) {
    return (
      <ProfileLayout>
        <Loading size="lg" text="Carregando perfil..." />
      </ProfileLayout>
    );
  }

  if (error || !user) {
    return (
      <ProfileLayout>
        <ErrorMessage message={error || 'Perfil não encontrado'} />
      </ProfileLayout>
    );
  }

  const profileInfoActions = isOwnProfile ? (
    <Button onClick={() => navigate('/editar-perfil')} variant="outline" className="flex items-center gap-2">
      <Edit className="w-4 h-4" />
      Editar Perfil
    </Button>
  ) : (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoadingFollow}
      className={`min-w-[120px] ${
        user.isFollowed 
          ? 'bg-white text-coral border-2 border-coral hover:bg-coral/5' 
          : 'bg-coral text-white hover:bg-coral/90 border-2 border-coral'
      }`}
    >
      {isLoadingFollow ? 'Atualizando...' : user.isFollowed ? 'Seguindo' : 'Seguir'}
    </Button>
  );

  return (
    <ProfileLayout
      user={user}
      coverImage={user?.cover_image || user?.capa_url || user?.capa}
      canEditCover={isOwnProfile}
      onCoverSelect={handleCoverUpload}
      isCoverUploading={isCoverUploading}
      infoActions={profileInfoActions}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {storeUrl && (
          <div className="bg-gradient-to-r from-green-50 via-olive/5 to-white border border-olive/20 rounded-2xl p-6 shadow-sm flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-olive text-white shadow-md">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-olive">Loja oficial no marketplace</p>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">Visite minha loja no marketplace!</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Descubra os produtos e serviços de {storeHighlightName}.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Button
                asChild
                variant="secondary"
                className="bg-olive text-white hover:bg-olive/90 shadow-md"
              >
                <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  Visitar loja
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </Button>
              {storeLabel && (
                <span className="text-xs text-gray-500 break-all max-w-[220px] sm:text-right">{storeLabel}</span>
              )}
            </div>
          </div>
        )}

        {hasProfileGaps && (
          <div className="bg-white border border-coral/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-coral/10 flex items-center justify-center text-coral">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Complete seu perfil</h3>
                <p className="text-sm text-gray-600">Preencha algumas etapas para destacar ainda mais a sua marca.</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-coral transition-all duration-500"
                  style={{ width: `${completionProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{completionProgress}% do perfil completo</p>
            </div>

            <ul className="mt-5 space-y-3">
              {completionItems.map(item => (
                <li key={item.id} className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <span className={`text-sm ${item.completed ? 'text-emerald-600 line-through' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Button onClick={() => navigate('/editar-perfil')} variant="outline" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Atualizar perfil agora
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowFollowersModal(true)}
            className="p-4 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors text-left"
          >
            <div className="text-sm text-gray-600">Seguidores</div>
            <div className="text-lg font-semibold">{user.followers_count || 0}</div>
          </button>
          <button 
            onClick={() => setShowFollowingModal(true)}
            className="p-4 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors text-left"
          >
            <div className="text-sm text-gray-600">Seguindo</div>
            <div className="text-lg font-semibold">{user.following_count || 0}</div>
          </button>
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Publicações</div>
            <div className="text-lg font-semibold">{posts.length}</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Posts
            </TabsTrigger>
            {isOwnProfile && (
              <>
                <TabsTrigger value="likes" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Curtidas
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Salvos
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conexões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4 mt-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <SocialPost 
                  key={post.id} 
                  post={post} 
                  currentUser={currentUser}
                  onLike={async (postId, liked, likesCount) => {
                    try {
                      // Atualizar contagem no post específico
                      setPosts(prev => prev.map(p => 
                        p.id === postId 
                          ? { ...p, user_liked: liked, likes: likesCount, isLiked: liked }
                          : p
                      ));
                    } catch (e) {
                      console.error('Erro ao curtir:', e);
                    }
                  }}
                  onFollow={async (userId, following, followersCount) => {
                    // Atualizar contagem de seguidores no perfil se for o mesmo usuário
                    if (user.id === userId) {
                      setUser(prev => ({
                        ...prev,
                        followers_count: followersCount,
                        isFollowed: following
                      }));
                    }
                  }}
                  onDelete={isOwnProfile ? async (postId) => {
                    try {
                      const res = await apiService.deletePost(postId);
                      if (res.success) {
                        setPosts(prev => prev.filter(p => p.id !== postId));
                      }
                    } catch (e) {
                      console.error('Erro ao deletar:', e);
                    }
                  } : undefined}
                  onUpdate={isOwnProfile ? (post) => {
                    // Abrir modal de edição
                    setEditingPost(post)
                    setShowEditModal(true)
                  } : undefined}
                  showActions={true}
                />
              ))
            ) : (
              <EmptyState
                title="Nenhum post ainda"
                description={isOwnProfile ? 'Você ainda não publicou nada.' : 'Este usuário não publicou nada.'}
              />
            )}
          </TabsContent>

          {isOwnProfile && (
            <>
              <TabsContent value="likes" className="space-y-4 mt-6">
                {likedPosts.length > 0 ? (
                  likedPosts.map(post => (
                    <SocialPost 
                      key={post.id} 
                      post={post} 
                      currentUser={currentUser}
                      onLike={async (postId, liked, likesCount) => {
                        try {
                          // Atualizar post na lista de curtidas
                          setLikedPosts(prev => prev.map(p => 
                            p.id === postId 
                              ? { ...p, user_liked: liked, likes: likesCount, isLiked: liked }
                              : p
                          ));
                          
                          // Se descurtiu, remover da lista
                          if (!liked) {
                            setLikedPosts(prev => prev.filter(p => p.id !== postId));
                          }
                        } catch (e) {
                          console.error('Erro ao curtir:', e);
                        }
                      }}
                      showActions={true}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="Nenhuma curtida ainda"
                    description="Posts que você curtir aparecerão aqui."
                  />
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4 mt-6">
                {savedPosts.length > 0 ? (
                  savedPosts.map(post => (
                    <SocialPost 
                      key={post.id} 
                      post={post} 
                      currentUser={currentUser}
                      onSave={async (postId, saved) => {
                        // Remover da lista se dessalvou
                        if (!saved) {
                          setSavedPosts(prev => prev.filter(p => p.id !== postId));
                        }
                      }}
                      showActions={true}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="Nenhum post salvo"
                    description="Posts que você salvar aparecerão aqui."
                  />
                )}
              </TabsContent>
            </>
          )}

          <TabsContent value="connections" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Seguidores ({user.followers_count || 0})</h3>
                <div className="space-y-3">
                  {followers.length > 0 ? (
                    followers.slice(0, 5).map(follower => (
                      <Link 
                        key={follower.id} 
                        to={`/perfil/${follower.username}`}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={follower.avatar_url ? config.getPublicUrl(follower.avatar_url) : follower.foto_perfil ? config.getPublicUrl(follower.foto_perfil) : ''} />
                          <AvatarFallback className="bg-coral text-white">
                            {follower.nome ? follower.nome.charAt(0) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium hover:underline truncate">{follower.nome}</p>
                          <p className="text-sm text-gray-500 hover:text-coral truncate">@{follower.username}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum seguidor ainda.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Seguindo ({user.following_count || 0})</h3>
                <div className="space-y-3">
                  {following.length > 0 ? (
                    following.slice(0, 5).map(followed => (
                      <Link 
                        key={followed.id} 
                        to={`/perfil/${followed.username}`}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={followed.avatar_url ? config.getPublicUrl(followed.avatar_url) : followed.foto_perfil ? config.getPublicUrl(followed.foto_perfil) : ''} />
                          <AvatarFallback className="bg-coral text-white">
                            {followed.nome ? followed.nome.charAt(0) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium hover:underline truncate">{followed.nome}</p>
                          <p className="text-sm text-gray-500 hover:text-coral truncate">@{followed.username}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Não está seguindo ninguém ainda.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Seguidores */}
      <Dialog open={showFollowersModal} onOpenChange={setShowFollowersModal}>
        <DialogContent className="max-w-md max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seguidores ({user.followers_count || 0})</DialogTitle>
            <DialogDescription>
              Lista de pessoas que seguem este usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {loadingFollowers ? (
              <p className="text-gray-500 text-center py-4">Carregando seguidores...</p>
            ) : followers.length > 0 ? (
              followers.map(follower => (
                <div key={follower.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={follower.avatar_url ? config.getPublicUrl(follower.avatar_url) : ''} />
                    <AvatarFallback>
                      {follower.nome ? follower.nome.charAt(0) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{follower.nome}</p>
                    <p className="text-sm text-gray-500">@{follower.username}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/perfil/${follower.username}`)}
                  >
                    Ver perfil
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum seguidor ainda.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Seguindo */}
      <Dialog open={showFollowingModal} onOpenChange={setShowFollowingModal}>
        <DialogContent className="max-w-md max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seguindo ({user.following_count || 0})</DialogTitle>
            <DialogDescription>
              Lista de pessoas que este usuário segue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {loadingFollowing ? (
              <p className="text-gray-500 text-center py-4">Carregando seguindo...</p>
            ) : following.length > 0 ? (
              following.map(followed => (
                <div key={followed.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={followed.avatar_url ? config.getPublicUrl(followed.avatar_url) : ''} />
                    <AvatarFallback>
                      {followed.nome ? followed.nome.charAt(0) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{followed.nome}</p>
                    <p className="text-sm text-gray-500">@{followed.username}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/perfil/${followed.username}`)}
                  >
                    Ver perfil
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Não está seguindo ninguém ainda.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Post */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingPost(null)
        }}
        post={editingPost}
        onSave={handleSaveEditPost}
      />
    </ProfileLayout>
  );
};

export default ProfilePage;