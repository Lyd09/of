"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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
    User,
    FileText,
    Settings2,
    MapPin,
    Send,
    Pencil
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { BudgetPreviewData, BudgetItem as BudgetItemType } from '@/types/budget';
import { BudgetPreview } from '@/components/BudgetPreview';

const budgetItemSchema = z.object({
    description: z.string().min(1, 'Descrição é obrigatória.'),
    unit: z.string().optional(),
    quantity: z.coerce.number().min(0.01, 'Quantidade deve ser maior que 0.'),
    unitPrice: z.coerce.number().min(0, 'Preço unitário não pode ser negativo.'),
    discount: z.coerce.number().optional(),
    discountType: z.enum(['percentage', 'fixed']).default('fixed'),
});

const budgetSchema = z.object({
    companyName: z.string().min(1, 'Nome da sua empresa é obrigatório.'),
    logoUrl: z.string().optional(),
    slogan: z.string().optional(),
    clientName: z.string().min(1, 'Nome do cliente é obrigatório.'),
    clientAddress: z.string().optional(),
    budgetNumber: z.coerce.number().min(1, "Número do orçamento é obrigatório."),
    budgetDate: z.string().min(1, 'Data é obrigatória'),
    items: z.array(budgetItemSchema).min(1, 'Adicione pelo menos um item.'),
    commercialConditions: z.string().optional(),
    paymentConditions: z.string().optional(),
    generalDiscount: z.coerce.number().optional(),
    generalDiscountType: z.enum(['percentage', 'fixed']).default('fixed'),
    observations: z.string().optional(),
    isDroneFeatureEnabled: z.boolean().default(false),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;

export type CompanyInfo = {
  name: string;
  logoUrl: string;
  slogan: string;
}

export const companyInfo: CompanyInfo = {
  name: "FastFilms",
  logoUrl: "https://raw.githubusercontent.com/Lyd09/FF/587b5eb4cf0fc07885618620dc1f18e8d6e0aef4/LOGO%20SVG.svg",
  slogan: "cada momento merece um bom take!"
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const AppHeader = () => (
    <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-primary">OrçaFAST</h1>
        <p className="text-muted-foreground mt-2">Crie orçamentos profissionais de forma rápida e fácil.</p>
    </header>
);

const BudgetForm = ({ form, onGeneratePdf, isGeneratingPdf }: { form: any, onGeneratePdf: (data: BudgetFormValues) => void, isGeneratingPdf: boolean }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });
    
    const watchedItems = form.watch('items');

    const calculateItemSubtotal = (item: any) => {
        const total = (item.quantity || 0) * (item.unitPrice || 0);
        let discountValue = item.discount || 0;
        if (item.discountType === 'percentage') {
            discountValue = total * (discountValue / 100);
        }
        return total - discountValue;
    }
    
    const fillWithTestData = () => {
        form.reset({
            ...form.getValues(),
            clientName: "Paula (SaborInclusão)",
            clientAddress: "Rua Fictícia, 123, Bairro dos Sonhos, Cidade Imaginária - IS",
            items: [
                { description: 'Fundação da Marca', unit: 'Un', quantity: 1, unitPrice: 1800, discount: 0, discountType: 'fixed' },
                { description: 'Gestão de Redes Sociais', unit: 'Un', quantity: 1, unitPrice: 3500, discount: 0, discountType: 'fixed' },
                { description: 'Produção de Conteúdo', unit: 'Un', quantity: 1, unitPrice: 3700, discount: 0, discountType: 'fixed' },
            ],
            paymentConditions: '1º Item - Pagamento único | 2º Item - Pagamento Mensal | 3º Item - Pagamento Mensal',
            commercialConditions: 'Forma de Pagamento: Transferência bancária, boleto ou PIX.',
            generalDiscount: 0,
            generalDiscountType: 'fixed',
            observations: 'Orçamento válido por 15 dias. Prazos de entrega a combinar.'
        });
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
                             <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => form.setValue('isDroneFeatureEnabled', !form.getValues('isDroneFeatureEnabled'))}>
                                    Ativar/Desativar Drone
                                </Button>
                                <Button type="button" variant="outline">
                                    <Settings2 size={16} /> Gerenciar Presets
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                           <div className="space-y-4">
                                     <h3 className="text-lg font-medium text-primary flex items-center gap-2"><User size={20}/>Dados do Cliente</h3>
                                    <FormField control={form.control} name="clientName" render={({ field }) => ( 
                                        <FormItem> 
                                            <FormLabel>Nome do Cliente</FormLabel> 
                                            <FormControl><Input placeholder="Ex: Paula (SaborInclusão)" {...field} /></FormControl> 
                                            <FormMessage /> 
                                        </FormItem> 
                                    )} />
                                    <FormField control={form.control} name="clientAddress" render={({ field }) => ( 
                                        <FormItem> 
                                            <FormLabel>Endereço (Opcional)</FormLabel> 
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
                                    <div className="hidden md:grid grid-cols-[1fr,80px,80px,100px,140px,100px,40px] gap-3 items-center font-bold text-muted-foreground text-sm px-2">
                                        <Label>Descrição</Label>
                                        <Label>Unid.</Label>
                                        <Label>Qtd.</Label>
                                        <Label>Preço Unit.</Label>
                                        <Label>Desconto</Label>
                                        <Label>Subtotal</Label>
                                    </div>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr,80px,80px,100px,140px,100px,40px] gap-2 items-start pb-4 border-b border-border/50">
                                            <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => ( <FormItem> <FormControl><Textarea placeholder="Descrição do item" {...field} className="min-h-[40px] bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                            <FormField control={form.control} name={`items.${index}.unit`} render={({ field }) => ( <FormItem> <FormControl><Input placeholder="Un" {...field} className="bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                            <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => ( <FormItem> <FormControl><Input type="number" step="1" placeholder="1" {...field} className="bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                            <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => ( <FormItem> <FormControl><Input type="number" step="0.01" placeholder="R$ 0,00" {...field} className="bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                            <div className="flex gap-1">
                                                <FormField control={form.control} name={`items.${index}.discount`} render={({ field }) => ( <FormItem className="flex-grow"> <FormControl><Input type="number" step="0.01" placeholder="0" {...field} className="bg-background" /></FormControl> <FormMessage /> </FormItem> )} />
                                                <FormField control={form.control} name={`items.${index}.discountType`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(field.value === 'fixed' ? 'percentage' : 'fixed')}>
                                                                {field.value === 'fixed' ? 'R$' : '%'}
                                                            </Button>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <div className="flex items-center h-10 text-sm">{formatCurrency(calculateItemSubtotal(watchedItems[index]))}</div>
                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" className="mt-4" onClick={() => append({ description: '', unit: 'Un', quantity: 1, unitPrice: 0, discount: 0, discountType: 'fixed' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                                </Button>
                            </div>
                            
                            <hr className="border-border" />
                            
                            {/* Conditions Section */}
                             <div className="space-y-4">
                                <h3 className="text-lg font-medium text-primary">Termos e Condições</h3>
                                <FormField control={form.control} name="commercialConditions" render={({ field }) => ( <FormItem> <FormLabel>Condições Comerciais</FormLabel> <FormControl><Textarea placeholder="Ex: Forma de Pagamento: Transferência bancária, boleto ou PIX." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                <FormField control={form.control} name="paymentConditions" render={({ field }) => ( <FormItem> <FormLabel>Condições de Pagamento</FormLabel> <FormControl><Textarea placeholder="Ex: 1º Item - Pagamento único | 2º Item - Pagamento Mensal | 3º Item - Pagamento Mensal" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            </div>

                             <hr className="border-border" />

                            {/* General Discount */}
                             <div className="space-y-4">
                                <h3 className="text-lg font-medium text-primary">Desconto Geral (Opcional)</h3>
                                <div className="flex items-center gap-2">
                                <FormField control={form.control} name="generalDiscount" render={({ field }) => ( <FormItem className="flex-grow"> <FormLabel>Valor do Desconto</FormLabel> <FormControl><Input type="number" step="0.01" placeholder="0" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                 <FormField control={form.control} name={`generalDiscountType`} render={({ field }) => (
                                    <FormItem className="self-end">
                                        <FormControl>
                                            <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(field.value === 'fixed' ? 'percentage' : 'fixed')}>
                                                {field.value === 'fixed' ? 'R$' : '%'}
                                            </Button>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                </div>
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
                                <Button type="button" variant="ghost" onClick={fillWithTestData}>
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

const BudgetPreviewForPdf = ({ data }: { data: BudgetPreviewData }) => {
    return (
        <div className="bg-white text-black p-10" style={{width: '210mm', minHeight: '297mm', fontFamily: 'sans-serif', position: 'relative'}}>
            {/* Header */}
            <header className="flex justify-between items-start pb-4 mb-4 border-b border-neutral-300">
                <div className="flex items-center gap-4">
                    {data.logoUrl && <Image src={data.logoUrl} alt="Logo da Empresa" width={60} height={60} />}
                     <div>
                        <h2 className="text-2xl font-bold text-neutral-900">{data.companyName}</h2>
                        <p className="text-sm text-neutral-600">{data.slogan}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-neutral-900">ORÇAMENTO</h1>
                    <p className="text-neutral-600">Número: {data.budgetNumber === "0000" ? 'PREVIEW' : data.budgetNumber}</p>
                    <p className="text-neutral-600">Data: {data.budgetDate}</p>
                </div>
            </header>

            {/* Client */}
            <section className="my-8 pb-4 border-b border-neutral-300">
                <h3 className="text-neutral-500 mb-1">Cliente:</h3>
                <p className="font-bold text-lg text-neutral-900">{data.clientName}</p>
            </section>
            
            {/* Items */}
            <section className="my-8">
                <h3 className="font-bold text-neutral-800 mb-4">Itens do Orçamento:</h3>
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr className="text-left text-neutral-500 border-b-2 border-neutral-300">
                            <th className="p-2 w-1/2 font-bold">Descrição</th>
                            <th className="p-2 text-center font-bold">Qtde.</th>
                            <th className="p-2 text-right font-bold">Preço Unit.</th>
                            <th className="p-2 text-right font-bold">Total Item</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => (
                            <tr key={index} className="border-b border-neutral-200">
                                <td className="p-2 align-top">{item.description}</td>
                                <td className="p-2 text-center align-top">{item.quantity} {item.unit}</td>
                                <td className="p-2 text-right align-top">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-2 text-right align-top">{formatCurrency(item.itemTotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            {/* Totals */}
            <section className="flex flex-col items-end my-8 no-break space-y-2">
                 <div className="text-right w-full max-w-xs">
                    <div className="flex justify-between py-1 text-lg">
                        <span className="text-neutral-600">Subtotal:</span>
                        <span>{formatCurrency(data.subtotal)}</span>
                    </div>
                    <div className="border-t border-neutral-300 my-2"></div>
                    <div className="flex justify-between text-3xl font-bold text-neutral-900 py-1">
                         <span >Total:</span>
                         <span>{formatCurrency(data.totalAmount)}</span>
                    </div>
                </div>
            </section>

            {/* Terms */}
            <section className="my-8 text-sm no-break space-y-4">
                { (data.commercialConditions || data.paymentConditions) && <h4 className="font-bold text-neutral-800 text-xl mb-4">Termos e Condições:</h4> }
                {data.commercialConditions && <p className="text-neutral-700"><span className="font-medium">Condições Comerciais:</span> {data.commercialConditions}</p>}
                {data.paymentConditions && <p className="text-neutral-700"><span className="font-medium">Condições de Pagamento:</span> {data.paymentConditions}</p>}
            </section>
            
            {/* Footer */}
            <footer className="absolute bottom-8 left-8 right-8 text-center text-xs text-neutral-500 border-t border-neutral-300 pt-4">
                <p>Obrigado pela preferência! — {data.companyName}</p>
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
            companyName: companyInfo.name,
            logoUrl: companyInfo.logoUrl,
            slogan: companyInfo.slogan,
            clientName: '',
            clientAddress: '',
            budgetNumber: 0,
            budgetDate: format(new Date(), 'dd/MM/yyyy'),
            items: [],
            commercialConditions: 'Forma de Pagamento: Transferência bancária, boleto ou PIX.',
            paymentConditions: '1º Item - Pagamento único | 2º Item - Pagamento Mensal | 3º Item - Pagamento Mensal',
            generalDiscount: 0,
            generalDiscountType: 'fixed',
            observations: '',
            isDroneFeatureEnabled: false
        },
    });

    useEffect(() => {
        form.setValue('budgetNumber', Math.floor(Math.random() * 1000) + 1);
    }, [form]);

    const watchedForm = form.watch();

    const getPreviewData = (): BudgetPreviewData | null => {
        const { items, generalDiscount = 0, generalDiscountType, budgetNumber, ...rest } = watchedForm;

        const itemsWithTotals: BudgetItemType[] = items.map(item => {
            const total = (item.quantity || 0) * (item.unitPrice || 0);
            let discountValue = item.discount || 0;
            if (item.discountType === 'percentage') {
                discountValue = total * (discountValue / 100);
            }
            return {
                ...item,
                itemTotal: total - discountValue,
                itemDiscountValue: discountValue,
            };
        });

        const subtotal = itemsWithTotals.reduce((acc, item) => acc + item.itemTotal, 0);
        
        let generalDiscountValue = generalDiscount;
        let generalDiscountPercentage = 0;

        if(generalDiscountType === 'percentage') {
            generalDiscountValue = subtotal * (generalDiscount / 100);
            generalDiscountPercentage = generalDiscount;
        } else if (subtotal > 0) {
            generalDiscountPercentage = (generalDiscountValue / subtotal) * 100;
        }
        
        const totalAmount = subtotal - generalDiscountValue;

        return {
            ...rest,
            items: itemsWithTotals,
            subtotal,
            generalDiscountValue,
            generalDiscountPercentage,
            totalAmount,
            budgetNumber: String(budgetNumber).padStart(4, '0')
        }
    }
    
    const previewData = getPreviewData();

    const onGeneratePdf = async () => {
        const result = budgetSchema.safeParse(form.getValues());
        if (!result.success) {
            toast({
                title: "Formulário Inválido",
                description: "Por favor, preencha todos os campos obrigatórios.",
                variant: "destructive",
            });
            console.log(result.error.flatten().fieldErrors)
            return;
        }

        const data = getPreviewData();
        if (!data) return;

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
            const previewElement = <BudgetPreviewForPdf data={data} />;
            
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const root = reactDom.createRoot(previewContainer);
            root.render(previewElement);
            
            await new Promise(resolve => setTimeout(resolve, 500)); 

            const opt = {
                margin: [0, 0, 0, 0],
                filename: `orcamento_${data.budgetNumber}_${data.clientName.replace(/\s/g, '_')}.pdf`,
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
    
    return (
        <main className="container mx-auto p-4 lg:p-8 font-sans">
            <AppHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <BudgetForm form={form} onGeneratePdf={onGeneratePdf} isGeneratingPdf={isGeneratingPdf} />
                </div>
                <div className="lg:col-span-2">
                    <div className="sticky top-8 space-y-4">
                        <Button className="w-full" size="lg" onClick={onGeneratePdf} disabled={isGeneratingPdf}>
                            <Download className="mr-2 h-4 w-4" /> 
                            {isGeneratingPdf ? 'Baixando...' : 'Baixar Orçamento'}
                        </Button>
                       <BudgetPreview data={previewData} />
                    </div>
                </div>
            </div>
        </main>
    );
}

    
