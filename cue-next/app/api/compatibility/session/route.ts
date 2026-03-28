import { NextResponse } from 'next/server';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400, headers: CORS_HEADERS });
    }

    const sessions: Record<string, unknown[]> = (globalThis as any).__compatibilitySessions || {};
    const friends = sessions[id];

    if (!friends) {
        return NextResponse.json({ error: "Session not found or expired" }, { status: 404, headers: CORS_HEADERS });
    }

    return NextResponse.json({ friends }, { headers: CORS_HEADERS });
}
