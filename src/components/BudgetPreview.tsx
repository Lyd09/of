"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BudgetPreviewData } from '@/types/budget';
import { FileText } from 'lucide-react';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const BudgetPreview = ({ data }: { data: BudgetPreviewData | null }) => {
    if (!data || !data.clientName) {
        return (
            <Card className="sticky top-8 bg-[#18191b] text-[#e0e0e0] border-border shadow-lg">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
                    <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold text-foreground">Orçamento</h3>
                    <p className="text-muted-foreground text-center">Preencha o formulário para ver a pré-visualização.</p>
                </CardContent>
            </Card>
        );
    }

    const {
        companyName,
        logoUrl,
        slogan,
        isDroneFeatureEnabled,
        budgetNumber,
        budgetDate,
        clientName,
        items,
        subtotal,
        totalAmount,
        paymentConditions,
        commercialConditions,
    } = data;

    return (
        <Card className="sticky top-8 bg-[#18191b] text-[#e0e0e0] border-border shadow-lg font-sans">
            <CardContent className="p-8">
                {/* Header */}
                <header className="flex justify-between items-start pb-4 mb-4 border-b border-border/50">
                    <div className="flex items-center gap-4">
                        {logoUrl && <Image src={logoUrl} alt="Logo da Empresa" width={60} height={60} unoptimized />}
                        <div>
                            <h2 className="text-2xl font-bold text-white">{companyName}</h2>
                            {slogan && <p className="text-sm text-neutral-400">{slogan}</p>}
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-white">ORÇAMENTO</h1>
                        {isDroneFeatureEnabled && <p className="text-sm text-drone-active">(com Drone)</p>}
                        <p className="text-neutral-400">Nº: <span className="font-semibold">{budgetNumber === "0000" ? 'PREVIEW' : budgetNumber}</span></p>
                        <p className="text-neutral-400">Data: {budgetDate}</p>
                    </div>
                </header>

                {/* Client Info */}
                <section className="mb-6 pb-4 border-b border-border/50">
                     <h3 className="text-neutral-400 mb-1">Cliente:</h3>
                     <p className="font-bold text-lg text-white">{clientName}</p>
                </section>

                {/* Items Table */}
                <section className="my-6">
                    <h3 className="font-bold text-neutral-200 mb-2">Itens do Orçamento:</h3>
                    {items && items.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/2 text-white">Descrição</TableHead>
                                    <TableHead className="text-center text-white">Qtde.</TableHead>
                                    <TableHead className="text-right text-white">Preço Unit.</TableHead>
                                    <TableHead className="text-right text-white">Total Item</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="align-top">
                                            {item.description}
                                        </TableCell>
                                        <TableCell className="text-center align-top">{item.quantity} {item.unit}</TableCell>
                                        <TableCell className="text-right align-top">{formatCurrency(item.unitPrice)}</TableCell>
                                        <TableCell className="text-right align-top">{formatCurrency(item.itemTotal)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-neutral-400">
                            <p>Nenhum item adicionado ainda.</p>
                        </div>
                    )}
                </section>

                {/* Totals */}
                <section className="flex flex-col items-end my-6 space-y-2">
                    <div className="text-right w-full max-w-sm">
                        <div className="flex justify-between py-1 text-lg">
                            <span className="text-neutral-400">Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <Separator className="my-2 bg-border" />
                        <div className="flex justify-between text-3xl font-bold text-white py-1">
                            <span>Total:</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </section>
                
                {/* Terms and Footer */}
                <footer className="space-y-4 text-sm pt-4 border-t border-border/50">
                     {(commercialConditions || paymentConditions) && <h4 className="font-bold text-neutral-200 text-xl mb-4">Termos e Condições:</h4>}
                     {commercialConditions && <p className="text-neutral-400"><span className="font-medium">Condições Comerciais:</span> {commercialConditions}</p>}
                     {paymentConditions && <p className="text-neutral-400"><span className="font-medium">Condições de Pagamento:</span> {paymentConditions}</p>}
                     <div className="text-center text-xs text-neutral-500 pt-8">
                        <p>Obrigado pela preferência! — {companyName}</p>
                    </div>
                </footer>
            </CardContent>
        </Card>
    );
};
