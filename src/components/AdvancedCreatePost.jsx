import React, { useState, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { 
  Image as ImageIcon, 
  Smile, 
  Send, 
  X, 
  Upload
} from 'lucide-react';
import { Badge } from './ui/badge';
import { useToast } from './ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const AdvancedCreatePost = ({ user, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Geral');
  const [tags, setTags] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const categories = [
    'Geral',
    'Artesanato',
    'Culinária',
    'Moda',
    'Beleza',
    'Tecnologia',
    'Negócios',
    'Saúde',
    'Educação',
    'Dicas',
    'Inspiração',
    'Eventos'
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar tipo de arquivo
    const fileType = file.type;
    let type = null;
    
    if (fileType.startsWith('image/')) {
      if (fileType === 'image/gif') {
        type = 'gif';
      } else {
        type = 'image';
      }
    } else if (fileType.startsWith('video/')) {
      type = 'video';
    } else {
      addToast('Tipo de arquivo não suportado. Use imagens, vídeos ou GIFs.', 'error');
      return;
    }

    // Verificar tamanho
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : // 50MB para vídeos
                   type === 'gif' ? 10 * 1024 * 1024 : // 10MB para GIFs
                   5 * 1024 * 1024; // 5MB para imagens

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      addToast(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`, 'error');
      return;
    }

    setMediaFile(file);
    setMediaType(type);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadMedia = async () => {
    if (!mediaFile) return null;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('media', mediaFile);
      formData.append('user_id', user.id);
      
      let uploadType;
      switch (mediaType) {
        case 'image':
          uploadType = 'post_image';
          break;
        case 'video':
          uploadType = 'post_video';
          break;
        case 'gif':
          uploadType = 'post_gif';
          break;
        default:
          throw new Error('Tipo de mídia inválido');
      }
      
      formData.append('upload_type', uploadType);

      const response = await fetch('http://localhost/empowerup/api/posts/upload_media.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erro no upload');
      }

      return data.file_path;
      
    } catch (error) {
      addToast('Erro no upload: ' + error.message, 'error');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      addToast('Escreva algo para publicar!', 'warning');
      return;
    }

    setIsPosting(true);

    try {
      // Upload da mídia primeiro, se houver
      let mediaUrl = null;
      if (mediaFile) {
        mediaUrl = await uploadMedia();
        if (!mediaUrl) {
          // Erro no upload, não continuar
          setIsPosting(false);
          return;
        }
      }

      // Preparar dados do post
      const postData = {
        user_id: user.id,
        conteudo: content.trim(),
        categoria: category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        autor: user.nome,
        username: user.username || 'usuario',
        avatar: user.avatar_url || '/placeholder.svg?height=40&width=40'
      };

      // Adicionar URL da mídia baseado no tipo
      if (mediaUrl) {
        switch (mediaType) {
          case 'image':
            postData.imagem_url = mediaUrl;
            break;
          case 'video':
            postData.video_url = mediaUrl;
            break;
          case 'gif':
            postData.gif_url = mediaUrl;
            break;
          default:
            // Tipo de mídia não reconhecido
            break;
        }
      }

      // Criar post
      const response = await fetch('http://localhost/empowerup/api/posts/postagens.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Limpar formulário
        setContent('');
        setCategory('Geral');
        setTags('');
        removeMedia();
        
        addToast('Post publicado com sucesso! 🎉', 'success');
        
        // Notificar componente pai
        if (onPostCreated) {
          onPostCreated(data.post);
        }
      } else {
        throw new Error(data.message || 'Erro ao criar post');
      }
      
    } catch (error) {
      addToast('Erro ao publicar: ' + error.message, 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const renderMediaPreview = () => {
    if (!mediaPreview) return null;

    return (
      <div className="mt-4 relative">
        <div className="relative rounded-lg overflow-hidden bg-gray-100">
          {mediaType === 'video' ? (
            <video
              src={mediaPreview}
              controls
              className="w-full max-h-64 object-cover"
            />
          ) : (
            <img
              src={mediaPreview}
              alt="Preview"
              className="w-full max-h-64 object-cover"
            />
          )}
          
          {/* Botão para remover */}
          <Button
            onClick={removeMedia}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Badge do tipo de mídia */}
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-black/70 text-white hover:bg-black/70">
              {mediaType === 'video' ? '🎥 Vídeo' :
               mediaType === 'gif' ? '🎭 GIF' :
               '🖼️ Imagem'}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Faça login para criar posts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url ? `http://localhost/empowerup/public${user.avatar_url}` : ''} />
              <AvatarFallback className="bg-coral text-white">
                {user.nome.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{user.nome}</h3>
              <p className="text-sm text-coral">@{user.username || 'usuario'}</p>
            </div>
          </div>

          {/* Área de texto */}
          <div>
            <Textarea
              placeholder="Compartilhe algo inspirador com a comunidade..."
              className="min-h-[120px] resize-none border-none bg-gray-50 text-base focus:ring-2 focus:ring-coral/20"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {content.length}/2000
            </div>
          </div>

          {/* Preview da mídia */}
          {renderMediaPreview()}

          {/* Configurações do post */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="#empreendedorismo, #dicas, #inspiração"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral/20 focus:border-coral"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              {/* Upload de mídia */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                variant="ghost"
                size="sm"
                className="text-coral hover:text-coral/80 hover:bg-coral/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isPosting}
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                Foto/Vídeo
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-olive hover:text-olive/80 hover:bg-olive/10"
                disabled
              >
                <Smile className="h-5 w-5 mr-2" />
                Emoji
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isUploading || isPosting}
              className="bg-coral hover:bg-coral/90 px-6"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : isPosting ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publicar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCreatePost;
