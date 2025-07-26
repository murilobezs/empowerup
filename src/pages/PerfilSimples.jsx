import { useState } from "react"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { User, Save, Camera } from "lucide-react"
import ImageUpload from "../components/ImageUpload"

export default function PerfilSimples() {
  const [perfil, setPerfil] = useState({
    nome: "João Silva",
    email: "joao@email.com",
    bio: "Desenvolvedor apaixonado por tecnologia",
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
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Editar Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seção do Avatar */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={perfil.avatar} alt={perfil.nome} />
                    <AvatarFallback className="text-2xl">{perfil.nome.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {showImageUpload ? "Cancelar" : "Alterar Foto"}
                  </Button>
                  
                  {showImageUpload && (
                    <div className="w-full max-w-md">
                      <ImageUpload
                        uploadType="user_avatar"
                        userId={1} // Substitua pelo ID do usuário logado
                        onUpload={handleImageUpload}
                        currentImage={perfil.avatar}
                        placeholder="Selecione sua nova foto de perfil"
                      />
                    </div>
                  )}
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="nome" className="text-sm font-medium">
                      Nome
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

                  <div className="flex justify-end space-x-4 pt-4">
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
      </main>
      <SiteFooter />
    </div>
  )
}
