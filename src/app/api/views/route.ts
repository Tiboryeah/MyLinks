import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const increment = searchParams.get('increment');

    // Use the hits endpoint
    const baseUrl = 'https://api.counterapi.dev/v1/tiboryeah-prod/hits';
    const url = increment === 'true' ? `${baseUrl}/up` : baseUrl;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("CounterAPI Error:", error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}
