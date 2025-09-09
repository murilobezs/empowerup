import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm, validationRules } from '../hooks/useForm';
import { PageLayout } from '../components/layout';
import { Loading, Toast } from '../components/common';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import EditUsernameModal from '../components/EditUsernameModal';
import { Camera, Save, ArrowLeft, Edit } from 'lucide-react';
import { ROUTES } from '../constants';
import { utils } from '../utils';

/**
 * Página de edição de perfil
 */
const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [showEditUsername, setShowEditUsername] = useState(false);

  // Formatar telefone no padrão brasileiro (xx) xxxxx-xxxx
  const formatTelefone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let result = '';
    if (digits.length > 0) result += '(' + digits.slice(0, 2);
    if (digits.length >= 3) result += ') ' + digits.slice(2, 7);
    else if (digits.length > 2) result += ') ' + digits.slice(2);
    if (digits.length >= 8) result += '-' + digits.slice(7, 11);
    return result;
  };

  // Formulário de perfil
  const {
    values,
    errors,
    handleBlur,
    handleSubmit,
    getFieldProps,
    setFormValues,
    setValue,
    isSubmitting
  } = useForm(
    {
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone ? formatTelefone(user.telefone) : '',
      bio: user?.bio || '',
      website: user?.website || '',
      localizacao: user?.localizacao || ''
    },
    {
      nome: validationRules.name,
      email: validationRules.email,
      telefone: (value) => {
        if (!value) return null;
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 11) {
          return 'Telefone deve ter 10 ou 11 dígitos';
        }
        return null;
      },
      bio: (value) => value && value.length > 500 ? 'Bio deve ter no máximo 500 caracteres' : null,
      website: (value) => {
        if (!value) return null;
        try {
          new URL(value);
          return null;
        } catch {
          return 'URL inválida';
        }
      }
    }
  );

  // Atualizar valores do formulário quando usuário estiver disponível
  React.useEffect(() => {
    if (user) {
      console.log('Dados do usuário no EditProfile:', user);
      setFormValues({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone ? formatTelefone(user.telefone) : '',
        bio: user.bio || '',
        website: user.website || '',
        localizacao: user.localizacao || ''
      });
    }
  }, [user, setFormValues]);

  // Submeter formulário
  const onSubmit = async (formData) => {
    // Limpar telefone para enviar apenas números
    const dataToSend = {
      ...formData,
      telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : ''
    };
    
    const result = await updateProfile(dataToSend);
    
    if (result.success) {
      showToast('Perfil atualizado com sucesso!', 'success');
      setTimeout(() => navigate(ROUTES.PROFILE), 1500);
    } else {
      showToast(result.message || 'Erro ao atualizar perfil', 'error');
    }
    
    return result;
  };

  // Upload de avatar
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    if (!utils.isImage(file)) {
      showToast('Apenas imagens são permitidas', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      showToast('Imagem deve ter no máximo 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const result = await updateAvatar(file);
      
      if (result.success) {
        showToast('Avatar atualizado com sucesso!', 'success');
      } else {
        showToast(result.message || 'Erro ao atualizar avatar', 'error');
      }
    } catch (error) {
      showToast('Erro ao fazer upload do avatar', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Atualizar username
  const handleUsernameUpdate = (updatedUser) => {
    // Atualizar o contexto do usuário
    updateProfile(updatedUser);
  };

  // Mostrar toast
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  return (
    <PageLayout
      title="Editar Perfil"
      subtitle="Atualize suas informações pessoais"
      breadcrumbs={[
        { label: 'Perfil', href: ROUTES.PROFILE },
        { label: 'Editar' }
      ]}
      actions={[
        <Button
          key="back"
          variant="outline"
          onClick={() => navigate(ROUTES.PROFILE)}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      ]}
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}>
          <div className="space-y-6">
            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage 
                        src={user?.foto_perfil} 
                        alt={user?.nome}
                      />
                      <AvatarFallback>
                        {user?.nome?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loading size="sm" showText={false} />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        className="cursor-pointer"
                        asChild
                      >
                        <span>
                          <Camera className="w-4 h-4 mr-2" />
                          {uploading ? 'Enviando...' : 'Alterar Foto'}
                        </span>
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG ou GIF. Máximo 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    {...getFieldProps('nome')}
                    placeholder="Seu nome completo"
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600 mt-1">{errors.nome}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="username">Username</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditUsername(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-md">
                    <span className="text-gray-600">@{user?.username}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Seu username único para ser encontrado na plataforma
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...getFieldProps('email')}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={values.telefone || ''}
                    onChange={(e) => {
                      const formatted = formatTelefone(e.target.value);
                      setValue('telefone', formatted);
                    }}
                    onBlur={handleBlur}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.telefone && (
                    <p className="text-sm text-red-600 mt-1">{errors.telefone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    {...getFieldProps('bio')}
                    placeholder="Conte um pouco sobre você..."
                    rows={4}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.bio && (
                      <p className="text-sm text-red-600">{errors.bio}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {values.bio?.length || 0}/500
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...getFieldProps('website')}
                    placeholder="https://seusite.com"
                    required={false}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-600 mt-1">{errors.website}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    {...getFieldProps('localizacao')}
                    placeholder="Cidade, Estado"
                    required={false}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.PROFILE)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center"
              >
                {isSubmitting ? (
                  <Loading size="sm" showText={false} className="mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Modal de Edição de Username */}
      <EditUsernameModal
        isOpen={showEditUsername}
        onClose={() => setShowEditUsername(false)}
        currentUsername={user?.username}
        onSave={handleUsernameUpdate}
      />
    </PageLayout>
  );
};

export default EditProfilePage;
