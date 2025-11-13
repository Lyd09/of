
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { clientSchema } from '@/types/contract';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'clients.json');

async function readClients() {
    try {
        console.log('API: Lendo arquivo de clientes...');
        const data = await fs.readFile(dataFilePath, 'utf8');
        const clients = JSON.parse(data);
        console.log(`API: ${clients.length} clientes lidos com sucesso.`);
        return clients;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log('API: Arquivo de clientes não encontrado, retornando array vazio.');
            return []; // Retorna um array vazio se o arquivo não existir
        }
        console.error('API: Erro ao ler o arquivo de clientes:', error);
        throw error;
    }
}

async function writeClients(clients: any[]) {
    try {
        console.log(`API: Escrevendo ${clients.length} clientes no arquivo...`);
        await fs.writeFile(dataFilePath, JSON.stringify(clients, null, 2), 'utf8');
        console.log('API: Arquivo de clientes escrito com sucesso.');
    } catch (error) {
        console.error('API: Erro ao escrever no arquivo de clientes:', error);
        throw error;
    }
}

// GET: Retorna todos os clientes
export async function GET() {
    console.log('API: Recebida requisição GET para /api/clients');
    try {
        const clients = await readClients();
        return NextResponse.json(clients);
    } catch (error) {
        console.error('API: Falha na requisição GET:', error);
        return NextResponse.json({ message: 'Failed to read clients' }, { status: 500 });
    }
}

// POST: Adiciona ou atualiza um cliente
export async function POST(request: Request) {
    console.log('API: Recebida requisição POST para /api/clients');
    try {
        const body = await request.json();
        console.log('API: Corpo da requisição POST:', body);
        
        // Se for um array, estamos salvando todos os clientes
        if (Array.isArray(body)) {
            console.log('API: Detectado array de clientes para salvar.');
            const validation = z.array(clientSchema).safeParse(body);
            if (!validation.success) {
                console.error('API: Erro de validação no array de clientes:', validation.error.issues);
                return NextResponse.json({ message: 'Invalid client data array', errors: validation.error.issues }, { status: 400 });
            }
             await writeClients(validation.data);
            console.log('API: Array de clientes salvo com sucesso.');
            return NextResponse.json({ message: 'Clients saved successfully' });
        }

        // Se for um objeto, é um único cliente (add/update)
        console.log('API: Detectado objeto de cliente único para salvar.');
        const validation = clientSchema.safeParse(body);
        if (!validation.success) {
            console.error('API: Erro de validação no objeto de cliente:', validation.error.issues);
            return NextResponse.json({ message: 'Invalid client data', errors: validation.error.issues }, { status: 400 });
        }

        const clientData = validation.data;
        const clients = await readClients();
        
        const existingClientIndex = clients.findIndex((c: any) => c.id === clientData.id);

        if (existingClientIndex > -1) {
            // Update
            console.log(`API: Atualizando cliente com ID: ${clientData.id}`);
            clients[existingClientIndex] = clientData;
        } else {
            // Add
            console.log(`API: Adicionando novo cliente com ID: ${clientData.id}`);
            clients.push(clientData);
        }

        await writeClients(clients);
        return NextResponse.json(clientData, { status: existingClientIndex > -1 ? 200 : 201 });

    } catch (error) {
        console.error('API: Falha na requisição POST:', error);
        return NextResponse.json({ message: 'Failed to save client' }, { status: 500 });
    }
}

// DELETE: Remove um cliente
export async function DELETE(request: Request) {
    console.log('API: Recebida requisição DELETE para /api/clients');
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('id');
        console.log(`API: ID do cliente para deletar: ${clientId}`);

        if (!clientId) {
            console.error('API: ID do cliente faltando na requisição DELETE.');
            return NextResponse.json({ message: 'Client ID is required' }, { status: 400 });
        }

        const clients = await readClients();
        const updatedClients = clients.filter((c: any) => c.id !== clientId);

        if (clients.length === updatedClients.length) {
            console.warn(`API: Cliente com ID ${clientId} não encontrado para deleção.`);
            return NextResponse.json({ message: 'Client not found' }, { status: 404 });
        }

        await writeClients(updatedClients);
        console.log(`API: Cliente com ID ${clientId} deletado com sucesso.`);
        return NextResponse.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('API: Falha na requisição DELETE:', error);
        return NextResponse.json({ message: 'Failed to delete client' }, { status: 500 });
    }
}
