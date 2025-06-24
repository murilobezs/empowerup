"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useAuth } from "../contexts/AuthContext"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    lembrar: false,
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e, tipo) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost/empowerup/api/auth/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.senha
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        login(data.user)
        navigate('/comunidade')
      } else {
        alert(data.message || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao conectar com o servidor')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12 bg-cream">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Bem-vinda de volta</h1>
              <p className="text-gray-700">Entre na sua conta para acessar sua área exclusiva</p>
            </div>
            <Tabs defaultValue="empreendedora" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="empreendedora">Empreendedora</TabsTrigger>
                <TabsTrigger value="cliente">Cliente</TabsTrigger>
              </TabsList>
              <TabsContent value="empreendedora">
                <Card>
                  <CardHeader>
                    <CardTitle>Área da Empreendedora</CardTitle>
                    <CardDescription>
                      Acesse sua conta para gerenciar seus produtos e conectar-se com outras empreendedoras.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={(e) => handleSubmit(e, "empreendedora")}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-empreendedora">Email</Label>
                        <Input
                          id="email-empreendedora"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="senha-empreendedora">Senha</Label>
                          <Link to="/recuperar-senha" className="text-sm text-coral hover:underline">
                            Esqueceu a senha?
                          </Link>
                        </div>
                        <Input
                          id="senha-empreendedora"
                          name="senha"
                          type="password"
                          value={formData.senha}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lembrar-empreendedora"
                          name="lembrar"
                          checked={formData.lembrar}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, lembrar: checked }))}
                        />
                        <Label htmlFor="lembrar-empreendedora">Lembrar de mim</Label>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full bg-coral hover:bg-coral/90">
                        Entrar
                      </Button>
                      <div className="text-center text-sm">
                        Ainda não tem uma conta?{" "}
                        <Link to="/cadastro" className="text-coral hover:underline">
                          Cadastre-se
                        </Link>
                      </div>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              <TabsContent value="cliente">
                <Card>
                  <CardHeader>
                    <CardTitle>Área do Cliente</CardTitle>
                    <CardDescription>Acesse sua conta para explorar produtos e serviços exclusivos.</CardDescription>
                  </CardHeader>
                  <form onSubmit={(e) => handleSubmit(e, "cliente")}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-cliente">Email</Label>
                        <Input
                          id="email-cliente"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="senha-cliente">Senha</Label>
                          <Link to="/recuperar-senha" className="text-sm text-coral hover:underline">
                            Esqueceu a senha?
                          </Link>
                        </div>
                        <Input
                          id="senha-cliente"
                          name="senha"
                          type="password"
                          value={formData.senha}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lembrar-cliente"
                          name="lembrar"
                          checked={formData.lembrar}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, lembrar: checked }))}
                        />
                        <Label htmlFor="lembrar-cliente">Lembrar de mim</Label>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full bg-olive hover:bg-olive/90">
                        Entrar
                      </Button>
                      <div className="text-center text-sm">
                        Ainda não tem uma conta?{" "}
                        <Link to="/cadastro" className="text-olive hover:underline">
                          Cadastre-se
                        </Link>
                      </div>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
