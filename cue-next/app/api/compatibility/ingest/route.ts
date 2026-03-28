import { NextResponse } from 'next/server';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Stable in-memory cache — survives Next.js hot reloads in dev
if (!(globalThis as any).__compatibilitySessions) {
    (globalThis as any).__compatibilitySessions = {};
}
const sessions: Record<string, unknown[]> = (globalThis as any).__compatibilitySessions;

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const friends = body.friends || [];
        const sessionId = Math.random().toString(36).substring(2, 15);
        sessions[sessionId] = friends;
        return NextResponse.json({ id: sessionId, count: friends.length }, { headers: CORS_HEADERS });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS_HEADERS });
    }
}
