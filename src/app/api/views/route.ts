import { NextResponse } from 'next/server';

// CounterAPI is the persistent source of truth. Vercel Functions cannot safely
// persist counters in project files because their filesystem is ephemeral.
const BASELINE_VIEWS = 154;
const COUNTER_URL = `https://counterapi.com/api/tiboryeah-prod/view/hits-v2?startNumber=${BASELINE_VIEWS}`;

const json = (count: number) => NextResponse.json(
    { count },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
);

async function getRemoteViews(readOnly: boolean): Promise<number | null> {
    try {
        const response = await fetch(`${COUNTER_URL}&readOnly=${readOnly}`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(4000)
        });
        if (!response.ok) return null;
        const data = await response.json();
        return Number.isSafeInteger(data.value) ? data.value : null;
    } catch {
        return null;
    }
}

// Reading the counter never changes it (important for crawlers and prefetching).
export async function GET() {
    const remoteCount = await getRemoteViews(true);
    return json(remoteCount ?? BASELINE_VIEWS);
}

// A deliberate entry is the only operation that adds one visit.
export async function POST() {
    const remoteCount = await getRemoteViews(false);
    return json(remoteCount ?? BASELINE_VIEWS);
}
