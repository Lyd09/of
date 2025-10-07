"use client";

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthorizationTermData, authorizationTermSchema } from '@/types/contract';
import { AuthorizationTermForm } from './AuthorizationTermForm';
import { AuthorizationTermPreview } from './AuthorizationTermPreview';
import { ContractPreviewForPdf } from './ContractPreviewForPdf'; // Reuse this for structure
import { AuthorizationTermPreviewForPdf } from './AuthorizationTermPreviewForPdf';


interface AuthorizationTermDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthorizationTermDialog({ isOpen, onOpenChange }: AuthorizationTermDialogProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();

  const form = useForm<AuthorizationTermData>({
    resolver: zodResolver(authorizationTermSchema),
    // Initial values are set in the form component
  });

  const watchedData = form.watch();

  const handleGeneratePdf = async () => {
     const result = authorizationTermSchema.safeParse(form.getValues());
      if (!result.success) {
          toast({
              title: "Formulário Inválido",
              description: "Por favor, corrija os campos inválidos antes de gerar o PDF.",
              variant: "destructive",
          });
          console.error(result.error.flatten().fieldErrors);
          return;
      }
      
      const data = result.data;

      setIsGeneratingPdf(true);
      toast({
          title: "Gerando PDF do Termo...",
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
          const previewElement = <AuthorizationTermPreviewForPdf data={data} />;
          
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const root = reactDom.createRoot(previewContainer);
          root.render(previewElement);
          
          await new Promise(resolve => setTimeout(resolve, 500)); 

          const opt = {
              margin: [0, 0, 0, 0],
              filename: `Termo_Autorizacao_${data.authorizedName.replace(/\s/g, '_')}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          const pdfElement = previewContainer.firstChild;
          if (pdfElement) {
               await html2pdf().from(pdfElement).set(opt).save();
          }
         
          root.unmount();
          document.body.removeChild(previewContainer);

          toast({
              title: "Sucesso!",
              description: "Seu termo de autorização em PDF foi gerado e o download iniciado.",
          });

      } catch (error) {
          console.error("Failed to generate authorization term PDF", error);
          toast({
              title: "Erro ao gerar PDF",
              description: "Ocorreu um problema ao tentar gerar o documento. Tente novamente.",
              variant: "destructive",
          });
      } finally {
          setIsGeneratingPdf(false);
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 m-0 flex flex-col">
        <DialogHeader className="flex-row items-center justify-between p-4 border-b bg-background">
          <DialogTitle>Gerador de Termo de Autorização de Uso</DialogTitle>
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
              <AuthorizationTermForm />
            </FormProvider>
          </div>

          {/* Right Side: Preview */}
          <div className="overflow-y-auto p-6 bg-background">
            <div className="max-w-[210mm] mx-auto">
               <AuthorizationTermPreview data={watchedData} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
