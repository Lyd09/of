
"use client";

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  PermutationContractData,
  permutationContractSchema,
  AuthorizationTermData,
  authorizationTermSchema
} from '@/types/contract';
import { PermutationContractForm } from './PermutationContractForm';
import { PermutationContractPreview } from './PermutationContractPreview';
import { PermutationContractPreviewForPdf } from './PermutationContractPreviewForPdf';
import { AuthorizationTermForm } from './AuthorizationTermForm';
import { AuthorizationTermPreview } from './AuthorizationTermPreview';
import { AuthorizationTermPreviewForPdf } from './AuthorizationTermPreviewForPdf';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type AgreementType = 'authorization' | 'permutation';

interface AgreementsContractDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const getShortName = (fullName: string = '') => {
  return fullName.split(' ').slice(0, 2).join('_');
}

export function AgreementsContractDialog({ isOpen, onOpenChange }: AgreementsContractDialogProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [agreementType, setAgreementType] = useState<AgreementType>('authorization');
  const { toast } = useToast();

  const currentSchema = agreementType === 'authorization' ? authorizationTermSchema : permutationContractSchema;

  const form = useForm({
    resolver: zodResolver(currentSchema),
  });

  const watchedData = form.watch();

  const handleAgreementTypeChange = (type: AgreementType) => {
    setAgreementType(type);
    form.reset(); // Reseta o formulário ao trocar de tipo
  };

  const handleGeneratePdf = async () => {
    const result = await form.trigger();
    if (!result) {
        toast({
            title: "Formulário Inválido",
            description: "Por favor, corrija os campos inválidos antes de gerar o PDF.",
            variant: "destructive",
        });
        console.error(form.formState.errors);
        return;
    }
    
    const data = form.getValues();

    setIsGeneratingPdf(true);
    toast({
        title: "Gerando PDF...",
        description: "Seu documento está sendo processado.",
    });

    try {
        const html2pdf = (await import('html2pdf.js')).default;
        const previewContainer = document.createElement('div');
        previewContainer.style.position = 'fixed';
        previewContainer.style.left = '-9999px';
        previewContainer.style.top = '0';
        document.body.appendChild(previewContainer);

        const reactDom = (await import('react-dom'));
        
        let previewElement;
        let pdfOptions;
        const dateString = format(new Date(), 'dd-MM-yyyy');


        if (agreementType === 'authorization') {
            const shortName = getShortName((data as AuthorizationTermData).authorizedName);
            previewElement = <AuthorizationTermPreviewForPdf data={data as AuthorizationTermData} />;
            pdfOptions = {
                filename: `Termo_Autorizacao_${shortName}_${dateString}.pdf`,
                html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
        } else {
            const shortName = getShortName((data as PermutationContractData).permutants[0]?.name);
            previewElement = <PermutationContractPreviewForPdf data={data as PermutationContractData} />;
            pdfOptions = {
                filename: `Contrato_Permuta_${shortName}_${dateString}.pdf`,
                html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const root = reactDom.createRoot(previewContainer);
        root.render(previewElement);
        
        await new Promise(resolve => setTimeout(resolve, 500));

        const opt = {
            margin: [0, 0, 0, 0],
            image: { type: 'jpeg', quality: 0.98 },
            ...pdfOptions
        };
        
        const pdfElement = previewContainer.firstChild;
        if (pdfElement) {
             await html2pdf().from(pdfElement).set(opt).save();
        }
       
        root.unmount();
        document.body.removeChild(previewContainer);

        toast({
            title: "Sucesso!",
            description: "Seu documento em PDF foi gerado e o download iniciado.",
        });

    } catch (error) {
        console.error("Failed to generate PDF", error);
        toast({
            title: "Erro ao gerar PDF",
            description: "Ocorreu um problema ao tentar gerar o documento. Tente novamente.",
            variant: "destructive",
        });
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const getTitle = () => {
    if (agreementType === 'authorization') return 'Gerador de Termo de Autorização de Uso';
    if (agreementType === 'permutation') return 'Gerador de Contrato de Permuta';
    return 'Gerador de Acordos';
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 m-0 flex flex-col">
        <DialogHeader className="flex-row items-center justify-between p-4 border-b bg-background">
          <DialogTitle>{getTitle()}</DialogTitle>
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
            <RadioGroup
                value={agreementType}
                onValueChange={(value) => handleAgreementTypeChange(value as AgreementType)}
                className="grid grid-cols-2 gap-4 mb-6"
            >
                <div>
                    <RadioGroupItem value="authorization" id="authorization" className="sr-only" />
                    <Label
                        htmlFor="authorization"
                        className={cn(
                            "flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            agreementType === 'authorization' && "bg-accent text-accent-foreground border-accent-foreground/50"
                        )}
                    >
                        Autorização de Uso
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="permutation" id="permutation" className="sr-only" />
                    <Label
                        htmlFor="permutation"
                         className={cn(
                            "flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            agreementType === 'permutation' && "bg-accent text-accent-foreground border-accent-foreground/50"
                        )}
                    >
                        Permuta
                    </Label>
                </div>
            </RadioGroup>

            <FormProvider {...form}>
              {agreementType === 'authorization' && <AuthorizationTermForm />}
              {agreementType === 'permutation' && <PermutationContractForm />}
            </FormProvider>
          </div>

          {/* Right Side: Preview */}
          <div className="overflow-y-auto p-6 bg-background">
            <div className="max-w-[210mm] mx-auto">
               {agreementType === 'authorization' && <AuthorizationTermPreview data={watchedData} />}
               {agreementType === 'permutation' && <PermutationContractPreview data={watchedData} />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
