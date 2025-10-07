
"use client";

import { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { PermutationContractData, PermutationObjectType } from '@/types/contract';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import numero from 'numero-por-extenso';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';

const objectTypeOptions: PermutationObjectType[] = [
  'Equipamentos',
  'Serviços',
  'Espaços',
  'Alimentos',
];

const getInitialPermutantObjectText = (type: PermutationObjectType) => {
    switch (type) {
        case 'Equipamentos':
            return 'Um equipamento X, modelo Y, em perfeito estado de funcionamento.';
        case 'Serviços':
            return 'Prestação de serviços de [especificar serviço], incluindo [detalhes do serviço].';
        case 'Espaços':
            return 'Cessão de uso do espaço [nome do espaço] para a realização de [especificar evento/finalidade].';
        case 'Alimentos':
            return 'Fornecimento de [quantidade] de [nome do produto alimentício] para o evento X.';
        default:
            return '';
    }
};

const getInitialConditionsText = (type: 'Com prazo' | 'Sem prazo', deadline?: string) => {
    if (type === 'Com prazo') {
        return `O PERMUTADO compromete-se a quitar o valor em serviços no prazo de ${deadline || '[definir prazo]'}. As partes se comprometem a manter comunicação clara e objetiva quanto à realização e entrega dos serviços.`;
    }
    return "Não há prazo limite estipulado para a quitação do valor em serviços. As partes se comprometem a manter comunicação clara e objetiva quanto à realização e entrega dos serviços.";
};

const getInitialPropertyTransferText = (objectType: PermutationObjectType) => {
    switch (objectType) {
        case 'Equipamentos':
        case 'Alimentos':
            return "A propriedade do bem/produto permutado será transferida ao PERMUTADO na assinatura deste contrato, sendo este responsável por sua guarda, manutenção e utilização a partir de então.";
        case 'Serviços':
            return "A obrigação de cada parte se encerra após a conclusão da entrega dos serviços acordados por ambos.";
        case 'Espaços':
            return "O direito de uso do espaço será concedido ao PERMUTADO nas datas e horários acordados entre as partes, sendo este responsável por zelar pelo local durante sua utilização.";
        default:
            return "A propriedade do bem/produto permutado será transferida ao PERMUTADO na assinatura deste contrato. No caso de permuta de serviços, a obrigação de cada parte se encerra após a conclusão da entrega acordada por ambos.";
    }
};

const getInitialGeneralDispositionsText = (): string => {
    return 'O presente contrato é firmado em caráter irrevogável e irretratável, obrigando as partes e seus sucessores. Qualquer alteração neste contrato só terá validade se feita por escrito e assinada por ambas as partes.';
};

export function PermutationContractForm() {
  const { control, watch, setValue } = useFormContext<PermutationContractData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'permutants',
  });

  const permutantObjectValue = watch('permutantObjectValue');
  const selectedObjectType = watch('permutantObjectType');
  const selectedConditionType = watch('conditionType');
  const conditionDeadline = watch('conditionDeadline');
  
  useEffect(() => {
    // Set initial default values if they are not set yet
    if (fields.length === 0) {
        append({ id: crypto.randomUUID(), name: '', cpfCnpj: '', address: '', email: '' });
        const initialObjectType: PermutationObjectType = 'Equipamentos';
        const initialConditionType: 'Com prazo' | 'Sem prazo' = 'Sem prazo';

        setValue('permutantObjectType', initialObjectType);
        setValue('permutantObject', getInitialPermutantObjectText(initialObjectType));
        setValue('permutantObjectValue', 5000);
        setValue('permutedObject', 'Serviços de produção audiovisual (gravação e edição) a serem prestados pela FastFilms.');
        
        setValue('conditionType', initialConditionType);
        setValue('conditions', getInitialConditionsText(initialConditionType));
        setValue('conditionDeadline', '90 dias');

        setValue('propertyTransfer', getInitialPropertyTransferText(initialObjectType));
        setValue('generalDispositions', getInitialGeneralDispositionsText());
        setValue('jurisdiction', 'Lagoa Santa/MG');
        setValue('signatureCity', 'Lagoa Santa');
        setValue('signatureDate', format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }));
    }
  }, [append, fields.length, setValue]);

  useEffect(() => {
      if (selectedObjectType) {
          setValue('propertyTransfer', getInitialPropertyTransferText(selectedObjectType));
          setValue('permutantObject', getInitialPermutantObjectText(selectedObjectType));
      }
  }, [selectedObjectType, setValue]);

  useEffect(() => {
      if (selectedConditionType) {
          setValue('conditions', getInitialConditionsText(selectedConditionType, conditionDeadline));
      }
  }, [selectedConditionType, conditionDeadline, setValue]);

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
                    <FormField
                        control={control}
                        name="permutantObjectType"
                        render={({ field }) => (
                        <FormItem>
                             <FormLabel>Tipo de Objeto do PERMUTANTE</FormLabel>
                             <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                {objectTypeOptions.map((type) => (
                                    <FormItem key={type}>
                                        <FormControl>
                                            <RadioGroupItem value={type} className="sr-only" id={`type-${type}`}/>
                                        </FormControl>
                                        <Label htmlFor={`type-${type}`} className={cn("flex items-center justify-center rounded-md border-2 border-muted p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-center", field.value === type && "bg-accent text-accent-foreground border-accent-foreground/50")}>
                                            {type}
                                        </Label>
                                    </FormItem>
                                ))}
                            </RadioGroup>
                            <FormMessage />
                        </FormItem>
                    )}/>

                    <FormField control={control} name="permutantObject" render={({ field }) => ( <FormItem><FormLabel>Descrição do Objeto oferecido pelo PERMUTANTE</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
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
            
            <div>
                <FormLabel>Cláusula 2 - Das Condições</FormLabel>
                <div className="p-4 border rounded-md mt-2 space-y-4">
                    <FormField
                        control={control}
                        name="conditionType"
                        render={({ field }) => (
                        <FormItem>
                             <FormLabel>Prazo para Quitação</FormLabel>
                             <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Sem prazo" /></FormControl><FormLabel className="font-normal">Sem prazo</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Com prazo" /></FormControl><FormLabel className="font-normal">Com prazo</FormLabel></FormItem>
                            </RadioGroup>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    {selectedConditionType === 'Com prazo' && (
                        <FormField control={control} name="conditionDeadline" render={({ field }) => ( <FormItem><FormLabel>Definir Prazo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    )}
                     <FormField control={control} name="conditions" render={({ field }) => ( 
                        <FormItem>
                            <FormLabel>Texto da Cláusula</FormLabel>
                            <FormControl><Textarea {...field} rows={4} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>

            <FormField control={control} name="propertyTransfer" render={({ field }) => ( 
                <FormItem>
                    <FormLabel>Cláusula 3 - Da Transferência de Propriedade/Uso</FormLabel>
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
