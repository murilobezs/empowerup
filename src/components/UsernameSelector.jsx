import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import useUsername from '../hooks/useUsername';

const UsernameSelector = ({ 
  onUsernameSelect, 
  defaultUsername = '', 
  userNome = '', 
  userEmail = '',
  showGenerateButton = true,
  className = "" 
}) => {
  const {
    username,
    setUsername,
    isAvailable,
    isChecking,
    error,
    generateUsername,
  } = useUsername();

  useState(() => {
    if (defaultUsername) {
      setUsername(defaultUsername);
    }
  }, [defaultUsername]);

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(newUsername);
    
    if (onUsernameSelect) {
      onUsernameSelect(newUsername, false); // false = não confirmado ainda
    }
  };

  const handleGenerateUsername = async () => {
    const generated = await generateUsername(userNome, userEmail);
    if (generated && onUsernameSelect) {
      onUsernameSelect(generated, true); // true = confirmado
    }
  };

  const handleConfirm = () => {
    if (isAvailable && onUsernameSelect) {
      onUsernameSelect(username, true);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
    }
    
    if (isAvailable === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (isAvailable === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getStatusMessage = () => {
    if (error) {
      return error;
    }
    
    if (isAvailable === true) {
      return 'Username disponível!';
    }
    
    if (isAvailable === false) {
      return 'Username não disponível';
    }
    
    return 'Digite um username único';
  };

  const getStatusColor = () => {
    if (error || isAvailable === false) return 'text-red-600';
    if (isAvailable === true) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">@</span>
              </div>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="seu_username"
                className="pl-8 pr-10"
                maxLength={20}
                minLength={3}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {getStatusIcon()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
            
            {showGenerateButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateUsername}
                disabled={isChecking}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Gerar</span>
              </Button>
            )}
          </div>

          {/* Regras do username */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Regras do username:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Entre 3 e 20 caracteres</li>
              <li>Apenas letras, números e underscore (_)</li>
              <li>Deve ser único</li>
              <li>Não pode ser alterado depois</li>
            </ul>
          </div>

          {/* Botão de confirmação */}
          {isAvailable === true && (
            <Button
              onClick={handleConfirm}
              className="w-full bg-coral hover:bg-coral/90"
              disabled={isChecking}
            >
              Confirmar Username
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsernameSelector;
