import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
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
      } catch (e) {
        setError(e.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username, currentUser, isOwnProfile]);

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
                    const res = await apiService.toggleFollowUser(user.id);
                    if (res.success) setUser({ ...user, isFollowed: res.following });
                  } catch {} 
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

        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map(post => (
              <SocialPost key={post.id} post={post} showActions={isOwnProfile} />
            ))
          ) : (
            <EmptyState
              title="Nenhum post ainda"
              description={isOwnProfile ? 'Você ainda não publicou nada.' : 'Este usuário não publicou nada.'}
            />
          )}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;