"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { MessageCircle, MapPin, Calendar } from "lucide-react"

export default function VisualizarPerfil() {
  const { username } = useParams()
  const [seguindo, setSeguindo] = useState(false)

  const perfil = {
    nome: "Ana Silva",
    username: username,
    avatar: "/placeholder.svg?height=128&width=128",
    bio: "Artesã apaixonada por criar peças únicas e especiais. Trabalho com materiais sustentáveis e designs exclusivos há mais de 5 anos.",
    localizacao: "São Paulo, SP",
    membro_desde: "Janeiro 2022",
    especialidades: ["Artesanato", "Decoração", "Sustentabilidade"],
  }

  const handleSeguir = () => {
    setSeguindo(!seguindo)
    console.log("Seguindo:", !seguindo)
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
              <div className="flex flex-col space-y-2">
                <Button onClick={handleSeguir} className={seguindo ? "bg-gray-500" : "bg-coral hover:bg-coral/90"}>
                  {seguindo ? "Seguindo" : "Seguir"}
                </Button>
                <Button variant="outline">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Conversar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
