"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Trash2, PlusCircle, FileDown, Building, User, FileText, Banknote, Calendar, CheckCircle, Info } from "lucide-react";
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

type BudgetFormValues = z.infer<typeof budgetSchema>;

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
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

    const onSubmit = async (data: BudgetFormValues) => {
        setIsGeneratingPdf(true);
        toast({
            title: "Gerando PDF...",
            description: "Seu orçamento está sendo processado.",
        });

        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const element = document.getElementById('budget-preview');
            
            if (element) {
                const opt = {
                    margin: [0.5, 0.5, 0.5, 0.5],
                    filename: `orcamento_${data.budgetNumber}_${data.clientName.replace(/\s/g, '_')}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                };

                await html2pdf().from(element).set(opt).save();
                toast({
                    title: "Sucesso!",
                    description: "Seu orçamento em PDF foi gerado e o download iniciado.",
                });
            } else {
                throw new Error("Elemento de preview do orçamento não encontrado.");
            }
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
        <>
            <main className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-sans text-primary">OrçaFAST</h1>
                    <p className="text-muted-foreground">Seu gerador de orçamentos rápido e profissional</p>
                </header>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card><CardHeader><CardTitle className="flex items-center gap-2 font-sans"><Building size={20} /> Dados da Sua Empresa</CardTitle></CardHeader><CardContent className="space-y-4"><FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem> <FormLabel>Nome da Empresa/Profissional</FormLabel> <FormControl><Input placeholder="Sua Empresa LTDA" {...field} /></FormControl> <FormMessage /> </FormItem> )} /><FormField control={form.control} name="companyInfo" render={({ field }) => ( <FormItem> <FormLabel>Informações (CNPJ, Endereço, Contato)</FormLabel> <FormControl><Textarea placeholder="CNPJ: 00.000.000/0001-00&#10;Rua Exemplo, 123&#10;contato@suaempresa.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} /></CardContent></Card>
                            <Card><CardHeader><CardTitle className="flex items-center gap-2 font-sans"><User size={20} /> Dados do Cliente</CardTitle></CardHeader><CardContent className="space-y-4"><FormField control={form.control} name="clientName" render={({ field }) => ( <FormItem> <FormLabel>Nome do Cliente</FormLabel> <FormControl><Input placeholder="Nome do Cliente" {...field} /></FormControl> <FormMessage /> </FormItem> )} /><FormField control={form.control} name="clientInfo" render={({ field }) => ( <FormItem> <FormLabel>Informações (CPF/CNPJ, Endereço, Contato)</FormLabel> <FormControl><Textarea placeholder="CPF/CNPJ: 123.456.789-00&#10;Endereço do Cliente&#10;cliente@email.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} /></CardContent></Card>
                        </div>
                        <Card><CardHeader><CardTitle className="flex items-center gap-2 font-sans"><FileText size={20} /> Detalhes do Orçamento</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><FormField control={form.control} name="budgetNumber" render={({ field }) => ( <FormItem> <FormLabel>Número do Orçamento</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} /><FormField control={form.control} name="budgetDate" render={({ field }) => ( <FormItem> <FormLabel>Data de Emissão</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} /></div></CardContent></Card>
                        <Card><CardHeader><CardTitle className="font-sans">Itens do Orçamento</CardTitle></CardHeader><CardContent><div className="space-y-4"><div className="hidden md:grid grid-cols-[1fr,120px,120px,120px,40px] gap-4 items-center font-bold text-muted-foreground"><Label>Descrição</Label><Label>Quantidade</Label><Label>Preço Unit. (R$)</Label><Label>Subtotal (R$)</Label></div>{fields.map((field, index) => (<div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr,120px,120px,120px,40px] gap-2 md:gap-4 items-start p-2 rounded-md border md:border-none md:p-0"><FormField control={form.control} name={`items.${index}.description`} render={({ field }) => ( <FormItem> <FormControl><Textarea placeholder="Descrição..." {...field} className="min-h-[40px]" /></FormControl> <FormMessage /> </FormItem> )} /><FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => ( <FormItem> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} /><FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => ( <FormItem> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} /><div className="flex items-center h-10">{formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0))}</div><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>))}</div><Button type="button" variant="outline" className="mt-4" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item</Button></CardContent><CardFooter className="flex-col items-end space-y-2"><Separator className="my-4"/><div className="flex justify-between w-full"><span className="text-muted-foreground font-sans">Total</span><span className="font-bold text-lg font-sans">{formatCurrency(total)}</span></div></CardFooter></Card>
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card><CardHeader><CardTitle className="flex items-center gap-2 font-sans"><Banknote size={20} /> Condições</CardTitle></CardHeader><CardContent className="space-y-4"><FormField control={form.control} name="paymentConditions" render={({ field }) => ( <FormItem> <FormLabel>Condições de Pagamento</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} /><FormField control={form.control} name="validity" render={({ field }) => ( <FormItem> <FormLabel>Validade da Proposta</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} /></CardContent></Card>
                            <Card><CardHeader><CardTitle className="flex items-center gap-2 font-sans"><Info size={20} /> Observações</CardTitle></CardHeader><CardContent><FormField control={form.control} name="observations" render={({ field }) => ( <FormItem> <FormLabel>Observações Adicionais</FormLabel> <FormControl><Textarea placeholder="Qualquer outra informação relevante..." {...field} /></FormControl> <FormMessage /> </FormItem> )} /></CardContent></Card>
                        </div>
                        <Card><CardHeader><CardTitle className="flex items-center gap-2 font-sans"><CheckCircle size={20} /> Finalizar e Gerar PDF</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Revise os dados e clique no botão para gerar o documento PDF do seu orçamento.</p><div className="mt-4 p-4 border rounded-md bg-muted/20"><p className="font-bold font-sans">Valor Total: {formatCurrency(total)}</p><p className="text-sm text-muted-foreground">({totalInWords})</p></div></CardContent><CardFooter><Button type="submit" size="lg" disabled={isGeneratingPdf} className="w-full font-sans"><FileDown className="mr-2 h-4 w-4" />{isGeneratingPdf ? 'Gerando...' : 'Gerar Orçamento em PDF'}</Button></CardFooter></Card>
                    </form>
                </Form>
            </main>
            
            <div id="budget-preview-wrapper" className="hidden">
                <BudgetPreview {...currentFormData} total={total} totalInWords={totalInWords} />
            </div>
        </>
    );
}

type BudgetPreviewProps = BudgetFormValues & {
  total: number,
  totalInWords: string
};

// Using a separate component for the preview helps with organization
const BudgetPreview = (props: BudgetPreviewProps) => {
    return (
        <div id="budget-preview" className="bg-white text-black p-8" style={{width: '210mm', minHeight: '297mm', fontFamily: 'serif', position: 'relative'}}>
            <header className="flex justify-between items-start pb-4 border-b-2 border-neutral-700">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">{props.companyName}</h2>
                    <pre className="text-xs text-neutral-600 whitespace-pre-wrap font-sans">{props.companyInfo}</pre>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-neutral-800">ORÇAMENTO</h1>
                    <p className="text-neutral-600">Número: <span className="font-bold">{String(props.budgetNumber).padStart(4, '0')}</span></p>
                    <p className="text-neutral-600">Data: {props.budgetDate}</p>
                </div>
            </header>

            <section className="my-8">
                <h3 className="font-bold text-neutral-800">Cliente:</h3>
                <div className="p-4 border border-neutral-300 rounded mt-2">
                    <p className="font-bold">{props.clientName}</p>
                    <pre className="text-sm text-neutral-600 whitespace-pre-wrap font-sans">{props.clientInfo}</pre>
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
                        {props.items.map((item, index) => (
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
                <div className="w-2/3 md:w-1/2">
                    <div className="p-4 bg-neutral-100 rounded">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-neutral-800">VALOR TOTAL</span>
                            <span className="font-bold text-2xl text-neutral-900">{formatCurrency(props.total)}</span>
                        </div>
                        <p className="text-xs text-neutral-600 text-right mt-1">({props.totalInWords})</p>
                    </div>
                </div>
            </section>

            <section className="my-8 text-sm no-break">
                {props.paymentConditions && <div><h4 className="font-bold">Condições de Pagamento:</h4><p className="text-neutral-700">{props.paymentConditions}</p></div>}
                {props.validity && <div className="mt-2"><h4 className="font-bold">Validade da Proposta:</h4><p className="text-neutral-700">{props.validity}</p></div>}
                {props.observations && <div className="mt-4"><h4 className="font-bold">Observações:</h4><pre className="text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-2 border rounded font-sans">{props.observations}</pre></div>}
            </section>
            
            <footer className="absolute bottom-8 left-8 right-8 text-center text-xs text-neutral-500 border-t pt-4">
                <p>Obrigado pela sua preferência!</p>
                <p>{props.companyName}</p>
            </footer>
        </div>
    );
}
