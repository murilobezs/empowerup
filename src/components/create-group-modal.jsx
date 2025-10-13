import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Plus } from "lucide-react"
import { cn } from "../lib/utils"

export function CreateGroupModal({ onCreateGroup, triggerButtonProps = {} }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    imagem: "/placeholder.svg?height=100&width=100",
    membros: 0,
    ativo: true
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await onCreateGroup(formData)
      if (result?.success === false) {
        return
      }
      setOpen(false)
      setFormData({
        nome: "",
        descricao: "",
        categoria: "",
        imagem: "/placeholder.svg?height=100&width=100",
        membros: 0,
        ativo: true
      })
    } finally {
      setSubmitting(false)
    }
  }

  const {
    className: triggerClassName,
    children: triggerChildren,
    ...restTriggerProps
  } = triggerButtonProps

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn("bg-coral hover:bg-coral/90", triggerClassName)}
          {...restTriggerProps}
        >
          {triggerChildren ?? (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Criar Grupo
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
          <DialogDescription>
            Crie um novo grupo para conectar empreendedoras com interesses em comum.
          </DialogDescription>
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
            <Button
              type="submit"
              className="bg-coral hover:bg-coral/90"
              disabled={submitting}
            >
              {submitting ? 'Criando...' : 'Criar Grupo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
