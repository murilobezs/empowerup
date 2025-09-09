import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfileLayout } from '../components/layout';
import { Loading, ErrorMessage, EmptyState } from '../components/common';
import SocialPost from '../components/SocialPost';
import EditPostModal from '../components/EditPostModal';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../components/ui/toast';
import apiService from '../services/api';
import { Edit, Heart, Bookmark, Users } from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
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

  const { addToast } = useToast();

  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    const loadLikedPosts = async () => {
      if (!isOwnProfile) return; // Só carrega curtidas para o próprio perfil
      try {
        const response = await apiService.getLikedPosts();
        setLikedPosts(response.posts || []);
      } catch (e) {
        console.error('Erro ao carregar posts curtidos:', e);
      }
    };

    const loadSavedPosts = async () => {
      if (!isOwnProfile) return; // Só carrega salvos para o próprio perfil
      try {
        const response = await apiService.getSavedPosts();
        setSavedPosts(response.posts || []);
      } catch (e) {
        console.error('Erro ao carregar posts salvos:', e);
      }
    };

    const loadFollowers = async (userId) => {
      try {
        const response = await apiService.getUserFollowers(userId);
        setFollowers(response.followers || []);
      } catch (e) {
        console.error('Erro ao carregar seguidores:', e);
      }
    };

    const loadFollowing = async (userId) => {
      try {
        const response = await apiService.getUserFollowing(userId);
        setFollowing(response.following || []);
      } catch (e) {
        console.error('Erro ao carregar seguindo:', e);
      }
    };

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        let profile;
        if (isOwnProfile && currentUser) {
          profile = currentUser;
        } else {
          const searchData = await apiService.searchUsers(username);
          const found = Array.isArray(searchData.users)
            ? searchData.users.find(u => u.username === username)
            : null;
          if (!found) throw new Error('Usuário não encontrado');
          const detail = await apiService.getUser(found.id);
          profile = detail.user;
        }
        setUser(profile);
        const postsData = await apiService.getPosts({ user_id: profile.id });
        setPosts(postsData.posts || postsData);
        
        // Carregar dados adicionais se for o próprio perfil
        if (isOwnProfile) {
          loadLikedPosts();
          loadSavedPosts();
        }
        
        // Carregar seguidores e seguindo
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
  }, [username, currentUser, isOwnProfile]);

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

  return (
    <ProfileLayout user={user} coverImage={user.capa}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
          <div>
            <h2 className="text-xl font-semibold">{user.nome}</h2>
            <div className="text-gray-500">@{user.username}</div>
          </div>
          <div>
            {isOwnProfile ? (
              <Button onClick={() => navigate('/editar-perfil')} variant="outline">
                <Edit className="w-4 h-4 mr-1" /> Editar Perfil
              </Button>
            ) : (
              <Button
                variant={user.isFollowed ? 'outline' : 'primary'}
                onClick={async () => {
                  try {
                    const res = await apiService.toggleFollow(user.id);
                    if (res.success) {
                      setUser({ 
                        ...user, 
                        isFollowed: res.following,
                        followers_count: res.followers_count || res.followersCount
                      });
                    }
                  } catch (e) {
                    console.error('Erro ao seguir:', e);
                  } 
                }}
              >
                {user.isFollowed ? 'Seguindo' : 'Seguir'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Seguidores</div>
            <div className="text-lg font-semibold">{user.followers_count || 0}</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Seguindo</div>
            <div className="text-lg font-semibold">{user.following_count || 0}</div>
          </div>
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
                      <div key={follower.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center text-white font-medium">
                          {follower.nome ? follower.nome.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="font-medium">{follower.nome}</p>
                          <p className="text-sm text-gray-500">@{follower.username}</p>
                        </div>
                      </div>
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
                      <div key={followed.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center text-white font-medium">
                          {followed.nome ? followed.nome.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="font-medium">{followed.nome}</p>
                          <p className="text-sm text-gray-500">@{followed.username}</p>
                        </div>
                      </div>
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