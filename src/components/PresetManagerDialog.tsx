"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit3, PlusCircle } from 'lucide-react';
import initialPresets from '@/data/presets.json';

export interface Preset {
  id: string;
  description: string;
  unitPrice: number;
}

const presetSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória.'),
  unitPrice: z.coerce.number().min(0, 'Preço deve ser um número positivo.'),
});

type PresetFormValues = z.infer<typeof presetSchema>;

interface PresetManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  presets: Preset[];
  setPresets: (presets: Preset[]) => void;
}

export function PresetManagerDialog({ isOpen, onOpenChange, presets, setPresets }: PresetManagerDialogProps) {
  const { toast } = useToast();
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PresetFormValues>({
    resolver: zodResolver(presetSchema),
    defaultValues: {
      description: '',
      unitPrice: 0,
    },
  });

  useEffect(() => {
    if (editingPreset) {
      setValue('description', editingPreset.description);
      setValue('unitPrice', editingPreset.unitPrice);
    } else {
      reset();
    }
  }, [editingPreset, setValue, reset]);

  const handleSavePreset = (data: PresetFormValues) => {
    if (editingPreset) {
      // Update
      setPresets(presets.map(p => p.id === editingPreset.id ? { ...p, ...data } : p));
      toast({ title: 'Preset atualizado!' });
    } else {
      // Create
      const newPreset: Preset = { id: crypto.randomUUID(), ...data };
      setPresets([...presets, newPreset]);
      toast({ title: 'Novo preset adicionado!' });
    }
    setEditingPreset(null);
    reset();
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
    toast({ title: 'Preset removido.', variant: 'destructive' });
  };

  const startEditing = (preset: Preset) => {
    setEditingPreset(preset);
  };
  
  const cancelEditing = () => {
    setEditingPreset(null);
    reset();
  };
  
  const loadDefaultPresets = () => {
      setPresets(initialPresets);
      toast({ title: 'Presets padrão carregados!' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Presets de Itens</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova presets para usar em seus orçamentos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSavePreset)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,150px,120px] gap-4 items-start">
            <div className="space-y-1">
              <Label htmlFor="preset-description">Descrição</Label>
              <Input id="preset-description" {...register('description')} placeholder="Ex: Produção de Vídeo" />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="preset-price">Preço Unitário</Label>
              <Input id="preset-price" type="number" step="0.01" {...register('unitPrice')} placeholder="R$ 250,00" />
              {errors.unitPrice && <p className="text-xs text-destructive">{errors.unitPrice.message}</p>}
            </div>
            <div className="flex gap-2 self-end">
              <Button type="submit">
                {editingPreset ? 'Atualizar' : 'Adicionar'}
              </Button>
               {editingPreset && <Button type="button" variant="ghost" onClick={cancelEditing}>Cancelar</Button>}
            </div>
          </div>
        </form>

        <Separator />

        <h3 className="text-lg font-medium">Presets Salvos</h3>
        <ScrollArea className="h-64 border rounded-md">
           <div className="p-4 space-y-2">
            {presets.length > 0 ? (
                presets.map(preset => (
                <div key={preset.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                    <div>
                    <p className="font-medium">{preset.description}</p>
                    <p className="text-sm text-muted-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preset.unitPrice)}</p>
                    </div>
                    <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => startEditing(preset)}>
                        <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso removerá permanentemente o preset.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePreset(preset.id)}>
                                Sim, remover
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    </div>
                </div>
                ))
            ) : (
                 <div className="text-center text-muted-foreground py-10">
                    <p>Nenhum preset encontrado.</p>
                     <Button variant="link" onClick={loadDefaultPresets}>Carregar Presets Padrão</Button>
                </div>
            )}
            </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Separator = () => <hr className="border-border" />;
