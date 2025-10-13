import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { 
  Calendar, 
  MapPin, 
  Users,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  DollarSign,
  Award
} from 'lucide-react';
import adminApi from '../../services/admin-api';

export const AdminEventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [selectedEventSubscriptions, setSelectedEventSubscriptions] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'workshop',
    data_evento: '',
    data_fim: '',
    local: '',
    endereco: '',
    capacidade_maxima: 50,
    valor: 0,
    eh_gratuito: true,
    instrutor_nome: '',
    instrutor_bio: '',
    instrutor_foto: '',
    requisitos: '',
    material_necessario: '',
    certificado: false,
    imagem_url: '',
    link_online: '',
    eh_online: false
  });
  
  const [errors, setErrors] = useState({});

  const toDateTimeLocalValue = (value) => {
    if (!value) return '';
    const formatted = value.includes('T') ? value : value.replace(' ', 'T');
    return formatted.slice(0, 16);
  };

  const toBackendDateTime = (value) => {
    if (!value) return null;
    const normalized = value.includes('T') ? value.replace('T', ' ') : value;
    return normalized.length === 16 ? `${normalized}:00` : normalized;
  };

  const getSubscriptionBadgeClass = (status) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'lista_espera':
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionStatusLabel = (status) => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada';
      case 'lista_espera':
        return 'Lista de Espera';
      case 'pendente':
        return 'Pendente';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getEvents();
      setEvents(response?.eventos || response?.events || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'workshop',
      data_evento: '',
      data_fim: '',
      local: '',
      endereco: '',
      capacidade_maxima: 50,
      valor: 0,
      eh_gratuito: true,
      instrutor_nome: '',
      instrutor_bio: '',
      instrutor_foto: '',
      requisitos: '',
      material_necessario: '',
      certificado: false,
      imagem_url: '',
      link_online: '',
      eh_online: false
    });
    setErrors({});
    setShowCreateModal(true);
  };
  
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      titulo: event.titulo || '',
      descricao: event.descricao || '',
      tipo: event.tipo || 'workshop',
      data_evento: toDateTimeLocalValue(event.data_evento),
      data_fim: toDateTimeLocalValue(event.data_fim),
      local: event.local || '',
      endereco: event.endereco || '',
      capacidade_maxima: event.capacidade_maxima || 50,
      valor: Number(event.valor) || 0,
      eh_gratuito: Boolean(event.eh_gratuito),
      instrutor_nome: event.instrutor_nome || '',
      instrutor_bio: event.instrutor_bio || '',
      instrutor_foto: event.instrutor_foto || '',
      requisitos: event.requisitos || '',
      material_necessario: event.material_necessario || '',
      certificado: Boolean(event.certificado),
      imagem_url: event.imagem_url || '',
      link_online: event.link_online || '',
      eh_online: Boolean(event.eh_online)
    });
    setErrors({});
    setShowCreateModal(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    const newErrors = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'Título é obrigatório';
    if (!formData.data_evento) newErrors.data_evento = 'Data do evento é obrigatória';
    if (!formData.tipo) newErrors.tipo = 'Tipo de evento é obrigatório';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        data_evento: toBackendDateTime(formData.data_evento),
        data_fim: toBackendDateTime(formData.data_fim),
        capacidade_maxima: Number(formData.capacidade_maxima) || 0,
        valor: formData.eh_gratuito ? 0 : Number(formData.valor) || 0
      };

      if (editingEvent) {
        await adminApi.updateEvent(editingEvent.id, payload);
      } else {
        await adminApi.createEvent(payload);
      }

      await fetchEvents();
      setShowCreateModal(false);
      setEditingEvent(null);
      setErrors({});
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      setErrors({ submit: error.message || 'Erro ao salvar evento. Tente novamente.' });
    }
  };
  
  const handleViewSubscriptions = async (event) => {
    try {
      const response = await adminApi.getEventSubscriptions(event.id);
      setSelectedEventSubscriptions(response?.inscricoes || []);
      setShowSubscriptionsModal(true);
    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) {
      return;
    }

    try {
      await adminApi.deleteEvent(eventId);
      await fetchEvents();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert(error.message || 'Erro ao excluir evento.');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    const normalized = dateString.includes('T') ? dateString : dateString.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusColor = (event) => {
    const now = new Date();
    const eventDate = new Date(event.data_evento);
    
    if (event.status === 'cancelado') return 'bg-red-100 text-red-800';
    if (event.status === 'finalizado') return 'bg-gray-100 text-gray-800';
    if (eventDate < now) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  const getStatusText = (event) => {
    const now = new Date();
    const eventDate = new Date(event.data_evento);
    
    if (event.status === 'cancelado') return 'Cancelado';
    if (event.status === 'finalizado') return 'Finalizado';
    if (eventDate < now) return 'Expirado';
    return 'Ativo';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Eventos</h2>
          <p className="text-gray-600">Crie e gerencie workshops, palestras e cursos</p>
        </div>
        <Button onClick={handleCreateEvent} className="bg-coral hover:bg-coral/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>
      
      {/* Lista de eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 h-20 rounded"></div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{event.titulo}</h3>
                        <Badge className={getStatusColor(event)}>
                          {getStatusText(event)}
                        </Badge>
                        <Badge variant="outline">
                          {event.tipo.charAt(0).toUpperCase() + event.tipo.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{event.descricao}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(event.data_evento)}
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.eh_online ? 'Online' : event.local || 'Local a definir'}
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {event.inscricoes_confirmadas}/{event.capacidade_maxima} inscritas
                        </div>
                        
                        {event.instrutor_nome && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Instrutor: {event.instrutor_nome}
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {event.eh_gratuito ? 'Gratuito' : `R$ ${event.valor?.toFixed(2)}`}
                        </div>
                        
                        {event.certificado && (
                          <div className="flex items-center text-green-600">
                            <Award className="w-4 h-4 mr-2" />
                            Oferece certificado
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubscriptions(event)}
                        title="Ver inscrições"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                        title="Editar evento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        title="Excluir evento"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum evento cadastrado
              </h3>
              <p className="text-gray-500 mb-4">
                Crie seu primeiro evento para começar
              </p>
              <Button onClick={handleCreateEvent} className="bg-coral hover:bg-coral/90">
                <Plus className="w-4 h-4 mr-2" />
                Criar Evento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de criação/edição */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}
            </DialogTitle>
            <DialogDescription>
              {editingEvent ? 'Faça as alterações necessárias no evento selecionado.' : 'Preencha os dados para criar um novo evento na plataforma.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="titulo">Título do Evento *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Nome do evento"
                  className={errors.titulo ? 'border-red-500' : ''}
                />
                {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo de Evento *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                  <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="palestra">Palestra</SelectItem>
                    <SelectItem value="curso">Curso</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
              </div>
              
              <div>
                <Label htmlFor="capacidade_maxima">Capacidade Máxima</Label>
                <Input
                  id="capacidade_maxima"
                  type="number"
                  min="1"
                  value={formData.capacidade_maxima}
                  onChange={(e) => setFormData({...formData, capacidade_maxima: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descreva o evento, objetivos e o que será abordado"
                className="min-h-[100px]"
              />
            </div>
            
            {/* Data e local */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_evento">Data e Hora de Início *</Label>
                <Input
                  id="data_evento"
                  type="datetime-local"
                  value={formData.data_evento}
                  onChange={(e) => setFormData({...formData, data_evento: e.target.value})}
                  className={errors.data_evento ? 'border-red-500' : ''}
                />
                {errors.data_evento && <p className="text-red-500 text-sm mt-1">{errors.data_evento}</p>}
              </div>
              
              <div>
                <Label htmlFor="data_fim">Data e Hora de Término</Label>
                <Input
                  id="data_fim"
                  type="datetime-local"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="eh_online"
                checked={formData.eh_online}
                onCheckedChange={(checked) => setFormData({...formData, eh_online: checked})}
              />
              <Label htmlFor="eh_online">Evento online</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData({...formData, local: e.target.value})}
                  placeholder="Nome do local ou 'Online'"
                />
              </div>
              
              <div>
                <Label htmlFor="link_online">Link Online</Label>
                <Input
                  id="link_online"
                  value={formData.link_online}
                  onChange={(e) => setFormData({...formData, link_online: e.target.value})}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                placeholder="Rua, número, bairro, cidade - CEP"
              />
            </div>
            
            {/* Instrutor */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações do Instrutor</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instrutor_nome">Nome do Instrutor</Label>
                  <Input
                    id="instrutor_nome"
                    value={formData.instrutor_nome}
                    onChange={(e) => setFormData({...formData, instrutor_nome: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="instrutor_foto">URL da Foto</Label>
                  <Input
                    id="instrutor_foto"
                    value={formData.instrutor_foto}
                    onChange={(e) => setFormData({...formData, instrutor_foto: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="instrutor_bio">Biografia do Instrutor</Label>
                <Textarea
                  id="instrutor_bio"
                  value={formData.instrutor_bio}
                  onChange={(e) => setFormData({...formData, instrutor_bio: e.target.value})}
                  placeholder="Experiência, formação e especialidades"
                />
              </div>
            </div>
            
            {/* Valor e certificado */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="eh_gratuito"
                  checked={formData.eh_gratuito}
                  onCheckedChange={(checked) => setFormData((prev) => ({
                    ...prev,
                    eh_gratuito: checked,
                    valor: checked ? 0 : prev.valor
                  }))}
                />
                <Label htmlFor="eh_gratuito">Evento gratuito</Label>
              </div>
              
              {!formData.eh_gratuito && (
                <div className="w-full md:w-48">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value) || 0})}
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="certificado"
                  checked={formData.certificado}
                  onCheckedChange={(checked) => setFormData({...formData, certificado: checked})}
                />
                <Label htmlFor="certificado">Oferece certificado de participação</Label>
              </div>
            </div>
            
            {/* Informações adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requisitos">Requisitos</Label>
                <Textarea
                  id="requisitos"
                  value={formData.requisitos}
                  onChange={(e) => setFormData({...formData, requisitos: e.target.value})}
                  placeholder="Conhecimentos prévios necessários"
                />
              </div>
              
              <div>
                <Label htmlFor="material_necessario">Material Necessário</Label>
                <Textarea
                  id="material_necessario"
                  value={formData.material_necessario}
                  onChange={(e) => setFormData({...formData, material_necessario: e.target.value})}
                  placeholder="Materiais que os participantes devem trazer"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="imagem_url">URL da Imagem do Evento</Label>
              <Input
                id="imagem_url"
                value={formData.imagem_url}
                onChange={(e) => setFormData({...formData, imagem_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{errors.submit}</span>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-coral hover:bg-coral/90">
                {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de inscrições */}
      <Dialog open={showSubscriptionsModal} onOpenChange={setShowSubscriptionsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Inscrições do Evento</DialogTitle>
            <DialogDescription>
              Lista de todas as inscrições recebidas para este evento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedEventSubscriptions.length > 0 ? (
              <div className="space-y-3">
                {selectedEventSubscriptions.map((subscription, index) => (
                  <div key={subscription.id || index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{subscription.nome || subscription.nome_completo || 'Participante'}</h4>
                        {subscription.telefone && (
                          <p className="text-sm text-gray-600">{subscription.telefone}</p>
                        )}
                        {subscription.email && (
                          <p className="text-sm text-gray-600">{subscription.email}</p>
                        )}
                        {subscription.observacoes && (
                          <p className="text-sm text-gray-500 mt-1">{subscription.observacoes}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getSubscriptionBadgeClass(subscription.status)}>
                          {getSubscriptionStatusLabel(subscription.status)}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {subscription.created_at
                            ? new Date((subscription.created_at || subscription.data_inscricao || '').replace(' ', 'T')).toLocaleString('pt-BR')
                            : 'Data não informada'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma inscrição ainda
                </h3>
                <p className="text-gray-500">
                  As inscrições aparecerão aqui quando os usuários se cadastrarem
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
