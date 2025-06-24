import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Card, CardContent } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"

const grupos = [
  // ...adicione os grupos aqui ou importe de outro lugar...
]

export default function GruposPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Todos os Grupos</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {grupos.map((grupo) => (
            <Card key={grupo.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={grupo.imagem || "/placeholder.svg"} />
                    <AvatarFallback className="bg-sage text-white text-lg">
                      {grupo.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{grupo.nome}</h3>
                    <p className="text-sm text-muted-foreground">{grupo.membros} membros</p>
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{grupo.descricao}</p>
                <Button className="mt-4 w-full bg-coral hover:bg-coral/90">Participar do Grupo</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
