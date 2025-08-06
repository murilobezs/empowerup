import React from 'react';
import { PageLayout } from "../components/layout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Heart, Users, Target, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const valores = [
    {
      icone: Heart,
      titulo: "Empoderamento",
      descricao: "Acreditamos no poder das mulheres empreendedoras e trabalhamos para amplificar suas vozes.",
    },
    {
      icone: Users,
      titulo: "Comunidade",
      descricao: "Criamos um ambiente colaborativo onde empreendedoras se conectam e crescem juntas.",
    },
    {
      icone: Target,
      titulo: "Inovação",
      descricao: "Utilizamos tecnologia para criar soluções que facilitam o empreendedorismo feminino.",
    },
    {
      icone: Award,
      titulo: "Qualidade",
      descricao: "Promovemos produtos e serviços de alta qualidade criados por mulheres talentosas.",
    },
  ]

  const equipe = [
    {
      nome: "Ana Carolina",
      cargo: "CEO & Fundadora",
      bio: "Empreendedora serial com mais de 10 anos de experiência em tecnologia e negócios.",
      avatar: "/placeholder.svg?height=128&width=128",
    },
    {
      nome: "Mariana Silva",
      cargo: "CTO",
      bio: "Desenvolvedora full-stack apaixonada por criar soluções que impactam positivamente a vida das pessoas.",
      avatar: "/placeholder.svg?height=128&width=128",
    },
    {
      nome: "Juliana Santos",
      cargo: "Head de Marketing",
      bio: "Especialista em marketing digital com foco em crescimento de comunidades online.",
      avatar: "/placeholder.svg?height=128&width=128",
    },
  ]

  return (
    <PageLayout 
      title="Sobre Nós" 
      description="Conheça a missão e visão do EmpowerUp"
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
              Sobre a <span className="text-primary">EmpowerUp</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Nascemos da paixão por empoderar mulheres empreendedoras e criar uma plataforma onde elas possam
              prosperar, conectar-se e transformar seus sonhos em realidade.
            </p>
          </div>
        </section>

        {/* Nossa Missão */}
        <section className="space-y-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <Badge className="bg-olive hover:bg-olive/80">Nossa Missão</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Empoderar mulheres através do empreendedorismo
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Nossa missão é criar um ecossistema digital onde mulheres empreendedoras possam prosperar. Oferecemos
                  as ferramentas, a comunidade e o suporte necessários para que cada mulher possa transformar sua paixão
                  em um negócio de sucesso.
                </p>
                <p>
                  Acreditamos que quando uma mulher empreende, ela não apenas transforma sua própria vida, mas também
                  impacta positivamente sua família, comunidade e sociedade como um todo.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Mulheres empreendedoras trabalhando juntas"
                className="rounded-lg object-cover w-full max-w-md"
              />
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="bg-muted/50 rounded-lg p-8 md:p-12 space-y-8">
          <div className="text-center space-y-4">
            <Badge className="bg-sage hover:bg-sage/80">Nossos Valores</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">O que nos move</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
              Nossos valores fundamentais guiam cada decisão e ação que tomamos na EmpowerUp
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor, index) => {
              const Icon = valor.icone
              return (
                <Card key={index} className="text-center h-full">
                  <CardContent className="p-6 space-y-4 h-full flex flex-col">
                    <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <Icon className="text-primary h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{valor.titulo}</h3>
                    <p className="text-muted-foreground flex-1">{valor.descricao}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Nossa História */}
        <section className="space-y-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="flex items-center justify-center order-2 md:order-1">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Fundação da EmpowerUp"
                className="rounded-lg object-cover w-full max-w-md"
              />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <Badge className="bg-coral-light hover:bg-coral-light/80">Nossa História</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Como tudo começou</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A EmpowerUp nasceu em 2022 da experiência pessoal de nossa fundadora, Ana Carolina, que enfrentou
                  dificuldades para divulgar seus produtos artesanais e conectar-se com outras empreendedoras.
                </p>
                <p>
                  Percebendo que muitas mulheres passavam pelos mesmos desafios, ela decidiu criar uma plataforma que
                  não apenas facilitasse a venda de produtos e serviços, mas também fomentasse uma verdadeira comunidade
                  de apoio mútuo.
                </p>
                <p>
                  Hoje, somos uma comunidade de milhares de mulheres empreendedoras que se apoiam, inspiram e crescem
                  juntas, provando que quando mulheres se unem, coisas incríveis acontecem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nossa Equipe */}
        <section className="bg-muted/30 rounded-lg p-8 md:p-12 space-y-8">
          <div className="text-center space-y-4">
            <Badge className="bg-olive hover:bg-olive/80">Nossa Equipe</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Conheça quem está por trás</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
              Uma equipe apaixonada e dedicada a empoderar mulheres empreendedoras
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {equipe.map((membro, index) => (
              <Card key={index} className="text-center h-full">
                <CardContent className="p-6 space-y-4 h-full flex flex-col">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-primary/10">
                    <img
                      src={membro.avatar || "/placeholder.svg"}
                      alt={membro.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{membro.nome}</h3>
                    <p className="text-primary font-medium">{membro.cargo}</p>
                  </div>
                  <p className="text-muted-foreground flex-1">{membro.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Estatísticas */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <Badge className="bg-coral hover:bg-coral/80">Nosso Impacto</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Números que nos orgulham</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">5,000+</div>
              <div className="text-muted-foreground">Empreendedoras</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">15,000+</div>
              <div className="text-muted-foreground">Produtos</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">50,000+</div>
              <div className="text-muted-foreground">Vendas</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">98%</div>
              <div className="text-muted-foreground">Satisfação</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-8 md:p-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Faça parte da nossa história
            </h2>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed opacity-90">
              Junte-se a milhares de mulheres empreendedoras que já estão transformando seus sonhos em realidade
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link to="/cadastro">Comece Agora</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link to="/contato">Entre em Contato</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
