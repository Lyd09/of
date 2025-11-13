"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit3 } from 'lucide-react';
import { Client, clientSchema } from '@/types/contract';

interface ClientManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientManagerDialog({ isOpen, onOpenChange }: ClientManagerDialogProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Client>({
    resolver: zodResolver(clientSchema),
  });

  const fetchClients = async () => {
    console.log('Dialog: fetchClients iniciado.');
    setIsLoading(true);
    try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Erro de rede ao buscar clientes');
        }
        console.log('Dialog: Clientes recebidos da API:', data);
        setClients(data);
    } catch (err) {
        toast({ title: 'Erro ao carregar clientes', description: (err as Error).message, variant: 'destructive'});
        console.error('Dialog: Erro em fetchClients:', err);
    } finally {
        console.log('Dialog: fetchClients finalizado.');
        setIsLoading(false);
    }
  }

  // Fetch clients from API on mount
  useEffect(() => {
    if (isOpen) {
      console.log('Dialog: Componente montado, buscando clientes...');
      fetchClients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingClient) {
      console.log('Dialog: Preenchendo formulário para edição:', editingClient);
      Object.keys(editingClient).forEach(key => {
        setValue(key as keyof Client, editingClient[key as keyof Client]);
      });
    } else {
      console.log('Dialog: Resetando formulário para novo cliente.');
      reset({ id: '', name: '', cpfCnpj: '', address: '', email: '' });
    }
  }, [editingClient, setValue, reset]);
  

  const handleSaveClient = async (data: Client) => {
    const isUpdating = !!editingClient;
    const clientData = { ...data, id: isUpdating ? editingClient.id : crypto.randomUUID() };
    console.log('Dialog: handleSaveClient chamado. Dados a serem salvos:', clientData);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      console.log(`Dialog: Resposta do servidor (Status: ${response.status})`);
      const responseData = await response.json();
      console.log('Dialog: Dados da resposta do servidor:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Falha ao salvar cliente');
      }

      if (isUpdating) {
        toast({ title: 'Cliente atualizado com sucesso!' });
      } else {
        toast({ title: 'Novo cliente adicionado!' });
      }
      
      console.log('Dialog: Cliente salvo com sucesso, atualizando a lista de clientes...');
      await fetchClients();

      setEditingClient(null);
      reset();

    } catch (error) {
      console.error('Dialog: Erro em handleSaveClient:', error);
      toast({ title: 'Erro ao salvar', description: 'Não foi possível salvar os dados do cliente.', variant: 'destructive'});
    }
  };

  const handleDeleteClient = async (id: string) => {
    console.log(`Dialog: handleDeleteClient chamado para o ID: ${id}`);
    try {
        const response = await fetch(`/api/clients?id=${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Falha ao deletar cliente');

        console.log(`Dialog: Cliente ${id} deletado com sucesso, atualizando estado.`);
        setClients(clients.filter(c => c.id !== id));
        toast({ title: 'Cliente removido.', variant: 'destructive' });

    } catch (error) {
        console.error(`Dialog: Erro ao deletar cliente ${id}:`, error);
        toast({ title: 'Erro ao remover', description: 'Não foi possível remover o cliente.', variant: 'destructive'});
    }
  };

  const startEditing = (client: Client) => {
    setEditingClient(client);
  };
  
  const cancelEditing = () => {
    setEditingClient(null);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Clientes</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova clientes para usar em seus contratos e orçamentos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[1fr_2fr] gap-8 flex-1 overflow-hidden">
            {/* Formulário */}
            <div className='flex flex-col space-y-4'>
                <h3 className="text-lg font-medium">{editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h3>
                 <form onSubmit={handleSubmit(handleSaveClient)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="client-name">Nome Completo / Razão Social</Label>
                        <Input id="client-name" {...register('name')} placeholder="Nome do Cliente" />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="client-cpfCnpj">CPF / CNPJ</Label>
                        <Input id="client-cpfCnpj" {...register('cpfCnpj')} placeholder="00.000.000/0000-00" />
                        {errors.cpfCnpj && <p className="text-xs text-destructive">{errors.cpfCnpj.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="client-address">Endereço Completo</Label>
                        <Input id="client-address" {...register('address')} placeholder="Rua, Nº, Bairro, Cidade - UF" />
                        {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="client-email">E-mail</Label>
                        <Input id="client-email" type="email" {...register('email')} placeholder="cliente@email.com" />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button type="submit">
                            {editingClient ? 'Salvar Alterações' : 'Adicionar Cliente'}
                        </Button>
                        {editingClient && <Button type="button" variant="ghost" onClick={cancelEditing}>Cancelar</Button>}
                    </div>
                </form>
            </div>
            
            {/* Lista de Clientes */}
            <div className='flex flex-col'>
                <h3 className="text-lg font-medium mb-4">Clientes Cadastrados</h3>
                <ScrollArea className="flex-1 border rounded-md">
                    <div className="p-4 space-y-2">
                        {isLoading ? (
                             <p>Carregando clientes...</p>
                        ) : clients.length > 0 ? (
                            clients.map(client => (
                            <div key={client.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                                <div>
                                <p className="font-medium">{client.name}</p>
                                <p className="text-sm text-muted-foreground">{client.cpfCnpj}</p>
                                </div>
                                <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => startEditing(client)}>
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação não pode ser desfeita. Isso removerá permanentemente o cliente.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>
                                            Sim, remover
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>Nenhum cliente cadastrado.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
