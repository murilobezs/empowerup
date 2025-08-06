import React, { useState, useEffect, useCallback } from 'react';import { useParams, useNavigate } from 'react-router-dom';import { useAuth } from '../contexts/AuthContext';import { usePosts } from '../hooks/usePosts';import { ProfileLayout } from '../components/layout';import { Loading, ErrorMessage, EmptyState } from '../components/common';import SocialPost from '../components/SocialPost';import { Button } from '../components/ui/button';import apiService from '../services/api';import { Edit } from 'lucide-react';

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

  const loadProfileUser = useCallback(async (username) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.searchUsers(username);
      if (response.success && response.users?.length > 0) {
        const user = response.users.find(u => u.username === username);
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
    <ProfileLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={targetUser.foto_perfil || '/api/placeholder/120/120'}
                alt={targetUser.nome}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{targetUser.nome}</h1>
                <p className="text-gray-600">@{targetUser.username}</p>
              </div>

              {targetUser.bio && (
                <p className="text-gray-700">{targetUser.bio}</p>
              )}

              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{posts.length}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {isOwnProfile ? (
                <Button onClick={() => navigate('/editar-perfil')} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              ) : (
                <Button>Seguir</Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
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
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;