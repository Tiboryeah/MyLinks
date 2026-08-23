import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const BASELINE_VIEWS = 154;
const REDIS_KEY = 'mylinks:views';
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

function getRedis(): Redis | null {
    const url = process.env.UPSTASH_REDIS_REST_URL
        ?? process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
        ?? process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

    if (!url || !token) return null;
    return new Redis({ url, token });
}

async function readPersistentViews(): Promise<number | null> {
    const redis = getRedis();
    if (!redis) return null;

    try {
        await redis.set(REDIS_KEY, BASELINE_VIEWS, { nx: true });
        const count = await redis.get<number>(REDIS_KEY);
        return typeof count === 'number' ? count : Number(count);
    } catch (error) {
        console.error('Unable to read the persistent view counter:', error);
        return null;
    }
}

async function incrementPersistentViews(): Promise<number | null> {
    const redis = getRedis();
    if (!redis) return null;

    try {
        // SET NX initializes the legacy total exactly once; INCR is atomic, so
        // simultaneous visitors can never overwrite one another.
        await redis.set(REDIS_KEY, BASELINE_VIEWS, { nx: true });
        return await redis.incr(REDIS_KEY);
    } catch (error) {
        console.error('Unable to increment the persistent view counter:', error);
        return null;
    }
}

// Reading the counter never changes it (important for crawlers and prefetching).
export async function GET() {
    const persistentCount = await readPersistentViews();
    if (persistentCount !== null) return json(persistentCount);

    const fallbackCount = await getRemoteViews(true);
    return json(fallbackCount ?? BASELINE_VIEWS);
}

// A deliberate entry is the only operation that adds one visit.
export async function POST() {
    const persistentCount = await incrementPersistentViews();
    if (persistentCount !== null) return json(persistentCount);

    const fallbackCount = await getRemoteViews(false);
    return json(fallbackCount ?? BASELINE_VIEWS);
}
