import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession, clearSession, validateAdminOTP, validateOwnerPassword } from '@/lib/auth';
import { getMemberNames, getConfig } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'login-member') {
      const { name } = body;
      const members = getMemberNames();
      if (!members.includes(name)) {
        return NextResponse.json({ error: 'Nama tidak ditemukan' }, { status: 400 });
      }
      await setSession({ name, role: 'member' });
      return NextResponse.json({ success: true, role: 'member', name });
    }

    if (action === 'login-admin') {
      const { otp } = body;
      if (!validateAdminOTP(otp)) {
        return NextResponse.json({ error: 'Kode OTP salah' }, { status: 401 });
      }
      await setSession({ name: 'Pengurus', role: 'admin' });
      return NextResponse.json({ success: true, role: 'admin', name: 'Pengurus', redirect: 'ruang-komando' });
    }

    if (action === 'login-owner') {
      const { password } = body;
      if (!validateOwnerPassword(password)) {
        return NextResponse.json({ error: 'Password salah' }, { status: 401 });
      }
      await setSession({ name: 'Sang Arsitek', role: 'owner' });
      return NextResponse.json({ success: true, role: 'owner', name: 'Sang Arsitek', redirect: 'ruang-komando' });
    }

    if (action === 'logout') {
      await clearSession();
      return NextResponse.json({ success: true });
    }

    if (action === 'check') {
      const session = await getSession();
      const config = getConfig();
      return NextResponse.json({
        session,
        killSwitch: config.killSwitch,
        megaphone: config.megaphoneActive ? config.megaphoneMessage : null,
        aiEnabled: config.aiEnabled,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
