
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Adjust the path to point to src/data/clients.json
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'clients.json');

async function readClients() {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist, create it with an empty array.
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            await writeClients([]);
            return [];
        }
        console.error('Error reading clients file:', error);
        throw new Error('Failed to read clients data.');
    }
}

async function writeClients(data: any) {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing clients file:', error);
        throw new Error('Failed to write clients data.');
    }
}

export async function GET() {
    try {
        const clients = await readClients();
        return NextResponse.json(clients);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'Failed to retrieve clients', error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // The body is expected to be the full array of clients
        await writeClients(body);
        return NextResponse.json({ message: 'Clients updated successfully' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'Failed to update clients', error: errorMessage }, { status: 500 });
    }
}
