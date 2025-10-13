import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const DEFAULT_FORM = {
  nome: '',
  descricao: '',
  categoria: '',
  regras: '',
  tags: '',
  privacidade: 'publico',
  moderacao_nivel: 'moderado',
  imagem: '',
  imagem_capa: '',
};

const PRIVACIDADE_OPTIONS = [
  { value: 'publico', label: 'Público' },
  { value: 'privado', label: 'Privado' },
  { value: 'somente_convidados', label: 'Somente convidadas' },
];

const MODERACAO_OPTIONS = [
  { value: 'aberto', label: 'Aberto (entrada imediata)' },
  { value: 'moderado', label: 'Moderado (confirmação necessária)' },
  { value: 'restrito', label: 'Restrito (maior controle)' },
];

export default function GroupSettingsDialog({
  open,
  onOpenChange,
  group,
  onSubmit,
  saving = false,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (open) {
      if (group) {
        setForm({
          nome: group.nome || '',
          descricao: group.descricao || '',
          categoria: group.categoria || '',
          regras: group.regras || '',
          tags: Array.isArray(group.tags) ? group.tags.join(', ') : group.tags || '',
          privacidade: group.privacidade || 'publico',
          moderacao_nivel: group.moderacao_nivel || 'moderado',
          imagem: group.imagem || '',
          imagem_capa: group.imagem_capa || '',
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [group, open]);

  const isValid = useMemo(() => form.nome.trim().length > 2, [form.nome]);

  const handleChange = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isValid || saving) return;
    onSubmit?.({ ...form });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configurações do grupo</DialogTitle>
          <DialogDescription>
            Personalize as informações principais do grupo e defina como novas integrantes podem participar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nome">Nome do grupo</Label>
              <Input
                id="nome"
                required
                value={form.nome}
                onChange={handleChange('nome')}
                placeholder="Comunidade das Empreendedoras Criativas"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                rows={4}
                value={form.descricao}
                onChange={handleChange('descricao')}
                placeholder="Explique o propósito, temas e o que as empreendedoras encontram por aqui."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria principal</Label>
              <Input
                id="categoria"
                value={form.categoria}
                onChange={handleChange('categoria')}
                placeholder="Ex.: Marketing, Tecnologia, Artesanato"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={handleChange('tags')}
                placeholder="Separe por vírgula (ex.: networking,finanças,inspiração)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacidade">Privacidade</Label>
              <Select value={form.privacidade} onValueChange={handleChange('privacidade')}>
                <SelectTrigger id="privacidade">
                  <SelectValue placeholder="Selecione a privacidade" />
                </SelectTrigger>
                <SelectContent>
                  {PRIVACIDADE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moderacao">Moderação</Label>
              <Select value={form.moderacao_nivel} onValueChange={handleChange('moderacao_nivel')}>
                <SelectTrigger id="moderacao">
                  <SelectValue placeholder="Selecione como novas integrantes entram" />
                </SelectTrigger>
                <SelectContent>
                  {MODERACAO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="regras">Regras e orientações</Label>
              <Textarea
                id="regras"
                rows={3}
                value={form.regras}
                onChange={handleChange('regras')}
                placeholder="Compartilhe as boas práticas, combinados e links úteis para manter a comunidade segura."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagem">Imagem (avatar)</Label>
              <Input
                id="imagem"
                value={form.imagem}
                onChange={handleChange('imagem')}
                placeholder="URL da imagem quadrada do grupo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagem_capa">Imagem de capa</Label>
              <Input
                id="imagem_capa"
                value={form.imagem_capa}
                onChange={handleChange('imagem_capa')}
                placeholder="URL para a capa do grupo"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
