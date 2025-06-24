"use client"

import { useState } from "react"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { MapPin, Calendar } from "lucide-react"

export default function EditarPerfil() {
  const [perfil, setPerfil] = useState({
    nome: "Ana Silva",
    avatar: "/placeholder.svg?height=128&width=128",
    bio: "Artesã apaixonada por criar peças únicas e especiais. Trabalho com materiais sustentáveis e designs exclusivos há mais de 5 anos.",
    localizacao: "São Paulo, SP",
    membro_desde: "Janeiro 2022",
    especialidades: "Artesanato, Decoração, Sustentabilidade",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Perfil atualizado:", perfil)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setPerfil(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={perfil.avatar} alt={perfil.nome} />
                    <AvatarFallback className="text-2xl">{perfil.nome.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline">Alterar foto</Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      name="nome"
                      value={perfil.nome}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Biografia</label>
                    <Textarea
                      name="bio"
                      value={perfil.bio}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Localização</label>
                    <Input
                      name="localizacao"
                      value={perfil.localizacao}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Especialidades (separadas por vírgula)</label>
                    <Input
                      name="especialidades"
                      value={perfil.especialidades}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">Cancelar</Button>
                  <Button type="submit" className="bg-coral hover:bg-coral/90">Salvar alterações</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
