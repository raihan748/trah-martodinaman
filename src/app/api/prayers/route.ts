import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPrayers, addPrayer, addAuditEntry } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ prayers: getPrayers() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const text = sanitize(body.text || '');
  if (!text) return NextResponse.json({ error: 'Doa kosong' }, { status: 400 });

  const prayer = addPrayer({ author: session.name, text, timestamp: Date.now() });
  addAuditEntry({ user: session.name, action: 'ADD_PRAYER', timestamp: Date.now() });
  return NextResponse.json({ prayer });
}
