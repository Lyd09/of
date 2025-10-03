"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Users, X } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';

interface ContractDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractDialog({ isOpen, onOpenChange }: ContractDialogProps) {
  const handleSelection = (type: 'services' | 'hiring') => {
    // Placeholder for future functionality
    console.log(`Selected contract type: ${type}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Novo Contrato</DialogTitle>
          <DialogDescription>
            Escolha o tipo de contrato que você deseja gerar com base neste orçamento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-28 flex flex-col gap-2 p-6 hover:bg-accent/10"
            onClick={() => handleSelection('services')}
          >
            <FileText className="w-10 h-10 text-primary" />
            <span className="text-lg">Serviços</span>
          </Button>
          <Button
            variant="outline"
            className="h-28 flex flex-col gap-2 p-6 hover:bg-accent/10"
            onClick={() => handleSelection('hiring')}
          >
            <Users className="w-10 h-10 text-primary" />
            <span className="text-lg">Contratações</span>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
