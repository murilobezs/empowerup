import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
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
  Bookmark
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
} from './ui/dialog';
import apiService from '../services/api';

const SocialPost = ({ 
  post, 
  currentUser, 
  onLike, 
  onComment, 
  onShare, 
  onDelete, 
  onUpdate, 
  onSave,
  showSaveButton = true,
  isSaved = false
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

  // Sincronizar estado quando as props mudarem
  useEffect(() => {
    setIsLiked(post.user_liked || post.isLiked || false);
    setLikeCount(post.likes || 0);
    setSaved(isSaved || post.user_saved || post.isSaved || false);
  }, [post.user_liked, post.isLiked, post.likes, isSaved, post.user_saved, post.isSaved]);

  // Carregar comentários quando abrir
  useEffect(() => {
    if (showComments && !loadingComments) {
      fetchComments();
    }
  }, [showComments, post.id]);

  // Carregar likes quando abrir modal
  useEffect(() => {
    if (showLikesList && !loadingLikes) {
      fetchLikes();
    }
  }, [showLikesList, post.id]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await apiService.getComments(post.id);
      
      if (response.success) {
        setComments(response.comments || []);
        setCommentCount(response.total || response.comments?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
    setLoadingComments(false);
  };

  const fetchLikes = async () => {
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
  };

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

    try {
      const response = await apiService.createComment(post.id, {
        conteudo: newComment.trim(),
        parent_id: replyTo?.id || null
      });
      
      if (response.success) {
        setNewComment('');
        setReplyTo(null);
        setCommentCount(prev => prev + 1);
        fetchComments(); // Recarregar comentários
        if (onComment) onComment(post.id);
      }
    } catch (error) {
      console.error('Erro ao comentar:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;

    try {
      const response = await apiService.deleteComment(commentId);
      
      if (response.success) {
        setCommentCount(prev => Math.max(prev - 1, 0));
        fetchComments(); // Recarregar comentários
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
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
        setIsFollowing(response.following);
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
    // Novo sistema: mídia do banco BLOB
    if (post.media_files && post.media_files.length > 0) {
      const mediaFiles = post.media_files;
      
      if (mediaFiles.length === 1) {
        // Um arquivo - layout único
        const media = mediaFiles[0];
        const mediaUrl = `http://localhost/empowerup/api/posts/media.php?id=${media.id}`;
        
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
              const mediaUrl = `http://localhost/empowerup/api/posts/media.php?id=${media.id}`;
              
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

    // Sistema antigo - manter compatibilidade
    if (post.tipo_midia === 'imagem' && post.imagem_url) {
      return (
        <div className="rounded-xl overflow-hidden mt-3">
          <img
            src={`http://localhost/empowerup/public${post.imagem_url}`}
            alt="Post"
            className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => window.open(`http://localhost/empowerup/public${post.imagem_url}`, '_blank')}
          />
        </div>
      );
    }

    if (post.tipo_midia === 'video' && post.video_url) {
      return (
        <div className="rounded-xl overflow-hidden mt-3 relative">
          <video
            src={`http://localhost/empowerup/public${post.video_url}`}
            controls
            className="w-full max-h-96 object-cover"
            poster="/placeholder.svg?height=300&width=500"
          />
        </div>
      );
    }

    if (post.tipo_midia === 'gif' && post.gif_url) {
      return (
        <div className="rounded-xl overflow-hidden mt-3">
          <img
            src={`http://localhost/empowerup/public${post.gif_url}`}
            alt="GIF"
            className="w-full max-h-96 object-cover cursor-pointer"
            onClick={() => window.open(`http://localhost/empowerup/public${post.gif_url}`, '_blank')}
          />
        </div>
      );
    }

    return null;
  };

  const renderComment = (comment) => (
    <div key={comment.id} className="flex space-x-3 py-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={comment.avatar_url ? `http://localhost/empowerup/public${comment.avatar_url}` : ''} />
        <AvatarFallback className="text-xs bg-coral text-white">
          {comment.nome ? comment.nome.charAt(0) : comment.autor ? comment.autor.charAt(0) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">{comment.nome || comment.autor || 'Usuário'}</span>
            <span className="text-coral text-sm">@{comment.username || 'unknown'}</span>
            <span className="text-gray-500 text-xs">{formatTimeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-gray-800">{comment.conteudo}</p>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-coral"
            onClick={() => setReplyTo(comment)}
          >
            <Reply className="w-3 h-3 mr-1" />
            Responder
          </Button>
          {currentUser && currentUser.id === comment.user_id && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-red-500"
              onClick={() => handleDeleteComment(comment.id)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Deletar
            </Button>
          )}
        </div>
        
        {/* Respostas do comentário */}
        {comment.respostas && comment.respostas.length > 0 && (
          <div className="ml-4 mt-3 space-y-3">
            {comment.respostas.map(resposta => (
              <div key={resposta.id} className="flex space-x-3">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={resposta.avatar_url ? `http://localhost/empowerup/public${resposta.avatar_url}` : ''} />
                  <AvatarFallback className="text-xs bg-sage text-white">
                    {resposta.nome ? resposta.nome.charAt(0) : resposta.autor ? resposta.autor.charAt(0) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-xs">{resposta.nome || resposta.autor || 'Usuário'}</span>
                      <span className="text-coral text-xs">@{resposta.username || 'unknown'}</span>
                      <span className="text-gray-500 text-xs">{formatTimeAgo(resposta.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-800">{resposta.conteudo}</p>
                  </div>
                  {currentUser && currentUser.id === resposta.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 hover:text-red-500 mt-1"
                      onClick={() => handleDeleteComment(resposta.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Deletar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header do post */}
        <div className="flex items-center justify-between mb-4">
            <Link to={`/perfil/${post.username}`} className="flex items-center space-x-3 hover:underline">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.avatar ? `http://localhost/empowerup/public${post.avatar}` : ''} />
                <AvatarFallback className="bg-coral text-white">
                  {post.autor.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{post.autor}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>@{post.username}</span>
                  <span>•</span>
                  <span>{post.tempo || formatTimeAgo(post.created_at)}</span>
                </div>
              </div>
            </Link>
          
          <div className="flex items-center space-x-2">
            {/* Botão de seguir */}
            {currentUser && post.user_id !== currentUser.id && (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
                className={`${
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
              <DropdownMenuContent align="end">
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

        {/* Categoria */}
        {post.categoria && (
          <Badge className="mb-3 bg-coral/10 text-coral hover:bg-coral/20">
            {post.categoria}
          </Badge>
        )}

        {/* Conteúdo */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed">{post.conteudo}</p>
          
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
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-coral hover:text-coral/80 cursor-pointer text-sm font-medium"
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
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`transition-all duration-200 ${
                isLiked 
                  ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100" 
                  : "text-coral hover:text-coral/80 hover:bg-coral/10"
              }`}
            >
              <Heart className={`mr-2 h-4 w-4 transition-all duration-200 ${isLiked ? "fill-current scale-110" : ""}`} />
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
              className="text-olive hover:text-olive/80"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {commentCount}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sage hover:text-sage/80"
              onClick={() => onShare && onShare(post)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {post.compartilhamentos || 0}
            </Button>

            {showSaveButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`transition-all duration-200 ${
                  saved 
                    ? "text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100" 
                    : "text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                }`}
                onClick={handleSave}
                title={saved ? "Remover dos salvos" : "Salvar post"}
              >
                <Bookmark className={`h-4 w-4 transition-all duration-200 ${saved ? "fill-current scale-110" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Seção de comentários */}
        {showComments && (
          <div className="mt-6 pt-4 border-t">
            {/* Formulário de novo comentário */}
            {currentUser && (
              <div className="mb-4">
                {replyTo && (
                  <div className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Respondendo a <strong>@{replyTo.username}</strong>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTo(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser.avatar_url ? `http://localhost/empowerup/public${currentUser.avatar_url}` : ''} />
                    <AvatarFallback className="bg-coral text-white text-xs">
                      {currentUser.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex space-x-2">
                    <Textarea
                      placeholder={replyTo ? `Responder para @${replyTo.username}...` : "Escreva um comentário..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 min-h-[60px] resize-none"
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
                      className="bg-coral hover:bg-coral/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de comentários */}
            <div className="space-y-4">
              {loadingComments ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando comentários...</p>
                </div>
              ) : comments.length > 0 ? (
                comments.map(renderComment)
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
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
                      <AvatarImage src={(like.avatar_url || like.user?.avatar_url) ? `http://localhost/empowerup/public${like.avatar_url || like.user?.avatar_url}` : ''} />
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
