
"use client";

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { AuthorizationTermData, Client } from '@/types/contract';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from './ui/combobox';

const initialPermissionsText = `O AUTORIZADO(A) poderá utilizar o material descrito na Cláusula 1ª exclusivamente para compor seu portfólio pessoal em sites, redes sociais de cunho profissional (como LinkedIn e Vimeo) e apresentações diretas a potenciais clientes.
É expressamente vedado ao AUTORIZADO(A):
- Monetizar o material, no todo ou em parte, através de plataformas de vídeo, publicidade ou qualquer outro meio;
- Utilizar trechos que contenham a imagem de pessoas identificáveis, caso estas não tenham cedido seus direitos de imagem para este fim específico;
- Realizar edições, cortes ou alterações que distorçam o sentido original da obra, a mensagem do cliente final ou a marca da AUTORIZANTE;
- Omitir o crédito. É obrigatório que, em toda e qualquer veiculação, o AUTORIZADO(A) atribua o crédito de produção à FastFilms, não podendo, em nenhuma hipótese, sugerir que o projeto foi uma realização integralmente sua.`;

export function AuthorizationTermForm() {
  const { control, watch, setValue } = useFormContext<AuthorizationTermData>();
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();

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

  const handleClientSelection = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
        setValue('authorizedName', selectedClient.name);
        setValue('authorizedCpfCnpj', selectedClient.cpfCnpj);
        setValue('authorizedAddress', selectedClient.address);
        setValue('authorizedEmail', selectedClient.email);
    }
  }

  useEffect(() => {
    // Set initial default values if they are not set yet
    if (!watch('jurisdiction')) {
        setValue('authorizedName', '');
        setValue('authorizedCpfCnpj', '');
        setValue('authorizedAddress', '');
        setValue('authorizedEmail', '');
        setValue('projectName', 'Vídeo Institucional para a Empresa X');
        setValue('finalClient', 'Empresa X');
        setValue('executionDate', format(new Date(), "dd/MM/yyyy"));
        setValue('authorizedLinks', 'https://www.youtube.com/watch?v=exemplo');
        setValue('permissionsAndProhibitions', initialPermissionsText);
        setValue('fineValue', 5000);
        setValue('generalDispositions', 'O presente termo é firmado em caráter irrevogável e irretratável, obrigando as partes e seus sucessores.');
        setValue('jurisdiction', 'Lagoa Santa/MG');
        setValue('signatureCity', 'Lagoa Santa');
        setValue('signatureDate', format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }));
    }
  }, [setValue, watch]);

  const clientOptions = clients.map(client => ({ value: client.id, label: `${client.name} - ${client.cpfCnpj}` }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Partes Envolvidas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p className='text-sm p-4 bg-background rounded-md'>
                <strong>AUTORIZANTE:</strong> FastFilms (dados preenchidos automaticamente no documento).
            </p>
            <div className="p-4 border rounded-md space-y-4">
                <h3 className='font-medium mb-4'>AUTORIZADO(A)</h3>
                 <FormItem>
                    <FormLabel>Selecionar Cliente Existente</FormLabel>
                     <Combobox
                        options={clientOptions}
                        value={clients.find(c => c.name === watch('authorizedName'))?.id || ''}
                        onChange={(value) => handleClientSelection(value)}
                        placeholder="Busque ou selecione um cliente..."
                        searchPlaceholder="Digite para buscar..."
                        emptyPlaceholder="Nenhum cliente encontrado."
                    />
                 </FormItem>
                 <FormField control={control} name="authorizedName" render={({ field }) => ( <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} placeholder="Nome do Freelancer" /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={control} name="authorizedCpfCnpj" render={({ field }) => ( <FormItem><FormLabel>CPF/CNPJ</FormLabel><FormControl><Input {...field} placeholder="000.000.000-00" /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={control} name="authorizedAddress" render={({ field }) => ( <FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} placeholder="Rua, Número, Bairro, Cidade - UF" /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={control} name="authorizedEmail" render={({ field }) => ( <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input {...field} type="email" placeholder="email@exemplo.com" /></FormControl><FormMessage /></FormItem>)} />
             </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Cláusulas do Termo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div>
                <FormLabel>Cláusula 1 - Objeto</FormLabel>
                <div className="p-4 border rounded-md mt-2 space-y-4">
                    <FormField control={control} name="projectName" render={({ field }) => ( <FormItem><FormLabel>Projeto</FormLabel><FormControl><Input {...field} placeholder="Vídeo Institucional para a Empresa X" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="finalClient" render={({ field }) => ( <FormItem><FormLabel>Cliente Final</FormLabel><FormControl><Input {...field} placeholder="Nome do Cliente Final" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="executionDate" render={({ field }) => ( <FormItem><FormLabel>Data de Execução</FormLabel><FormControl><Input {...field} placeholder="dd/mm/aaaa" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="authorizedLinks" render={({ field }) => ( <FormItem><FormLabel>Link(s) Autorizado(s)</FormLabel><FormControl><Textarea {...field} placeholder="Cole o link do YouTube, Vimeo, etc." /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>
            
            <FormField control={control} name="permissionsAndProhibitions" render={({ field }) => ( 
                <FormItem>
                    <FormLabel>Cláusula 2 - Permissões e Vedações</FormLabel>
                    <FormControl><Textarea {...field} rows={10} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            
             <div>
                <FormLabel>Cláusula 3 - Penalidade</FormLabel>
                <div className="p-4 border rounded-md mt-2 space-y-4">
                     <FormField control={control} name="fineValue" render={({ field }) => ( 
                        <FormItem>
                            <FormLabel>Valor da Multa por Uso Indevido (R$)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
            
            <FormField control={control} name="generalDispositions" render={({ field }) => ( 
                <FormItem>
                    <FormLabel>Cláusula 4 - Disposições Gerais</FormLabel>
                    <FormControl><Textarea {...field} rows={3} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <div>
                <FormLabel>Cláusula 5 - Foro</FormLabel>
                <div className="p-4 border rounded-md mt-2 space-y-4">
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
