// API service for Spring Boot Backend integration

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

function getAuthHeaders(userId, additional = {}) {
  const headers = { ...additional };
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  return headers;
}

export const api = {
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || 'Invalid username or password');
    }
    return res.json();
  },

  async register(username, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || 'Registration failed. Username may already be taken.');
    }
    return res.json();
  },

  async searchUser(username, currentUserId) {
    const res = await fetch(`${API_BASE}/auth/search-user?username=${encodeURIComponent(username.trim())}`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(currentUserId)
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('User not found');
    }
    return res.json();
  },

  async getUserChats(userId) {
    if (!userId) return [];
    const res = await fetch(`${API_BASE}/chats/user/me?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(userId)
    });
    if (!res.ok) {
      throw new Error(`Failed to load chats (${res.status})`);
    }
    return res.json();
  },

  async createChat({ name, participantIds, groupChat, senderId }) {
    if (!senderId) throw new Error('Not logged in');

    const payload = {
      name: name || '',
      participantIds,
      GroupChat: Boolean(groupChat),
      senderId
    };

    const res = await fetch(`${API_BASE}/chats/create-chat?userId=${encodeURIComponent(senderId)}`, {
      method: 'POST',
      headers: getAuthHeaders(senderId, { 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || 'Failed to create chat');
    }
    return res.json();
  },

  async getMessages(chatId, userId) {
    const url = userId
      ? `${API_BASE}/chats/${chatId}/messages?userId=${encodeURIComponent(userId)}`
      : `${API_BASE}/chats/${chatId}/messages`;

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(userId)
    });

    if (!res.ok) {
      throw new Error(`Failed to load messages (${res.status})`);
    }
    return res.json();
  },

  async sendMessageRest(chatId, senderId, content) {
    const url = senderId
      ? `${API_BASE}/chats/${chatId}/messages?userId=${encodeURIComponent(senderId)}`
      : `${API_BASE}/chats/${chatId}/messages`;

    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(senderId, { 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ content, senderId })
    });

    if (!res.ok) {
      throw new Error('Failed to send message');
    }
    return res.json();
  },

  async getOnlineUsers(chatId, userId) {
    const res = await fetch(`${API_BASE}/chats/${chatId}/online-users`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(userId)
    });
    if (!res.ok) return [];
    return res.json();
  }
};
