// Server-side in-memory store — NEVER import this in client components
// This file stores all portal data. In production, replace with Supabase.

export interface FamilyMember {
  id: string;
  name: string;
  parentId: string | null;
  generation: number;
  location?: string;
  birthYear?: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export interface Prayer {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface Recipe {
  id: string;
  title: string;
  author: string;
  ingredients: string;
  steps: string;
  timestamp: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  uploader: string;
  timestamp: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  timestamp: number;
}

export interface TimeCapsule {
  id: string;
  author: string;
  message: string;
  openDate: number;
  timestamp: number;
  imageUrl?: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  timestamp: number;
  detail?: string;
}

export interface AdminUser {
  name: string;
  activeSince: number;
}

// ============ GLOBAL STATE ============
const store = {
  familyTree: [
    { id: '1', name: 'Mbah Marto Dinaman', parentId: null, generation: 1, location: 'Yogyakarta', birthYear: 1920 },
    { id: '2', name: 'Pak Suroto', parentId: '1', generation: 2, location: 'Semarang', birthYear: 1945 },
    { id: '3', name: 'Pak Hartono', parentId: '1', generation: 2, location: 'Solo', birthYear: 1948 },
    { id: '4', name: 'Bu Sriati', parentId: '1', generation: 2, location: 'Yogyakarta', birthYear: 1950 },
    { id: '5', name: 'Mas Budi', parentId: '2', generation: 3, location: 'Jakarta', birthYear: 1970 },
    { id: '6', name: 'Mbak Rina', parentId: '2', generation: 3, location: 'Bandung', birthYear: 1972 },
    { id: '7', name: 'Mas Joko', parentId: '3', generation: 3, location: 'Surabaya', birthYear: 1975 },
    { id: '8', name: 'Mbak Dewi', parentId: '3', generation: 3, location: 'Malang', birthYear: 1978 },
    { id: '9', name: 'Mas Agus', parentId: '4', generation: 3, location: 'Yogyakarta', birthYear: 1974 },
    { id: '10', name: 'Dek Anisa', parentId: '5', generation: 4, location: 'Jakarta', birthYear: 1998 },
    { id: '11', name: 'Dek Rama', parentId: '5', generation: 4, location: 'Jakarta', birthYear: 2001 },
    { id: '12', name: 'Dek Putri', parentId: '7', generation: 4, location: 'Surabaya', birthYear: 2000 },
    { id: '13', name: 'Dek Fajar', parentId: '9', generation: 4, location: 'Yogyakarta', birthYear: 2003 },
  ] as FamilyMember[],

  chatMessages: [
    { id: '1', sender: 'Mas Budi', text: 'Assalamualaikum keluarga besar! 🙏', timestamp: Date.now() - 3600000 },
    { id: '2', sender: 'Mbak Rina', text: 'Waalaikumsalam Mas! Kapan kumpul lagi nih?', timestamp: Date.now() - 3000000 },
    { id: '3', sender: 'Dek Anisa', text: 'Aku kangen masakan Mbah 😊', timestamp: Date.now() - 2400000 },
  ] as ChatMessage[],

  prayers: [
    { id: '1', author: 'Mbak Dewi', text: 'Ya Allah, lindungilah keluarga besar Martodinaman. Berikan kesehatan dan rezeki yang barokah. Aamiin.', timestamp: Date.now() - 86400000 },
    { id: '2', author: 'Mas Agus', text: 'Semoga keluarga kita selalu rukun dan saling menyayangi. Aamiin ya Rabbal Aalamiin.', timestamp: Date.now() - 43200000 },
  ] as Prayer[],

  recipes: [
    { id: '1', title: 'Gudeg Mbah Marto', author: 'Bu Sriati', ingredients: 'Nangka muda 1kg, Santan kelapa 2 liter, Gula merah 200gr, Bawang merah 10 siung, Bawang putih 5 siung, Daun salam, Lengkuas', steps: '1. Rebus nangka muda hingga setengah empuk\n2. Haluskan bumbu, tumis hingga harum\n3. Masukkan santan dan gula merah\n4. Masukkan nangka, masak dengan api kecil 4-5 jam\n5. Aduk sesekali hingga bumbu meresap sempurna', timestamp: Date.now() - 259200000 },
    { id: '2', title: 'Soto Ayam Khas Keluarga', author: 'Pak Hartono', ingredients: 'Ayam kampung 1 ekor, Kunyit, Jahe, Serai, Daun jeruk, Bawang merah goreng, Kecap manis', steps: '1. Rebus ayam dengan bumbu rempah\n2. Suwir-suwir ayam\n3. Saring kaldu\n4. Sajikan dengan taburan bawang goreng dan kecap', timestamp: Date.now() - 172800000 },
  ] as Recipe[],

  gallery: [
    { id: '1', title: 'Silaturahmi Lebaran 2024', description: 'Foto bersama di rumah Mbah saat Lebaran', imageUrl: '', uploader: 'Mas Budi', timestamp: Date.now() - 604800000 },
    { id: '2', title: 'Pernikahan Dek Putri', description: 'Resepsi pernikahan Dek Putri di Surabaya', imageUrl: '', uploader: 'Mbak Dewi', timestamp: Date.now() - 2592000000 },
  ] as GalleryItem[],

  polls: [
    { id: '1', question: 'Lokasi Kumpul Keluarga Tahun Ini?', options: [
      { id: 'o1', text: 'Yogyakarta (Rumah Mbah)', votes: 5, voters: ['Mas Budi','Mbak Rina','Dek Anisa','Mas Agus','Bu Sriati'] },
      { id: 'o2', text: 'Bali (Liburan Bareng)', votes: 3, voters: ['Mas Joko','Mbak Dewi','Dek Putri'] },
      { id: 'o3', text: 'Malang (Vila Keluarga)', votes: 2, voters: ['Pak Hartono','Dek Rama'] },
    ], createdBy: 'Mas Budi', timestamp: Date.now() - 432000000 },
  ] as Poll[],

  timeCapsules: [
    { id: '1', author: 'Dek Anisa', message: 'Untuk keluarga 10 tahun mendatang: Semoga kita semua tetap sehat dan bahagia! Aku sayang kalian semua ❤️', openDate: new Date('2035-01-01').getTime(), timestamp: Date.now() - 86400000 },
  ] as TimeCapsule[],

  auditLog: [] as AuditEntry[],

  // ===== SYSTEM CONFIG (Owner-only) =====
  config: {
    geminiApiKey: '',
    aiEnabled: true,
    killSwitch: false,
    capsuleForceOpen: false,
    capsuleForceLock: false,
    megaphoneMessage: '',
    megaphoneActive: false,
    gamelanYoutubeLink: '',
    eventDate: new Date('2026-06-15').toISOString(),
    admins: [{ name: 'Pak Suroto', activeSince: Date.now() }] as AdminUser[],
  },
};

// ============ ACCESSOR FUNCTIONS ============

export function getStore() { return store; }
export function getFamilyTree() { return store.familyTree; }
export function getChatMessages() { return store.chatMessages; }
export function getPrayers() { return store.prayers; }
export function getRecipes() { return store.recipes; }
export function getGallery() { return store.gallery; }
export function getPolls() { return store.polls; }
export function getTimeCapsules() { return store.timeCapsules; }
export function getAuditLog() { return store.auditLog; }
export function getConfig() { return store.config; }

// ============ MUTATOR FUNCTIONS ============

export function addChatMessage(msg: Omit<ChatMessage, 'id'>) {
  const m = { ...msg, id: Date.now().toString() };
  store.chatMessages.push(m);
  return m;
}

export function addPrayer(p: Omit<Prayer, 'id'>) {
  const prayer = { ...p, id: Date.now().toString() };
  store.prayers.push(prayer);
  return prayer;
}

export function addRecipe(r: Omit<Recipe, 'id'>) {
  const recipe = { ...r, id: Date.now().toString() };
  store.recipes.push(recipe);
  return recipe;
}

export function addGalleryItem(g: Omit<GalleryItem, 'id'>) {
  const item = { ...g, id: Date.now().toString() };
  store.gallery.push(item);
  return item;
}

export function addPoll(p: Omit<Poll, 'id'>) {
  const poll = { ...p, id: Date.now().toString() };
  store.polls.push(poll);
  return poll;
}

export function votePoll(pollId: string, optionId: string, voterName: string) {
  const poll = store.polls.find(p => p.id === pollId);
  if (!poll) return null;
  // Check if already voted
  const alreadyVoted = poll.options.some(o => o.voters.includes(voterName));
  if (alreadyVoted) return { error: 'Sudah memilih' };
  const option = poll.options.find(o => o.id === optionId);
  if (!option) return null;
  option.votes++;
  option.voters.push(voterName);
  return poll;
}

export function resetAllPolls() {
  store.polls.forEach(p => {
    p.options.forEach(o => { o.votes = 0; o.voters = []; });
  });
}

export function addTimeCapsule(tc: Omit<TimeCapsule, 'id'>) {
  const capsule = { ...tc, id: Date.now().toString() };
  store.timeCapsules.push(capsule);
  return capsule;
}

export function addAuditEntry(entry: Omit<AuditEntry, 'id'>) {
  const e = { ...entry, id: Date.now().toString() };
  store.auditLog.unshift(e); // newest first
  if (store.auditLog.length > 200) store.auditLog.pop();
  return e;
}

export function addFamilyMember(m: Omit<FamilyMember, 'id'>) {
  const member = { ...m, id: Date.now().toString() };
  store.familyTree.push(member);
  return member;
}

export function updateFamilyMember(id: string, m: Partial<FamilyMember>) {
  const i = store.familyTree.findIndex(x => x.id === id);
  if (i > -1) {
    store.familyTree[i] = { ...store.familyTree[i], ...m };
    return store.familyTree[i];
  }
  return null;
}

export function removeFamilyMember(id: string) {
  const idx = store.familyTree.findIndex(x => x.id === id);
  if (idx > -1) {
    const deleted = store.familyTree.splice(idx, 1)[0];
    // Also remove parent references to maintain tree integrity
    store.familyTree.forEach(m => {
      if (m.parentId === id) m.parentId = null;
    });
    return deleted;
  }
  return null;
}

export function updateConfig(partial: Partial<typeof store.config>) {
  Object.assign(store.config, partial);
}

export function addAdmin(name: string) {
  if (!store.config.admins.find(a => a.name === name)) {
    store.config.admins.push({ name, activeSince: Date.now() });
  }
}

export function removeAdmin(name: string) {
  store.config.admins = store.config.admins.filter(a => a.name !== name);
}

export function getMemberNames(): string[] {
  return store.familyTree.map(m => m.name);
}
