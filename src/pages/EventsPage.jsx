import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import config from "../config/config";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
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
  DollarSign,
  ArrowLeft
} from "lucide-react";
import { EventSubscriptionModal } from "../components/EventSubscriptionModal";
import apiService from "../services/api";
import { useToast } from "../components/ui/toast";
import CommunityLeftSidebar from "../components/layout/CommunityLeftSidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Clock, Info } from "lucide-react";

function EventsHeader({ user, logout }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center transition-opacity hover:opacity-80">
            <img src="/logo-sem-fundo.png" alt="EmpowerUp" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Calendar className="h-6 w-6 text-coral" />
            Eventos
          </div>
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full p-2 transition-colors hover:bg-gray-100">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.avatar_url ? config.getPublicUrl(user.avatar_url) : user.foto_perfil || ""}
                  alt={user.nome}
                />
                <AvatarFallback className="bg-coral text-sm font-medium text-white">
                  {user?.nome?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
              <span className="hidden font-medium text-gray-900 sm:block">{user?.nome}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2 w-56">
              <DropdownMenuItem onClick={() => navigate("/perfil")} className="cursor-pointer">
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout?.();
                  navigate("/");
                }}
                className="cursor-pointer text-red-600"
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Entrar</Button>
        )}
      </div>
    </header>
  );
}

export default function EventsPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const ALL_EVENT_TYPES_VALUE = 'all';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        status: "ativo",
        limit: 50,
      };

      if (filterType) {
        params.tipo = filterType;
      }

      const response = await apiService.getEvents(params);

      console.log('Response completa dos eventos:', response);

      if (response?.success) {
        const payloadEvents =
          response.events ||
          response.eventos ||
          response.data?.events ||
          response.data?.eventos ||
          [];
        
        console.log('Eventos extraídos:', payloadEvents);
        console.log('Total de eventos:', Array.isArray(payloadEvents) ? payloadEvents.length : 0);
        
        setEvents(Array.isArray(payloadEvents) ? payloadEvents : []);
      } else {
        console.error('Resposta sem success:', response);
        setEvents([]);
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filterType]);
  
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

  const handleViewDetails = (event) => {
    setEventDetails(event);
    setShowDetailsModal(true);
  };

  const handleSubscribeFromDetails = () => {
    setShowDetailsModal(false);
    if (eventDetails) {
      handleSubscribe(eventDetails);
    }
  };
  
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredEvents = useMemo(() => {
    const now = new Date();

    const matchSearch = (event) => {
      if (!normalizedSearch) return true;
      const title = (event.titulo || "").toLowerCase();
      const description = (event.descricao || "").toLowerCase();
      const instructor = (event.instrutor_nome || "").toLowerCase();
      return (
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        instructor.includes(normalizedSearch)
      );
    };

    const parsedEvents = Array.isArray(events) ? events : [];

    const sorted = [...parsedEvents].sort((a, b) => {
      const dateA = new Date(a.data_evento || 0);
      const dateB = new Date(b.data_evento || 0);

      const isFutureA = dateA >= now;
      const isFutureB = dateB >= now;

      if (isFutureA !== isFutureB) {
        return isFutureA ? -1 : 1;
      }

      return dateA - dateB;
    });

    return sorted.filter(matchSearch);
  }, [events, normalizedSearch]);
  
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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-coral/5 to-olive/5 text-gray-800">
      <EventsHeader user={user} logout={logout} />

      <main className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <CommunityLeftSidebar active="eventos" />

          <section className="lg:col-span-9">
            <div className="space-y-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/comunidade")}
                  className="w-full justify-start gap-2 sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para a comunidade
                </Button>
              </div>

              <section className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-coral/10 p-8 shadow-sm ring-1 ring-sky-100/60">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <Badge className="bg-coral/10 text-coral">Experiências ao vivo</Badge>
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Eventos EmpowerUp</h1>
                    <p className="max-w-2xl text-base text-gray-600">
                      Participe de workshops, palestras e encontros de networking para impulsionar o seu negócio e criar conexões genuínas.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-inner ring-1 ring-gray-100">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-coral" />
                      <span>Acompanhe as agendas, garanta sua vaga e receba lembretes personalizados.</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-4 rounded-2xl border border-dashed border-gray-200 bg-white/80 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">Filtrar programação</h2>
                  <p className="text-sm text-gray-500">
                    Busque por temas, instrutoras ou formatos para encontrar o evento ideal para você.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar eventos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select
                    value={filterType || ALL_EVENT_TYPES_VALUE}
                    onValueChange={(value) => setFilterType(value === ALL_EVENT_TYPES_VALUE ? "" : value)}
                  >
                    <SelectTrigger className="w-full sm:w-56">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Tipo de evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_EVENT_TYPES_VALUE}>Todos os tipos</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="palestra">Palestra</SelectItem>
                      <SelectItem value="curso">Curso</SelectItem>
                      <SelectItem value="meetup">Meetup</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section>
                {loading ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                          <div className="h-3 w-1/2 rounded bg-gray-200" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="h-3 rounded bg-gray-200" />
                            <div className="h-3 w-5/6 rounded bg-gray-200" />
                            <div className="h-8 rounded bg-gray-200" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => {
                      const confirmed = event.inscricoes_confirmadas ?? 0;
                      const capacity = event.capacidade_maxima ?? event.capacidade ?? 0;
                      const spotsAvailable = event.vagas_disponiveis ?? Math.max(capacity - confirmed, 0);
                      const priceLabel = event.eh_gratuito
                        ? "Gratuito"
                        : `R$ ${Number(event.valor ?? 0).toFixed(2)}`;
                      const isSubscribed = Boolean(event.inscrito);
                      const hasSpots = spotsAvailable > 0;

                      return (
                        <Card key={event.id} className="transition-shadow duration-200 hover:shadow-lg">
                          <CardHeader>
                            <div className="mb-2 flex items-start justify-between">
                              <Badge className={getEventTypeColor(event.tipo)}>
                                {getEventTypeLabel(event.tipo)}
                              </Badge>
                              {isSubscribed && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Inscrita
                                </Badge>
                              )}
                            </div>

                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                              {event.titulo}
                            </h3>

                            {event.imagem_url && (
                              <div className="mb-3 h-32 w-full overflow-hidden rounded-md bg-gray-200">
                                <img
                                  src={config.getPublicUrl(event.imagem_url)}
                                  alt={event.titulo}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                          </CardHeader>

                          <CardContent>
                            <p className="mb-4 line-clamp-3 text-sm text-gray-600">{event.descricao}</p>

                            <div className="mb-4 space-y-2">
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="mr-2 h-4 w-4" />
                                {formatDate(event.data_evento)} às {formatTime(event.data_evento)}
                              </div>

                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="mr-2 h-4 w-4" />
                                {event.eh_online ? "Online" : event.local || "Local a definir"}
                              </div>

                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="mr-2 h-4 w-4" />
                                {confirmed}/{capacity} participantes
                              </div>

                              {event.instrutor_nome && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <User className="mr-2 h-4 w-4" />
                                  {event.instrutor_nome}
                                </div>
                              )}

                              <div className="flex items-center text-sm text-gray-500">
                                <DollarSign className="mr-2 h-4 w-4" />
                                {priceLabel}
                              </div>

                              {event.certificado && (
                                <div className="flex items-center text-sm text-green-600">
                                  <Award className="mr-2 h-4 w-4" />
                                  Oferece certificado
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                {isSubscribed ? (
                                  <Button variant="outline" className="flex-1" disabled>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Inscrita
                                  </Button>
                                ) : hasSpots ? (
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
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>

                              <Button
                                onClick={() => handleViewDetails(event)}
                                variant="ghost"
                                className="w-full text-coral hover:bg-coral/10 hover:text-coral/80"
                                size="sm"
                              >
                                <Info className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-12 text-center shadow-sm">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Nenhum evento encontrado</h3>
                    <p className="text-gray-500">
                      {searchTerm || filterType
                        ? "Tente ajustar seus filtros de busca"
                        : "Novos eventos serão adicionados em breve!"}
                    </p>
                  </div>
                )}
              </section>
            </div>
          </section>
        </div>
      </main>

      {/* Modal de Detalhes do Evento */}
      {eventDetails && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {eventDetails.titulo}
                  </DialogTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getEventTypeColor(eventDetails.tipo)}>
                      {getEventTypeLabel(eventDetails.tipo)}
                    </Badge>
                    {eventDetails.inscrito && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Inscrita
                      </Badge>
                    )}
                    {eventDetails.eh_gratuito && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Gratuito
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Imagem */}
              {eventDetails.imagem_url && (
                <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={config.getPublicUrl(eventDetails.imagem_url)}
                    alt={eventDetails.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Descrição */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sobre o Evento</h3>
                <p className="text-gray-600 leading-relaxed">{eventDetails.descricao}</p>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm">
                  <Calendar className="w-5 h-5 mr-3 text-coral" />
                  <div>
                    <p className="font-medium text-gray-900">Data</p>
                    <p className="text-gray-600">
                      {formatDate(eventDetails.data_evento)} às {formatTime(eventDetails.data_evento)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <MapPin className="w-5 h-5 mr-3 text-coral" />
                  <div>
                    <p className="font-medium text-gray-900">Local</p>
                    <p className="text-gray-600">
                      {eventDetails.eh_online ? 'Online' : eventDetails.local || 'A definir'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Users className="w-5 h-5 mr-3 text-coral" />
                  <div>
                    <p className="font-medium text-gray-900">Participantes</p>
                    <p className="text-gray-600">
                      {eventDetails.inscricoes_confirmadas || 0}/{eventDetails.capacidade_maxima} inscritas
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <DollarSign className="w-5 h-5 mr-3 text-coral" />
                  <div>
                    <p className="font-medium text-gray-900">Investimento</p>
                    <p className="text-gray-600">
                      {eventDetails.eh_gratuito ? 'Gratuito' : `R$ ${Number(eventDetails.valor || 0).toFixed(2)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instrutor */}
              {eventDetails.instrutor_nome && (
                <div className="p-4 bg-olive/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Instrutor(a)
                  </h3>
                  <p className="font-medium text-gray-900">{eventDetails.instrutor_nome}</p>
                  {eventDetails.instrutor_bio && (
                    <p className="text-gray-600 mt-2 text-sm">{eventDetails.instrutor_bio}</p>
                  )}
                </div>
              )}

              {/* Requisitos */}
              {eventDetails.requisitos && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Requisitos</h3>
                  <p className="text-gray-600 text-sm">{eventDetails.requisitos}</p>
                </div>
              )}

              {/* Material Necessário */}
              {eventDetails.material_necessario && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Material Necessário</h3>
                  <p className="text-gray-600 text-sm">{eventDetails.material_necessario}</p>
                </div>
              )}

              {/* Certificado */}
              {eventDetails.certificado && (
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <Award className="w-6 h-6 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Certificado de Participação</p>
                    <p className="text-green-700 text-sm">Este evento oferece certificado de conclusão</p>
                  </div>
                </div>
              )}

              {/* Link Online */}
              {eventDetails.link_online && (
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <ExternalLink className="w-6 h-6 mr-3 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">Link do Evento</p>
                    <a 
                      href={eventDetails.link_online} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline break-all"
                    >
                      {eventDetails.link_online}
                    </a>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4 border-t">
                {!eventDetails.inscrito ? (
                  <>
                    <Button 
                      onClick={handleSubscribeFromDetails}
                      className="flex-1 bg-coral hover:bg-coral/90"
                    >
                      Inscrever-se no Evento
                    </Button>
                    <Button 
                      onClick={() => setShowDetailsModal(false)}
                      variant="outline"
                    >
                      Fechar
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1"
                    variant="outline"
                  >
                    Fechar
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
    </div>
  );
}

