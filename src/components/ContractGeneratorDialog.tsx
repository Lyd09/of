"use client";

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';
import { ServiceContractForm } from './ServiceContractForm';
import { ContractPreview } from './ContractPreview';
import { ServiceContractData, serviceContractSchema } from '@/types/contract';

interface ContractGeneratorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractGeneratorDialog({ isOpen, onOpenChange }: ContractGeneratorDialogProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const form = useForm<ServiceContractData>({
    resolver: zodResolver(serviceContractSchema),
    // Valores iniciais serão definidos no ServiceContractForm
  });

  const watchedData = form.watch();

  const handleGeneratePdf = () => {
    // Lógica para gerar PDF será implementada aqui
    console.log("Gerando PDF com os dados:", form.getValues());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 m-0 flex flex-col">
        <DialogHeader className="flex-row items-center justify-between p-4 border-b bg-background">
          <DialogTitle>Gerador de Contrato</DialogTitle>
          <div className="flex items-center gap-4">
            <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
              <Download className="mr-2 h-4 w-4" />
              {isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-6 w-6" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
          {/* Left Side: Form */}
          <div className="overflow-y-auto p-6 bg-card">
            <FormProvider {...form}>
              <ServiceContractForm />
            </FormProvider>
          </div>

          {/* Right Side: Preview */}
          <div className="overflow-y-auto p-6 bg-background">
            <div className="max-w-[210mm] mx-auto">
               <ContractPreview data={watchedData} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
