"use client";

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { AuthorizationTermData } from '@/types/contract';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AuthorizationTermForm() {
  const { control, watch, setValue } = useFormContext<AuthorizationTermData>();

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
        setValue('fineValue', 5000);
        setValue('jurisdiction', 'Lagoa Santa/MG');
        setValue('signatureCity', 'Lagoa Santa');
        setValue('signatureDate', format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }));
    }
  }, [setValue, watch]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Partes Envolvidas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p className='text-sm p-4 bg-background rounded-md'>
                <strong>AUTORIZANTE:</strong> FastFilms (dados preenchidos automaticamente no documento).
            </p>
            <div className="p-4 border rounded-md space-y-2">
                <h3 className='font-medium mb-4'>AUTORIZADO(A)</h3>
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
            
            <div>
                <FormLabel>Cláusula 2 - Permissões e Vedações</FormLabel>
                 <div className="p-4 border rounded-md mt-2 space-y-2 text-sm text-muted-foreground">
                    <p><strong>Permitido:</strong> Uso exclusivo para portfólio pessoal em sites, redes sociais profissionais e apresentações.</p>
                    <p><strong>Proibido:</strong> Monetizar, usar indevidamente a imagem de terceiros, distorcer o trabalho ou a marca do cliente, e não dar o devido crédito à <strong>FastFilms</strong> como produtora.</p>
                </div>
            </div>
            
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

            <div>
                <FormLabel>Cláusula 4 - Foro</FormLabel>
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
