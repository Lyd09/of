import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { clientSchema } from '@/types/contract';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'clients.json');

async function readClients() {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return []; // Retorna um array vazio se o arquivo não existir
        }
        throw error;
    }
}

async function writeClients(clients: any[]) {
    await fs.writeFile(dataFilePath, JSON.stringify(clients, null, 2), 'utf8');
}

// GET: Retorna todos os clientes
export async function GET() {
    try {
        const clients = await readClients();
        return NextResponse.json(clients);
    } catch (error) {
        console.error('Failed to read clients:', error);
        return NextResponse.json({ message: 'Failed to read clients' }, { status: 500 });
    }
}

// POST: Adiciona ou atualiza um cliente
export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Se for um array, estamos salvando todos os clientes
        if (Array.isArray(body)) {
            const validation = z.array(clientSchema).safeParse(body);
            if (!validation.success) {
                return NextResponse.json({ message: 'Invalid client data array', errors: validation.error.issues }, { status: 400 });
            }
             await writeClients(validation.data);
            return NextResponse.json({ message: 'Clients saved successfully' });
        }

        // Se for um objeto, é um único cliente (add/update)
        const validation = clientSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid client data', errors: validation.error.issues }, { status: 400 });
        }

        const clientData = validation.data;
        const clients = await readClients();
        
        const existingClientIndex = clients.findIndex((c: any) => c.id === clientData.id);

        if (existingClientIndex > -1) {
            // Update
            clients[existingClientIndex] = clientData;
        } else {
            // Add
            clients.push(clientData);
        }

        await writeClients(clients);
        return NextResponse.json(clientData, { status: existingClientIndex > -1 ? 200 : 201 });

    } catch (error) {
        console.error('Failed to save client:', error);
        return NextResponse.json({ message: 'Failed to save client' }, { status: 500 });
    }
}

// DELETE: Remove um cliente
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('id');

        if (!clientId) {
            return NextResponse.json({ message: 'Client ID is required' }, { status: 400 });
        }

        const clients = await readClients();
        const updatedClients = clients.filter((c: any) => c.id !== clientId);

        if (clients.length === updatedClients.length) {
            return NextResponse.json({ message: 'Client not found' }, { status: 404 });
        }

        await writeClients(updatedClients);
        return NextResponse.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Failed to delete client:', error);
        return NextResponse.json({ message: 'Failed to delete client' }, { status: 500 });
    }
}
