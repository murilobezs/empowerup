import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/toast';
import apiService from '../services/api';
import { getStoredToken } from '../utils/authStorage';

const EditUsernameModal = ({ isOpen, onClose, currentUsername, onSave }) => {
  const [username, setUsername] = useState(currentUsername || '');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Reseta o campo quando o modal abrir
  React.useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || '');
    }
  }, [isOpen, currentUsername]);

  const validateUsername = (value) => {
    if (!value.trim()) {
      return 'Username é obrigatório';
    }
    
    if (value.length < 3 || value.length > 30) {
      return 'Username deve ter entre 3 e 30 caracteres';
    }
    
    if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
      return 'Username deve conter apenas letras, números, _ ou .';
    }
    
    return null;
  };

  const handleSave = async () => {
    const error = validateUsername(username);
    if (error) {
      addToast(error, 'error');
      return;
    }

    if (username === currentUsername) {
      addToast('Nenhuma alteração foi feita', 'info');
      onClose();
      return;
    }

    setLoading(true);

    try {
      const token = getStoredToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${apiService.baseURL}/auth/username`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await response.json();

      if (data.success) {
        addToast('Username atualizado com sucesso!', 'success');
        onSave(data.user);
        onClose();
      } else {
        addToast(data.message || 'Erro ao atualizar username', 'error');
      }
    } catch (error) {
      console.error('Erro ao atualizar username:', error);
      addToast('Erro ao conectar com o servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Editar Username</DialogTitle>
          <DialogDescription>
            Altere seu nome de usuário único para personalizar seu perfil.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Novo Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="meunovousername"
              maxLength={30}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Apenas letras, números, _ ou . (3-30 caracteres)
            </p>
          </div>

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
              disabled={loading || !username.trim() || username === currentUsername}
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

export default EditUsernameModal;
