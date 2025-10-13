import React, { useRef } from 'react';
import { PageLayout } from "../components/layout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Heart, Users, Target, BookOpen, Search, Code, Lightbulb, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { cn } from "../lib/utils";

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

  const rhTeam = [
    { nome: "Lívia Alves Ramos", foto: "/images/members/liviaalves.jpg" },
    { nome: "Luane Perez Silva" },
    { nome: "Lucia Helena Rocha Lira", foto: "/images/members/lucia.jpg" },
    { nome: "Maria Luiza Ribeiro Rodrigues", foto: "/images/members/marialuiza.jpg" },
    { nome: "Susana Santos Tristão", foto: "/images/members/susana.PNG" },
    { nome: "Victor Leanni Vieira", foto: "/images/members/victor.jpg" },
  ];

  const devTeam = [
    { nome: "Murilo Bezerra da Silva", papel: "Desenvolvedor Full-Stack · Documentador", foto: "/images/members/murilo.jpg" },
    { nome: "Nicolas Lima Albuquerque", papel: "Desenvolvedor do Marketplace", foto: "/images/members/nicolas.jpg" },
    { nome: "Pedro Carneiro Santos", papel: "Desenvolvedor do Marketplace", foto: "/images/members/pedro.jpg" },
    { nome: "Raquel Pereira Araujo", papel: "Documentadora · Desenvolvedora Full-Stack", foto: "/images/members/raquel.jpg" },
    { nome: "Ryllary Victória Barroso", papel: "Documentadora", foto: "/images/members/ryllary.jpg" },
  ];

  const teamGroups = [
    {
      id: 'rh',
      titulo: 'Através do Espelho · Recursos Humanos',
      subtitulo: 'Estudantes do 3º ano B da Etec Professora Maria Cristina Medeiros',
      descricao: 'Responsáveis por transformar acolhimento, desenvolvimento de pessoas e pesquisas de campo em estratégias que inspiram nossa comunidade.',
      membros: rhTeam,
      accent: 'from-coral/50 via-rose-200/40 to-white/30',
    },
    {
      id: 'devs',
      titulo: 'Equipe EmpowerUp · Tecnologia',
      subtitulo: 'Time de desenvolvimento responsável pela experiência digital da plataforma',
      descricao: 'Criamos, codamos e mantemos o ecossistema EmpowerUp com foco em impacto, acessibilidade e inovação para empreendedoras.',
      membros: devTeam,
      accent: 'from-olive/40 via-sky-200/40 to-white/20',
    },
  ];

  const heroRef = useScrollReveal({ threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
  const origemRef = useScrollReveal({ delay: 80, stagger: 120 });
  const projetoRef = useScrollReveal({ delay: 120, stagger: 120 });
  const metodologiaRef = useScrollReveal({ delay: 160, stagger: 90 });
  const valoresRef = useScrollReveal({ delay: 200, stagger: 90 });
  const equipesRef = useScrollReveal({ delay: 220, stagger: 110 });
  const ctaRef = useScrollReveal({ delay: 260 });
  const carouselRefs = useRef({});

  const getInitials = (nome = '') => {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('') || '?';
  };

  const TeamCard = ({ membro, accent, className = '' }) => {
    return (
      <div
        data-reveal-child
        data-carousel-item
        className={cn(
          "group relative min-w-[240px] snap-center overflow-hidden rounded-3xl border border-white/50 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/60 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/40",
          className
        )}
      >
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral/40 to-olive/40 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Avatar className="h-20 w-20 border-2 border-white/70 shadow-lg">
              {membro.foto ? (
                <AvatarImage src={membro.foto} alt={membro.nome} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-coral/70 via-white/40 to-olive/60 text-lg font-semibold text-white">
                  {getInitials(membro.nome)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {membro.nome}
            </h4>
            {membro.papel && (
              <p className="text-sm font-medium text-coral/90 dark:text-coral/80">
                {membro.papel}
              </p>
            )}
            {membro.bio && (
              <p className="text-sm text-muted-foreground">
                {membro.bio}
              </p>
            )}
          </div>
        </div>
        <div className="absolute -top-10 right-4 h-24 w-24 rounded-full bg-white/20 blur-3xl transition-all duration-300 group-hover:scale-125 group-hover:bg-white/40" />
      </div>
    );
  };

  const scrollCarousel = (groupId, direction = 1) => {
    const container = carouselRefs.current[groupId];
    if (!container) return;

    const firstItem = container.querySelector('[data-carousel-item]');
    const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : 280;
    const gap = parseInt(getComputedStyle(container).columnGap || getComputedStyle(container).gap || '16', 10);

    container.scrollBy({
      left: (itemWidth + gap) * direction,
      behavior: 'smooth',
    });
  };

  return (
    <PageLayout 
      title="Sobre o EmpowerUp" 
      description="Conheça nossa história, missão e metodologia"
      showBreadcrumb={true}
    >
      <div className="space-y-20">
        {/* Hero Section */}
        <section ref={heroRef} data-reveal className="text-center space-y-8">
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
        <section ref={origemRef} data-reveal className="space-y-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div data-reveal-child className="space-y-6">
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
            <div data-reveal-child className="flex items-center justify-center">
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
        <section ref={projetoRef} data-reveal className="bg-gradient-to-r from-coral/5 to-olive/5 rounded-3xl p-8 md:p-12">
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
              <Card data-reveal-child className="border-coral/20">
                <CardContent className="p-6 text-center">
                  <Heart className="h-12 w-12 text-coral mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Recursos Humanos</h3>
                  <p className="text-gray-600">
                    Desenvolvimento pessoal e profissional, capacitação e empoderamento das microempreendedoras
                  </p>
                </CardContent>
              </Card>
              <Card data-reveal-child className="border-olive/20">
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
        <section ref={metodologiaRef} data-reveal className="space-y-12">
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
              <Card key={index} data-reveal-child className="relative overflow-hidden group hover:shadow-lg transition-shadow">
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
        <section ref={valoresRef} data-reveal className="space-y-12">
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
              <Card key={index} data-reveal-child className="text-center group hover:shadow-lg transition-all hover:-translate-y-1">
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

        {/* Equipe */}
        <section ref={equipesRef} data-reveal className="space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-coral shadow-md ring-1 ring-coral/30">
              <Sparkles className="h-4 w-4" />
              Nossa Rede de Talentos
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pessoas que tornam o EmpowerUp possível
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Da sala de aula à experiência digital, unimos equipe de Recursos Humanos e desenvolvimento para entregar uma plataforma acolhedora, estratégica e feita por estudantes apaixonados por impacto.
            </p>
          </div>

          <div className="space-y-12">
            {teamGroups.map((grupo) => (
              <div key={grupo.id} className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">{grupo.titulo}</h3>
                    <p className="text-sm uppercase tracking-[0.2em] text-coral/80">{grupo.subtitulo}</p>
                    <p className="text-base text-muted-foreground max-w-3xl">{grupo.descricao}</p>
                  </div>
                 
                </div>

                <div className="relative">
                  <div
                    ref={(el) => {
                      if (el) carouselRefs.current[grupo.id] = el;
                    }}
                    className="flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 snap-x md:px-6 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {grupo.membros.map((membro) => (
                      <TeamCard
                        key={`${grupo.id}-${membro.nome}`}
                        membro={membro}
                        accent={grupo.accent}
                        className="md:min-w-[260px] lg:min-w-[280px] xl:min-w-[320px]"
                      />
                    ))}
                  </div>

                  <div className="pointer-events-none hidden md:block">
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/70 to-transparent dark:from-slate-900 dark:via-slate-900/80" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/70 to-transparent dark:from-slate-900 dark:via-slate-900/80" />
                  </div>

                  <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={() => scrollCarousel(grupo.id, -1)}
                      className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-coral shadow-lg ring-1 ring-coral/20 transition hover:bg-white"
                      aria-label={`Scroll ${grupo.titulo} para a esquerda`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel(grupo.id, 1)}
                      className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-coral shadow-lg ring-1 ring-coral/20 transition hover:bg-white"
                      aria-label={`Scroll ${grupo.titulo} para a direita`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section ref={ctaRef} data-reveal className="bg-gradient-to-r from-coral to-olive rounded-3xl p-8 md:p-12 text-center text-white">
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
