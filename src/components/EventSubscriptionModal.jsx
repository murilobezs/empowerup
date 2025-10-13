import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign,
  Award,
  User,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/api';
import { useToast } from './ui/toast';

export const EventSubscriptionModal = ({ event, isOpen, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    nome_completo: user?.nome || '',
    telefone: user?.telefone || '',
    email: user?.email || '',
    observacoes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome_completo.trim()) {
      newErrors.nome_completo = 'Nome completo é obrigatório';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone) && !/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) {
      newErrors.telefone = 'Formato de telefone inválido';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiService.subscribeToEvent(event.id, formData);
      
      if (response.success) {
        addToast(response.message || 'Inscrição realizada com sucesso!', 'success');
        onSuccess();
      } else {
        addToast(response.message || 'Erro ao realizar inscrição', 'error');
      }
    } catch (error) {
      console.error('Erro ao se inscrever:', error);
      addToast('Erro ao realizar inscrição. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };
  
  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    handleChange('telefone', formatted);
  };
  
  if (!event) return null;
  
  const isWaitingList = event.vagas_disponiveis <= 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isWaitingList ? 'Entrar na Lista de Espera' : 'Inscrever-se no Evento'}
          </DialogTitle>
          <DialogDescription>
            {isWaitingList 
              ? 'Todas as vagas estão ocupadas. Entre na lista de espera para ser notificado caso alguma vaga seja liberada.'
              : 'Preencha os dados abaixo para confirmar sua participação no evento.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do evento */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">{event.titulo}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(event.data_evento)}
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(event.data_evento)}
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {event.eh_online ? 'Online' : event.local || 'Local a definir'}
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {event.inscricoes_confirmadas}/{event.capacidade_maxima} participantes
              </div>
              
              {event.instrutor_nome && (
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  {event.instrutor_nome}
                </div>
              )}
              
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                {event.eh_gratuito ? 'Gratuito' : `R$ ${event.valor?.toFixed(2)}`}
              </div>
              
              {event.certificado && (
                <div className="flex items-center text-green-600 md:col-span-2">
                  <Award className="w-4 h-4 mr-2" />
                  Este evento oferece certificado de participação
                </div>
              )}
            </div>
            
            {isWaitingList && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-700">
                  <p className="font-medium">Evento lotado!</p>
                  <p>Você será adicionada à lista de espera e notificada caso surjam vagas.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Formulário de inscrição */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => handleChange('nome_completo', e.target.value)}
                placeholder="Seu nome completo"
                className={errors.nome_completo ? 'border-red-500' : ''}
              />
              {errors.nome_completo && (
                <p className="text-red-500 text-sm mt-1">{errors.nome_completo}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className={errors.telefone ? 'border-red-500' : ''}
              />
              {errors.telefone && (
                <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Será usado para comunicações sobre o evento
              </p>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Alguma dúvida ou informação adicional? (opcional)"
                className="min-h-[80px]"
              />
            </div>
            
            {event.requisitos && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="font-medium text-blue-900 mb-1">Requisitos:</p>
                <p className="text-blue-800 text-sm">{event.requisitos}</p>
              </div>
            )}
            
            {event.material_necessario && (
              <div className="bg-green-50 p-3 rounded-md">
                <p className="font-medium text-green-900 mb-1">Material necessário:</p>
                <p className="text-green-800 text-sm">{event.material_necessario}</p>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-coral hover:bg-coral/90"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </div>
                ) : (
                  isWaitingList ? 'Entrar na Lista de Espera' : 'Confirmar Inscrição'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
