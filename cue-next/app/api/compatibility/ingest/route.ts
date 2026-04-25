import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function corsHeaders(origin: string | null) {
    const allowed = origin?.startsWith('chrome-extension://') ? origin : null;
    return {
        'Access-Control-Allow-Origin': allowed ?? '',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };
}

export async function OPTIONS(request: Request) {
    const origin = request.headers.get('origin');
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
    const origin = request.headers.get('origin');
    const headers = corsHeaders(origin);

    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.INGEST_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    try {
        const body = await request.json();
        const friends = body.friends || [];
        const sessionId = Math.random().toString(36).substring(2, 15);

        const { error } = await supabase
            .from('compatibility_sessions')
            .insert({ id: sessionId, friends });

        if (error) throw error;

        return NextResponse.json({ id: sessionId, count: friends.length }, { headers });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Invalid JSON' }, { status: 400, headers });
    }
}
