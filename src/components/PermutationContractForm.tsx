
"use client";

import { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { PermutationContractData } from '@/types/contract';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import numero from 'numero-por-extenso';

const initialConditionsText = "Não há prazo limite estipulado para a quitação do valor em serviços. As partes se comprometem a manter comunicação clara e objetiva quanto à realização e entrega dos serviços.";
const initialPropertyTransferText = "A propriedade do bem/produto permutado será transferida ao PERMUTADO na assinatura deste contrato, sendo este responsável por sua guarda, manutenção e utilização a partir de então. No caso de permuta de serviços, a obrigação de cada parte se encerra após a conclusão da entrega acordada por ambos.";
const initialGeneralDispositionsText = "O presente contrato é firmado em caráter irrevogável e irretratável, obrigando as partes e seus sucessores. Qualquer alteração neste contrato só terá validade se feita por escrito e assinada por ambas as partes.";

export function PermutationContractForm() {
  const { control, watch, setValue } = useFormContext<PermutationContractData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'permutants',
  });

  const permutantObjectValue = watch('permutantObjectValue');

  useEffect(() => {
    // Set initial default values if they are not set yet
    if (fields.length === 0) {
        append({ id: crypto.randomUUID(), name: '', cpfCnpj: '', address: '', email: '' });
        setValue('permutantObject', 'Um equipamento X, modelo Y, em perfeito estado de funcionamento.');
        setValue('permutantObjectValue', 5000);
        setValue('permutedObject', 'Serviços de produção audiovisual (gravação e edição) a serem prestados pela FastFilms.');
        setValue('conditions', initialConditionsText);
        setValue('propertyTransfer', initialPropertyTransferText);
        setValue('generalDispositions', initialGeneralDispositionsText);
        setValue('jurisdiction', 'Lagoa Santa/MG');
        setValue('signatureCity', 'Lagoa Santa');
        setValue('signatureDate', format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }));
    }
  }, [append, fields.length, setValue, watch]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Partes Envolvidas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p className='text-sm p-4 bg-background rounded-md'>
                <strong>PERMUTADO:</strong> FastFilms (dados preenchidos automaticamente no documento).
            </p>
            <div className="space-y-4">
                <h3 className='font-medium mb-2'>PERMUTANTE(S)</h3>
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md relative space-y-2">
                        {fields.length > 1 && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                        <FormField control={control} name={`permutants.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} placeholder="Nome do Permutante" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={control} name={`permutants.${index}.cpfCnpj`} render={({ field }) => ( <FormItem><FormLabel>CPF/CNPJ</FormLabel><FormControl><Input {...field} placeholder="000.000.000-00" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={control} name={`permutants.${index}.address`} render={({ field }) => ( <FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} placeholder="Rua, Número, Bairro, Cidade - UF" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={control} name={`permutants.${index}.email`} render={({ field }) => ( <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input {...field} type="email" placeholder="email@exemplo.com" /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                ))}
                 <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), name: '', cpfCnpj: '', address: '', email: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Permutante
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Cláusulas do Contrato</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div>
                <FormLabel>Cláusula 1 - Objeto da Permuta</FormLabel>
                <div className="p-4 border rounded-md mt-2 space-y-4">
                    <FormField control={control} name="permutantObject" render={({ field }) => ( <FormItem><FormLabel>Objeto oferecido pelo PERMUTANTE</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="permutantObjectValue" render={({ field }) => ( 
                        <FormItem>
                            <FormLabel>Valor Avaliado do Objeto (R$)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                            {permutantObjectValue > 0 && <p className="text-sm text-muted-foreground">{numero.porExtenso(permutantObjectValue, numero.estilo.monetario)}.</p>}
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={control} name="permutedObject" render={({ field }) => ( <FormItem><FormLabel>Objeto/Serviço oferecido pelo PERMUTADO</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>
            
            <FormField control={control} name="conditions" render={({ field }) => ( 
                <FormItem>
                    <FormLabel>Cláusula 2 - Das Condições</FormLabel>
                    <FormControl><Textarea {...field} rows={4} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={control} name="propertyTransfer" render={({ field }) => ( 
                <FormItem>
                    <FormLabel>Cláusula 3 - Da Transferência de Propriedade</FormLabel>
                    <FormControl><Textarea {...field} rows={5} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />

             <FormField control={control} name="generalDispositions" render={({ field }) => ( 
                <FormItem>
                    <FormLabel>Cláusula 4 - Das Disposições Gerais</FormLabel>
                    <FormControl><Textarea {...field} rows={4} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <div>
                <FormLabel>Cláusula 5 - Foro</FormLabel>
                <div className="p-4 border rounded-md mt-2">
                    <FormField control={control} name="jurisdiction" render={({ field }) => ( <FormItem><FormLabel>Foro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Local e Data da Assinatura</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <FormField control={control} name="signatureCity" render={({ field }) => ( <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={control} name="signatureDate" render={({ field }) => ( <FormItem><FormLabel>Data Completa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        </CardContent>
      </Card>

    </div>
  );
}
