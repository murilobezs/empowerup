"use client"

import { useState } from "react"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { MapPin, Calendar, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"

export default function MeuPerfil() {
  const [perfil, setPerfil] = useState({
    nome: "Ana Silva",
    avatar: "/placeholder.svg?height=128&width=128",
    bio: "Artesã apaixonada por criar peças únicas e especiais. Trabalho com materiais sustentáveis e designs exclusivos há mais de 5 anos.",
    localizacao: "São Paulo, SP",
    membro_desde: "Janeiro 2022",
    especialidades: ["Artesanato", "Decoração", "Sustentabilidade"],
  })

  const [formData, setFormData] = useState(perfil)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setPerfil(formData)
    // Aqui você pode adicionar a lógica para fechar o modal
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8">
          <div className="bg-gradient-to-r from-coral/10 to-sage/10 rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={perfil.avatar} alt={perfil.nome} />
                <AvatarFallback className="text-2xl">{perfil.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{perfil.nome}</h1>
                <p className="text-gray-700 mb-4">{perfil.bio}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {perfil.localizacao}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Membro desde {perfil.membro_desde}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {perfil.especialidades.map((especialidade) => (
                    <Badge key={especialidade} className="bg-coral-light hover:bg-coral-light/80">
                      {especialidade}
                    </Badge>
                  ))}
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Perfil
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Biografia</label>
                      <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Localização</label>
                      <Input
                        name="localizacao"
                        value={formData.localizacao}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button type="submit" className="bg-coral hover:bg-coral/90">
                        Salvar alterações
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
