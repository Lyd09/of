"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Users, Repeat } from 'lucide-react';
import { ContractGeneratorDialog } from './ContractGeneratorDialog';

type ContractType = 'services' | 'hiring' | 'exchange';

interface ContractDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractDialog({ isOpen, onOpenChange }: ContractDialogProps) {
  const [selectedType, setSelectedType] = useState<ContractType | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const handleSelection = (type: ContractType) => {
    setSelectedType(type);
    onOpenChange(false); // Fecha o diálogo de seleção
    setIsGeneratorOpen(true); // Abre o gerador de contrato
  };

  const handleGeneratorClose = (open: boolean) => {
    setIsGeneratorOpen(open);
    if (!open) {
      setSelectedType(null); // Reseta a seleção quando o gerador é fechado
    }
  };

  return (
    <>
      <Dialog open={isOpen && !isGeneratorOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar Novo Contrato</DialogTitle>
            <DialogDescription>
              Escolha o tipo de documento que você deseja gerar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2 p-6 group"
              onClick={() => handleSelection('services')}
            >
              <FileText className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
              <span className="text-lg">Prestação de Serviços</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2 p-6 group"
              onClick={() => handleSelection('hiring')}
              disabled
            >
              <Users className="w-10 h-10 text-muted-foreground group-hover:text-white transition-colors" />
              <span className="text-lg text-muted-foreground">Contratações</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2 p-6 group"
              onClick={() => handleSelection('exchange')}
              disabled
            >
              <Repeat className="w-10 h-10 text-muted-foreground group-hover:text-white transition-colors" />
              <span className="text-lg text-muted-foreground">Acordos e Trocas</span>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedType === 'services' && (
        <ContractGeneratorDialog
          isOpen={isGeneratorOpen}
          onOpenChange={handleGeneratorClose}
        />
      )}
    </>
  );
}
