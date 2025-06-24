import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"

const eventos = [
  // ...adicione os eventos aqui ou importe de outro lugar...
]

export default function EventosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Todos os Eventos</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <Card key={evento.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{evento.nome}</h3>
                    <p className="text-sm text-muted-foreground">por {evento.organizador}</p>
                  </div>
                  <Badge className="bg-olive hover:bg-olive/80">{evento.tipo}</Badge>
                </div>
                <p className="mt-2 text-gray-700 text-sm">{evento.descricao}</p>
                <div className="space-y-2 text-sm mt-2">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {evento.data} às {evento.horario}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {evento.local}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {evento.participantes}/{evento.maxParticipantes} participantes
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-lg font-semibold text-coral">{evento.preco}</div>
                  <Badge variant="outline">{evento.categoria}</Badge>
                </div>
                <Button className="mt-4 w-full bg-olive hover:bg-olive/90">Participar do Evento</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
