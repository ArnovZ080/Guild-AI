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
    if (Array.isArray(messages)) {
      // Convert timestamp strings back to Date objects
      return messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      }));
    }
    return [];
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
  
  // Create a unique identifier based on the first user message content
  const firstUserContent = firstUser ? firstUser.content : '';
  const contentHash = firstUserContent ? btoa(firstUserContent).slice(0, 8) : Date.now().toString();
  
  const item = {
    id: `c_${contentHash}`,
    title: title || 'New Chat',
    timestamp: new Date().toISOString(),
    preview: (preview || '').slice(0, 120),
    messages,
  };
  
  const existing = loadConversations();
  
  // Check if a conversation with the same content already exists
  const duplicateExists = existing.some(conv => {
    const existingFirstUser = conv.messages?.find(m => m.type === 'user');
    const existingContent = existingFirstUser ? existingFirstUser.content : '';
    return existingContent === firstUserContent && existingContent.length > 0;
  });
  
  if (duplicateExists) {
    console.log('Duplicate conversation detected, skipping archive');
    clearCurrentConversation();
    return null;
  }
  
  const updated = [item, ...existing].slice(0, 100);
  saveConversations(updated);
  
  // Clear current conversation after archiving
  clearCurrentConversation();
  
  return item;
}

export function loadThread(conversationId) {
  const list = loadConversations();
  const found = list.find(c => c.id === conversationId);
  if (found?.messages) {
    // Convert timestamp strings back to Date objects
    return found.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    }));
  }
  return [];
}

