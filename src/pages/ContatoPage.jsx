"use client"

import { useState } from "react"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Formulário enviado:", formData)
    // Aqui você implementaria o envio do formulário
    alert("Mensagem enviada com sucesso! Entraremos em contato em breve.")
    setFormData({ nome: "", email: "", assunto: "", mensagem: "" })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-cream py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Entre em Contato</h1>
              <p className="max-w-[700px] text-gray-700 md:text-xl/relaxed">
                Estamos aqui para ajudar! Entre em contato conosco e tire suas dúvidas sobre a plataforma EmpowerUp.
              </p>
            </div>
          </div>
        </section>

        <div className="container px-4 md:px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Formulário de contato */}
            <Card>
              <CardHeader>
                <CardTitle>Envie sua mensagem</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e nossa equipe entrará em contato com você em breve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assunto">Assunto</Label>
                    <Input
                      id="assunto"
                      name="assunto"
                      type="text"
                      placeholder="Qual o assunto da sua mensagem?"
                      value={formData.assunto}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      placeholder="Escreva sua mensagem aqui..."
                      value={formData.mensagem}
                      onChange={handleInputChange}
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-coral hover:bg-coral/90">
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Informações de contato */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>Outras formas de entrar em contato conosco</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-coral/10 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-coral" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">contato@empowerup.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-olive/10 p-2 rounded-full">
                      <Phone className="h-5 w-5 text-olive" />
                    </div>
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">(11) 9999-9999</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-sage/10 p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-sage" />
                    </div>
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-sm text-muted-foreground">São Paulo, SP - Brasil</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-coral-light/10 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-coral-light" />
                    </div>
                    <div>
                      <p className="font-medium">Horário de Atendimento</p>
                      <p className="text-sm text-muted-foreground">Segunda a Sexta: 9h às 18h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Perguntas Frequentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Como faço para vender na plataforma?</h4>
                    <p className="text-sm text-muted-foreground">
                      Cadastre-se como empreendedora e crie seus anúncios na área do dashboard.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">A plataforma é gratuita?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sim! O cadastro e uso básico da plataforma são totalmente gratuitos.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Como entro em contato com uma vendedora?</h4>
                    <p className="text-sm text-muted-foreground">
                      Use o sistema de mensagens interno da plataforma para se comunicar com segurança.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
