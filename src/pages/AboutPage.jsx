import React from 'react';
import { PageLayout } from "../components/layout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Heart, Users, Target, BookOpen, Search, Code, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const metodologias = [
    {
      icone: BookOpen,
      titulo: "Pesquisa Bibliográfica e Exploratória",
      descricao: "Estudamos profundamente o contexto do empreendedorismo feminino através de literatura especializada e dados de mercado.",
    },
    {
      icone: Search,
      titulo: "Pesquisa de Campo",
      descricao: "Conversamos diretamente com microempreendedoras para entender suas necessidades, desafios e oportunidades reais.",
    },
    {
      icone: Code,
      titulo: "Metodologia Aplicada e Experimental",
      descricao: "Desenvolvemos e testamos a plataforma EmpowerUp com base nos insights coletados, validando a efetividade da solução.",
    },
  ];

  const valores = [
    {
      icone: Heart,
      titulo: "Empoderamento Feminino",
      descricao: "Fortalecemos o protagonismo das mulheres no mercado de trabalho e no empreendedorismo.",
    },
    {
      icone: Users,
      titulo: "Conexão Humanizada",
      descricao: "Conectamos mulheres a clientes e parceiros por meio de uma plataforma prática e acessível.",
    },
    {
      icone: Target,
      titulo: "Desenvolvimento Integral",
      descricao: "Trabalhamos tanto o desenvolvimento pessoal quanto profissional das microempreendedoras.",
    },
    {
      icone: Lightbulb,
      titulo: "Inovação com Propósito",
      descricao: "Digitalizamos soluções de RH para ampliar o alcance e a eficiência das ações de empoderamento.",
    },
  ];

  return (
    <PageLayout 
      title="Sobre o EmpowerUp" 
      description="Conheça nossa história, missão e metodologia"
      showBreadcrumb={true}
    >
      <div className="space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-6">
            <Badge className="bg-coral hover:bg-coral/80 text-lg px-6 py-2">
              Nossa História
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Do <span className="text-coral">"Através do Espelho"</span> ao <span className="text-olive">EmpowerUp</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Uma jornada de transformação digital que amplifica o impacto do empreendedorismo feminino
            </p>
          </div>
        </section>

        {/* Nossa Origem */}
        <section className="space-y-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <Badge className="bg-olive hover:bg-olive/80">Nossa Origem</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Nascemos de uma base sólida
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  O <strong className="text-coral">EmpowerUp</strong> nasceu como um desdobramento natural do projeto 
                  <strong className="text-olive"> "Através do Espelho"</strong>, que já atuava no fortalecimento do 
                  microempreendedorismo feminino e na valorização do protagonismo das mulheres no mercado de trabalho.
                </p>
                <p>
                  A partir dessa base consolidada, surgimos com a proposta de <strong>transformar essa iniciativa em uma 
                  plataforma digital</strong>, ampliando significativamente o alcance e a eficiência das ações de empoderamento.
                </p>
                <p>
                  Hoje, os dois projetos atuam de forma <strong className="text-coral">complementar e sinérgica</strong>: 
                  o "Através do Espelho" foca no desenvolvimento pessoal e profissional presencial, enquanto o EmpowerUp 
                  digitaliza essa proposta, criando pontes digitais entre mulheres, clientes e parceiros.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-coral/20 to-olive/20 p-8 rounded-2xl">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <Users className="h-12 w-12 text-coral mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">Através do Espelho</h3>
                    <p className="text-xs text-gray-600">Desenvolvimento Presencial</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <Code className="h-12 w-12 text-olive mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">EmpowerUp</h3>
                    <p className="text-xs text-gray-600">Plataforma Digital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projeto Intercurso */}
        <section className="bg-gradient-to-r from-coral/5 to-olive/5 rounded-3xl p-8 md:p-12">
          <div className="text-center space-y-6">
            <Badge className="bg-gradient-to-r from-coral to-olive text-white">Projeto Intercurso</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              RH + Tecnologia da Informação
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              O EmpowerUp é um <strong>projeto intercurso</strong> que une as expertises de 
              <strong className="text-coral"> Recursos Humanos (RH)</strong> e 
              <strong className="text-olive"> Informática para Internet (T.I.)</strong>, 
              criando uma solução integrada e humanizada para o empreendedorismo feminino.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <Card className="border-coral/20">
                <CardContent className="p-6 text-center">
                  <Heart className="h-12 w-12 text-coral mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Recursos Humanos</h3>
                  <p className="text-gray-600">
                    Desenvolvimento pessoal e profissional, capacitação e empoderamento das microempreendedoras
                  </p>
                </CardContent>
              </Card>
              <Card className="border-olive/20">
                <CardContent className="p-6 text-center">
                  <Code className="h-12 w-12 text-olive mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Tecnologia da Informação</h3>
                  <p className="text-gray-600">
                    Plataforma digital prática, acessível e humanizada para conectar empreendedoras a oportunidades
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Metodologia */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-gray-100 text-gray-800">Nossa Metodologia</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Três Abordagens Metodológicas
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Nosso projeto foi desenvolvido com rigor científico, utilizando metodologias complementares 
              para garantir uma solução verdadeiramente efetiva.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {metodologias.map((metodologia, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coral/20 to-olive/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <metodologia.icone className="h-8 w-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{metodologia.titulo}</h3>
                  <p className="text-muted-foreground leading-relaxed">{metodologia.descricao}</p>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-coral/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-coral">{index + 1}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-olive hover:bg-olive/80 text-white">Nossos Valores</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              O que nos move
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Nossos valores refletem nosso compromisso com o empoderamento feminino e a transformação social.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {valores.map((valor, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coral/20 to-olive/20 rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <valor.icone className="h-8 w-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{valor.titulo}</h3>
                  <p className="text-muted-foreground leading-relaxed">{valor.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-coral to-olive rounded-3xl p-8 md:p-12 text-center text-white">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Faça parte desta transformação
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Junte-se à nossa comunidade de mulheres empreendedoras e descubra como podemos crescer juntas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="bg-white text-coral hover:bg-gray-100">
                <Link to="/cadastro">Começar Agora</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-coral">
                <Link to="/comunidade">Explorar Comunidade</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
