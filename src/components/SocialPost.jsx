import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import config from '../config/config';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Edit,
  Trash2,
  Reply,
  X,
  Bookmark,
  Megaphone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import apiService from '../services/api';

const CAMPAIGN_OBJECTIVE_LABELS = {
  alcance: 'Alcance',
  cliques: 'Cliques',
  conversao: 'Conversões',
  engajamento: 'Engajamento',
};

const SocialPost = ({ 
  post, 
  currentUser, 
  onLike, 
  onComment, 
  onShare, 
  onDelete, 
  onUpdate, 
  onSave,
  onFollow,
  showSaveButton = true,
  isSaved = false,
  showGroupBadge = false,
  groupName = null
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showLikesList, setShowLikesList] = useState(false);
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(post.user_liked || post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.comentarios || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [saved, setSaved] = useState(isSaved || post.user_saved || post.isSaved || false);
  const [isFollowing, setIsFollowing] = useState(post.isFollowed || false);
  const [editingComment, setEditingComment] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [updatingComment, setUpdatingComment] = useState(false);
  const [commentFollowStates, setCommentFollowStates] = useState({});
  
  // Ref para controlar carregamento de comentários
  const commentsLoadedRef = useRef(false);
  const commentsSnapshotRef = useRef(null);

  const isSponsored = Boolean(post?.sponsored || post?.is_promovido || post?.isPromovido || post?.ad_campaign_id);
  const campaignInfo = post?.sponsored_campaign;
  const sponsoredBadgeLabel = post?.sponsored_badge || 'Patrocinado';
  const campaignObjectiveLabel = campaignInfo?.objetivo
    ? (CAMPAIGN_OBJECTIVE_LABELS[campaignInfo.objetivo] || campaignInfo.objetivo)
    : null;

  // Sincronizar estado quando as props mudarem
  useEffect(() => {
    setIsLiked(post.user_liked || post.isLiked || false);
    setLikeCount(post.likes || 0);
    setSaved(isSaved || post.user_saved || post.isSaved || false);
    setIsFollowing(post.isFollowed || false);
  }, [post.user_liked, post.isLiked, post.likes, isSaved, post.user_saved, post.isSaved, post.isFollowed]);

  const fetchComments = useCallback(async () => {
    // Evitar carregamento duplicado
    if (loadingComments || commentsLoadedRef.current) return;
    
    commentsLoadedRef.current = true;
    setLoadingComments(true);
    
    try {
      const response = await apiService.getComments(post.id, { limit: 10 }); // Reduzir limite para 10
      
      if (response.success) {
        setComments(response.comments || []);
        setCommentCount(response.total || response.comments?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      // Reset ref em caso de erro para permitir nova tentativa
      commentsLoadedRef.current = false;
    }
    setLoadingComments(false);
  }, [post.id, loadingComments]);

  const fetchLikes = useCallback(async () => {
    setLoadingLikes(true);
    try {
      const response = await apiService.getLikes(post.id);
      
      if (response.success) {
        setLikes(response.likes || []);
        setLikeCount(response.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar likes:', error);
    }
    setLoadingLikes(false);
  }, [post.id]);

  const updateCommentInState = useCallback((commentId, updater) => {
    setComments((prevComments) => prevComments.map((comment) => {
      if (comment.id === commentId) {
        const updated = updater(comment);
        if (Array.isArray(comment.replies) && !Array.isArray(updated.replies)) {
          updated.replies = comment.replies;
        }
        return updated;
      }

      if (Array.isArray(comment.replies) && comment.replies.length > 0) {
        let replyUpdated = false;
        const updatedReplies = comment.replies.map((reply) => {
          if (reply.id === commentId) {
            replyUpdated = true;
            return updater(reply);
          }
          return reply;
        });

        if (replyUpdated) {
          return {
            ...comment,
            replies: updatedReplies,
          };
        }
      }

      return comment;
    }));
  }, []);

  const handleStartEditComment = useCallback((comment, parentId = null) => {
    setEditingComment({ id: comment.id, parentId });
    setEditingText(comment.conteudo || '');
    setReplyTo(null);
  }, []);

  const handleCancelEditComment = useCallback(() => {
    setEditingComment(null);
    setEditingText('');
  }, []);

  const handleUpdateComment = useCallback(async () => {
    if (!editingComment || !editingText.trim()) return;

    const commentId = editingComment.id;
    const newContent = editingText.trim();
    const isReply = Boolean(editingComment.parentId);

    try {
      commentsSnapshotRef.current = JSON.parse(JSON.stringify(comments));
    } catch (error) {
      commentsSnapshotRef.current = comments;
    }

    updateCommentInState(commentId, (prev) => ({
      ...prev,
      conteudo: newContent,
      updated_at: new Date().toISOString(),
    }));

    setUpdatingComment(true);

    try {
      const response = await apiService.updateComment(commentId, { conteudo: newContent });
      if (response.success && response.comment) {
        const updatedComment = response.comment;
        updateCommentInState(commentId, (prev) => {
          const merged = {
            ...prev,
            ...updatedComment,
          };

          if (!isReply) {
            merged.replies = prev.replies ?? (Array.isArray(updatedComment.replies) ? updatedComment.replies : []);
          }

          return merged;
        });
      } else if (commentsSnapshotRef.current) {
        setComments(commentsSnapshotRef.current);
      }
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      if (commentsSnapshotRef.current) {
        setComments(commentsSnapshotRef.current);
      }
    } finally {
      setUpdatingComment(false);
      setEditingComment(null);
      setEditingText('');
      commentsSnapshotRef.current = null;
    }
  }, [comments, editingComment, editingText, updateCommentInState]);

  const removeCommentFromState = useCallback((commentId) => {
    setComments((prevComments) => prevComments
      .map((comment) => {
        if (comment.id === commentId) {
          return null;
        }

        if (Array.isArray(comment.replies) && comment.replies.length > 0) {
          const filteredReplies = comment.replies.filter((reply) => reply.id !== commentId);
          if (filteredReplies.length !== comment.replies.length) {
            return {
              ...comment,
              replies: filteredReplies,
            };
          }
        }

        return comment;
      })
      .filter(Boolean)
    );
  }, []);

  // Carregar comentários quando abrir (apenas uma vez)
  useEffect(() => {
    if (showComments && !commentsLoadedRef.current && !loadingComments) {
      fetchComments();
    }
  }, [showComments, fetchComments, loadingComments]);

  // Carregar likes quando abrir modal
  useEffect(() => {
    if (showLikesList && !loadingLikes) {
      fetchLikes();
    }
  }, [showLikesList, post.id, fetchLikes, loadingLikes]);

  const handleLike = async () => {
    if (!currentUser) return;

    // Atualização otimista do estado para feedback imediato
    const previousLiked = isLiked;
    const previousCount = likeCount;
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    
    setIsLiked(newLiked);
    setLikeCount(newCount);

    try {
      const response = await apiService.toggleLike(post.id);
      
      if (response.success) {
        // Confirmar com dados do servidor
        setIsLiked(response.liked);
        setLikeCount(response.likesCount || response.likes_count || newCount);
        
        if (onLike) {
          onLike(post.id, response.liked, response.likesCount || response.likes_count || newCount);
        }
      } else {
        // Reverter em caso de erro
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      // Reverter estado em caso de erro
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  const handleComment = async () => {
    if (!currentUser || !newComment.trim()) return;

    const tempComment = {
      id: `temp-${Date.now()}`,
      conteudo: newComment.trim(),
      autor: currentUser.nome,
      nome: currentUser.nome,
      username: currentUser.username,
  avatar_url: currentUser.avatar_url,
  avatar: currentUser.avatar_url,
  foto_perfil: currentUser.foto_perfil,
      created_at: new Date().toISOString(),
      parent_id: replyTo?.id || null,
      replies: [],
      user_id: Number(currentUser.id)
    };

    // Atualização otimística - adicionar comentário imediatamente
    if (replyTo) {
      // Adicionar como resposta
      setComments(prev => prev.map(comment => 
        comment.id === replyTo.id 
          ? { ...comment, replies: [...(comment.replies || []), tempComment] }
          : comment
      ));
    } else {
      // Adicionar como comentário principal
      setComments(prev => [...prev, tempComment]);
    }
    
    setCommentCount(prev => prev + 1);
    const originalComment = newComment;
    setNewComment('');
    setReplyTo(null);

    try {
      const response = await apiService.createComment(post.id, {
        conteudo: originalComment.trim(),
        parent_id: replyTo?.id || null
      });
      
      if (response.success) {
        // Substituir comentário temporário pelo real
        if (replyTo) {
          setComments(prev => prev.map(comment => 
            comment.id === replyTo.id 
              ? { 
                  ...comment, 
                  replies: (comment.replies || []).map(reply => 
                    reply.id === tempComment.id ? response.comment : reply
                  )
                }
              : comment
          ));
        } else {
          setComments(prev => prev.map(comment => 
            comment.id === tempComment.id ? response.comment : comment
          ));
        }
        
  if (onComment) onComment(post.id, response.comment, replyTo?.id);
      } else {
        // Remover comentário temporário em caso de erro
        if (replyTo) {
          setComments(prev => prev.map(comment => 
            comment.id === replyTo.id 
              ? { ...comment, replies: (comment.replies || []).filter(reply => reply.id !== tempComment.id) }
              : comment
          ));
        } else {
          setComments(prev => prev.filter(comment => comment.id !== tempComment.id));
        }
        setCommentCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Erro ao comentar:', error);
      
      // Remover comentário temporário em caso de erro
      if (replyTo) {
        setComments(prev => prev.map(comment => 
          comment.id === replyTo.id 
            ? { ...comment, replies: (comment.replies || []).filter(reply => reply.id !== tempComment.id) }
            : comment
        ));
      } else {
        setComments(prev => prev.filter(comment => comment.id !== tempComment.id));
      }
      setCommentCount(prev => prev - 1);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;

    if (editingComment?.id === commentId) {
      handleCancelEditComment();
    }

    let snapshot = null;
    try {
      snapshot = JSON.parse(JSON.stringify(comments));
    } catch (error) {
      snapshot = comments;
    }

    removeCommentFromState(commentId);
    setCommentCount(prev => Math.max(prev - 1, 0));

    try {
      const response = await apiService.deleteComment(commentId);
      
      if (!response.success && snapshot) {
        setComments(snapshot);
        setCommentCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      if (snapshot) {
        setComments(snapshot);
        setCommentCount(prev => prev + 1);
      }
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    // Atualização otimista do estado para feedback imediato
    const previousSaved = saved;
    const newSaved = !saved;
    
    setSaved(newSaved);

    try {
      const response = await apiService.toggleSavePost(post.id);
      
      if (response.success) {
        // Confirmar com dados do servidor
        setSaved(response.saved);
        
        if (onSave) {
          onSave(post.id, response.saved);
        }
      } else {
        // Reverter em caso de erro
        setSaved(previousSaved);
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      // Reverter estado em caso de erro
      setSaved(previousSaved);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    if (post.user_id === currentUser.id) return; // Não pode seguir a si mesmo

    try {
      const response = await apiService.toggleFollow(post.user_id);
      
      if (response.success) {
        const newFollowing = response.following;
        const followersCount = response.followers_count || response.followersCount || 0;
        
        // Atualizar estado local
        setIsFollowing(newFollowing);
        
        // Chamar callback se fornecido (para atualizar lista de posts)
        if (onFollow) {
          onFollow(post.user_id, newFollowing, followersCount);
        }
      }
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return postDate.toLocaleDateString('pt-BR');
  };

  const renderMedia = () => {
    // Sistema de arquivos locais - prioridade para imagem_url e video_url
    if (post.tipo_midia === 'imagem' && post.imagem_url) {
      return (
        <div className="rounded-xl overflow-hidden mt-3">
          <img
            src={config.getPublicUrl(post.imagem_url)}
            alt="Imagem do post"
            className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => window.open(config.getPublicUrl(post.imagem_url), '_blank')}
          />
        </div>
      );
    }

    if (post.tipo_midia === 'video' && post.video_url) {
      return (
        <div className="rounded-xl overflow-hidden mt-3">
          <video
            src={config.getPublicUrl(post.video_url)}
            controls
            className="w-full max-h-96 object-cover"
            poster="/placeholder.svg?height=300&width=500"
          />
        </div>
      );
    }

    // Sistema antigo de BLOB - manter compatibilidade
    if (post.media_files && post.media_files.length > 0) {
      const mediaFiles = post.media_files;
      
      if (mediaFiles.length === 1) {
        // Um arquivo - layout único
        const media = mediaFiles[0];
        const mediaUrl = config.getApiUrl(`posts/media.php?id=${media.id}`);
        
        if (media.media_type.startsWith('image/')) {
          return (
            <div className="rounded-xl overflow-hidden mt-3">
              <img
                src={mediaUrl}
                alt={media.media_filename}
                className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(mediaUrl, '_blank')}
              />
            </div>
          );
        } else if (media.media_type.startsWith('video/')) {
          return (
            <div className="rounded-xl overflow-hidden mt-3">
              <video
                src={mediaUrl}
                controls
                className="w-full max-h-96 object-cover"
                poster="/placeholder.svg?height=300&width=500"
              />
            </div>
          );
        }
      } else {
        // Múltiplos arquivos - grid
        return (
          <div className={`grid gap-2 rounded-xl overflow-hidden mt-3 ${
            mediaFiles.length === 2 ? 'grid-cols-2' :
            mediaFiles.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {mediaFiles.map((media, index) => {
              const mediaUrl = config.getApiUrl(`posts/media.php?id=${media.id}`);
              
              return (
                <div 
                  key={media.id} 
                  className={`relative ${
                    mediaFiles.length === 3 && index === 0 ? 'row-span-2' : ''
                  }`}
                >
                  {media.media_type.startsWith('image/') ? (
                    <img
                      src={mediaUrl}
                      alt={media.media_filename}
                      className="w-full h-full object-cover min-h-[150px] max-h-[300px] cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => window.open(mediaUrl, '_blank')}
                    />
                  ) : (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full h-full object-cover min-h-[150px] max-h-[300px]"
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      }
    }

    return null;
  };

  const resolveAvatarSrc = (avatar) => {
    if (!avatar) return '';
    if (typeof avatar === 'string' && avatar.startsWith('http')) return avatar;
    return config.getPublicUrl(avatar);
  };

  const getAvatarFromComment = (item) => {
    if (!item) return '';
    return resolveAvatarSrc(
      item.avatar ||
      item.avatar_url ||
      item.foto_perfil ||
      item.user?.avatar_url ||
      item.user?.foto_perfil
    );
  };

  const renderReply = (reply, parentId) => {
    const displayName = reply.autor || reply.author || reply.nome || 'Usuário';
    const username = reply.username || reply.user?.username || 'unknown';
  const avatarSrc = getAvatarFromComment(reply);
    const isOwner = Boolean(currentUser) && (Number(currentUser.id) === Number(reply.user_id) || reply.isOwner);
    const isEditingReply = editingComment?.id === reply.id;

    return (
      <div key={reply.id} className="flex space-x-2 sm:space-x-3">
        <Link to={`/perfil/${username}`} className="flex-shrink-0">
          <Avatar className="w-5 h-5 sm:w-6 sm:h-6 hover:opacity-80 transition-opacity">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback className="text-xs bg-sage text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-lg p-1.5 sm:p-2">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
              <Link to={`/perfil/${username}`} className="font-medium text-xs hover:underline">{displayName}</Link>
              <Link to={`/perfil/${username}`} className="text-coral text-xs hover:underline">@{username}</Link>
              <span className="text-gray-500 text-xs">{formatTimeAgo(reply.created_at)}</span>
            </div>
            {isEditingReply ? (
              <>
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="text-xs"
                  rows={3}
                />
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    className="bg-coral hover:bg-coral/90 text-white h-8"
                    onClick={handleUpdateComment}
                    disabled={updatingComment || !editingText.trim()}
                  >
                    {updatingComment ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handleCancelEditComment}
                    disabled={updatingComment}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-800 break-words whitespace-pre-wrap overflow-wrap-anywhere">{reply.conteudo}</p>
            )}
          </div>
          {isOwner && !isEditingReply && (
            <div className="flex items-center gap-2 mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-coral px-1 py-0.5 h-auto"
                onClick={() => handleStartEditComment(reply, parentId)}
              >
                <Edit className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-red-500 px-1 py-0.5 h-auto"
                onClick={() => handleDeleteComment(reply.id)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Deletar
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderComment = (comment) => {
    const displayName = comment.autor || comment.author || comment.nome || 'Usuário';
    const username = comment.username || comment.user?.username || 'unknown';
  const avatarSrc = getAvatarFromComment(comment);
    const isOwner = Boolean(currentUser) && (Number(currentUser.id) === Number(comment.user_id) || comment.isOwner);
    const isEditingComment = editingComment?.id === comment.id;
    const replies = Array.isArray(comment.replies) ? comment.replies : [];
    const isCurrentUser = currentUser && Number(currentUser.id) === Number(comment.user_id);
    const commentIsFollowing = commentFollowStates[comment.user_id] ?? comment.isFollowing ?? false;

    const handleCommentFollow = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const response = await apiService.toggleFollow(comment.user_id);
        if (response.success) {
          setCommentFollowStates(prev => ({
            ...prev,
            [comment.user_id]: response.following
          }));
        }
      } catch (error) {
        console.error('Erro ao seguir usuário:', error);
      }
    };

    return (
      <div key={comment.id} className="flex space-x-2 sm:space-x-3 py-2 sm:py-3">
        <Link to={`/perfil/${username}`} className="flex-shrink-0">
          <Avatar className="w-7 h-7 sm:w-8 sm:h-8 hover:opacity-80 transition-opacity">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback className="text-xs bg-coral text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link to={`/perfil/${username}`} className="font-medium text-xs sm:text-sm hover:underline">{displayName}</Link>
                <Link to={`/perfil/${username}`} className="text-coral text-xs sm:text-sm hover:underline">@{username}</Link>
                <span className="text-gray-500 text-xs">{formatTimeAgo(comment.created_at)}</span>
              </div>
              {currentUser && !isCurrentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs h-6 px-2 ${commentIsFollowing ? 'text-gray-600' : 'text-coral hover:text-coral/90'}`}
                  onClick={handleCommentFollow}
                >
                  {commentIsFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
              )}
            </div>
            {isEditingComment ? (
              <>
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    className="bg-coral hover:bg-coral/90 text-white h-8"
                    onClick={handleUpdateComment}
                    disabled={updatingComment || !editingText.trim()}
                  >
                    {updatingComment ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handleCancelEditComment}
                    disabled={updatingComment}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs sm:text-sm text-gray-800 break-words whitespace-pre-wrap overflow-wrap-anywhere">{comment.conteudo}</p>
            )}
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-coral px-1 py-0.5 h-auto"
              onClick={() => setReplyTo(comment)}
              disabled={isEditingComment}
            >
              <Reply className="w-3 h-3 mr-1" />
              Responder
            </Button>
            {isOwner && !isEditingComment && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-coral px-1 py-0.5 h-auto"
                onClick={() => handleStartEditComment(comment)}
              >
                <Edit className="w-3 h-3 mr-1" />
                Editar
              </Button>
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-red-500 px-1 py-0.5 h-auto"
                onClick={() => handleDeleteComment(comment.id)}
                disabled={updatingComment && editingComment?.id === comment.id}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Deletar
              </Button>
            )}
          </div>

          {replies.length > 0 && (
            <div className="ml-2 sm:ml-4 mt-2 sm:mt-3 space-y-2 sm:space-y-3">
              {replies.map((reply) => renderReply(reply, comment.id))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Header do post */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
            <Link to={`/perfil/${post.username}`} className="flex items-start space-x-2 sm:space-x-3 hover:underline min-w-0 flex-1">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <AvatarImage src={post.avatar ? config.getPublicUrl(post.avatar) : ''} />
                <AvatarFallback className="bg-coral text-white text-sm">
                  {post.autor.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{post.autor}</h3>
                  {showGroupBadge && groupName && (
                    <Badge variant="outline" className="bg-olive/10 text-olive border-olive/20 text-xs">
                      {groupName}
                    </Badge>
                  )}
                  {isSponsored && (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-700 border-amber-200 uppercase tracking-wide text-[10px] sm:text-xs"
                    >
                      {sponsoredBadgeLabel}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                  <span className="text-coral font-medium break-all">@{post.username}</span>
                  <span>•</span>
                  <span className="whitespace-nowrap">{post.tempo || formatTimeAgo(post.created_at)}</span>
                </div>
              </div>
            </Link>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Botão de seguir */}
            {currentUser && post.user_id !== currentUser.id && (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
                className={`text-xs px-2 py-1 h-auto ${
                  isFollowing 
                    ? "border-coral text-coral hover:bg-coral hover:text-white" 
                    : "bg-coral hover:bg-coral/90 text-white"
                }`}
              >
                {isFollowing ? "Seguindo" : "Seguir"}
              </Button>
            )}
            
            {/* Menu de opções */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {currentUser && currentUser.id === post.user_id ? (
                  <>
                    <DropdownMenuItem onClick={() => onUpdate && onUpdate(post)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onDelete && onDelete(post.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="text-yellow-600">
                    Reportar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isSponsored && (
          <div className="mb-3 sm:mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm text-amber-700 flex items-start gap-2">
            <Megaphone className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-800 leading-snug">
                {campaignInfo?.titulo ? `Campanha “${campaignInfo.titulo}”` : 'Conteúdo patrocinado'}
                {campaignObjectiveLabel ? ` • ${campaignObjectiveLabel}` : ''}
              </p>
              <p className="leading-snug">
                Este post foi impulsionado para alcançar mais empreendedoras na comunidade EmpowerUp.
              </p>
            </div>
          </div>
        )}

        {/* Categoria */}
        {post.categoria && (
          <Badge className="mb-3 bg-coral/10 text-coral hover:bg-coral/20 text-xs">
            {post.categoria}
          </Badge>
        )}

        {/* Conteúdo */}
        <div className="mb-3 sm:mb-4">
          <p className="text-gray-800 leading-relaxed text-sm sm:text-base break-words whitespace-pre-wrap overflow-wrap-anywhere">{post.conteudo}</p>
          
          {/* Tags */}
          {(() => {
            let tags = [];
            try {
              // Se post.tags é uma string JSON, fazer parse
              if (typeof post.tags === 'string') {
                tags = JSON.parse(post.tags);
              } else if (Array.isArray(post.tags)) {
                tags = post.tags;
              }
            } catch (e) {
              // Se não conseguir fazer parse, tentar split por vírgula
              if (typeof post.tags === 'string') {
                tags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
              }
            }
            
            return tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-coral hover:text-coral/80 cursor-pointer text-xs sm:text-sm font-medium break-words"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            );
          })()}

          {/* Mídia */}
          {renderMedia()}
        </div>

        {/* Ações do post */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`transition-all duration-200 px-2 py-1 h-auto text-xs sm:text-sm ${
                isLiked 
                  ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100" 
                  : "text-coral hover:text-coral/80 hover:bg-coral/10"
              }`}
            >
              <Heart className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 transition-all duration-200 ${isLiked ? "fill-current scale-110" : ""}`} />
              <span 
                className="cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLikesList(true);
                }}
              >
                {likeCount}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-olive hover:text-olive/80 px-2 py-1 h-auto text-xs sm:text-sm"
              onClick={() => setShowComments(!showComments)}
              onMouseEnter={() => {
                // Pré-carregar comentários no hover para melhor UX
                if (!commentsLoadedRef.current && !loadingComments) {
                  fetchComments();
                }
              }}
            >
              <MessageCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {commentCount}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sage hover:text-sage/80 px-2 py-1 h-auto text-xs sm:text-sm"
              onClick={() => onShare && onShare(post)}
            >
              <Share2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {post.compartilhamentos || 0}
            </Button>

            {showSaveButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`transition-all duration-200 p-1 sm:p-2 h-auto ${
                  saved 
                    ? "text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100" 
                    : "text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                }`}
                onClick={handleSave}
                title={saved ? "Remover dos salvos" : "Salvar post"}
              >
                <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 transition-all duration-200 ${saved ? "fill-current scale-110" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Seção de comentários */}
        {showComments && (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
            {/* Formulário de novo comentário */}
            {currentUser && (
              <div className="mb-3 sm:mb-4">
                {replyTo && (
                  <div className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Respondendo a <strong>@{replyTo.username}</strong>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTo(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex space-x-2 sm:space-x-3">
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                    <AvatarImage src={currentUser.avatar_url ? config.getPublicUrl(currentUser.avatar_url) : ''} />
                    <AvatarFallback className="bg-coral text-white text-xs">
                      {currentUser.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-end space-x-2">
                    <Textarea
                      placeholder={replyTo ? `Responder para @${replyTo.username}...` : "Escreva um comentário..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 min-h-[40px] resize-none text-sm"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment();
                        }
                      }}
                    />
                    <Button
                      onClick={handleComment}
                      disabled={!newComment.trim()}
                      className="bg-coral hover:bg-coral/90 px-3 py-2 h-auto"
                      size="sm"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de comentários */}
            <div className="space-y-4">
              {loadingComments ? (
                // Loading skeleton mais elaborado
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                comments.map(renderComment)
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhum comentário ainda. Seja a primeira a comentar!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Modal de likes */}
        <Dialog open={showLikesList} onOpenChange={setShowLikesList}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Curtidas ({likeCount})</DialogTitle>
              <DialogDescription>
                Pessoas que curtiram este post
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loadingLikes ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral mx-auto"></div>
                </div>
              ) : likes.length > 0 ? (
                likes.map((like) => (
                  <div key={like.id || like.user?.id} className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={(like.avatar_url || like.user?.avatar_url) ? config.getPublicUrl(like.avatar_url || like.user?.avatar_url) : ''} />
                      <AvatarFallback className="bg-coral text-white">
                        {(like.nome || like.user?.nome) ? (like.nome || like.user?.nome).charAt(0) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{like.nome || like.user?.nome || 'Usuário'}</p>
                      <p className="text-sm text-coral">@{like.username || like.user?.username || 'unknown'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Nenhuma curtida ainda.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SocialPost;
