import React, { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { PageLayout } from "../components/layout";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Filter,
  Search,
  CheckCircle,
  ExternalLink,
  User,
  Award,
  DollarSign
} from "lucide-react";
import { EventSubscriptionModal } from "../components/EventSubscriptionModal";
import apiService from "../services/api";
import config from "../config/config";
import { useToast } from "../components/ui/toast";

export default function EventsPage() {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  
  // Helper function to construct image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    const baseUrl = config.API_BASE_URL.replace('/api', '');
    return `${baseUrl}/public${imagePath}`;
  };
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType) params.tipo = filterType;
      
      const response = await apiService.getEvents(params);
      
      if (response.success) {
        setEvents(response.events || []);
      } else {
        addToast('Erro ao carregar eventos', 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      addToast('Erro ao carregar eventos', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterType, addToast]);
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  const handleSubscribe = (event) => {
    if (!user) {
      addToast('Faça login para se inscrever em eventos', 'error');
      return;
    }
    
    setSelectedEvent(event);
    setShowSubscriptionModal(true);
  };
  
  const handleSubscriptionSuccess = () => {
    fetchEvents(); // Recarregar eventos para atualizar status
    setShowSubscriptionModal(false);
    setSelectedEvent(null);
  };
  
  const filteredEvents = events.filter(event =>
    event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.instrutor_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
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
  
  const getEventTypeColor = (tipo) => {
    const colors = {
      'workshop': 'bg-blue-100 text-blue-800',
      'palestra': 'bg-green-100 text-green-800',
      'curso': 'bg-purple-100 text-purple-800',
      'meetup': 'bg-orange-100 text-orange-800',
      'networking': 'bg-pink-100 text-pink-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };
  
  const getEventTypeLabel = (tipo) => {
    const labels = {
      'workshop': 'Workshop',
      'palestra': 'Palestra',
      'curso': 'Curso',
      'meetup': 'Meetup',
      'networking': 'Networking'
    };
    return labels[tipo] || tipo;
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Eventos EmpowerUp
          </h1>
          <p className="text-gray-600">
            Participe de workshops, palestras e networking para impulsionar seu empreendimento
          </p>
        </div>
        
        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tipo de evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os tipos</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="palestra">Palestra</SelectItem>
              <SelectItem value="curso">Curso</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Lista de eventos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getEventTypeColor(event.tipo)}>
                      {getEventTypeLabel(event.tipo)}
                    </Badge>
                    {event.inscrito && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Inscrito
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.titulo}
                  </h3>
                  
                  {event.imagem_url && (
                    <div className="w-full h-32 bg-gray-200 rounded-md overflow-hidden mb-3">
                      <img
                        src={getImageUrl(event.imagem_url)}
                        alt={event.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {event.descricao}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.data_evento)} às {formatTime(event.data_evento)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.eh_online ? 'Online' : event.local || 'Local a definir'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      {event.inscricoes_confirmadas}/{event.capacidade_maxima} participantes
                    </div>
                    
                    {event.instrutor_nome && (
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-2" />
                        {event.instrutor_nome}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {event.eh_gratuito ? 'Gratuito' : `R$ ${event.valor.toFixed(2)}`}
                    </div>
                    
                    {event.certificado && (
                      <div className="flex items-center text-sm text-green-600">
                        <Award className="w-4 h-4 mr-2" />
                        Oferece certificado
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {event.inscrito ? (
                      <Button variant="outline" className="flex-1" disabled>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Inscrito
                      </Button>
                    ) : event.vagas_disponiveis > 0 ? (
                      <Button 
                        onClick={() => handleSubscribe(event)}
                        className="flex-1 bg-coral hover:bg-coral/90"
                      >
                        Inscrever-se
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSubscribe(event)}
                        variant="outline" 
                        className="flex-1"
                      >
                        Lista de Espera
                      </Button>
                    )}
                    
                    {event.link_online && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={event.link_online} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType 
                ? 'Tente ajustar seus filtros de busca'
                : 'Novos eventos serão adicionados em breve!'
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Modal de inscrição */}
      {selectedEvent && (
        <EventSubscriptionModal
          event={selectedEvent}
          isOpen={showSubscriptionModal}
          onClose={() => {
            setShowSubscriptionModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleSubscriptionSuccess}
        />
      )}
    </PageLayout>
  );
}

