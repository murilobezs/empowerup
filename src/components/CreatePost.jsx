import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Send } from 'lucide-react';
import ImageUpload from './ImageUpload';

const CreatePost = ({ onPostCreated, currentUser }) => {
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [imagem, setImagem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorias = [
    'Geral',
    'Artesanato',
    'Negócios',
    'Dicas',
    'Eventos',
    'Networking',
    'Empreendedorismo'
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageUpload = (imagePath) => {
    setImagem(imagePath);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!conteudo.trim()) {
      alert('O conteúdo do post é obrigatório');
      return;
    }

    if (!currentUser?.id) {
      alert('Você precisa estar logado para criar um post');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost/empowerup/api/posts/postagens.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          conteudo,
          categoria,
          tags,
          imagem: imagem || null
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Limpar formulário
        setConteudo('');
        setCategoria('Geral');
        setTags([]);
        setImagem('');
        
        // Notificar componente pai
        if (onPostCreated) {
          onPostCreated(result.post);
        }
        
        alert('Post criado com sucesso!');
      } else {
        alert('Erro ao criar post: ' + result.message);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Criar Novo Post</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Conteúdo do Post */}
          <div>
            <Textarea
              placeholder="O que você gostaria de compartilhar?"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              className="min-h-[120px]"
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {conteudo.length}/1000
            </div>
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Adicionar Imagem (opcional)
            </label>
            <ImageUpload
              uploadType="post_image"
              userId={currentUser?.id}
              onUpload={handleImageUpload}
              placeholder="Adicione uma imagem ao seu post"
              className="mb-4"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} className="bg-coral/10 text-coral hover:bg-coral/20">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-coral hover:text-coral/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Adicionar tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
                maxLength={20}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                size="sm"
              >
                Adicionar
              </Button>
            </div>
          </div>

          {/* Botão de Envio */}
          <Button
            type="submit"
            disabled={isSubmitting || !conteudo.trim()}
            className="w-full bg-coral hover:bg-coral/90"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publicando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Publicar Post
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
