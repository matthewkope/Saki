import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const friends = body.friends || [];
        const sessionId = Math.random().toString(36).substring(2, 15);

        const { error } = await supabase
            .from('compatibility_sessions')
            .insert({ id: sessionId, friends });

        if (error) throw error;

        return NextResponse.json({ id: sessionId, count: friends.length }, { headers: CORS_HEADERS });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS });
    }
}
