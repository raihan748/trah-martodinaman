import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getFamilyTree, addFamilyMember, addAuditEntry } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ tree: getFamilyTree() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const name = sanitize(body.name || '');
  const parentId = body.parentId || null;
  const location = sanitize(body.location || '');
  const birthYear = body.birthYear ? parseInt(body.birthYear) : undefined;

  if (!name) return NextResponse.json({ error: 'Nama harus diisi' }, { status: 400 });

  const parent = parentId ? getFamilyTree().find(m => m.id === parentId) : null;
  const generation = parent ? parent.generation + 1 : 1;

  const member = addFamilyMember({ name, parentId, generation, location, birthYear });
  addAuditEntry({ user: session.name, action: 'ADD_FAMILY_MEMBER', timestamp: Date.now(), detail: name });
  return NextResponse.json({ member });
}
