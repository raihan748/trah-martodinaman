import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPolls, addPoll, votePoll, addAuditEntry } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ polls: getPolls() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (body.action === 'vote') {
    const { pollId, optionId } = body;
    const result = votePoll(pollId, optionId, session.name);
    if (!result) return NextResponse.json({ error: 'Poll atau opsi tidak ditemukan' }, { status: 404 });
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    addAuditEntry({ user: session.name, action: 'VOTE_POLL', timestamp: Date.now(), detail: pollId });
    return NextResponse.json({ poll: result });
  }

  if (body.action === 'create') {
    const question = sanitize(body.question || '');
    const options = (body.options as string[] || []).map((o: string, i: number) => ({
      id: `opt_${Date.now()}_${i}`,
      text: sanitize(o),
      votes: 0,
      voters: [],
    }));
    if (!question || options.length < 2) return NextResponse.json({ error: 'Minimal 2 pilihan' }, { status: 400 });
    const poll = addPoll({ question, options, createdBy: session.name, timestamp: Date.now() });
    addAuditEntry({ user: session.name, action: 'CREATE_POLL', timestamp: Date.now(), detail: question });
    return NextResponse.json({ poll });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
