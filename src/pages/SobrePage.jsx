import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Heart, Users, Target, Award } from "lucide-react"
import { Link } from "react-router-dom"

export default function SobrePage() {
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
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-coral/10 to-sage/10 py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Badge className="bg-coral hover:bg-coral/80">Nossa História</Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Sobre a EmpowerUp</h1>
              <p className="max-w-[700px] text-gray-700 md:text-xl/relaxed">
                Nascemos da paixão por empoderar mulheres empreendedoras e criar uma plataforma onde elas possam
                prosperar, conectar-se e transformar seus sonhos em realidade.
              </p>
            </div>
          </div>
        </section>

        {/* Nossa Missão */}
        <section className="py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-4">
                <Badge className="bg-olive hover:bg-olive/80">Nossa Missão</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Empoderar mulheres através do empreendedorismo
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Nossa missão é criar um ecossistema digital onde mulheres empreendedoras possam prosperar. Oferecemos
                  as ferramentas, a comunidade e o suporte necessários para que cada mulher possa transformar sua paixão
                  em um negócio de sucesso.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Acreditamos que quando uma mulher empreende, ela não apenas transforma sua própria vida, mas também
                  impacta positivamente sua família, comunidade e sociedade como um todo.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=400&width=500"
                  alt="Mulheres empreendedoras trabalhando juntas"
                  className="rounded-lg object-cover w-full max-w-[500px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="py-12 md:py-24 bg-cream">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <Badge className="bg-sage hover:bg-sage/80">Nossos Valores</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">O que nos move</h2>
              <p className="max-w-[700px] text-gray-700 md:text-xl/relaxed">
                Nossos valores fundamentais guiam cada decisão e ação que tomamos na EmpowerUp
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {valores.map((valor, index) => {
                const Icon = valor.icone
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-coral/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                        <Icon className="text-coral h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold">{valor.titulo}</h3>
                      <p className="text-gray-700">{valor.descricao}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Nossa História */}
        <section className="py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=400&width=500"
                  alt="Fundação da EmpowerUp"
                  className="rounded-lg object-cover w-full max-w-[500px]"
                />
              </div>
              <div className="space-y-4">
                <Badge className="bg-coral-light hover:bg-coral-light/80">Nossa História</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Como tudo começou</h2>
                <p className="text-gray-700 leading-relaxed">
                  A EmpowerUp nasceu em 2022 da experiência pessoal de nossa fundadora, Ana Carolina, que enfrentou
                  dificuldades para divulgar seus produtos artesanais e conectar-se com outras empreendedoras.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Percebendo que muitas mulheres passavam pelos mesmos desafios, ela decidiu criar uma plataforma que
                  não apenas facilitasse a venda de produtos e serviços, mas também fomentasse uma verdadeira comunidade
                  de apoio mútuo.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Hoje, somos uma comunidade de milhares de mulheres empreendedoras que se apoiam, inspiram e crescem
                  juntas, provando que quando mulheres se unem, coisas incríveis acontecem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nossa Equipe */}
        <section className="py-12 md:py-24 bg-cream">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <Badge className="bg-olive hover:bg-olive/80">Nossa Equipe</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Conheça quem está por trás</h2>
              <p className="max-w-[700px] text-gray-700 md:text-xl/relaxed">
                Uma equipe apaixonada e dedicada a empoderar mulheres empreendedoras
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {equipe.map((membro, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
                      <img
                        src={membro.avatar || "/placeholder.svg"}
                        alt={membro.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{membro.nome}</h3>
                      <p className="text-coral font-medium">{membro.cargo}</p>
                    </div>
                    <p className="text-gray-700">{membro.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <Badge className="bg-coral hover:bg-coral/80">Nosso Impacto</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Números que nos orgulham</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-coral mb-2">5,000+</div>
                <div className="text-gray-700">Empreendedoras</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-olive mb-2">15,000+</div>
                <div className="text-gray-700">Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-sage mb-2">50,000+</div>
                <div className="text-gray-700">Vendas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-coral-light mb-2">98%</div>
                <div className="text-gray-700">Satisfação</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 bg-gradient-to-r from-coral to-coral-light text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Faça parte da nossa história</h2>
              <p className="max-w-[700px] md:text-xl/relaxed">
                Junte-se a milhares de mulheres empreendedoras que já estão transformando seus sonhos em realidade
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-white text-coral hover:bg-white/90">
                  <Link to="/cadastro">Comece Agora</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link to="/contato">Entre em Contato</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
