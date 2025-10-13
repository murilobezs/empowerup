import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { useToast } from './ui/toast';

const EditPostModal = ({ isOpen, onClose, post, onSave }) => {
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Lista de categorias disponíveis
  const categorias = [
    'Geral',
    'Artesanato',
    'Culinária',
    'Moda',
    'Beleza',
    'Tecnologia',
    'Negócios',
    'Saúde',
    'Educação',
  ];

  // Inicializar campos quando o modal abrir
  useEffect(() => {
    if (isOpen && post) {
      setConteudo(post.conteudo || '');
      setCategoria(post.categoria || 'Geral');
      
      // Parse das tags se existirem
      let parsedTags = [];
      if (post.tags) {
        try {
          if (typeof post.tags === 'string') {
            parsedTags = JSON.parse(post.tags);
          } else if (Array.isArray(post.tags)) {
            parsedTags = post.tags;
          }
        } catch (e) {
          console.warn('Erro ao parsear tags:', e);
          parsedTags = [];
        }
      }
      setTags(parsedTags);
    }
  }, [isOpen, post]);

  // Limpar campos quando fechar
  useEffect(() => {
    if (!isOpen) {
      setConteudo('');
      setCategoria('Geral');
      setTags([]);
      setNewTag('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
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

  const handleSave = async () => {
    if (!conteudo.trim()) {
      addToast('O conteúdo do post é obrigatório', 'error');
      return;
    }

    if (conteudo.length > 2000) {
      addToast('O conteúdo deve ter no máximo 2000 caracteres', 'error');
      return;
    }

    setLoading(true);

    try {
      const updatedData = {
        conteudo: conteudo.trim(),
        categoria,
        tags
      };

      await onSave(post.id, updatedData);
      addToast('Post atualizado com sucesso!', 'success');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      addToast('Erro ao atualizar post. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Editar Post</DialogTitle>
          <DialogDescription>
            Faça alterações no seu post e salve as modificações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conteúdo */}
          <div>
            <Label htmlFor="conteudo">Conteúdo</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="O que você gostaria de compartilhar?"
              className="min-h-[120px]"
              maxLength={2000}
            />
            <div className="text-sm text-gray-500 mt-1">
              {conteudo.length}/2000 caracteres
            </div>
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (opcional)</Label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma tag e pressione Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-coral"
                maxLength={20}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.length >= 5}
                size="sm"
              >
                Adicionar
              </Button>
            </div>
            
            {/* Lista de tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="text-sm text-gray-500 mt-1">
              {tags.length}/5 tags
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={loading || !conteudo.trim()}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;
