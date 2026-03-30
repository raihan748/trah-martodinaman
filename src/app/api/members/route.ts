import { NextRequest, NextResponse } from 'next/server';
import { getFamilyTree, addFamilyMember, updateFamilyMember, removeFamilyMember, addAuditEntry, getConfig } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

// Completely open endpoint since it's used on the login screen
export async function GET() {
  const members = getFamilyTree();
  const config = getConfig();
  // Return the full array mapping names and IDs for management
  return NextResponse.json({ members, gamelanYoutubeLink: config.gamelanYoutubeLink });
}

export async function POST(req: NextRequest) {
  try {
    const { action, member, id } = await req.json();

    if (action === 'add') {
      const name = sanitize(member.name);
      if (!name) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
      
      const newMember = addFamilyMember({ 
        name, 
        parentId: member.parentId || null, 
        generation: member.generation || 1,
        location: sanitize(member.location || '')
      });
      addAuditEntry({ user: 'Tamu (Halaman Login)', action: 'Tambah Anggota', detail: `Menambahkan: ${name}`, timestamp: Date.now() });
      return NextResponse.json({ success: true, member: newMember });
    }

    if (action === 'edit' && id) {
      const name = sanitize(member.name);
      if (!name) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
      
      const updated = updateFamilyMember(id, { 
        name,
        location: sanitize(member.location || '')
      });
      
      if (updated) {
        addAuditEntry({ user: 'Tamu (Halaman Login)', action: 'Edit Anggota', detail: `Mengubah ID ${id} menjadi: ${name}`, timestamp: Date.now() });
        return NextResponse.json({ success: true, member: updated });
      }
      return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 });
    }

    if (action === 'delete' && id) {
      const deleted = removeFamilyMember(id);
      if (deleted) {
        addAuditEntry({ user: 'Tamu (Halaman Login)', action: 'Hapus Anggota', detail: `Menghapus: ${deleted.name}`, timestamp: Date.now() });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Members API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
