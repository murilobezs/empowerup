import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import config from '../config/config';

const ImageUpload = ({ 
  onUpload, 
  uploadType, 
  userId, 
  postId, 
  groupId, 
  currentImage, 
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = "",
  placeholder = "Clique para selecionar uma imagem"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage ? config.getPublicUrl(currentImage) : null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const validateAndUpload = async (file) => {
    setError('');
    setSuccess('');

    // Validar tamanho
    if (file.size > maxSize) {
      setError(`Arquivo muito grande! Tamanho máximo: ${formatFileSize(maxSize)}`);
      return;
    }

    // Validar tipo
    if (!acceptedTypes.includes(file.type)) {
      setError(`Tipo de arquivo não permitido! Use: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('upload_type', uploadType);
      
      if (userId) formData.append('user_id', userId);
      if (postId) formData.append('post_id', postId);
      if (groupId) formData.append('group_id', groupId);

      const response = await fetch(config.getApiUrl('upload_image.php'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSuccess('Imagem enviada com sucesso!');
        if (onUpload) {
          onUpload(result.image_path, result.file_name);
        }
      } else {
        setError(result.message || 'Erro ao enviar imagem');
        setPreview(currentImage ? config.getPublicUrl(currentImage) : null);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setError(`Erro de conexão: ${error.message}. Verifique se o servidor está rodando.`);
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    if (!preview || preview === (currentImage ? config.getPublicUrl(currentImage) : null)) return;
    
    setPreview(currentImage ? config.getPublicUrl(currentImage) : null);
    setError('');
    setSuccess('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`image-upload ${className}`}>
      <Card>
        <CardContent className="p-4">
          {/* Área de Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isUploading ? 'border-coral bg-coral/5' : 'border-gray-300 hover:border-coral hover:bg-coral/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                />
                {!isUploading && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
                    <span className="text-coral">Enviando...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{placeholder}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Ou arraste e solte uma imagem aqui
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Input oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Informações */}
          <div className="mt-4 text-xs text-gray-500">
            <p>Tamanho máximo: {formatFileSize(maxSize)}</p>
            <p>Tipos aceitos: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}</p>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUpload;
