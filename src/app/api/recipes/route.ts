import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getRecipes, addRecipe, addAuditEntry } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ recipes: getRecipes() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const title = sanitize(body.title || '');
  const ingredients = sanitize(body.ingredients || '');
  const steps = sanitize(body.steps || '');
  if (!title || !ingredients || !steps) return NextResponse.json({ error: 'Data resep tidak lengkap' }, { status: 400 });

  const recipe = addRecipe({ title, author: session.name, ingredients, steps, timestamp: Date.now() });
  addAuditEntry({ user: session.name, action: 'ADD_RECIPE', timestamp: Date.now(), detail: title });
  return NextResponse.json({ recipe });
}
