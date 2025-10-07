"use client";

import { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ServiceContractData, ServiceType } from '@/types/contract';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import numero from 'numero-por-extenso';

const serviceOptions: ServiceType[] = [
  'Produção de Vídeo',
  'Edição de Vídeo',
  'Criação de Site',
  'Filmagem com Drone',
  'Desenvolvimento de Software',
  'Motion Graphics',
];

const getInitialObjectText = (service: ServiceType) => {
    switch (service) {
        case 'Produção de Vídeo':
            return 'O presente contrato tem como objeto a prestação de serviços de gravação e edição de [NÚMERO] (por extenso) vídeos, conforme briefing e orientações fornecidas pelo CONTRATANTE.';
        default:
            return '';
    }
}

const getInitialResponsibilitiesText = (service: ServiceType) => {
    switch (service) {
        case 'Produção de Vídeo':
            return 'Gravar os vídeos conforme combinado;\nEditar os vídeos;\nEntregar os vídeos finalizados dentro do prazo estipulado.';
        default:
            return '';
    }
}

export function ServiceContractForm() {
  const { control, watch, setValue } = useFormContext<ServiceContractData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contractors',
  });

  const selectedService = watch('serviceType') as ServiceType;
  const paymentMethod = watch('paymentMethod');
  const totalValue = watch('totalValue');
  
  useEffect(() => {
    // Seta os valores iniciais quando o formulário é montado pela primeira vez.
    setValue('serviceType', 'Produção de Vídeo');
    setValue('contractors', [{ id: crypto.randomUUID(), name: '', cpfCnpj: '', address: '', email: '' }]);
    setValue('paymentMethod', 'Sinal + Entrega');
    setValue('paymentSignalPercentage', 50);
    setValue('deliveryDeadline', '4 dias úteis após a realização da última gravação, salvo acordo diferente entre as partes.');
    setValue('clientResponsibilities', 'Fornecer todas as informações, logos, e materiais necessários para a execução dos serviços;\nAprovar as etapas do projeto dentro dos prazos solicitados.');
    setValue('copyright', 'Todos os direitos de propriedade intelectual sobre os materiais criados pertencerão ao CONTRATANTE após a quitação integral do valor acordado. A CONTRATADA reserva-se o direito de utilizar o material em seu portfólio.');
    setValue('rescissionNoticePeriod', 7);
    setValue('rescissionFine', 20);
    setValue('jurisdiction', 'Lagoa Santa/MG');
    setValue('signatureCity', 'Lagoa Santa');
    setValue('signatureDate', format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }));

  }, [setValue]);

  useEffect(() => {
    if(selectedService) {
        setValue('contractTitle', `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ${selectedService.toUpperCase()}`);
        setValue('object', getInitialObjectText(selectedService));
        setValue('contractorResponsibilities', getInitialResponsibilitiesText(selectedService));
    }
  }, [selectedService, setValue]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Serviço Principal</CardTitle></CardHeader>
        <CardContent>
            <FormField
                control={control}
                name="serviceType"
                render={({ field }) => (
                <FormItem>
                    <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                    {serviceOptions.map((service) => (
                        <FormItem key={service}>
                        <FormControl>
                            <RadioGroupItem value={service} className="sr-only" id={service}/>
                        </FormControl>
                        <Label htmlFor={service} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:bg-accent [&:has([data-state=checked])]:text-accent-foreground cursor-pointer text-center">
                            {service}
                        </Label>
                        </FormItem>
                    ))}
                    </RadioGroup>
                    <FormMessage />
                </FormItem>
                )}
            />
        </CardContent>
      </Card>
      
      <FormField control={control} name="contractTitle" render={({ field }) => (
          <FormItem>
              <FormLabel>Título do Contrato</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
          </FormItem>
      )} />

      {/* CONTRATANTE(S) */}
      <Card>
        <CardHeader><CardTitle>Contratante(s)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            {fields.map((field, index) => (
                 <div key={field.id} className="p-4 border rounded-md relative space-y-2">
                    {fields.length > 1 && (
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                     <FormField control={control} name={`contractors.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} placeholder="Nome do Contratante" /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={control} name={`contractors.${index}.cpfCnpj`} render={({ field }) => ( <FormItem><FormLabel>CPF/CNPJ</FormLabel><FormControl><Input {...field} placeholder="000.000.000-00" /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={control} name={`contractors.${index}.address`} render={({ field }) => ( <FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} placeholder="Rua, Número, Bairro, Cidade - UF" /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={control} name={`contractors.${index}.email`} render={({ field }) => ( <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input {...field} type="email" placeholder="email@exemplo.com" /></FormControl><FormMessage /></FormItem>)} />
                 </div>
            ))}
             <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), name: '', cpfCnpj: '', address: '', email: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Contratante
            </Button>
        </CardContent>
      </Card>

      {/* Cláusulas */}
      <Card>
        <CardHeader><CardTitle>Cláusulas do Contrato</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <FormField control={control} name="object" render={({ field }) => ( <FormItem><FormLabel>Cláusula 1 - Objeto do Contrato</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
            
            <div>
                <FormLabel>Cláusula 2 - Valor e Forma de Pagamento</FormLabel>
                <div className="p-4 border rounded-md mt-2 space-y-4">
                    <FormField control={control} name="totalValue" render={({ field }) => ( 
                        <FormItem>
                            <FormLabel>Valor Total (R$)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                            {totalValue > 0 && <p className="text-sm text-muted-foreground">{numero.porExtenso(totalValue, numero.estilo.monetario)}.</p>}
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField
                        control={control}
                        name="paymentMethod"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Forma de Pagamento</FormLabel>
                             <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="À vista" /></FormControl><FormLabel className="font-normal">À vista</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Sinal + Entrega" /></FormControl><FormLabel className="font-normal">Sinal + Entrega</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Outro" /></FormControl><FormLabel className="font-normal">Outro</FormLabel></FormItem>
                            </RadioGroup>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    {paymentMethod === 'Sinal + Entrega' && (
                        <FormField control={control} name="paymentSignalPercentage" render={({ field }) => ( 
                            <FormItem>
                                <FormLabel>Porcentagem do Sinal (%)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                    {paymentMethod === 'Outro' && (
                        <FormField control={control} name="paymentMethodOther" render={({ field }) => ( 
                            <FormItem>
                                <FormLabel>Descreva a forma de pagamento</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                </div>
            </div>

            <FormField control={control} name="deliveryDeadline" render={({ field }) => ( <FormItem><FormLabel>Cláusula 3 - Prazo de Entrega</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

            <div>
                <FormLabel>Cláusula 4 - Responsabilidades</FormLabel>
                <div className="p-4 border rounded-md mt-2 space-y-4">
                    <FormField control={control} name="contractorResponsibilities" render={({ field }) => ( <FormItem><FormLabel>Compete à CONTRATADA</FormLabel><FormControl><Textarea {...field} rows={5}/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="clientResponsibilities" render={({ field }) => ( <FormItem><FormLabel>Compete ao(s) CONTRATANTE(S)</FormLabel><FormControl><Textarea {...field} rows={5}/></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

             <div>
                <FormLabel>Cláusulas Finais</FormLabel>
                <div className="p-4 border rounded-md mt-2 space-y-4">
                     <FormField control={control} name="copyright" render={({ field }) => ( <FormItem><FormLabel>Direitos Autorais</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={control} name="rescissionNoticePeriod" render={({ field }) => ( <FormItem><FormLabel>Aviso Prévio (dias)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={control} name="rescissionFine" render={({ field }) => ( <FormItem><FormLabel>Multa de Rescisão (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>)} />
                     </div>
                     <FormField control={control} name="jurisdiction" render={({ field }) => ( <FormItem><FormLabel>Foro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

        </CardContent>
      </Card>
      
      {/* Assinatura */}
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
