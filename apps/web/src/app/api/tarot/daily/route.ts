import { NextResponse } from 'next/server';

import { randomTarotCard } from '../../../../constants/dailyTarot';

export async function GET() {
    try {
        return NextResponse.json(randomTarotCard());
    } catch (error) {
        console.error('Error fetching tarot card:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tarot card' },
            { status: 500 }
        );
    }
}
