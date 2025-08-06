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
import { Textarea } from "../components/ui/textarea"
import { useAuth } from "../contexts/AuthContext"

export default function CadastroPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    bio: "",
    termos: false,
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
    
    // Validação de senha
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem')
      return
    }

    if (!formData.termos) {
      alert('Você deve aceitar os termos de uso')
      return
    }
    
    try {
      const result = await register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone,
        bio: formData.bio,
        tipo
      });
      
      if (result.success) {
        // Redirecionar para a página de comunidade após cadastro bem-sucedido
        navigate('/comunidade');
      } else {
        alert(result.message || 'Erro ao cadastrar');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor');
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12 bg-cream">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Junte-se à EmpowerUp</h1>
              <p className="text-gray-700">Crie sua conta e comece a empreender hoje mesmo</p>
            </div>
            <Tabs defaultValue="empreendedora" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="empreendedora">Empreendedora</TabsTrigger>
                <TabsTrigger value="cliente">Cliente</TabsTrigger>
              </TabsList>
              <TabsContent value="empreendedora">
                <Card>
                  <CardHeader>
                    <CardTitle>Cadastro de Empreendedora</CardTitle>
                    <CardDescription>
                      Crie sua conta para vender produtos e conectar-se com outras empreendedoras.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={(e) => handleSubmit(e, "empreendedora")}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome-empreendedora">Nome completo</Label>
                        <Input
                          id="nome-empreendedora"
                          name="nome"
                          type="text"
                          placeholder="Seu nome completo"
                          value={formData.nome}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
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
                        <Label htmlFor="telefone-empreendedora">Telefone</Label>
                        <Input
                          id="telefone-empreendedora"
                          name="telefone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio-empreendedora">Sobre você e seu negócio</Label>
                        <Textarea
                          id="bio-empreendedora"
                          name="bio"
                          placeholder="Conte um pouco sobre você e seus produtos/serviços..."
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senha-empreendedora">Senha</Label>
                        <Input
                          id="senha-empreendedora"
                          name="senha"
                          type="password"
                          value={formData.senha}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmar-senha-empreendedora">Confirmar senha</Label>
                        <Input
                          id="confirmar-senha-empreendedora"
                          name="confirmarSenha"
                          type="password"
                          value={formData.confirmarSenha}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="termos-empreendedora"
                          name="termos"
                          checked={formData.termos}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, termos: checked }))}
                        />
                        <Label htmlFor="termos-empreendedora" className="text-sm">
                          Aceito os{" "}
                          <Link to="/termos" className="text-coral hover:underline">
                            termos de uso
                          </Link>{" "}
                          e{" "}
                          <Link to="/privacidade" className="text-coral hover:underline">
                            política de privacidade
                          </Link>
                        </Label>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full bg-coral hover:bg-coral/90" disabled={!formData.termos}>
                        Criar conta
                      </Button>
                      <div className="text-center text-sm">
                        Já tem uma conta?{" "}
                        <Link to="/login" className="text-coral hover:underline">
                          Faça login
                        </Link>
                      </div>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              <TabsContent value="cliente">
                <Card>
                  <CardHeader>
                    <CardTitle>Cadastro de Cliente</CardTitle>
                    <CardDescription>Crie sua conta para explorar produtos e serviços exclusivos.</CardDescription>
                  </CardHeader>
                  <form onSubmit={(e) => handleSubmit(e, "cliente")}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome-cliente">Nome completo</Label>
                        <Input
                          id="nome-cliente"
                          name="nome"
                          type="text"
                          placeholder="Seu nome completo"
                          value={formData.nome}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
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
                        <Label htmlFor="telefone-cliente">Telefone</Label>
                        <Input
                          id="telefone-cliente"
                          name="telefone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senha-cliente">Senha</Label>
                        <Input
                          id="senha-cliente"
                          name="senha"
                          type="password"
                          value={formData.senha}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmar-senha-cliente">Confirmar senha</Label>
                        <Input
                          id="confirmar-senha-cliente"
                          name="confirmarSenha"
                          type="password"
                          value={formData.confirmarSenha}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="termos-cliente"
                          name="termos"
                          checked={formData.termos}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, termos: checked }))}
                        />
                        <Label htmlFor="termos-cliente" className="text-sm">
                          Aceito os{" "}
                          <Link to="/termos" className="text-olive hover:underline">
                            termos de uso
                          </Link>{" "}
                          e{" "}
                          <Link to="/privacidade" className="text-olive hover:underline">
                            política de privacidade
                          </Link>
                        </Label>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full bg-olive hover:bg-olive/90" disabled={!formData.termos}>
                        Criar conta
                      </Button>
                      <div className="text-center text-sm">
                        Já tem uma conta?{" "}
                        <Link to="/login" className="text-olive hover:underline">
                          Faça login
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
