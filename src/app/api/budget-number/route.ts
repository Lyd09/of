
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'budget-number.json');

async function readData() {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist, create it with a default value
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            const initialData = { nextBudgetNumber: 101 };
            await fs.writeFile(dataFilePath, JSON.stringify(initialData, null, 2), 'utf8');
            return initialData;
        }
        throw error;
    }
}

async function writeData(data: any) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
    try {
        const data = await readData();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to read budget number:', error);
        return NextResponse.json({ message: 'Failed to read budget number' }, { status: 500 });
    }
}

export async function POST() {
    try {
        const data = await readData();
        const currentNumber = data.nextBudgetNumber;
        const nextNumber = currentNumber + 1;
        await writeData({ nextBudgetNumber: nextNumber });
        
        // Return the number that was just "reserved" by this POST call
        return NextResponse.json({ nextBudgetNumber: currentNumber });
    } catch (error) {
        console.error('Failed to update budget number:', error);
        return NextResponse.json({ message: 'Failed to update budget number' }, { status: 500 });
    }
}

    