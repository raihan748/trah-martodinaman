// Authentication utilities — server-side only
import { cookies } from 'next/headers';
import { addAuditEntry } from './store';

export type Role = 'member' | 'admin' | 'owner';

export interface Session {
  name: string;
  role: Role;
}

const ADMIN_OTP = 'TRAH-99X2';
const OWNER_PASSWORD = 'raihanloveraisa';

export function validateAdminOTP(otp: string): boolean {
  return otp === ADMIN_OTP;
}

export function validateOwnerPassword(password: string): boolean {
  return password === OWNER_PASSWORD;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('trah-session');
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value) as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('trah-session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  addAuditEntry({
    user: session.name,
    action: `LOGIN as ${session.role.toUpperCase()}`,
    timestamp: Date.now(),
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getSession();
  if (session) {
    addAuditEntry({
      user: session.name,
      action: 'LOGOUT',
      timestamp: Date.now(),
    });
  }
  cookieStore.delete('trah-session');
}

export async function requireRole(role: Role): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  if (role === 'owner' && session.role !== 'owner') throw new Error('Forbidden: Owner only');
  if (role === 'admin' && session.role !== 'admin' && session.role !== 'owner') throw new Error('Forbidden: Admin only');
  return session;
}
