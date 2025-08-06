import React from "react";
import { PageLayout } from "../components/layout";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Users, MessageCircle, Lock, Globe } from "lucide-react";

const grupos = [
  {
    id: 1,
    nome: "Empreendedoras Tech",
    descricao: "Grupo para mulheres que empreendem na área de tecnologia",
    membros: 234,
    categoria: "Tecnologia",
    tipo: "Público",
    imagem: "/placeholder.svg",
    atividade: "Ativo hoje"
  },
  {
    id: 2,
    nome: "Mães Empreendedoras",
    descricao: "Rede de apoio para mães que conciliam maternidade e empreendedorismo",
    membros: 156,
    categoria: "Maternidade",
    tipo: "Privado",
    imagem: "/placeholder.svg",
    atividade: "Ativo há 2 horas"
  },
  {
    id: 3,
    nome: "Artesãs do Brasil",
    descricao: "Comunidade de artesãs para trocar experiências e dicas",
    membros: 89,
    categoria: "Artesanato",
    tipo: "Público",
    imagem: "/placeholder.svg",
    atividade: "Ativo ontem"
  }
];

export default function GroupsPage() {
  return (
    <PageLayout 
      title="Grupos" 
      description="Encontre e participe de grupos de empreendedoras"
      showBreadcrumb={true}
    >
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary text-lg px-6 py-2">
              Comunidades
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Grupos de <span className="text-primary">empreendedoras</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Conecte-se com outras empreendedoras, compartilhe experiências e cresça junto com 
              uma comunidade que entende seus desafios e conquistas.
            </p>
          </div>
        </section>

        {/* Groups Grid */}
        <section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {grupos.map((grupo) => (
              <Card key={grupo.id} className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 space-y-4 h-full flex flex-col">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={grupo.imagem || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                        {grupo.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg leading-tight">{grupo.nome}</h3>
                        <div className="flex items-center ml-2">
                          {grupo.tipo === "Privado" ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="mt-1">{grupo.categoria}</Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground flex-1">{grupo.descricao}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{grupo.membros} membros</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{grupo.atividade}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Participar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Empty State when no groups */}
        {grupos.length === 0 && (
          <section className="text-center py-12">
            <div className="space-y-4">
              <Users className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">Nenhum grupo disponível</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Seja a primeira a criar um grupo para sua área de interesse!
              </p>
              <Button>
                Criar Grupo
              </Button>
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}
