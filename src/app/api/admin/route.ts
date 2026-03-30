import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getConfig, updateConfig, getAuditLog, resetAllPolls, getFamilyTree, addAuditEntry, removeAdmin, addAdmin } from '@/lib/store';

async function requireOwner() {
  const session = await getSession();
  if (!session || session.role !== 'owner') {
    throw new Error('OWNER_ONLY');
  }
  return session;
}

async function requireAdminOrOwner() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
    throw new Error('ADMIN_ONLY');
  }
  return session;
}

export async function GET() {
  try {
    const session = await requireAdminOrOwner();
    const config = getConfig();
    const auditLog = getAuditLog();

    return NextResponse.json({
      config,
      auditLog: session.role === 'owner' ? auditLog : [],
      isOwner: session.role === 'owner',
    });
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Admin-level actions
    if (action === 'set-event-date') {
      const session = await requireAdminOrOwner();
      updateConfig({ eventDate: body.date });
      addAuditEntry({ user: session.name, action: 'SET_EVENT_DATE', timestamp: Date.now(), detail: body.date });
      return NextResponse.json({ success: true });
    }

    // === OWNER-ONLY GOD MODE ACTIONS ===

    if (action === 'set-api-key') {
      const session = await requireOwner();
      updateConfig({ geminiApiKey: body.key || '' });
      addAuditEntry({ user: session.name, action: 'SET_API_KEY', timestamp: Date.now() });
      return NextResponse.json({ success: true });
    }

    if (action === 'set-gamelan-link') {
      const session = await requireOwner();
      updateConfig({ gamelanYoutubeLink: body.link || '' });
      addAuditEntry({ user: session.name, action: 'SET_GAMELAN_LINK', timestamp: Date.now() });
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle-ai') {
      const session = await requireOwner();
      const config = getConfig();
      updateConfig({ aiEnabled: !config.aiEnabled });
      addAuditEntry({ user: session.name, action: `AI_${!config.aiEnabled ? 'ON' : 'OFF'}`, timestamp: Date.now() });
      return NextResponse.json({ success: true, aiEnabled: !config.aiEnabled });
    }

    if (action === 'remove-admin') {
      const session = await requireOwner();
      removeAdmin(body.name);
      addAuditEntry({ user: session.name, action: 'REMOVE_ADMIN', timestamp: Date.now(), detail: body.name });
      return NextResponse.json({ success: true });
    }

    if (action === 'add-admin') {
      const session = await requireOwner();
      addAdmin(body.name);
      addAuditEntry({ user: session.name, action: 'ADD_ADMIN', timestamp: Date.now(), detail: body.name });
      return NextResponse.json({ success: true });
    }

    if (action === 'force-capsule') {
      const session = await requireOwner();
      updateConfig({
        capsuleForceOpen: body.mode === 'open',
        capsuleForceLock: body.mode === 'lock',
      });
      addAuditEntry({ user: session.name, action: `CAPSULE_${body.mode?.toUpperCase()}`, timestamp: Date.now() });
      return NextResponse.json({ success: true });
    }

    if (action === 'megaphone') {
      const session = await requireOwner();
      if (body.clear) {
        updateConfig({ megaphoneActive: false, megaphoneMessage: '' });
        addAuditEntry({ user: session.name, action: 'MEGAPHONE_CLEAR', timestamp: Date.now() });
      } else {
        updateConfig({ megaphoneActive: true, megaphoneMessage: body.message || '' });
        addAuditEntry({ user: session.name, action: 'MEGAPHONE_SEND', timestamp: Date.now(), detail: (body.message || '').substring(0, 50) });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'reset-polling') {
      const session = await requireOwner();
      resetAllPolls();
      addAuditEntry({ user: session.name, action: 'RESET_ALL_POLLS', timestamp: Date.now() });
      return NextResponse.json({ success: true });
    }

    if (action === 'backup-silsilah') {
      await requireOwner();
      const tree = getFamilyTree();
      return NextResponse.json({ backup: tree, filename: `silsilah_backup_${new Date().toISOString().split('T')[0]}.json` });
    }

    if (action === 'kill-switch') {
      const session = await requireOwner();
      const config = getConfig();
      updateConfig({ killSwitch: !config.killSwitch });
      addAuditEntry({ user: session.name, action: `KILL_SWITCH_${!config.killSwitch ? 'ON' : 'OFF'}`, timestamp: Date.now() });
      return NextResponse.json({ success: true, killSwitch: !config.killSwitch });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    if (message === 'OWNER_ONLY') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Sang Arsitek yang bisa mengakses fitur ini.' }, { status: 403 });
    }
    if (message === 'ADMIN_ONLY') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Pengurus/Owner.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
