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
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Trash2,
    PlusCircle,
    Download,
    Building,
    User,
    FileText,
    Banknote,
    Info,
    Pencil,
    Send,
    Settings2,
    MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

const budgetItemSchema = z.object({
    description: z.string().min(1, 'Descrição é obrigatória.'),
    unit: z.string().optional(),
    quantity: z.coerce.number().min(0.01, 'Quantidade deve ser maior que 0.'),
    unitPrice: z.coerce.number().min(0, 'Preço unitário não pode ser negativo.'),
    discount: z.coerce.number().optional(),
});

const budgetSchema = z.object({
    companyName: z.string().min(1, 'Nome da sua empresa é obrigatório.'),
    companyInfo: z.string().optional(),
    clientName: z.string().min(1, 'Nome do cliente é obrigatório.'),
    clientAddress: z.string().optional(),
    budgetNumber: z.coerce.number().min(1, "Número do orçamento é obrigatório."),
    budgetDate: z.string().min(1, 'Data é obrigatória'),
    items: z.array(budgetItemSchema).min(1, 'Adicione pelo menos um item.'),
    commercialConditions: z.string().optional(),
    paymentConditions: z.string().optional(),
    generalDiscount: z.coerce.number().optional(),
    observations: z.string().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const AppHeader = () => (
    <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold font-sans text-primary">OrçaFAST</h1>
        <p className="text-muted-foreground mt-2">Crie orçamentos profissionais de forma rápida e fácil.</p>
    </header>
);

const BudgetForm = ({ form, onGeneratePdf, isGeneratingPdf }: { form: any, onGeneratePdf: (data: BudgetFormValues) => void, isGeneratingPdf: boolean }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const watchedItems = form.watch('items');
    const calculateSubtotal = (item: any) => {
        const total = (item.quantity || 0) * (item.unitPrice || 0);
        return total - (item.discount || 0);
    }
    
    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onGeneratePdf)} className="space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-3 font-sans text-xl">
                                <FileText size={22} className="text-primary" />
                                Criar Novo Orçamento
                            </CardTitle>
                             <Button type="button" variant="outline">
                                <Settings2 size={16} /> Gerenciar Presets
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Company Section is removed from form and will be part of presets/settings in the future */}
                            
                            {/* Client Section */}
                            <div className="space-y-4">
                                 <h3 className="text-lg font-medium text-primary">Dados do Cliente</h3>
                                <FormField control={form.control} name="clientName" render={({ field }) => ( 
                                    <FormItem> 
                                        <FormLabel className="flex items-center gap-2"><User size={16}/>Nome do Cliente</FormLabel> 
                                        <FormControl><Input placeholder="Ex: João Silva" {...field} /></FormControl> 
                                        <FormMessage /> 
                                    </FormItem> 
                                )} />
                                <FormField control={form.control} name="clientAddress" render={({ field }) => ( 
                                    <FormItem> 
                                        <FormLabel className="flex items-center gap-2"><MapPin size={16}/>Endereço (Opcional)</FormLabel> 
                                        <FormControl><Textarea placeholder="Ex: Rua das Palmeiras, 123, Bairro, Cidade - UF" {...field} /></FormControl>
                                        <FormMessage /> 
                                    </FormItem> 
                                )} />
                            </div>

                            <hr className="border-border" />

                            {/* Items Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-primary">Itens do Orçamento</h3>
                                <div className="space-y-4">
                                    <div className="hidden md:grid grid-cols-[1fr,80px,80px,100px,100px,100px,40px] gap-3 items-center font-bold text-muted-foreground text-sm px-2">
                                        <Label>Descrição</Label>
                                        <Label>Unid.</Label>
                                        <Label>Qtd.</Label>
                                        <Label>Preço Unit.</Label>
                                        <Label>Desconto</Label>
                                        <Label>Subtotal</Label>
                                    </div>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr,80px,80px,100px,100px,100px,40px] gap-2 items-start pb-4 border-b border-border/50">
                                            <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => ( <FormItem> <FormControl><Textarea placeholder="Descrição do item" {...field} className="min-h-[40px] bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                            <FormField control={form.control} name={`items.${index}.unit`} render={({ field }) => ( <FormItem> <FormControl><Input placeholder="Un" {...field} className="bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                            <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => ( <FormItem> <FormControl><Input type="number" step="1" placeholder="1" {...field} className="bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                            <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => ( <FormItem> <FormControl><Input type="number" step="0.01" placeholder="R$ 0,00" {...field} className="bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                            <FormField control={form.control} name={`items.${index}.discount`} render={({ field }) => ( <FormItem> <FormControl><Input type="number" step="0.01" placeholder="R$ 0,00" {...field} className="bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                            <div className="flex items-center h-10 text-sm">{formatCurrency(calculateSubtotal(watchedItems[index]))}</div>
                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" className="mt-4" onClick={() => append({ description: '', unit: 'Un', quantity: 1, unitPrice: 0, discount: 0 })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                                </Button>
                            </div>
                            
                            <hr className="border-border" />
                            
                            {/* Conditions Section */}
                             <div className="space-y-4">
                                <h3 className="text-lg font-medium text-primary">Termos e Condições</h3>
                                <FormField control={form.control} name="commercialConditions" render={({ field }) => ( <FormItem> <FormLabel>Condições Comerciais</FormLabel> <FormControl><Input placeholder="Ex: Forma de Pagamento: Transferência bancária, boleto ou PIX." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                <FormField control={form.control} name="paymentConditions" render={({ field }) => ( <FormItem> <FormLabel>Condições de Pagamento</FormLabel> <FormControl><Textarea placeholder="Ex: 50% do valor será pago antes do início do serviço e o restante, após sua conclusão." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            </div>

                             <hr className="border-border" />

                            {/* General Discount */}
                             <div className="space-y-4">
                                <h3 className="text-lg font-medium text-primary">Desconto Geral (Opcional)</h3>
                                <FormField control={form.control} name="generalDiscount" render={({ field }) => ( <FormItem> <FormLabel>Valor do Desconto</FormLabel> <FormControl><Input type="number" step="0.01" placeholder="R$ 0,00" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            </div>

                            <hr className="border-border" />

                            {/* Observations */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-primary">Observações</h3>
                                <FormField control={form.control} name="observations" render={({ field }) => ( <FormItem> <FormControl><Textarea placeholder="Qualquer outra informação relevante..." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4">
                             <div className="flex items-center justify-between w-full">
                                <Button type="button" variant="ghost" onClick={() => { /* logic for test data */ }}>
                                    <Pencil className="mr-2 h-4 w-4" /> Preencher Teste
                                </Button>
                                <Button type="submit" size="lg" disabled={isGeneratingPdf} className="font-sans">
                                    <Send className="mr-2 h-4 w-4" />{isGeneratingPdf ? 'Gerando...' : 'Gerar Orçamento'}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </FormProvider>
    );
}

type BudgetPreviewProps = {
  data: BudgetFormValues;
  subtotal: number;
  total: number;
};

const BudgetPreview = ({ data, subtotal, total }: BudgetPreviewProps) => {
    return (
        <div id="budget-preview" className="bg-[#1e1e20] text-neutral-300 p-8 rounded-lg shadow-lg" style={{ width: '100%', minHeight: '80vh', fontFamily: 'sans-serif' }}>
            <header className="flex justify-between items-start pb-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded">
                        <Image src="/logo-fastfilms.svg" alt="FastFilms Logo" width={40} height={40} data-ai-hint="film reel" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-neutral-100">{data.companyName || 'FastFilms'}</h2>
                        <p className="text-xs text-neutral-400">cada momento merece um bom take!</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-neutral-100">ORÇAMENTO</h1>
                    <p className="text-neutral-400">Número: <span className="font-bold">{String(data.budgetNumber || 1).padStart(4, '0')}</span></p>
                    <p className="text-neutral-400">Data: {data.budgetDate}</p>
                </div>
            </header>

            <section className="my-8">
                <h3 className="font-bold text-neutral-200 mb-2">Cliente:</h3>
                <p className="font-medium text-neutral-100">{data.clientName || 'Nome do Cliente'}</p>
                <p className="text-sm text-neutral-400">{data.clientAddress || 'Endereço do cliente'}</p>
            </section>

             <section className="my-8">
                <h3 className="font-bold text-neutral-200 mb-2">Itens do Orçamento:</h3>
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr className="text-left text-neutral-400 border-b border-neutral-700">
                            <th className="p-2 w-1/2 font-medium">Descrição</th>
                            <th className="p-2 text-center font-medium">Qtd.</th>
                            <th className="p-2 text-right font-medium">Preço Unit.</th>
                            <th className="p-2 text-right font-medium">Total Item</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.items && data.items.length > 0 && data.items[0].description) ? data.items.map((item, index) => (
                            <tr key={index} className="border-b border-neutral-800">
                                <td className="p-2 align-top">{item.description}</td>
                                <td className="p-2 text-center align-top">{item.quantity} {item.unit}</td>
                                <td className="p-2 text-right align-top">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-2 text-right align-top">{formatCurrency((item.quantity * item.unitPrice) - (item.discount || 0))}</td>
                            </tr>
                        )) : (
                            <tr>
                               <td colSpan={4} className="p-8 text-center text-neutral-500">Adicione itens ao orçamento.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
            
            <section className="flex flex-col items-end my-8 no-break space-y-2">
                <div className="text-right">
                    <p className="text-neutral-400">Subtotal: {formatCurrency(subtotal)}</p>
                    {data.generalDiscount && data.generalDiscount > 0 && (
                         <p className="text-neutral-400">Desconto Geral: -{formatCurrency(data.generalDiscount)}</p>
                    )}
                </div>
                 <div className="w-full max-w-xs text-right">
                    <p className="text-3xl font-bold text-neutral-100">Total: {formatCurrency(total)}</p>
                </div>
            </section>

             <section className="my-8 text-sm no-break space-y-4">
                <h4 className="font-bold text-neutral-200">Termos e Condições:</h4>
                {data.commercialConditions && <p className="text-neutral-400">{data.commercialConditions}</p>}
                {data.paymentConditions && <p className="text-neutral-400">{data.paymentConditions}</p>}
            </section>
             
            <footer className="absolute bottom-8 left-8 right-8 text-center text-xs text-neutral-500 pt-4">
                <p>Obrigado pela preferência! — {data.companyName || 'Sua Empresa'}</p>
            </footer>
        </div>
    );
};


const BudgetPreviewForPdf = ({ data, subtotal, total }: BudgetPreviewProps) => {
    // This component is for PDF generation and should mimic the on-screen preview but with a white theme
    return (
        <div className="bg-white text-black p-10" style={{width: '210mm', minHeight: '297mm', fontFamily: 'sans-serif', position: 'relative'}}>
            <header className="flex justify-between items-start pb-4 mb-8">
                <div className="flex items-center gap-4">
                    {/* Public assets need to be referenced by absolute URL in PDF generation */}
                    <div className="bg-black p-2 rounded">
                        <img src="/logo-fastfilms.svg" alt="FastFilms Logo" style={{width: '40px', height: '40px'}} />
                    </div>
                     <div>
                        <h2 className="text-xl font-bold text-neutral-900">{data.companyName || 'FastFilms'}</h2>
                        <p className="text-xs text-neutral-600">cada momento merece um bom take!</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-neutral-900">ORÇAMENTO</h1>
                    <p className="text-neutral-600">Número: <span className="font-bold">{String(data.budgetNumber || 1).padStart(4, '0')}</span></p>
                    <p className="text-neutral-600">Data: {data.budgetDate}</p>
                </div>
            </header>

            <section className="my-8">
                <h3 className="font-bold text-neutral-800 mb-2">Cliente:</h3>
                <p className="font-medium text-neutral-900">{data.clientName || 'Nome do Cliente'}</p>
                <p className="text-sm text-neutral-700">{data.clientAddress || 'Endereço do cliente'}</p>
            </section>

             <section className="my-8">
                <h3 className="font-bold text-neutral-800 mb-2">Itens do Orçamento:</h3>
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr className="text-left text-neutral-500 border-b-2 border-neutral-300">
                            <th className="p-2 w-1/2 font-bold">Descrição</th>
                            <th className="p-2 text-center font-bold">Qtd.</th>
                            <th className="p-2 text-right font-bold">Preço Unit.</th>
                            <th className="p-2 text-right font-bold">Total Item</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.items && data.items.length > 0) ? data.items.map((item, index) => (
                            <tr key={index} className="border-b border-neutral-200">
                                <td className="p-2 align-top">{item.description}</td>
                                <td className="p-2 text-center align-top">{item.quantity} {item.unit}</td>
                                <td className="p-2 text-right align-top">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-2 text-right align-top">{formatCurrency((item.quantity * item.unitPrice) - (item.discount || 0))}</td>
                            </tr>
                        )) : (
                             <tr><td colSpan={4} className="p-8 text-center text-neutral-400">Nenhum item adicionado.</td></tr>
                        )}
                    </tbody>
                </table>
            </section>
            
            <section className="flex flex-col items-end my-8 no-break space-y-2">
                 <div className="text-right">
                    <p className="text-neutral-600">Subtotal: {formatCurrency(subtotal)}</p>
                     {data.generalDiscount && data.generalDiscount > 0 && (
                         <p className="text-neutral-600">Desconto Geral: -{formatCurrency(data.generalDiscount)}</p>
                    )}
                </div>
                <div className="w-full max-w-xs text-right">
                     <p className="text-3xl font-bold text-neutral-900">Total: {formatCurrency(total)}</p>
                </div>
            </section>

             <section className="my-8 text-sm no-break space-y-4">
                <h4 className="font-bold text-neutral-800">Termos e Condições:</h4>
                {data.commercialConditions && <p className="text-neutral-700">{data.commercialConditions}</p>}
                {data.paymentConditions && <p className="text-neutral-700">{data.paymentConditions}</p>}
            </section>
            
            <footer className="absolute bottom-8 left-8 right-8 text-center text-xs text-neutral-500 border-t border-neutral-300 pt-4">
                <p>Obrigado pela preferência! — {data.companyName || 'Sua Empresa'}</p>
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
            companyName: 'FastFilms',
            companyInfo: 'cada momento merece um bom take!',
            clientName: '',
            clientAddress: '',
            budgetNumber: Math.floor(Math.random() * 1000) + 1,
            budgetDate: format(new Date(), 'dd/MM/yyyy'),
            items: [{ description: '', unit: 'Un', quantity: 1, unitPrice: 0, discount: 0 }],
            commercialConditions: 'Forma de Pagamento: Transferência bancária, boleto ou PIX.',
            paymentConditions: '50% do valor será pago antes do início do serviço e o restante, após sua conclusão.',
            generalDiscount: 0,
            observations: '',
        },
    });

    const watchedItems = form.watch('items');
    const generalDiscount = form.watch('generalDiscount') || 0;

    const subtotal = watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0) - (item.discount || 0), 0);
    const total = subtotal - generalDiscount;
    

    const onGeneratePdf = async (data: BudgetFormValues) => {
        setIsGeneratingPdf(true);
        toast({
            title: "Gerando PDF...",
            description: "Seu orçamento está sendo processado.",
        });

        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const previewContainer = document.createElement('div');
            previewContainer.style.position = 'fixed';
            previewContainer.style.left = '-9999px';
            document.body.appendChild(previewContainer);

            const reactDom = (await import('react-dom'));
            const previewElement = <BudgetPreviewForPdf data={data} subtotal={subtotal} total={total} />;
            
            const root = reactDom.createRoot(previewContainer);
            root.render(previewElement);
            
            await new Promise(resolve => setTimeout(resolve, 200));

            const opt = {
                margin: [0, 0, 0, 0],
                filename: `orcamento_${String(data.budgetNumber).padStart(4, '0')}_${data.clientName.replace(/\s/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().from(previewContainer.firstChild).set(opt).save();
            
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
    
    const currentFormData = form.watch();

    return (
        <main className="container mx-auto p-4 lg:p-8">
            <AppHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <BudgetForm form={form} onGeneratePdf={onGeneratePdf} isGeneratingPdf={isGeneratingPdf} />
                </div>
                <div className="lg:col-span-2">
                     <div className="sticky top-8 space-y-4">
                         <Button className="w-full" size="lg" onClick={form.handleSubmit(onGeneratePdf)} disabled={isGeneratingPdf}>
                            <Download className="mr-2 h-4 w-4" /> 
                            {isGeneratingPdf ? 'Baixando...' : 'Baixar Orçamento'}
                        </Button>
                       <BudgetPreview data={currentFormData} subtotal={subtotal} total={total} />
                    </div>
                </div>
            </div>
        </main>
    );
}
