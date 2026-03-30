import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getChatMessages, addChatMessage, addAuditEntry } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ messages: getChatMessages() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const text = sanitize(body.text || '');
  if (!text) return NextResponse.json({ error: 'Pesan kosong' }, { status: 400 });

  const msg = addChatMessage({ sender: session.name, text, timestamp: Date.now() });
  addAuditEntry({ user: session.name, action: 'SEND_CHAT', timestamp: Date.now(), detail: text.substring(0, 50) });
  return NextResponse.json({ message: msg });
}
