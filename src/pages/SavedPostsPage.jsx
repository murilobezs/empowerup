import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageLayout } from '../components/layout';
import { Loading, ErrorMessage, EmptyState } from '../components/common';
import SocialPost from '../components/SocialPost';
import EditPostModal from '../components/EditPostModal';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';
import { Bookmark, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

/**
 * Página de posts salvos
 */
const SavedPostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { addToast } = useToast();

  // Debug log para verificar se a página está sendo acessada
  useEffect(() => {
    console.log('SavedPostsPage mounted');
    console.log('User:', user);
    console.log('User authenticated:', !!user);
  }, [user]);

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    try {
      console.log('Loading saved posts...');
      setLoading(true);
      setError('');
      const response = await apiService.getSavedPosts();
      console.log('API Response:', response);
      
      if (response.success) {
        console.log('Posts loaded successfully:', response.posts);
        setPosts(response.posts || []);
      } else {
        console.error('API error:', response.message);
        setError('Erro ao carregar posts salvos');
      }
    } catch (err) {
      console.error('Catch error:', err);
      setError('Erro ao carregar posts salvos');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsavePost = async (postId) => {
    try {
      const response = await apiService.toggleSavePost(postId);
      if (response.success) {
        setPosts(prev => prev.filter(post => post.id !== postId));
      }
    } catch (err) {
      console.error('Erro ao remover post salvo:', err);
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleUpdatePost = (post) => {
    // Abrir modal de edição
    setEditingPost(post)
    setShowEditModal(true)
  };

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

  const handleBulkRemove = async () => {
    try {
      const promises = selectedPosts.map(postId => apiService.toggleSavePost(postId));
      await Promise.all(promises);
      setPosts(prev => prev.filter(post => !selectedPosts.includes(post.id)));
      setSelectedPosts([]);
      setSelectionMode(false);
    } catch (err) {
      console.error('Erro ao remover posts:', err);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Loading size="lg" text="Carregando posts salvos..." />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorMessage message={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Posts Salvos"
      subtitle="Seus posts salvos para visualizar mais tarde"
      breadcrumbs={[
        { label: 'Comunidade', href: '/comunidade' },
        { label: 'Posts Salvos' }
      ]}
      actions={[
        <Button
          key="back"
          variant="outline"
          onClick={() => navigate('/comunidade')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>,
        posts.length > 0 && (
          <Button
            key="select"
            variant={selectionMode ? "destructive" : "outline"}
            onClick={() => {
              if (selectionMode && selectedPosts.length > 0) {
                handleBulkRemove();
              } else {
                setSelectionMode(!selectionMode);
                setSelectedPosts([]);
              }
            }}
            className="flex items-center"
          >
            {selectionMode ? (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Selecionados ({selectedPosts.length})
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 mr-2" />
                Gerenciar
              </>
            )}
          </Button>
        )
      ].filter(Boolean)}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-semibold">Posts Salvos</h1>
          </div>
          <div className="text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? 'post salvo' : 'posts salvos'}
          </div>
        </div>

        {/* Posts salvos */}
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map(post => (
              <div
                key={post.id}
                className={`relative ${selectionMode ? 'cursor-pointer' : ''}`}
                onClick={selectionMode ? () => handleSelectPost(post.id) : undefined}
              >
                {selectionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
                
                <SocialPost
                  post={post}
                  currentUser={user}
                  onLike={async (postId) => {
                    try {
                      const res = await apiService.toggleLike(postId);
                      if (res.success) {
                        setPosts(prev => prev.map(p => 
                          p.id === postId 
                            ? { ...p, user_liked: res.liked, likes_count: res.likesCount }
                            : p
                        ));
                      }
                    } catch (e) {
                      console.error('Erro ao curtir:', e);
                    }
                  }}
                  onSave={() => handleUnsavePost(post.id)}
                  onUpdate={user && user.id === post.user_id ? handleUpdatePost : undefined}
                  showActions={true}
                  showSaveButton={true}
                  isSaved={true}
                />
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Bookmark className="w-12 h-12 text-gray-400" />}
              title="Nenhum post salvo"
              description="Você ainda não salvou nenhum post. Quando salvar posts, eles aparecerão aqui."
              action={
                <Button
                  onClick={() => navigate('/comunidade')}
                  className="mt-4"
                >
                  Explorar Posts
                </Button>
              }
            />
          )}
        </div>

        {selectionMode && (
          <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg border">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedPosts.length} selecionados
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedPosts([]);
                }}
              >
                Cancelar
              </Button>
              {selectedPosts.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkRemove}
                >
                  Remover
                </Button>
              )}
            </div>
          </div>
        )}
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
    </PageLayout>
  );
};

export default SavedPostsPage;
