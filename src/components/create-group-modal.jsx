import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Plus } from "lucide-react"

export function CreateGroupModal({ onCreateGroup }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    imagem: "/placeholder.svg?height=100&width=100",
    membros: 0,
    ativo: true
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onCreateGroup(formData)
    setOpen(false)
    setFormData({
      nome: "",
      descricao: "",
      categoria: "",
      imagem: "/placeholder.svg?height=100&width=100",
      membros: 0,
      ativo: true
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-coral hover:bg-coral/90">
          <Plus className="mr-2 h-4 w-4" />
          Criar Grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Crie um novo grupo para conectar empreendedoras com interesses em comum.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Grupo</Label>
            <Input
              id="nome"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              required
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              required
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-coral hover:bg-coral/90">
              Criar Grupo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
