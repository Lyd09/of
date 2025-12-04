
"use client";

import { useEffect, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ServiceContractData, ServiceType, ServiceInclusion, Client } from '@/types/contract';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import numero from 'numero-por-extenso';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from './ui/combobox';
import { Switch } from './ui/switch';

const serviceOptions: ServiceType[] = [
  'Produção de Vídeo',
  'Edição de Vídeo',
  'Website',
  'Drone',
  'Desenvolvimento de Software',
  'Motion Graphics',
];

const serviceInclusionOptions: ServiceInclusion[] = [
    'Apenas Vídeo',
    'Vídeo e Fotos',
];

const getObjectText = (service: ServiceType, inclusion: ServiceInclusion, videoCount?: number, photoCount?: number) => {
    let baseText = '';

    const videoStr = videoCount ? `${videoCount} (${numero.porExtenso(videoCount)})` : '[NÚMERO]';
    const photoStr = photoCount ? `${photoCount} (${numero.porExtenso(photoCount)})` : '[NÚMERO]';

    switch (service) {
        case 'Produção de Vídeo':
            baseText = `O presente contrato tem como objeto a prestação de serviços de gravação e edição de ${videoStr} vídeo(s)`;
            if (inclusion === 'Vídeo e Fotos') {
                baseText += ` e a entrega de ${photoStr} foto(s) editada(s) em alta resolução`;
            }
            baseText += ', conforme briefing e orientações fornecidas pelo CONTRATANTE.';
            break;
        case 'Edição de Vídeo':
            baseText = `O presente contrato tem como objeto a prestação de serviços de edição de ${videoStr} vídeo(s) a partir de material bruto fornecido pelo CONTRATANTE e/ou captado anteriormente pela CONTRATADA.`;
             if (inclusion === 'Vídeo e Fotos') {
                baseText += ` Inclui também a edição e entrega de ${photoStr} foto(s).`;
            }
            break;
        case 'Website':
            baseText = 'O presente contrato tem como objeto a criação e desenvolvimento de um website institucional/plataforma online, conforme escopo e funcionalidades detalhadas em anexo ou briefing.';
            break;
        case 'Drone':
            baseText = 'O presente contrato tem como objeto a captação de imagens aéreas com drone, conforme plano de voo e orientações acordadas com o CONTRATANTE.';
             if (inclusion === 'Vídeo e Fotos') {
                 baseText += ` Inclui a entrega do material bruto de vídeo e ${photoStr} foto(s) editada(s).`;
            } else {
                 baseText += ` Inclui a entrega do material bruto de ${videoStr} vídeo(s).`;
            }
            break;
        case 'Desenvolvimento de Software':
            baseText = 'O presente contrato tem como objeto o desenvolvimento e implementação de uma solução de software customizada, conforme especificações técnicas e requisitos detalhados em anexo ou briefing.';
            break;
        case 'Motion Graphics':
            baseText = `O presente contrato tem como objeto a criação e produção de ${videoStr} animação(ões) 2D/3D (motion graphics), incluindo design de elementos gráficos, personagens, cenários e animação, para explicar um conceito, promover um produto ou contar uma história, conforme roteiro e storyboard aprovados.`;
            break;
        default:
            return '';
    }
    return baseText;
}

const getInitialContractorResponsibilitiesText = (service: ServiceType) => {
    switch (service) {
        case 'Produção de Vídeo':
            return 'Gravar os vídeos conforme combinado;\nEditar os vídeos;\nEntregar os vídeos finalizados dentro do prazo estipulado.';
        case 'Edição de Vídeo':
            return 'Receber e organizar o material bruto fornecido;\nRealizar a edição, montagem, correção de cor e finalização dos vídeos;\nEntregar os vídeos finalizados nos formatos solicitados.';
        case 'Website':
            return 'Desenvolver o layout e design do site conforme identidade visual do cliente;\nImplementar as funcionalidades acordadas (formulários, galerias, etc.);\nOferecer um período de garantia de 6 meses para correção de bugs.';
        case 'Drone':
            return 'Operar o drone para capturar as imagens aéreas solicitadas;\nEntregar o material bruto capturado em formato digital;';
        case 'Desenvolvimento de Software':
            return 'Analisar os requisitos e modelar a arquitetura do software;\nCodificar, testar e depurar a aplicação;\nFornecer documentação técnica e de usuário.';
        case 'Motion Graphics':
            return 'Criar o storyboard conforme briefing combinado;\nDesenvolver e animar os elementos gráficos, personagens e textos;\nRenderizar e entregar o vídeo final no formato acordado.';
        default:
            return '';
    }
}

const getInitialClientResponsibilitiesText = (service: ServiceType) => {
    switch(service) {
        case 'Website':
            return 'Fornecer todo o material de texto, imagens e vídeos para o site;\nFornecer o logotipo e o manual da marca (se houver);\nRealizar as aprovações das etapas de design e desenvolvimento dentro do prazo combinado.';
        case 'Drone':
            return 'Garantir que a área de voo esteja segura e desimpedida;\nObter as autorizações necessárias para a filmagem no local, se aplicável;\nEfetuar os pagamentos nas condições previstas;';
        case 'Desenvolvimento de Software':
            return 'Participar ativamente da definição de requisitos e validação das entregas;\nFornecer os dados e acessos necessários para os testes;\nRealizar a homologação do software.';
        case 'Motion Graphics':
            return 'Fornecer roteiro e todas as informações necessárias para a animação;\nAprovar o storyboard e as etapas de animação;\nEfetuar os pagamentos nas condições previstas.';
        default:
            return 'Fornecer todas as informações, logos, e materiais necessários para a execução dos serviços;\nAprovar as etapas do projeto dentro dos prazos solicitados.';
    }
}

const getInitialWarrantyClause = (service: ServiceType): string => {
    if (service === 'Website') {
        return 'A CONTRATADA oferece uma garantia de 6 (seis) meses para correção de bugs ou problemas técnicos decorrentes do desenvolvimento, contados a partir da data de entrega final do projeto. Esta garantia não cobre novas funcionalidades ou alterações de escopo.';
    }
    return ''; // Retorna vazio para outros serviços
}

const getInitialSpecificationsClause = (service: ServiceType): string => {
    if (service === 'Desenvolvimento de Software') {
        return 'As especificações técnicas, requisitos funcionais e não funcionais, escopo e tecnologias a serem utilizadas estão detalhadas no documento anexo (Anexo I - Especificação de Requisitos), que é parte integrante e inseparável deste contrato.';
    }
    return '';
}

const getInitialGeneralDispositions = (): string => {
    return 'Qualquer alteração neste contrato só terá validade se feita por escrito e assinada por ambas as partes.';
}

export function ServiceContractForm() {
  const { control, watch, setValue, formState: { isSubmitting, isDirty, isValid, isSubmitted } } = useFormContext<ServiceContractData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contractors',
  });
  
  const [clients, setClients] = useState<Client[]>([]);
  const [searchingStates, setSearchingStates] = useState<boolean[]>([]);
  const { toast } = useToast();

  const selectedService = watch('serviceType') as ServiceType;
  const selectedInclusion = watch('serviceInclusion') as ServiceInclusion;
  const videoCount = watch('videoCount');
  const photoCount = watch('photoCount');
  const paymentMethod = watch('paymentMethod');
  const totalValue = watch('totalValue');

  useEffect(() => {
    const fetchClients = async () => {
        try {
            const response = await fetch('/api/clients');
            if (response.ok) {
                const data = await response.json();
                setClients(data);
            } else {
                throw new Error('Falha ao buscar clientes');
            }
        } catch (error) {
            toast({
                title: 'Erro ao carregar clientes',
                description: 'Não foi possível buscar a lista de clientes.',
                variant: 'destructive'
            })
        }
    };
    fetchClients();
  }, [toast]);

   useEffect(() => {
    // Initialize searching states for existing fields
    setSearchingStates(fields.map(() => false));
  }, [fields.length]);
  
  const handleClientSelection = (clientId: string, index: number) => {
    const selectedClient = clients.find(c => c.id.toLowerCase() === clientId.toLowerCase());
    if (selectedClient) {
        setValue(`contractors.${index}.name`, selectedClient.name);
        setValue(`contractors.${index}.cpfCnpj`, selectedClient.cpfCnpj);
        setValue(`contractors.${index}.address`, selectedClient.address);
        setValue(`contractors.${index}.email`, selectedClient.email);
    }
  }

  const handleSearchToggle = (isSearching: boolean, index: number) => {
      const newStates = [...searchingStates];
      newStates[index] = isSearching;
      setSearchingStates(newStates);
      
      setValue(`contractors.${index}.name`, '');
      setValue(`contractors.${index}.cpfCnpj`, '');
      setValue(`contractors.${index}.address`, '');
      setValue(`contractors.${index}.email`, '');
  };
  
  const handleAppendContractor = () => {
    append({ id: crypto.randomUUID(), name: '', cpfCnpj: '', address: '', email: '' });
  };


  useEffect(() => {
    const initialService = 'Produção de Vídeo';
    const initialInclusion = 'Apenas Vídeo';
    if (!watch('serviceType')) {
        setValue('serviceType', initialService, { shouldDirty: true });
        setValue('serviceInclusion', initialInclusion, { shouldDirty: true });
        setValue('videoCount', 1);
        setValue('photoCount', 10);
        setValue('contractors', [{ id: crypto.randomUUID(), name: '', cpfCnpj: '', address: '', email: '' }], { shouldDirty: true });
        setValue('paymentMethod', 'Sinal + Entrega', { shouldDirty: true });
        setValue('paymentSignalPercentage', 50, { shouldDirty: true });
        setValue('deliveryDeadline', '4 dias úteis após a realização da última gravação, salvo acordo diferente entre as partes.', { shouldDirty: true });
        setValue('clientResponsibilities', getInitialClientResponsibilitiesText(initialService), { shouldDirty: true });
        setValue('copyright', 'Todos os direitos de propriedade intelectual sobre os materiais criados pertencerão ao CONTRATANTE após a quitação integral do valor acordado. A CONTRATADA reserva-se o direito de utilizar o material em seu portfólio.', { shouldDirty: true });
        setValue('rescissionNoticePeriod', 7, { shouldDirty: true });
        setValue('rescissionFine', 20, { shouldDirty: true });
        setValue('jurisdiction', 'Lagoa Santa/MG', { shouldDirty: true });
        setValue('signatureCity', 'Lagoa Santa', { shouldDirty: true });
        setValue('signatureDate', format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }), { shouldDirty: true });
        setValue('generalDispositions', getInitialGeneralDispositions(), { shouldDirty: true });
        setValue('warranty', getInitialWarrantyClause(initialService), { shouldDirty: true });
        setValue('specifications', getInitialSpecificationsClause(initialService), { shouldDirty: true });
    }

  }, [setValue, watch]);

  useEffect(() => {
    if(selectedService) {
        let titleText = selectedService.toUpperCase();
        if (selectedService === 'Drone') {
            titleText = 'SERVIÇOS DE DRONE';
        }
        setValue('contractTitle', `CONTRATO DE PRESTAÇÃO DE ${titleText}`);
        setValue('object', getObjectText(selectedService, selectedInclusion, videoCount, photoCount));
        setValue('contractorResponsibilities', getInitialContractorResponsibilitiesText(selectedService));
        setValue('clientResponsibilities', getInitialClientResponsibilitiesText(selectedService));
        setValue('generalDispositions', getInitialGeneralDispositions());
        setValue('warranty', getInitialWarrantyClause(selectedService));
        setValue('specifications', getInitialSpecificationsClause(selectedService));
    }
  }, [selectedService, selectedInclusion, videoCount, photoCount, setValue]);
  
  const clientOptions = clients.map(client => ({ value: client.id, label: `${client.name} - ${client.cpfCnpj}` }));


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Escopo do Serviço</CardTitle></CardHeader>
        <CardContent className="space-y-6">
            <FormField
                control={control}
                name="serviceType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de Serviço</FormLabel>
                    <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                    {serviceOptions.map((service) => {
                        const isSelected = field.value === service;
                        const labelClassName = cn(
                            "flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer text-center",
                             isSelected && "bg-accent text-accent-foreground border-accent-foreground/50"
                        );
                        return (
                        <FormItem key={service}>
                            <FormControl>
                                <RadioGroupItem value={service} className="sr-only" id={service}/>
                            </FormControl>
                            <Label htmlFor={service} className={labelClassName}>
                                {service}
                            </Label>
                        </FormItem>
                        )
                    })}
                    </RadioGroup>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            {(selectedService === 'Produção de Vídeo' || selectedService === 'Edição de Vídeo' || selectedService === 'Drone') && (
                 <FormField
                    control={control}
                    name="serviceInclusion"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Inclusões</FormLabel>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                        >
                        {serviceInclusionOptions.map((inclusion) => {
                            const isSelected = field.value === inclusion;
                            const labelClassName = cn(
                                "flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer text-center",
                                isSelected && "bg-accent text-accent-foreground border-accent-foreground/50"
                            );
                            return (
                            <FormItem key={inclusion}>
                                <FormControl>
                                    <RadioGroupItem value={inclusion} className="sr-only" id={inclusion}/>
                                </FormControl>
                                <Label htmlFor={inclusion} className={labelClassName}>
                                    {inclusion}
                                </Label>
                            </FormItem>
                            )
                        })}
                        </RadioGroup>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
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
                 <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                    {fields.length > 1 && (
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                     <div className="flex items-center space-x-2">
                        <Switch
                            id={`contractor-search-mode-${index}`}
                            checked={searchingStates[index]}
                            onCheckedChange={(checked) => handleSearchToggle(checked, index)}
                        />
                        <Label htmlFor={`contractor-search-mode-${index}`}>Buscar contratante cadastrado</Label>
                    </div>
                     {searchingStates[index] ? (
                        <FormItem className="flex flex-col">
                            <FormLabel>Buscar Contratante</FormLabel>
                            <Combobox
                                options={clientOptions}
                                value={clients.find(c => c.name === watch(`contractors.${index}.name`))?.id || ''}
                                onChange={(clientId) => handleClientSelection(clientId, index)}
                                placeholder="Busque por nome ou CPF/CNPJ..."
                                searchPlaceholder="Digite para buscar..."
                                emptyPlaceholder="Nenhum cliente encontrado."
                            />
                        </FormItem>
                    ) : (
                        <FormField
                            control={control}
                            name={`contractors.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Contratante</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Digite o nome do novo contratante" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                     <FormField control={control} name={`contractors.${index}.cpfCnpj`} render={({ field }) => ( <FormItem><FormLabel>CPF/CNPJ</FormLabel><FormControl><Input {...field} placeholder="000.000.000-00" /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={control} name={`contractors.${index}.address`} render={({ field }) => ( <FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} placeholder="Rua, Número, Bairro, Cidade - UF" /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={control} name={`contractors.${index}.email`} render={({ field }) => ( <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input {...field} type="email" placeholder="email@contratante.com" /></FormControl><FormMessage /></FormItem>)} />
                 </div>
            ))}
             <Button type="button" variant="outline" onClick={handleAppendContractor}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Contratante
            </Button>
        </CardContent>
      </Card>

      {/* Cláusulas */}
      <Card>
        <CardHeader><CardTitle>Cláusulas do Contrato</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            
             <div>
                <FormLabel>Cláusula 1 - Objeto do Contrato</FormLabel>
                 <div className="p-4 border rounded-md mt-2 space-y-4">
                    {(selectedService !== 'Website' && selectedService !== 'Desenvolvimento de Software') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <FormField control={control} name="videoCount" render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel>Nº de Vídeos</FormLabel>
                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            {selectedInclusion === 'Vídeo e Fotos' && (
                                <FormField control={control} name="photoCount" render={({ field }) => ( 
                                    <FormItem>
                                        <FormLabel>Nº de Fotos</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                        </div>
                    )}
                    <FormField control={control} name="object" render={({ field }) => ( <FormItem><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

            <div>
                <FormLabel>Cláusula 2 - Valor e Forma de Pagamento</FormLabel>
                <div className="p-4 border rounded-md mt-2 space-y-4">
                    <FormField control={control} name="totalValue" render={({ field }) => ( 
                        <FormItem>
                            <FormLabel>Valor Total (R$)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
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
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
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
                        <FormField control={control} name="rescissionNoticePeriod" render={({ field }) => ( <FormItem><FormLabel>Aviso Prévio (dias)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={control} name="rescissionFine" render={({ field }) => ( <FormItem><FormLabel>Multa de Rescisão (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                     </div>
                     <FormField control={control} name="generalDispositions" render={({ field }) => ( <FormItem><FormLabel>Disposições Gerais</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                     {selectedService === 'Website' && (
                        <FormField control={control} name="warranty" render={({ field }) => ( <FormItem><FormLabel>Garantia</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                     )}
                     {selectedService === 'Desenvolvimento de Software' && (
                        <FormField control={control} name="specifications" render={({ field }) => ( <FormItem><FormLabel>Especificações Técnicas</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                     )}
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
