import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { 
  Image as ImageIcon, 
  Video,
  X, 
  Upload,
  Sparkles,
  MapPin,
  Calendar,
  BarChart3,
  Hash,
  Tag,
  Send
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';

const MAX_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov'];

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

const EmpowerUpCreatePost = ({ user, onPostCreated, className = "" }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Geral');
  const [tags, setTags] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Validar arquivo
  const validateFile = useCallback((file) => {
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande. Máximo 10MB.';
    }
    
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    
    if (!isImage && !isVideo) {
      return 'Tipo de arquivo não suportado. Use imagens (JPG, PNG, GIF, WEBP) ou vídeos (MP4, WEBM, MOV).';
    }
    
    return null;
  }, []);

  // Processar arquivos selecionados
  const processFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    
    if (mediaFiles.length + fileArray.length > MAX_FILES) {
      alert(`Máximo ${MAX_FILES} arquivos permitidos.`);
      return;
    }

    const validFiles = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }

      validFiles.push(file);

      // Converter para base64 e criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = {
          id: Date.now() + Math.random(),
          file,
          url: e.target.result,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name,
          size: file.size,
          data: e.target.result.split(',')[1] // Base64 sem prefixo
        };
        
        setMediaPreviews(prev => [...prev, preview]);
      };
      reader.readAsDataURL(file);
    });

    setMediaFiles(prev => [...prev, ...validFiles]);
  }, [mediaFiles, validateFile]);

  // Handle file input
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  // Remover arquivo
  const removeMedia = (previewId) => {
    const previewIndex = mediaPreviews.findIndex(p => p.id === previewId);
    if (previewIndex !== -1) {
      setMediaPreviews(prev => prev.filter(p => p.id !== previewId));
      setMediaFiles(prev => prev.filter((_, index) => index !== previewIndex));
    }
  };

  // Enviar post
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && mediaPreviews.length === 0) {
      alert('Adicione conteúdo ou mídia ao seu post');
      return;
    }

    if (!user?.id) {
      alert('Você precisa estar logado para postar');
      return;
    }

    setIsPosting(true);
    setIsUploading(true);

    try {
      // Preparar dados do post
      const postData = {
        conteudo: content.trim(),
        categoria: category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };

      // Se há arquivo de mídia, usar o primeiro arquivo
      const mediaFile = mediaFiles.length > 0 ? mediaFiles[0] : null;

      // Chamar a função onPostCreated passada como prop
      if (onPostCreated) {
        const result = await onPostCreated(postData, mediaFile);
        
        if (result && result.success) {
          // Limpar formulário
          setContent('');
          setCategory('Geral');
          setTags('');
          setMediaFiles([]);
          setMediaPreviews([]);
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
          
          alert('Post publicado com sucesso!');
        } else {
          throw new Error(result?.message || 'Erro ao publicar post');
        }
      } else {
        throw new Error('Função de criação de post não definida');
      }
    } catch (error) {
      console.error('Erro ao postar:', error);
      alert('Erro ao publicar post: ' + error.message);
    } finally {
      setIsPosting(false);
      setIsUploading(false);
    }
  };

  // Calcular caracteres restantes
  const charactersLeft = 280 - content.length;
  const isOverLimit = charactersLeft < 0;

  // Formatação de tamanho de arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={`w-full shadow-sm border-sage/20 ${className}`}>
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Avatar do usuário */}
          <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-coral/20">
            <AvatarImage src={user?.foto_perfil} alt={user?.nome} />
            <AvatarFallback className="bg-coral text-white font-semibold">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Área de conteúdo */}
          <div className="flex-1 space-y-4">
            {/* Header com nome do usuário */}
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-800">{user?.nome || 'Usuário'}</h3>
              <span className="text-sm text-coral">@{user?.username || 'usuario'}</span>
            </div>

            {/* Textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Compartilhe suas ideias e inspire outras empreendedoras! ✨"
                value={content}
                onChange={handleTextareaChange}
                className="min-h-[120px] text-lg border-sage/30 resize-none p-4 focus:ring-2 focus:ring-coral/50 focus:border-coral placeholder:text-gray-500 bg-cream/30"
                style={{ fontSize: '18px', lineHeight: '26px' }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              />
              
              {/* Overlay de drag */}
              {dragActive && (
                <div className="absolute inset-0 bg-sage/20 border-2 border-dashed border-coral rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-coral mx-auto mb-2" />
                    <p className="text-coral font-medium">Solte os arquivos aqui</p>
                  </div>
                </div>
              )}
            </div>

            {/* Categoria e Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-sage/30">
              {/* Seletor de Categoria */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-olive flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-coral" />
                  Categoria
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full border-sage/30 focus:ring-coral/50 focus:border-coral">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="hover:bg-sage/20">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campo de Hashtags */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-olive flex items-center">
                  <Hash className="h-4 w-4 mr-2 text-coral" />
                  Hashtags
                </label>
                <Input
                  type="text"
                  placeholder="#empreendedorismo, #inspiração, #dicas"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full border-sage/30 focus:ring-coral/50 focus:border-coral"
                />
                <p className="text-xs text-gray-500">Separe as hashtags com vírgulas</p>
              </div>
            </div>

            {/* Preview de mídia */}
            {mediaPreviews.length > 0 && (
              <div className={`grid gap-2 rounded-2xl overflow-hidden border ${
                mediaPreviews.length === 1 ? 'grid-cols-1' :
                mediaPreviews.length === 2 ? 'grid-cols-2' :
                mediaPreviews.length === 3 ? 'grid-cols-2' :
                'grid-cols-2'
              }`}>
                {mediaPreviews.map((preview, index) => (
                  <div 
                    key={preview.id} 
                    className={`relative group ${
                      mediaPreviews.length === 3 && index === 0 ? 'row-span-2' : ''
                    }`}
                  >
                    {preview.type === 'image' ? (
                      <img
                        src={preview.url}
                        alt="Preview"
                        className="w-full h-full object-cover min-h-[200px] max-h-[400px]"
                      />
                    ) : (
                      <div className="relative">
                        <video
                          src={preview.url}
                          className="w-full h-full object-cover min-h-[200px] max-h-[400px]"
                          controls
                          preload="metadata"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          <Video className="w-3 h-3 inline mr-1" />
                          {formatFileSize(preview.size)}
                        </div>
                      </div>
                    )}
                    
                    {/* Botão remover */}
                    <button
                      onClick={() => removeMedia(preview.id)}
                      className="absolute top-2 right-2 bg-coral/80 hover:bg-coral text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    {/* Loading overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-sage/30 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Barra de ferramentas */}
            <div className="flex items-center justify-between pt-4 border-t border-sage/30">
              <div className="flex items-center space-x-2">
                {/* Botão de mídia */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={mediaFiles.length >= MAX_FILES || isPosting}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-sage/20 disabled:opacity-50 disabled:cursor-not-allowed group transition-colors"
                  title="Adicionar imagem ou vídeo"
                >
                  <ImageIcon className="h-5 w-5 text-coral group-hover:text-coral-dark" />
                </button>

                {/* Input de arquivo (hidden) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Outros botões decorativos */}
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-sage/20 transition-colors"
                  disabled
                  title="Adicionar enquete (em breve)"
                >
                  <BarChart3 className="h-5 w-5 text-olive" />
                </button>
                
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-sage/20 transition-colors"
                  disabled
                  title="Adicionar emoji (em breve)"
                >
                  <Sparkles className="h-5 w-5 text-olive" />
                </button>
                
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-sage/20 transition-colors"
                  disabled
                  title="Agendar post (em breve)"
                >
                  <Calendar className="h-5 w-5 text-olive" />
                </button>
                
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-sage/20 transition-colors"
                  disabled
                  title="Adicionar localização (em breve)"
                >
                  <MapPin className="h-5 w-5 text-olive" />
                </button>
              </div>

              {/* Contador de caracteres e botão postar */}
              <div className="flex items-center space-x-4">
                {content.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={isOverLimit ? "#FF6B6B" : charactersLeft <= 20 ? "#F59E0B" : "#95E1D3"}
                          strokeWidth="2"
                          strokeDasharray={`${Math.min(100, (content.length / 280) * 100)}, 100`}
                        />
                      </svg>
                      {charactersLeft <= 20 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-bold ${isOverLimit ? 'text-coral' : 'text-amber-500'}`}>
                            {charactersLeft}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={(!content.trim() && mediaFiles.length === 0) || isOverLimit || isPosting}
                  className="bg-coral hover:bg-coral-dark disabled:bg-gray-300 text-white px-8 py-2 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  {isPosting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmpowerUpCreatePost;
