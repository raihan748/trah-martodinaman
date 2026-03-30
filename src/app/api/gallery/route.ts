import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getGallery, addGalleryItem, addAuditEntry } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ gallery: getGallery() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const title = sanitize(body.title || '');
  const description = sanitize(body.description || '');
  if (!title) return NextResponse.json({ error: 'Judul harus diisi' }, { status: 400 });

  const item = addGalleryItem({ title, description, imageUrl: body.imageUrl || '', uploader: session.name, timestamp: Date.now() });
  addAuditEntry({ user: session.name, action: 'ADD_GALLERY', timestamp: Date.now(), detail: title });
  return NextResponse.json({ item });
}
