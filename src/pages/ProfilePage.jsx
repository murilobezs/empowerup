import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { ProfileLayout } from '../components/layout';
import { Loading, ErrorMessage, EmptyState } from '../components/common';
import SocialPost from '../components/SocialPost';
import { Button } from '../components/ui/button';
import apiService from '../services/api';
import { Edit } from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !username || username === currentUser?.username;

  const {
    posts,
    loading: postsLoading,
    error: postsError,
    fetchPosts,
    toggleLike,
    deletePost
  } = usePosts();

  const loadProfileUser = useCallback(async (usernameToLoad) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.searchUsers(usernameToLoad);
      if (response.success && response.users?.length > 0) {
        const user = response.users.find(u => u.username === usernameToLoad);
        if (user) {
          setProfileUser(user);
          fetchPosts({ user_id: user.id });
        } else {
          setError('Usuário não encontrado');
        }
      } else {
        setError('Usuário não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setProfileUser(currentUser);
      setLoading(false);
      fetchPosts({ user_id: currentUser.id });
    } else if (username) {
      loadProfileUser(username);
    }
  }, [username, currentUser, isOwnProfile, fetchPosts, loadProfileUser]);

  const targetUser = profileUser || currentUser;

  const [activeTab, setActiveTab] = useState('posts');

  const tabs = [
    { key: 'posts', label: 'Posts', count: posts.length },
    { key: 'replies', label: 'Respostas' },
    { key: 'media', label: 'Mídia' },
    { key: 'likes', label: 'Curtidas' }
  ];

  if (loading) {
    return (
      <ProfileLayout>
        <Loading size="lg" text="Carregando perfil..." />
      </ProfileLayout>
    );
  }

  if (error) {
    return (
      <ProfileLayout>
        <ErrorMessage message={error} />
      </ProfileLayout>
    );
  }

  if (!targetUser) {
    return (
      <ProfileLayout>
        <EmptyState
          title="Perfil não encontrado"
          description="O usuário que você está procurando não existe."
        />
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout
      user={targetUser}
      coverImage={targetUser.capa}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{targetUser.nome}</h2>
                  <div className="text-sm text-gray-600">@{targetUser.username}</div>
                </div>
                <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
                  <div>{posts.length} publicações</div>
                </div>
              </div>

              <div>
                {isOwnProfile ? (
                  <Button onClick={() => navigate('/editar-perfil')} variant="outline" className="profile-action-btn">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar perfil
                  </Button>
                ) : (
                  <Button className="bg-coral hover:bg-coral/90 text-white">Seguir</Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {postsLoading ? (
                <Loading text="Carregando posts..." />
              ) : postsError ? (
                <ErrorMessage message={postsError} />
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <SocialPost
                    key={post.id}
                    post={post}
                    onLike={() => toggleLike(post.id)}
                    onDelete={isOwnProfile ? () => deletePost(post.id) : undefined}
                    showActions={true}
                  />
                ))
              ) : (
                <EmptyState
                  title="Nenhum post encontrado"
                  description={
                    isOwnProfile 
                      ? "Você ainda não publicou nenhum post."
                      : "Este usuário ainda não publicou nenhum post."
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4 profile-stats">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Seguidores</div>
                <div className="text-lg font-semibold text-gray-900">{targetUser.followers_count ?? targetUser.seguidores ?? 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Seguindo</div>
                <div className="text-lg font-semibold text-gray-900">{targetUser.following_count ?? targetUser.seguindo ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Sobre</h3>
            <p className="text-sm text-gray-700">{targetUser.bio || '—'}</p>
          </div>
        </aside>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;