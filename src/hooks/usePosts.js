import { useState, useEffect } from 'react';
import apiService from '../services/api';

/**
 * Hook personalizado para gerenciar posts
 */
export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPosts(params);
      
      if (response.success) {
        setPosts(response.posts || []);
      } else {
        setError(response.message || 'Erro ao carregar posts');
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData, file = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createPost(postData, file);
      
      if (response.success) {
        // Adicionar o novo post ao início da lista
        setPosts(prevPosts => [response.post, ...prevPosts]);
        return { success: true, post: response.post };
      } else {
        setError(response.message || 'Erro ao criar post');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao criar post';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId, postData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updatePost(postId, postData);
      
      if (response.success) {
        // Atualizar o post na lista
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, ...response.post } : post
          )
        );
        return { success: true, post: response.post };
      } else {
        setError(response.message || 'Erro ao atualizar post');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar post';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.deletePost(postId);
      
      if (response.success) {
        // Remover o post da lista
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        return { success: true };
      } else {
        setError(response.message || 'Erro ao deletar post');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao deletar post';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const response = await apiService.toggleLike(postId);
      
      if (response.success) {
        // Atualizar o post na lista com os novos dados de likes
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  curtidas: response.likes_count,
                  user_liked: response.liked
                } 
              : post
          )
        );
        return { success: true, liked: response.liked, count: response.likes_count };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Erro ao curtir post' };
    }
  };

  const searchPosts = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.searchPosts(params);
      
      if (response.success) {
        setPosts(response.posts || []);
      } else {
        setError(response.message || 'Erro ao buscar posts');
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar posts');
    } finally {
      setLoading(false);
    }
  };

  // Carregar posts ao montar o componente
  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    searchPosts,
    setPosts
  };
};

/**
 * Hook para gerenciar um post específico
 */
export const usePost = (postId) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPost = async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPost(postId);
      
      if (response.success) {
        setPost(response.post);
      } else {
        setError(response.message || 'Erro ao carregar post');
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (params = {}) => {
    if (!postId) return;
    
    try {
      const response = await apiService.getComments(postId, params);
      
      if (response.success) {
        setComments(response.comments || []);
      } else {
        setError(response.message || 'Erro ao carregar comentários');
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar comentários');
    }
  };

  const createComment = async (commentData) => {
    if (!postId) return;
    
    try {
      const response = await apiService.createComment(postId, commentData);
      
      if (response.success) {
        // Adicionar o novo comentário à lista
        setComments(prevComments => [...prevComments, response.comment]);
        
        // Atualizar o contador de comentários do post
        if (post) {
          setPost(prevPost => ({
            ...prevPost,
            comentarios: (prevPost.comentarios || 0) + 1
          }));
        }
        
        return { success: true, comment: response.comment };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Erro ao criar comentário' };
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await apiService.deleteComment(commentId);
      
      if (response.success) {
        // Remover o comentário da lista
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== commentId)
        );
        
        // Atualizar o contador de comentários do post
        if (post) {
          setPost(prevPost => ({
            ...prevPost,
            comentarios: Math.max((prevPost.comentarios || 1) - 1, 0)
          }));
        }
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Erro ao deletar comentário' };
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  return {
    post,
    comments,
    loading,
    error,
    fetchPost,
    fetchComments,
    createComment,
    deleteComment,
    setPost,
    setComments
  };
};
