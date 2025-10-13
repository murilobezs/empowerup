import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { ArrowRight, Heart, Users, ShoppingBag, Star } from "lucide-react"
import { Link } from "react-router-dom"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { FloatingPlusBackdrop } from "../components/common"

export default function HomePage() {
  const categorias = [
    { nome: "Artesanato", icone: "🎨" },
    { nome: "Moda", icone: "👗" },
    { nome: "Beleza", icone: "💄" },
    { nome: "Gastronomia", icone: "🍰" },
    { nome: "Casa", icone: "🏠" },
    { nome: "Serviços", icone: "⚡" },
  ]

  const produtosDestaque = [
    {
      id: 1,
      nome: "Bolsa Artesanal",
      preco: 129.9,
      imagem: "/placeholder.svg?height=300&width=300",
      vendedora: "Ana Silva",
    },
    {
      id: 2,
      nome: "Colar Exclusivo",
      preco: 89.9,
      imagem: "/placeholder.svg?height=300&width=300",
      vendedora: "Maria Santos",
    },
    {
      id: 3,
      nome: "Vaso Decorativo",
      preco: 159.9,
      imagem: "/placeholder.svg?height=300&width=300",
      vendedora: "Carla Oliveira",
    },
    {
      id: 4,
      nome: "Sabonete Natural",
      preco: 25.9,
      imagem: "/placeholder.svg?height=300&width=300",
      vendedora: "Juliana Costa",
    },
  ]

  const depoimentos = [
    {
      nome: "Ana Silva",
      texto: "A EmpowerUp transformou meu pequeno negócio. Consegui triplicar minhas vendas!",
      avaliacao: 5,
    },
    {
      nome: "Maria Santos",
      texto: "Encontrei uma comunidade incrível de mulheres que me apoiam e inspiram.",
      avaliacao: 5,
    },
    {
      nome: "Carla Oliveira",
      texto: "Plataforma perfeita para divulgar meus produtos artesanais.",
      avaliacao: 4,
    },
  ]

  const heroRef = useScrollReveal({ threshold: 0.2, rootMargin: "0px 0px -5% 0px" })
  const categoriasRef = useScrollReveal({ delay: 80, stagger: 70 })
  const produtosRef = useScrollReveal({ delay: 120, stagger: 80 })
  const motivosRef = useScrollReveal({ delay: 100, stagger: 90 })
  const depoimentosRef = useScrollReveal({ delay: 100, stagger: 90 })
  const ctaRef = useScrollReveal({ delay: 60 })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
  <section ref={heroRef} data-reveal className="relative isolate overflow-hidden pt-4 pb-12 md:pt-12 md:pb-20 bg-cream">
          <FloatingPlusBackdrop className="opacity-80" />
          <div className="relative z-10 container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-5">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Empodere seu Negócio, Conecte-se com Clientes
                </h1>
                <p className="max-w-[620px] text-gray-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A plataforma exclusiva para mulheres empreendedoras. Venda seus produtos, ofereça serviços e faça
                  parte de uma comunidade que cresce junto com você.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-coral hover:bg-coral/90">
                    <Link to="/cadastro">Comece Gratuitamente</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="hover:text-white">
                    <Link to="https://marketplace.empowerup.com.br">Explorar Marketplace</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[520px] aspect-square">
                  <img
                    src="/logo-sem-fundo.png?height=500&width=500"
                    alt="Mulheres empreendedoras"
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
  </section>

        {/* Categorias */}
        <section ref={categoriasRef} data-reveal className="py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Explore por Categoria</h2>
              <p className="max-w-[700px] text-gray-700 md:text-xl/relaxed">
                Descubra produtos e serviços únicos criados por mulheres empreendedoras talentosas
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-12">
              {categorias.map((categoria) => (
                <Card
                  key={categoria.nome}
                  data-reveal-child
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <Link to={`https://marketplace.empowerup.com.br?categoria=${categoria.nome.toLowerCase()}`}>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-2">{categoria.icone}</div>
                      <h3 className="font-medium">{categoria.nome}</h3>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Produtos em Destaque */}
        <section ref={produtosRef} data-reveal className="py-12 md:py-24 bg-cream">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Produtos em Destaque</h2>
              <p className="max-w-[700px] text-gray-700 md:text-xl/relaxed">
                Conheça alguns dos produtos mais populares da nossa plataforma
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {produtosDestaque.map((produto) => (
                <Card key={produto.id} data-reveal-child className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={produto.imagem || "/placeholder.svg"}
                      alt={produto.nome}
                      className="object-cover w-full aspect-square"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{produto.nome}</h3>
                    <p className="text-sm text-gray-700 mb-2">por {produto.vendedora}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-coral">R$ {produto.preco.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-olive hover:text-olive/80 hover:bg-olive/10"
                        asChild
                      >
                        <Link to={`https://marketplace.empowerup.com.br/produto/${produto.id}`}>
                          Ver detalhes <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button asChild className="bg-olive hover:bg-olive/90">
                <Link to="https://marketplace.empowerup.com.br">Ver Todos os Produtos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Por que escolher */}
        <section ref={motivosRef} data-reveal className="py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Por que escolher a EmpowerUp?
              </h2>
              <p className="max-w-[700px] text-gray-700 md:text-xl/relaxed">
                Uma plataforma feita por mulheres, para mulheres empreendedoras
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card data-reveal-child className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-coral/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <Heart className="text-coral h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Comunidade Exclusiva</h3>
                  <p className="text-gray-700">
                    Faça parte de uma rede de mulheres empreendedoras que se apoiam mutuamente
                  </p>
                </CardContent>
              </Card>
              <Card data-reveal-child className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-olive/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <Users className="text-olive h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Visibilidade Ampliada</h3>
                  <p className="text-gray-700">
                    Alcance mais clientes e aumente suas vendas com nossa plataforma otimizada
                  </p>
                </CardContent>
              </Card>
              <Card data-reveal-child className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-sage/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <ShoppingBag className="text-sage h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Ferramentas Completas</h3>
                  <p className="text-gray-700">Gerencie produtos, pedidos e comunicações em um só lugar</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section ref={depoimentosRef} data-reveal className="py-12 md:py-24 bg-cream">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                O que nossas empreendedoras dizem
              </h2>
              <p className="max-w-[700px] text-gray-700 md:text-xl/relaxed">
                Histórias reais de sucesso na nossa plataforma
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {depoimentos.map((depoimento, index) => (
                <Card key={index} data-reveal-child>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < depoimento.avaliacao ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 italic">"{depoimento.texto}"</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                        <span className="font-semibold text-coral">{depoimento.nome.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{depoimento.nome}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section ref={ctaRef} data-reveal className="py-12 md:py-24 bg-gradient-to-r from-coral to-coral-light text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Pronta para começar?</h2>
              <p className="max-w-[700px] md:text-xl/relaxed">
                Junte-se a milhares de mulheres empreendedoras que já estão crescendo com a EmpowerUp
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-white text-coral hover:bg-white/90">
                  <Link to="/cadastro">Cadastre-se Gratuitamente</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white hover:bg-white/10 hover:text-white">
                  <Link to="/sobre">Saiba Mais</Link>
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
