import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VIEWS_FILE = path.join(process.cwd(), '.views.json');
const BASELINE_VIEWS = 108;
const COUNTER_URL = `https://counterapi.com/api/tiboryeah-prod/view/hits?startNumber=${BASELINE_VIEWS}`;

function getStoredViews(): number {
    try {
        const data = JSON.parse(fs.readFileSync(VIEWS_FILE, 'utf-8'));
        return Number.isSafeInteger(data.count) && data.count >= 0 ? data.count : BASELINE_VIEWS;
    } catch {
        return BASELINE_VIEWS;
    }
}

function saveStoredViews(count: number) {
    const tempFile = `${VIEWS_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify({ count, updatedAt: new Date().toISOString() }), 'utf-8');
    fs.renameSync(tempFile, VIEWS_FILE);
}

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
    const localCount = getStoredViews();
    const remoteCount = await getRemoteViews(true);
    const currentCount = remoteCount === null ? localCount : Math.max(localCount, remoteCount);
    if (currentCount !== localCount) saveStoredViews(currentCount);
    return json(currentCount);
}

// A deliberate entry is the only operation that adds one visit.
export async function POST() {
    const localCount = getStoredViews();
    const remoteCount = await getRemoteViews(false);
    const nextCount = remoteCount === null ? localCount + 1 : Math.max(localCount + 1, remoteCount);
    saveStoredViews(nextCount);
    return json(nextCount);
}
