const STORAGE_KEY = 'guild.chat.conversations.v1';

export function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations || []));
  } catch {}
}

export function archiveThread(messages) {
  if (!messages || messages.length === 0) return null;
  const firstUser = messages.find(m => m.type === 'user');
  const title = firstUser ? (firstUser.content || '').slice(0, 50) : 'New Chat';
  const preview = firstUser ? firstUser.content : (messages[0]?.content || '');
  const item = {
    id: `c_${Date.now()}`,
    title: title || 'New Chat',
    timestamp: new Date().toISOString(),
    preview: (preview || '').slice(0, 120),
    messages,
  };
  const existing = loadConversations();
  const updated = [item, ...existing].slice(0, 100);
  saveConversations(updated);
  return item;
}

export function loadThread(conversationId) {
  const list = loadConversations();
  const found = list.find(c => c.id === conversationId);
  return found?.messages || [];
}

