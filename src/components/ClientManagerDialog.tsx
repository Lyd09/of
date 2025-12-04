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

interface ClientWithId extends Client {
  id: string;
}

interface ClientManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientManagerDialog({ isOpen, onOpenChange }: ClientManagerDialogProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<ClientWithId | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<Client, 'id' | 'createdAt'>>({
    resolver: zodResolver(clientSchema.omit({ id: true, createdAt: true })),
  });
  
  // Fetch clients from the local API
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients.');
      }
      const data = await response.json();
      const clientsWithIds = data.map((c: Client) => ({ ...c, id: c.id || crypto.randomUUID() }));
      setClients(clientsWithIds);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ title: 'Erro ao carregar clientes', description: errorMessage, variant: 'destructive'});
      console.error('Fetch Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Persist clients to the local API
  const persistClients = async (updatedClients: Client[]) => {
      try {
          // The API expects newest first, but we manage state as newest last, so we reverse it back before sending
          const response = await fetch('/api/clients', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify([...updatedClients].reverse()),
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to save clients.');
          }
          return true;
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          toast({ title: 'Erro ao salvar', description: errorMessage, variant: 'destructive'});
          console.error('Persist Error:', error);
          return false;
      }
  }

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingClient) {
      setValue('name', editingClient.name);
      setValue('cpfCnpj', editingClient.cpfCnpj);
      setValue('address', editingClient.address);
      setValue('email', editingClient.email);
    } else {
      reset({ name: '', cpfCnpj: '', address: '', email: '' });
    }
  }, [editingClient, setValue, reset]);

  const handleSaveClient = async (data: Omit<Client, 'id' | 'createdAt'>) => {
    const isUpdating = !!editingClient;
    let updatedClients: ClientWithId[];
    
    if (isUpdating) {
      updatedClients = clients.map(c => c.id === editingClient!.id ? { ...editingClient!, ...data } : c);
      toast({ title: 'Cliente atualizado com sucesso!' });
    } else {
      const newClient: ClientWithId = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
       // Add to the end so it appears at the top when reversed for display
      updatedClients = [...clients, newClient];
      toast({ title: 'Novo cliente adicionado!' });
    }

    // Persist to API
    const success = await persistClients(updatedClients);
    if(success) {
        // Refetch to get the correct order from server
        fetchClients();
        setEditingClient(null);
        reset();
    }
  };

  const handleDeleteClient = async (id: string) => {
    const updatedClients = clients.filter(c => c.id !== id);
    const success = await persistClients(updatedClients);
    if(success) {
      setClients(updatedClients);
      toast({ title: 'Cliente removido.', variant: 'destructive' });
    }
  };

  const startEditing = (client: ClientWithId) => {
    setEditingClient(client);
  };
  
  const cancelEditing = () => {
    setEditingClient(null);
  };
  
  const displayedClients = [...clients].reverse();


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
                        ) : displayedClients.length > 0 ? (
                            displayedClients.map((client) => (
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
