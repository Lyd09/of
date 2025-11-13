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
import { FileText, Users, Repeat, UserPlus } from 'lucide-react';
import { ContractGeneratorDialog } from './ContractGeneratorDialog';
import { AgreementsContractDialog } from './AgreementsContractDialog';
import { ClientManagerDialog } from './ClientManagerDialog';

type ContractType = 'services' | 'agreements' | 'hiring';

interface ContractDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractDialog({ isOpen, onOpenChange }: ContractDialogProps) {
  const [selectedType, setSelectedType] = useState<ContractType | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isClientManagerOpen, setIsClientManagerOpen] = useState(false);

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
  
  const handleClientManagerOpen = () => {
    onOpenChange(false);
    setIsClientManagerOpen(true);
  }
  
  const handleClientManagerClose = (open: boolean) => {
    setIsClientManagerOpen(open);
    if (!open) {
        onOpenChange(true);
    }
  }

  const isMainDialogOpen = isOpen && !isGeneratorOpen && !isClientManagerOpen;

  return (
    <>
      <Dialog open={isMainDialogOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Gerar Novo Documento</DialogTitle>
            <DialogDescription>
              Escolha o tipo de documento que você deseja gerar ou gerencie seus clientes.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <Button
                  variant="outline"
                  className="h-32 flex flex-col gap-2 p-6 group"
                  onClick={() => handleSelection('services')}
                >
                  <FileText className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                  <span className="text-center">Prestação de Serviços</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-32 flex flex-col gap-2 p-6 group"
                  onClick={() => handleSelection('agreements')}
                >
                  <Repeat className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                  <span className="text-center">Acordos e Trocas</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-32 flex flex-col gap-2 p-6 group"
                  onClick={handleClientManagerOpen}
                >
                  <UserPlus className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                  <span className="text-center">Gerenciar Clientes</span>
                </Button>
                 <Button
                  variant="outline"
                  className="h-32 flex flex-col gap-2 p-6 group"
                  onClick={() => handleSelection('hiring')}
                  disabled
                >
                  <Users className="w-10 h-10 text-muted-foreground group-hover:text-white transition-colors" />
                  <span className="text-center text-muted-foreground">Contratações (em breve)</span>
                </Button>
              </div>
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
      {selectedType === 'agreements' && (
        <AgreementsContractDialog
            isOpen={isGeneratorOpen}
            onOpenChange={handleGeneratorClose}
        />
      )}
       <ClientManagerDialog 
        isOpen={isClientManagerOpen}
        onOpenChange={handleClientManagerClose}
      />
    </>
  );
}
