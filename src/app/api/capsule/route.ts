import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTimeCapsules, addTimeCapsule, getConfig, addAuditEntry } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = getConfig();
  const capsules = getTimeCapsules().map(c => ({
    ...c,
    canOpen: config.capsuleForceOpen || (!config.capsuleForceLock && Date.now() >= c.openDate),
    message: (config.capsuleForceOpen || (!config.capsuleForceLock && Date.now() >= c.openDate)) ? c.message : '🔒 Kapsul masih terkunci...',
  }));

  return NextResponse.json({ capsules, forceOpen: config.capsuleForceOpen, forceLock: config.capsuleForceLock });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const message = sanitize(body.message || '');
  const openDate = body.openDate ? new Date(body.openDate).getTime() : 0;
  if (!message || !openDate) return NextResponse.json({ error: 'Data kapsul tidak lengkap' }, { status: 400 });

  const capsule = addTimeCapsule({ author: session.name, message, openDate, timestamp: Date.now(), imageUrl: body.imageUrl || '' });
  addAuditEntry({ user: session.name, action: 'ADD_CAPSULE', timestamp: Date.now() });
  return NextResponse.json({ capsule });
}
