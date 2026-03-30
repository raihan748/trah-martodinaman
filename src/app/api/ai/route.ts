import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getConfig, getFamilyTree, getPrayers, getRecipes, addAuditEntry } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

// Sowan Mbah AI — calls Gemini API SERVER-SIDE ONLY
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = getConfig();
  if (!config.aiEnabled) {
    return NextResponse.json({ error: 'Fitur Sowan Mbah sedang dinonaktifkan oleh Sang Arsitek.' }, { status: 403 });
  }
  if (!config.geminiApiKey) {
    return NextResponse.json({ error: 'API Key Gemini belum dikonfigurasi. Hubungi Sang Arsitek.' }, { status: 503 });
  }

  const body = await req.json();
  const userMessage = sanitize(body.message || '');
  if (!userMessage) return NextResponse.json({ error: 'Pesan kosong' }, { status: 400 });

  // Build dynamic context injection
  const familyTree = getFamilyTree();
  const prayers = getPrayers().slice(-5);
  const recipes = getRecipes().slice(-3);

  const systemContext = `Kamu adalah "Mbah Marto", sesepuh keluarga besar Martodinaman yang bijaksana, hangat, dan penuh kasih sayang.
Kamu berbicara dengan gaya Jawa yang lembut, kadang menyisipkan kata-kata Jawa.
Kamu mengetahui seluruh silsilah keluarga dan kondisi terkini.

DATA SILSILAH KELUARGA:
${familyTree.map(m => `- ${m.name} (Gen ${m.generation}, lokasi: ${m.location || 'tidak diketahui'})`).join('\n')}

DOA-DOA TERBARU KELUARGA:
${prayers.map(p => `- ${p.author}: "${p.text}"`).join('\n')}

RESEP KELUARGA:
${recipes.map(r => `- ${r.title} oleh ${r.author}`).join('\n')}

Jawab dengan penuh kasih sayang dan kebijaksanaan seorang kakek/nenek. Gunakan bahasa Indonesia yang lembut.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemContext + '\n\nPesan dari ' + session.name + ': ' + userMessage }] }
          ],
          generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return NextResponse.json({ error: 'Gagal menghubungi Mbah. Coba lagi nanti.' }, { status: 502 });
    }

    const data = await response.json();
    const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Mbah sedang berfikir, Nak...';

    addAuditEntry({ user: session.name, action: 'SOWAN_MBAH', timestamp: Date.now(), detail: userMessage.substring(0, 50) });

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan koneksi.' }, { status: 500 });
  }
}
