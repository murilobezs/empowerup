import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Smile,
  Edit,
  Trash2,
  Reply,
  X,
  Play,
  Pause
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

const SocialPost = ({ post, currentUser, onLike, onComment, onShare, onDelete, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showLikesList, setShowLikesList] = useState(false);
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(post.user_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.comentarios || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Carregar comentários quando abrir
  useEffect(() => {
    if (showComments && !loadingComments) {
      fetchComments();
    }
  }, [showComments]);

  // Carregar likes quando abrir modal
  useEffect(() => {
    if (showLikesList && !loadingLikes) {
      fetchLikes();
    }
  }, [showLikesList]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(`http://localhost/empowerup/api/posts/comentarios.php?post_id=${post.id}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comentarios);
        setCommentCount(data.total);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
    setLoadingComments(false);
  };

  const fetchLikes = async () => {
    setLoadingLikes(true);
    try {
      const response = await fetch(`http://localhost/empowerup/api/posts/likes.php?post_id=${post.id}`);
      const data = await response.json();
      
      if (data.success) {
        setLikes(data.likes);
        setLikeCount(data.total);
      }
    } catch (error) {
      console.error('Erro ao carregar likes:', error);
    }
    setLoadingLikes(false);
  };

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch('http://localhost/empowerup/api/posts/likes.php', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post.id,
          user_id: currentUser.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsLiked(!isLiked);
        setLikeCount(data.total_likes);
        if (onLike) onLike(post.id, !isLiked);
      }
    } catch (error) {
      console.error('Erro ao curtir:', error);
    }
  };

  const handleComment = async () => {
    if (!currentUser || !newComment.trim()) return;

    try {
      const response = await fetch('http://localhost/empowerup/api/posts/comentarios.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post.id,
          user_id: currentUser.id,
          conteudo: newComment.trim(),
          parent_id: replyTo?.id || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        setReplyTo(null);
        setCommentCount(data.total_comentarios);
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
      const response = await fetch('http://localhost/empowerup/api/posts/comentarios.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comentario_id: commentId,
          user_id: currentUser.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCommentCount(data.total_comentarios);
        fetchComments(); // Recarregar comentários
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
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
          {comment.nome.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">{comment.nome}</span>
            <span className="text-coral text-sm">@{comment.username}</span>
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
                    {resposta.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-xs">{resposta.nome}</span>
                      <span className="text-coral text-xs">@{resposta.username}</span>
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
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.avatar ? `http://localhost/empowerup/public${post.avatar}` : ''} />
              <AvatarFallback className="bg-coral text-white">
                {post.autor.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{post.autor}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{post.username}</span>
                <span>•</span>
                <span>{post.tempo || formatTimeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>
          
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
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-coral hover:text-coral/80 cursor-pointer text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

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
              className={`transition-colors ${
                isLiked 
                  ? "text-red-500 hover:text-red-600" 
                  : "text-coral hover:text-coral/80"
              }`}
            >
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span 
                className="cursor-pointer hover:underline"
                onClick={() => setShowLikesList(true)}
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
                  <div key={like.id} className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={like.avatar_url ? `http://localhost/empowerup/public${like.avatar_url}` : ''} />
                      <AvatarFallback className="bg-coral text-white">
                        {like.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{like.nome}</p>
                      <p className="text-sm text-coral">@{like.username}</p>
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
