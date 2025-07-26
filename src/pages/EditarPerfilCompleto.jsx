import { useState } from "react"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { User, Save, Camera, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import ImageUpload from "../components/ImageUpload"

export default function EditarPerfilCompleto() {
  const [perfil, setPerfil] = useState({
    nome: "Ana Silva",
    email: "ana@email.com",
    telefone: "(11) 99999-9999",
    bio: "Artesã apaixonada por criar peças únicas e especiais. Trabalho com materiais sustentáveis e designs exclusivos há mais de 5 anos.",
    localizacao: "São Paulo, SP",
    avatar: "/placeholder.svg?height=128&width=128",
  })

  const [showImageUpload, setShowImageUpload] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setPerfil(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Perfil atualizado:", perfil)
    alert("Perfil atualizado com sucesso!")
  }

  const handleImageUpload = (imagePath) => {
    setPerfil(prev => ({
      ...prev,
      avatar: imagePath
    }))
    setShowImageUpload(false)
    alert("Foto de perfil atualizada!")
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <Button variant="outline" asChild className="mb-4">
                <Link to="/meu-perfil">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Perfil
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Editar Perfil</h1>
              <p className="text-gray-600 mt-2">Atualize suas informações pessoais e foto de perfil</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Card da Foto de Perfil */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Foto de Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={perfil.avatar} alt={perfil.nome} />
                      <AvatarFallback className="text-2xl">{perfil.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {showImageUpload ? "Cancelar" : "Alterar Foto"}
                    </Button>
                    
                    {showImageUpload && (
                      <div className="w-full">
                        <ImageUpload
                          uploadType="user_avatar"
                          userId={1} // Substitua pelo ID do usuário logado
                          onUpload={handleImageUpload}
                          currentImage={perfil.avatar}
                          placeholder="Nova foto de perfil"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card das Informações */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="nome" className="text-sm font-medium">
                          Nome Completo
                        </label>
                        <Input
                          id="nome"
                          name="nome"
                          value={perfil.nome}
                          onChange={handleChange}
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={perfil.email}
                          onChange={handleChange}
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="telefone" className="text-sm font-medium">
                          Telefone
                        </label>
                        <Input
                          id="telefone"
                          name="telefone"
                          value={perfil.telefone}
                          onChange={handleChange}
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="localizacao" className="text-sm font-medium">
                          Localização
                        </label>
                        <Input
                          id="localizacao"
                          name="localizacao"
                          value={perfil.localizacao}
                          onChange={handleChange}
                          placeholder="Cidade, Estado"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium">
                        Biografia
                      </label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={perfil.bio}
                        onChange={handleChange}
                        placeholder="Conte um pouco sobre você..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t">
                      <Button type="button" variant="outline" asChild>
                        <Link to="/meu-perfil">Cancelar</Link>
                      </Button>
                      <Button type="submit" className="bg-coral hover:bg-coral/90">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
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
