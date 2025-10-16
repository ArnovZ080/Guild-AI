const STORAGE_KEY = 'guild.chat.conversations.v1';
const CURRENT_CONVERSATION_KEY = 'guild.chat.current_conversation.v1';

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

// Current conversation persistence
export function saveCurrentConversation(messages) {
  try {
    if (messages && messages.length > 0) {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, JSON.stringify(messages));
    }
  } catch {}
}

export function loadCurrentConversation() {
  try {
    const raw = localStorage.getItem(CURRENT_CONVERSATION_KEY);
    if (!raw) return [];
    const messages = JSON.parse(raw);
    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
}

export function clearCurrentConversation() {
  try {
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
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
  
  // Clear current conversation after archiving
  clearCurrentConversation();
  
  return item;
}

export function loadThread(conversationId) {
  const list = loadConversations();
  const found = list.find(c => c.id === conversationId);
  return found?.messages || [];
}

