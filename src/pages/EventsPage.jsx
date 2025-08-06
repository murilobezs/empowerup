import React from "react";
import { PageLayout } from "../components/layout";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

const eventos = [
  {
    id: 1,
    nome: "Workshop de Marketing Digital",
    organizador: "Maria Silva",
    tipo: "Workshop",
    descricao: "Aprenda as melhores estratégias de marketing digital para impulsionar seu negócio",
    data: "2024-02-15",
    horario: "14:00",
    local: "Online",
    participantes: 25,
    maxParticipantes: 50,
    preco: "Gratuito"
  },
  {
    id: 2,
    nome: "Networking Feminino",
    organizador: "Ana Costa",
    tipo: "Networking",
    descricao: "Conecte-se com outras empreendedoras e expanda sua rede de contatos",
    data: "2024-02-20",
    horario: "19:00",
    local: "São Paulo, SP",
    participantes: 15,
    maxParticipantes: 30,
    preco: "R$ 50"
  },
  {
    id: 3,
    nome: "Curso de Gestão Financeira",
    organizador: "Juliana Santos",
    tipo: "Curso",
    descricao: "Domine as finanças do seu negócio e tome decisões mais assertivas",
    data: "2024-02-25",
    horario: "09:00",
    local: "Online",
    participantes: 40,
    maxParticipantes: 100,
    preco: "R$ 150"
  }
];

export default function EventsPage() {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <PageLayout 
      title="Eventos" 
      description="Descubra eventos e workshops para empreendedoras"
      showBreadcrumb={true}
    >
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary text-lg px-6 py-2">
              Eventos e Workshops
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Eventos para <span className="text-primary">empreendedoras</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Participe de workshops, cursos e eventos de networking para expandir seus conhecimentos 
              e conectar-se com outras empreendedoras.
            </p>
          </div>
        </section>

        {/* Events Grid */}
        <section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento) => (
              <Card key={evento.id} className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 space-y-4 h-full flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{evento.nome}</h3>
                      <p className="text-sm text-muted-foreground">por {evento.organizador}</p>
                    </div>
                    <Badge variant="secondary">{evento.tipo}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground flex-1">{evento.descricao}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(evento.data)}</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{evento.horario}</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{evento.local}</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{evento.participantes}/{evento.maxParticipantes} participantes</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="font-semibold text-primary text-lg">{evento.preco}</span>
                    <Button size="sm">
                      Inscrever-se
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Empty State when no events */}
        {eventos.length === 0 && (
          <section className="text-center py-12">
            <div className="space-y-4">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">Nenhum evento disponível</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Estamos preparando eventos incríveis para você. Volte em breve!
              </p>
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}

