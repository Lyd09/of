"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import porExtenso from "numero-por-extenso";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, PlusCircle, FileDown, Building, User, FileText, Banknote, Info, Download, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const budgetItemSchema = z.object({
    description: z.string().min(1, 'Descrição é obrigatória.'),
    quantity: z.coerce.number().min(0.01, 'Quantidade deve ser maior que 0.'),
    unitPrice: z.coerce.number().min(0, 'Preço unitário não pode ser negativo.'),
});

const budgetSchema = z.object({
    companyName: z.string().min(1, 'Nome da sua empresa é obrigatório.'),
    companyInfo: z.string().optional(),
    clientName: z.string().min(1, 'Nome do cliente é obrigatório.'),
    clientInfo: z.string().optional(),
    budgetNumber: z.coerce.number().min(1, "Número do orçamento é obrigatório."),
    budgetDate: z.string().min(1, 'Data é obrigatória'),
    items: z.array(budgetItemSchema).min(1, 'Adicione pelo menos um item.'),
    paymentConditions: z.string().optional(),
    validity: z.string().optional(),
    observations: z.string().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const AppHeader = () => (
    <header className="mb-10">
        <h1 className="text-4xl font-bold font-sans text-primary">OrçaFAST</h1>
        <p className="text-muted-foreground mt-2">Crie orçamentos profissionais de forma rápida e descomplicada.</p>
    </header>
);

const BudgetForm = ({ form, onGeneratePdf, isGeneratingPdf }: { form: any, onGeneratePdf: (data: BudgetFormValues) => void, isGeneratingPdf: boolean }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const watchedItems = form.watch('items');
    const total = watchedItems.reduce((acc: number, item: any) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0);

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onGeneratePdf)} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 font-sans"><Building size={20} /> Dados da Sua Empresa</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem> <FormLabel>Nome da Empresa/Profissional</FormLabel> <FormControl><Input placeholder="Sua Empresa LTDA" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="companyInfo" render={({ field }) => ( <FormItem> <FormLabel>Informações (CNPJ, Endereço, Contato)</FormLabel> <FormControl><Textarea placeholder="CNPJ: 00.000.000/0001-00&#10;Rua Exemplo, 123&#10;contato@suaempresa.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 font-sans"><User size={20} /> Dados do Cliente</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="clientName" render={({ field }) => ( <FormItem> <FormLabel>Nome do Cliente</FormLabel> <FormControl><Input placeholder="Nome do Cliente" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="clientInfo" render={({ field }) => ( <FormItem> <FormLabel>Informações (CPF/CNPJ, Endereço, Contato)</FormLabel> <FormControl><Textarea placeholder="CPF/CNPJ: 123.456.789-00&#10;Endereço do Cliente&#10;cliente@email.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 font-sans"><FileText size={20} /> Detalhes do Orçamento</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="budgetNumber" render={({ field }) => ( <FormItem> <FormLabel>Número do Orçamento</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="budgetDate" render={({ field }) => ( <FormItem> <FormLabel>Data de Emissão</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="font-sans">Itens do Orçamento</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="hidden md:grid grid-cols-[1fr,100px,120px,120px,40px] gap-4 items-center font-bold text-muted-foreground text-sm">
                                    <Label>Descrição</Label>
                                    <Label>Qtd.</Label>
                                    <Label>Preço Unit.</Label>
                                    <Label>Subtotal</Label>
                                </div>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr,100px,120px,120px,40px] gap-2 md:gap-4 items-start pb-2 border-b">
                                        <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => ( <FormItem> <FormControl><Textarea placeholder="Descrição do item ou serviço" {...field} className="min-h-[40px]" /></FormControl> <FormMessage /> </FormItem> )} />
                                        <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => ( <FormItem> <FormControl><Input type="number" step="1" placeholder="1" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                        <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => ( <FormItem> <FormControl><Input type="number" step="0.01" placeholder="R$ 0,00" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                        <div className="flex items-center h-10 text-sm">{formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0))}</div>
                                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" className="mt-4" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 font-sans"><Banknote size={20} /> Condições e Validade</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="paymentConditions" render={({ field }) => ( <FormItem> <FormLabel>Condições de Pagamento</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="validity" render={({ field }) => ( <FormItem> <FormLabel>Validade da Proposta</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 font-sans"><Info size={20} /> Observações</CardTitle></CardHeader>
                        <CardContent>
                            <FormField control={form.control} name="observations" render={({ field }) => ( <FormItem> <FormLabel>Observações Adicionais</FormLabel> <FormControl><Textarea placeholder="Qualquer outra informação relevante..." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-2 pt-4">
                         <Button type="button" variant="outline" onClick={() => { /* logic to save preset */ }}>
                            Gerenciar Presets
                        </Button>
                        <Button type="submit" size="lg" disabled={isGeneratingPdf} className="font-sans">
                            <Download className="mr-2 h-4 w-4" />{isGeneratingPdf ? 'Gerando PDF...' : 'Gerar Orçamento'}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormProvider>
    );
}

type BudgetPreviewProps = {
  data: BudgetFormValues;
  total: number;
  totalInWords: string;
};

const BudgetPreview = ({ data, total, totalInWords }: BudgetPreviewProps) => {
    return (
        <div id="budget-preview" className="bg-[#18191b] text-neutral-300 p-8 rounded-lg shadow-lg" style={{ width: '100%', minHeight: '297mm', fontFamily: 'sans-serif' }}>
            <header className="flex justify-between items-start pb-4 border-b-2 border-neutral-700">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100">{data.companyName || 'Nome da Sua Empresa'}</h2>
                    <pre className="text-xs text-neutral-400 whitespace-pre-wrap font-mono">{data.companyInfo || 'Suas informações de contato'}</pre>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-neutral-100">ORÇAMENTO</h1>
                    <p className="text-neutral-400">Número: <span className="font-bold">{String(data.budgetNumber || 1).padStart(4, '0')}</span></p>
                    <p className="text-neutral-400">Data: {data.budgetDate}</p>
                </div>
            </header>

            <section className="my-8">
                <h3 className="font-bold text-neutral-200 mb-2">Cliente:</h3>
                <div className="p-4 border border-neutral-700 rounded bg-neutral-900/30">
                    <p className="font-bold text-neutral-100">{data.clientName || 'Nome do Cliente'}</p>
                    <pre className="text-sm text-neutral-400 whitespace-pre-wrap font-mono">{data.clientInfo || 'Informações do cliente'}</pre>
                </div>
            </section>

            <section className="my-8">
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                    <thead className="border-b-2 border-neutral-600">
                        <tr className="text-left text-neutral-300">
                            <th className="p-2 w-1/2 font-bold">Descrição</th>
                            <th className="p-2 text-center font-bold">Qtd.</th>
                            <th className="p-2 text-right font-bold">Preço Unit.</th>
                            <th className="p-2 text-right font-bold">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.items && data.items.length > 0 && data.items[0].description) ? data.items.map((item, index) => (
                            <tr key={index} className="border-b border-neutral-800">
                                <td className="p-2 align-top">{item.description}</td>
                                <td className="p-2 text-center align-top">{item.quantity}</td>
                                <td className="p-2 text-right align-top">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-2 text-right align-top">{formatCurrency(item.quantity * item.unitPrice)}</td>
                            </tr>
                        )) : (
                            <tr>
                               <td colSpan={4} className="p-8 text-center text-neutral-500">Adicione itens ao orçamento.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
            
            <section className="flex justify-end my-8 no-break">
                <div className="w-full max-w-xs">
                    <div className="p-4 bg-neutral-900/50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-neutral-300">VALOR TOTAL</span>
                            <span className="font-bold text-2xl text-neutral-100">{formatCurrency(total)}</span>
                        </div>
                        <p className="text-xs text-neutral-400 text-right mt-1">({totalInWords})</p>
                    </div>
                </div>
            </section>

            <section className="my-8 text-sm no-break space-y-4">
                {data.paymentConditions && <div><h4 className="font-bold text-neutral-200">Condições de Pagamento:</h4><p className="text-neutral-400">{data.paymentConditions}</p></div>}
                {data.validity && <div><h4 className="font-bold text-neutral-200">Validade da Proposta:</h4><p className="text-neutral-400">{data.validity}</p></div>}
            </section>
             
            {data.observations && <section className="my-8 text-sm no-break"><h4 className="font-bold text-neutral-200">Observações:</h4><pre className="text-neutral-400 whitespace-pre-wrap bg-neutral-900/30 p-3 border border-neutral-700 rounded font-mono mt-2">{data.observations}</pre></section>}
            
            <footer className="absolute bottom-8 left-8 right-8 text-center text-xs text-neutral-500 border-t border-neutral-800 pt-4">
                <p>Obrigado pela sua preferência!</p>
                <p>{data.companyName || 'Sua Empresa'}</p>
            </footer>
        </div>
    );
};


export default function OrcaFastPage() {
    const { toast } = useToast();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    
    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            companyName: '',
            companyInfo: '',
            clientName: '',
            clientInfo: '',
            budgetNumber: 1,
            budgetDate: format(new Date(), 'dd/MM/yyyy'),
            items: [{ description: '', quantity: 1, unitPrice: 0 }],
            paymentConditions: 'À vista',
            validity: '7 dias',
            observations: '',
        },
    });

    const watchedItems = form.watch('items');
    const total = watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0);
    
    const [totalInWords, setTotalInWords] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
          if (total > 0) {
              try {
                  setTotalInWords(porExtenso.porExtenso(total, porExtenso.estilo.monetario));
              } catch (error) {
                  console.error("Error converting number to words:", error);
                  setTotalInWords("Erro na conversão do valor.");
              }
          } else {
              setTotalInWords('Zero reais');
          }
        }
    }, [total]);

    const onGeneratePdf = async (data: BudgetFormValues) => {
        setIsGeneratingPdf(true);
        toast({
            title: "Gerando PDF...",
            description: "Seu orçamento está sendo processado.",
        });

        try {
            const html2pdf = (await import('html2pdf.js')).default;
            
            // Create a temporary element to render the preview for PDF generation
            const previewContainer = document.createElement('div');
            previewContainer.style.position = 'fixed';
            previewContainer.style.left = '-9999px'; // Position off-screen
            document.body.appendChild(previewContainer);

            const reactDom = (await import('react-dom'));
            
            const previewElement = <div style={{width: '210mm', background: 'white', color: 'black'}}><BudgetPreviewForPdf data={data} total={total} totalInWords={totalInWords} /></div>;
            
            // Use createRoot for React 18
            const root = reactDom.createRoot(previewContainer);
            root.render(previewElement);
            
            // Wait a moment for rendering
            await new Promise(resolve => setTimeout(resolve, 100));

            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `orcamento_${data.budgetNumber}_${data.clientName.replace(/\s/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().from(previewContainer.firstChild).set(opt).save();
            
            // Cleanup
            root.unmount();
            document.body.removeChild(previewContainer);

            toast({
                title: "Sucesso!",
                description: "Seu orçamento em PDF foi gerado e o download iniciado.",
            });

        } catch (error) {
            console.error("Failed to generate PDF", error);
            toast({
                title: "Erro ao gerar PDF",
                description: "Ocorreu um problema ao tentar gerar o orçamento. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingPdf(false);
        }
    };
    
    const fillTestData = () => {
      form.reset({
        companyName: "Tech Soluções Inovadoras",
        companyInfo: "CNPJ: 12.345.678/0001-99\nRua da Tecnologia, 456, São Paulo/SP\ncontato@techsolucoes.com",
        clientName: "Construtora Horizonte",
        clientInfo: "CNPJ: 98.765.432/0001-11\nAvenida Principal, 789, Belo Horizonte/MG",
        budgetNumber: 101,
        budgetDate: format(new Date(), 'dd/MM/yyyy'),
        items: [
          { description: 'Desenvolvimento de Website Institucional com CMS', quantity: 1, unitPrice: 7500 },
          { description: 'Manutenção Mensal e Suporte Técnico (Plano Básico)', quantity: 6, unitPrice: 450 },
          { description: 'Consultoria SEO e Otimização de Performance', quantity: 10, unitPrice: 120 },
        ],
        paymentConditions: '50% de entrada, 50% na entrega do projeto.',
        validity: '15 dias',
        observations: 'O prazo de desenvolvimento do website é de 30 dias úteis após a aprovação do design.',
      });
      toast({ title: "Dados de teste preenchidos!", description: "O formulário foi preenchido com dados de exemplo." });
    };

    const currentFormData = form.watch();

    return (
        <main className="container mx-auto p-4 lg:p-8">
            <AppHeader />
            <div className="fixed top-4 right-4 z-10 flex gap-2">
                <Button variant="outline" size="sm" onClick={fillTestData}>
                    <Pencil className="mr-2 h-4 w-4"/> Preencher Teste
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <BudgetForm form={form} onGeneratePdf={onGeneratePdf} isGeneratingPdf={isGeneratingPdf} />
                </div>
                <div className="lg:col-span-2">
                    <div className="sticky top-8">
                       <BudgetPreview data={currentFormData} total={total} totalInWords={totalInWords} />
                    </div>
                </div>
            </div>
        </main>
    );
}

const BudgetPreviewForPdf = ({ data, total, totalInWords }: BudgetPreviewProps) => {
    return (
        <div className="bg-white text-black p-8" style={{width: '210mm', minHeight: '297mm', fontFamily: 'serif'}}>
            <header className="flex justify-between items-start pb-4 border-b-2 border-neutral-700">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">{data.companyName}</h2>
                    <pre className="text-xs text-neutral-600 whitespace-pre-wrap font-sans">{data.companyInfo}</pre>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-neutral-800">ORÇAMENTO</h1>
                    <p className="text-neutral-600">Número: <span className="font-bold">{String(data.budgetNumber).padStart(4, '0')}</span></p>
                    <p className="text-neutral-600">Data: {data.budgetDate}</p>
                </div>
            </header>

            <section className="my-8">
                <h3 className="font-bold text-neutral-800">Cliente:</h3>
                <div className="p-4 border border-neutral-300 rounded mt-2">
                    <p className="font-bold">{data.clientName}</p>
                    <pre className="text-sm text-neutral-600 whitespace-pre-wrap font-sans">{data.clientInfo}</pre>
                </div>
            </section>

            <section className="my-8">
                <table className="w-full text-sm" style={{borderCollapse: 'collapse'}}>
                    <thead className="border-b-2 border-neutral-700">
                        <tr className="text-left text-neutral-800">
                            <th className="p-2 w-1/2 font-bold">Descrição</th>
                            <th className="p-2 text-center font-bold">Qtd.</th>
                            <th className="p-2 text-right font-bold">Preço Unit.</th>
                            <th className="p-2 text-right font-bold">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => (
                            <tr key={index} className="border-b border-neutral-200">
                                <td className="p-2 align-top">{item.description}</td>
                                <td className="p-2 text-center align-top">{item.quantity}</td>
                                <td className="p-2 text-right align-top">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-2 text-right align-top">{formatCurrency(item.quantity * item.unitPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            <section className="flex justify-end my-8 no-break">
                 <div className="w-full max-w-xs">
                    <div className="p-4 bg-neutral-100 rounded">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-neutral-800">VALOR TOTAL</span>
                            <span className="font-bold text-2xl text-neutral-900">{formatCurrency(total)}</span>
                        </div>
                        <p className="text-xs text-neutral-600 text-right mt-1">({totalInWords})</p>
                    </div>
                </div>
            </section>

            <section className="my-8 text-sm no-break space-y-4">
                {data.paymentConditions && <div><h4 className="font-bold">Condições de Pagamento:</h4><p className="text-neutral-700">{data.paymentConditions}</p></div>}
                {data.validity && <div><h4 className="font-bold">Validade da Proposta:</h4><p className="text-neutral-700">{data.validity}</p></div>}
            </section>

            {data.observations && <section className="my-8 text-sm no-break"><h4 className="font-bold">Observações:</h4><pre className="text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-2 border rounded font-sans mt-2">{data.observations}</pre></section>}
            
            <footer className="absolute bottom-8 left-8 right-8 text-center text-xs text-neutral-500 border-t pt-4 border-neutral-300">
                <p>Obrigado pela sua preferência!</p>
                <p>{data.companyName}</p>
            </footer>
        </div>
    );
};
