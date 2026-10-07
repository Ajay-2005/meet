/**
 * MeetChat / SyncWave - Modern Real-Time Chat Application
 * Integrates Spring Boot REST APIs + STOMP WebSockets + Presence & Typing
 */

// Configuration
const defaultOrigin = (window.location.protocol && window.location.protocol.startsWith('http'))
  ? window.location.origin
  : 'http://localhost:8080';

const CONFIG = {
  API_BASE: window.API_BASE_URL || defaultOrigin,
  WS_ENDPOINT: window.WS_BASE_URL || `${defaultOrigin}/ws`,
  TYPING_DEBOUNCE_MS: 1500,
  POLL_ONLINE_INTERVAL_MS: 8000,
  STORAGE_KEYS: {
    USER_ID: 'meetchat_user_id',
    USERNAME: 'meetchat_username',
    USER_CACHE: 'meetchat_user_cache',
    CHAT_NAMES: 'meetchat_chat_names',
    THEME: 'meetchat_theme',
    SOUND: 'meetchat_sound_enabled'
  }
};

// Global App State
const state = {
  currentUser: null, // { id, username }
  activeChat: null,  // { chatId, name, isGroup, participantIds }
  chats: [],         // Array of ChatResponseDTO
  messages: [],      // Array of MessageResponseDTO
  activeTab: 'all',  // 'all' | 'direct' | 'group'
  userCache: {},     // { [userId]: username }
  chatCustomNames: {}, // { [chatId]: customName }
  onlineUserIds: new Set(),
  stompClient: null,
  activeSubscriptions: {},
  isTypingLocal: false,
  typingTimer: null,
  onlinePollTimer: null,
  soundEnabled: true
};

/* ==========================================================================
   Sound Synthesis (Web Audio API - No External Files Required)
   ========================================================================== */
const soundService = {
  ctx: null,
  init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  },
  playSend() {
    if (!state.soundEnabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  },
  playReceive() {
    if (!state.soundEnabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }
};

/* ==========================================================================
   Toast Notification Service
   ========================================================================== */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ==========================================================================
   REST API Service
   ========================================================================== */
function getAuthHeaders(additional = {}) {
  const headers = { ...additional };
  if (state.currentUser && state.currentUser.id) {
    headers['X-User-Id'] = state.currentUser.id;
  }
  return headers;
}

function handleUnauthorized(err) {
  if (err && (err.status === 401 || (err.message && err.message.toLowerCase().includes('unauthorized')))) {
    showToast('Session expired or unauthorized. Please sign in.', 'error', 3000);
    openAuthModal('login');
    return true;
  }
  return false;
}

const api = {
  async login(username, password) {
    const res = await fetch(`${CONFIG.API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Invalid username or password');
    return res.json();
  },

  async register(username, password) {
    const res = await fetch(`${CONFIG.API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Registration failed. Username may already be taken.');
    return res.json();
  },

  async searchUser(username) {
    const res = await fetch(`${CONFIG.API_BASE}/auth/search-user?username=${encodeURIComponent(username.trim())}`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('User search error');
    }
    return res.json();
  },

  async getUserChats() {
    if (!state.currentUser || !state.currentUser.id) return [];
    const url = `${CONFIG.API_BASE}/chats/user/me?userId=${encodeURIComponent(state.currentUser.id)}`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        handleUnauthorized({ status: res.status });
      }
      throw new Error('Failed to load user chats');
    }
    return res.json();
  },

  async createChat({ name, participantIds, groupChat }) {
    if (!state.currentUser || !state.currentUser.id) {
      showToast('Please sign in or create an account first!', 'warning');
      openAuthModal('login');
      throw new Error('Not signed in');
    }

    const payload = {
      name: name || '',
      participantIds,
      groupChat: Boolean(groupChat),
      senderId: state.currentUser.id
    };

    const url = `${CONFIG.API_BASE}/chats/create-chat?userId=${encodeURIComponent(state.currentUser.id)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.text();
      if (res.status === 401 || (err && err.includes('Unauthorized'))) {
        handleUnauthorized({ status: 401, message: 'Unauthorized' });
      }
      throw new Error(err || 'Failed to create chat');
    }
    return res.json();
  },

  async getMessages(chatId) {
    const url = state.currentUser && state.currentUser.id
      ? `${CONFIG.API_BASE}/chats/${chatId}/messages?userId=${encodeURIComponent(state.currentUser.id)}`
      : `${CONFIG.API_BASE}/chats/${chatId}/messages`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      if (res.status === 401) handleUnauthorized({ status: 401 });
      throw new Error('Failed to load messages');
    }
    return res.json();
  },

  async sendMessageRest(chatId, content) {
    const userId = state.currentUser ? state.currentUser.id : '';
    const url = userId 
      ? `${CONFIG.API_BASE}/chats/${chatId}/messages?userId=${encodeURIComponent(userId)}`
      : `${CONFIG.API_BASE}/chats/${chatId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ content, senderId: userId })
    });
    if (!res.ok) throw new Error('Failed to send message via REST');
    return res.json();
  },

  async getOnlineUsers(chatId) {
    const res = await fetch(`${CONFIG.API_BASE}/chats/${chatId}/online-users`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }
};

/* ==========================================================================
   WebSocket & STOMP Manager
   ========================================================================== */
const wsManager = {
  isConnecting: false,
  reconnectAttempts: 0,
  reconnectTimer: null,

  connect() {
    if (!state.currentUser) return;
    if (state.stompClient && state.stompClient.connected) return;

    this.updateStatus('connecting', 'Connecting...');
    this.isConnecting = true;

    try {
      // Connect using SockJS with fallback
      const socket = new SockJS(CONFIG.WS_ENDPOINT);
      state.stompClient = Stomp.over(socket);
      state.stompClient.debug = null; // Disable verbose console logging

      // Pass userId in native connect headers for WebsocketPresenceListener
      const connectHeaders = {
        userId: state.currentUser.id
      };

      state.stompClient.connect(
        connectHeaders,
        (frame) => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.updateStatus('online', 'Connected');
          showToast('WebSocket connected real-time', 'success', 2000);

          // If a chat was already open, subscribe to it
          if (state.activeChat) {
            this.subscribeToChat(state.activeChat.chatId);
          }
        },
        (error) => {
          this.isConnecting = false;
          console.warn('STOMP Connection error:', error);
          this.updateStatus('offline', 'Disconnected');
          this.scheduleReconnect();
        }
      );
    } catch (err) {
      this.isConnecting = false;
      this.updateStatus('offline', 'Error');
      console.error('Socket initialization failed', err);
      this.scheduleReconnect();
    }
  },

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(30000, 2000 * Math.pow(1.5, this.reconnectAttempts++));
    this.reconnectTimer = setTimeout(() => {
      if (!state.stompClient || !state.stompClient.connected) {
        this.connect();
      }
    }, delay);
  },

  updateStatus(statusClass, label) {
    const pill = document.getElementById('wsStatusPill');
    const dot = document.getElementById('wsStatusDot');
    const text = document.getElementById('wsStatusText');
    if (!pill || !dot || !text) return;

    dot.className = `status-dot ${statusClass}`;
    text.textContent = label;
  },

  subscribeToChat(chatId) {
    if (!state.stompClient || !state.stompClient.connected) return;

    // Unsubscribe from previous chat topics
    if (state.activeSubscriptions.messages) {
      state.activeSubscriptions.messages.unsubscribe();
      state.activeSubscriptions.messages = null;
    }
    if (state.activeSubscriptions.typing) {
      state.activeSubscriptions.typing.unsubscribe();
      state.activeSubscriptions.typing = null;
    }

    // 1. Subscribe to Chat Messages: /topic/chat/{chatId}
    state.activeSubscriptions.messages = state.stompClient.subscribe(
      `/topic/chat/${chatId}`,
      (message) => {
        try {
          const payload = JSON.parse(message.body);
          handleIncomingMessage(payload);
        } catch (e) {
          console.error('Error parsing incoming message', e);
        }
      }
    );

    // 2. Subscribe to Typing Indicators: /topic/chat/{chatId}/typing
    state.activeSubscriptions.typing = state.stompClient.subscribe(
      `/topic/chat/${chatId}/typing`,
      (message) => {
        try {
          const payload = JSON.parse(message.body);
          handleIncomingTyping(payload);
        } catch (e) {
          console.error('Error parsing typing payload', e);
        }
      }
    );
  },

  sendMessage(chatId, content) {
    if (!state.currentUser) return;
    const payload = {
      chatId: chatId,
      senderId: state.currentUser.id,
      content: content
    };

    if (state.stompClient && state.stompClient.connected) {
      state.stompClient.send('/app/chat/send', {}, JSON.stringify(payload));
      soundService.playSend();
    } else {
      // Fallback to REST API
      api.sendMessageRest(chatId, content)
        .then((msg) => {
          handleIncomingMessage(msg);
          soundService.playSend();
        })
        .catch(err => {
          showToast('Failed to send message: ' + err.message, 'error');
        });
    }
  },

  sendTyping(isTyping) {
    if (!state.currentUser || !state.activeChat) return;
    if (!state.stompClient || !state.stompClient.connected) return;

    const payload = {
      chatId: state.activeChat.chatId,
      userId: state.currentUser.id,
      isTyping: isTyping ? 'true' : 'false'
    };

    state.stompClient.send('/app/typing', {}, JSON.stringify(payload));
  },

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (state.stompClient) {
      try {
        state.stompClient.disconnect(() => {
          this.updateStatus('offline', 'Disconnected');
        });
      } catch (e) {}
      state.stompClient = null;
    }
  }
};

/* ==========================================================================
   Incoming Real-Time Handlers
   ========================================================================== */
function handleIncomingMessage(msg) {
  // If message belongs to active chat, append to message stream
  if (state.activeChat && msg.chat === state.activeChat.chatId) {
    // Avoid exact duplicate
    const exists = state.messages.some(m => m.id === msg.id);
    if (!exists) {
      state.messages.push(msg);
      renderNewMessage(msg);
      scrollToBottom();
      if (msg.sender !== state.currentUser.id) {
        soundService.playReceive();
      }
    }
  }

  // Update last message preview in chat list
  updateChatPreview(msg.chat, msg.content, msg.timestamp);
}

let typingDismissTimer = null;
function handleIncomingTyping(data) {
  if (!state.activeChat || data.chatId !== state.activeChat.chatId) return;

  // Don't show typing indicator for yourself
  if (data.userId === state.currentUser.id) return;

  const indicatorEl = document.getElementById('typingIndicator');
  const typingTextEl = document.getElementById('typingIndicatorText');
  if (!indicatorEl || !typingTextEl) return;

  const isTyping = data.isTyping === true || data.isTyping === 'true';

  if (isTyping) {
    const senderName = state.userCache[data.userId] || `User ${data.userId.substring(0, 5)}`;
    typingTextEl.textContent = `${senderName} is typing`;
    indicatorEl.style.display = 'flex';

    if (typingDismissTimer) clearTimeout(typingDismissTimer);
    typingDismissTimer = setTimeout(() => {
      indicatorEl.style.display = 'none';
    }, 2500);
  } else {
    indicatorEl.style.display = 'none';
  }
}

/* ==========================================================================
   Application Initialization & Storage Sync
   ========================================================================== */
function initApp() {
  soundService.init();

  // Load User Cache & Saved Settings
  try {
    const cachedUsers = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_CACHE);
    if (cachedUsers) state.userCache = JSON.parse(cachedUsers);

    const cachedNames = localStorage.getItem(CONFIG.STORAGE_KEYS.CHAT_NAMES);
    if (cachedNames) state.chatCustomNames = JSON.parse(cachedNames);

    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedSound = localStorage.getItem(CONFIG.STORAGE_KEYS.SOUND);
    state.soundEnabled = savedSound !== 'false';
  } catch (e) {
    console.warn('Storage read error', e);
  }

  // Check if session user exists
  const storedId = sessionStorage.getItem(CONFIG.STORAGE_KEYS.USER_ID);
  const storedName = sessionStorage.getItem(CONFIG.STORAGE_KEYS.USERNAME);

  if (storedId && storedName) {
    state.currentUser = { id: storedId, username: storedName };
    cacheUser(storedId, storedName);
    onUserLoggedIn();
  } else {
    openAuthModal('login');
  }

  setupEventListeners();
}

function saveUserCache() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_CACHE, JSON.stringify(state.userCache));
  } catch (e) {}
}

function saveChatCustomNames() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CHAT_NAMES, JSON.stringify(state.chatCustomNames));
  } catch (e) {}
}

function cacheUser(id, username) {
  if (!id || !username) return;
  state.userCache[id] = username;
  saveUserCache();
}

/* ==========================================================================
   Authentication Flow
   ========================================================================== */
function onUserLoggedIn() {
  closeAuthModal();

  // Update User Header Display
  const nameEl = document.getElementById('currentUsername');
  const idEl = document.getElementById('currentUserId');
  const avatarEl = document.getElementById('currentUserAvatar');

  if (nameEl) nameEl.textContent = state.currentUser.username;
  if (idEl) idEl.textContent = `#${state.currentUser.id.substring(0, 8)}`;
  if (avatarEl) avatarEl.textContent = state.currentUser.username.substring(0, 2).toUpperCase();

  // Connect STOMP WebSocket
  wsManager.connect();

  // Load User's Chat List
  loadUserChats();
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('authUsername');
  const passwordInput = document.getElementById('authPassword');
  const submitBtn = document.getElementById('authSubmitBtn');
  const mode = document.getElementById('authModal').dataset.mode || 'login';

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showToast('Please enter both username and password', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Please wait...';

  try {
    let authRes;
    if (mode === 'login') {
      authRes = await api.login(username, password);
      showToast(`Welcome back, ${authRes.username}!`, 'success');
    } else {
      authRes = await api.register(username, password);
      showToast(`Account created! Welcome, ${authRes.username}!`, 'success');
    }

    state.currentUser = {
      id: authRes.id,
      username: authRes.username || username
    };

    sessionStorage.setItem(CONFIG.STORAGE_KEYS.USER_ID, state.currentUser.id);
    sessionStorage.setItem(CONFIG.STORAGE_KEYS.USERNAME, state.currentUser.username);
    cacheUser(state.currentUser.id, state.currentUser.username);

    onUserLoggedIn();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = mode === 'login' ? 'Sign In' : 'Create Account';
  }
}

function logout() {
  sessionStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ID);
  sessionStorage.removeItem(CONFIG.STORAGE_KEYS.USERNAME);
  state.currentUser = null;
  state.activeChat = null;
  state.chats = [];
  state.messages = [];
  wsManager.disconnect();

  if (state.onlinePollTimer) clearInterval(state.onlinePollTimer);

  // Clear UI
  renderChatsList();
  closeActiveChat();
  openAuthModal('login');
  showToast('Logged out successfully', 'info');
}

/* ==========================================================================
   Chat Management & Loading
   ========================================================================== */
async function loadUserChats() {
  try {
    const chats = await api.getUserChats();
    state.chats = chats || [];
    renderChatsList();

    // If an active chat exists in state, ensure it's still highlighted
    if (state.activeChat) {
      highlightActiveChat(state.activeChat.chatId);
    }
  } catch (err) {
    console.error('Error fetching user chats', err);
    showToast('Failed to load chats. Check backend connection.', 'error');
  }
}

function getChatDisplayName(chat) {
  const isGroup = Boolean(chat.groupChat || chat.GroupChat);
  if (isGroup) {
    return chat.name || 'Group Chat';
  }

  // If custom mapped name exists
  if (state.chatCustomNames[chat.chatId]) {
    return state.chatCustomNames[chat.chatId];
  }

  // For 1-on-1 chats: participantIds has the other user's ID
  if (chat.participantIds && chat.participantIds.length > 0) {
    const partnerId = chat.participantIds[0];
    if (state.userCache[partnerId]) {
      return state.userCache[partnerId];
    }
    return `User ${partnerId.substring(0, 6)}`;
  }

  return chat.name || 'Direct Message';
}

function renderChatsList() {
  const container = document.getElementById('chatsList');
  if (!container) return;

  container.innerHTML = '';

  const filtered = state.chats.filter(c => {
    const isGroup = Boolean(c.groupChat || c.GroupChat);
    if (state.activeTab === 'direct') return !isGroup;
    if (state.activeTab === 'group') return isGroup;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-chats">
        <div class="empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <p style="font-weight: 600; color: var(--text-secondary);">No conversations yet</p>
        <p style="font-size: 0.8rem;">Search for a user or create a group to begin messaging.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(chat => {
    const isGroup = Boolean(chat.groupChat || chat.GroupChat);
    const title = getChatDisplayName(chat);
    const initials = title.substring(0, 2).toUpperCase();
    const isActive = state.activeChat && state.activeChat.chatId === chat.chatId;

    const card = document.createElement('div');
    card.className = `chat-card ${isActive ? 'active' : ''}`;
    card.id = `chatCard-${chat.chatId}`;
    card.onclick = () => selectChat(chat);

    card.innerHTML = `
      <div class="chat-avatar-wrapper">
        <div class="avatar md ${isGroup ? 'group-avatar' : ''}">${initials}</div>
        <div class="online-indicator-dot" id="onlineDot-${chat.chatId}"></div>
      </div>
      <div class="chat-content">
        <div class="chat-header-row">
          <span class="chat-name">${title}</span>
          ${isGroup ? '<span class="group-tag">GROUP</span>' : ''}
        </div>
        <div class="chat-preview-row">
          <span class="chat-preview-text" id="preview-${chat.chatId}">Click to view conversation</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function highlightActiveChat(chatId) {
  document.querySelectorAll('.chat-card').forEach(c => c.classList.remove('active'));
  const target = document.getElementById(`chatCard-${chatId}`);
  if (target) target.classList.add('active');
}

function updateChatPreview(chatId, snippet, timestamp) {
  const el = document.getElementById(`preview-${chatId}`);
  if (el) {
    el.textContent = snippet;
  }
}

/* ==========================================================================
   Chat Selection & Messaging View
   ========================================================================== */
async function selectChat(chat) {
  state.activeChat = chat;
  highlightActiveChat(chat.chatId);

  // Switch right pane view
  const emptyState = document.getElementById('noChatSelected');
  const chatWrapper = document.getElementById('activeChatWrapper');
  if (emptyState) emptyState.style.display = 'none';
  if (chatWrapper) chatWrapper.classList.add('visible');

  // Populate Chat Header
  const title = getChatDisplayName(chat);
  const isGroup = Boolean(chat.groupChat || chat.GroupChat);

  document.getElementById('activeChatTitle').textContent = title;
  document.getElementById('activeChatAvatar').textContent = title.substring(0, 2).toUpperCase();
  document.getElementById('activeChatIdBadge').textContent = `ID: ${chat.chatId.substring(0, 8)}...`;
  document.getElementById('chatCopyIdBtn').dataset.fullId = chat.chatId;

  // On mobile, hide sidebar to view chat
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && window.innerWidth <= 768) {
    sidebar.classList.add('mobile-hidden');
  }

  // Subscribe to WebSocket topics for this chat
  wsManager.subscribeToChat(chat.chatId);

  // Load message history from REST API
  await loadMessagesForChat(chat.chatId);

  // Poll online status for chat members
  checkOnlinePresence();
  if (state.onlinePollTimer) clearInterval(state.onlinePollTimer);
  state.onlinePollTimer = setInterval(checkOnlinePresence, CONFIG.POLL_INTERVAL_MS || 8000);

  // Focus message input
  const input = document.getElementById('messageInput');
  if (input) input.focus();
}

function closeActiveChat() {
  state.activeChat = null;
  const emptyState = document.getElementById('noChatSelected');
  const chatWrapper = document.getElementById('activeChatWrapper');
  if (emptyState) emptyState.style.display = 'flex';
  if (chatWrapper) chatWrapper.classList.remove('visible');

  if (state.onlinePollTimer) clearInterval(state.onlinePollTimer);
}

async function loadMessagesForChat(chatId) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.9rem;">
      Loading messages...
    </div>
  `;

  try {
    const messages = await api.getMessages(chatId);
    state.messages = messages || [];
    renderAllMessages(state.messages);
    scrollToBottom();
  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--status-busy); font-size: 0.9rem;">
        Failed to load messages. <button onclick="loadMessagesForChat('${chatId}')" style="color: var(--accent-primary); text-decoration: underline;">Retry</button>
      </div>
    `;
  }
}

function renderAllMessages(messages) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;
  container.innerHTML = '';

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p style="font-weight: 600; font-size: 1rem; color: var(--text-secondary); margin-bottom: 6px;">No messages here yet</p>
        <p style="font-size: 0.85rem;">Send a greeting to start the conversation!</p>
      </div>
    `;
    return;
  }

  let lastDate = null;

  messages.forEach(msg => {
    // Optional date divider
    if (msg.timestamp) {
      const msgDate = new Date(msg.timestamp).toLocaleDateString();
      if (msgDate !== lastDate) {
        lastDate = msgDate;
        const divider = document.createElement('div');
        divider.className = 'date-divider';
        divider.innerHTML = `<span class="date-divider-pill">${formatDateDivider(msg.timestamp)}</span>`;
        container.appendChild(divider);
      }
    }
    renderNewMessage(msg, false);
  });
}

function renderNewMessage(msg, shouldScroll = true) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  // Remove empty state if present
  if (container.querySelector('div[style*="text-align: center"]')) {
    container.innerHTML = '';
  }

  const isMe = state.currentUser && msg.sender === state.currentUser.id;
  const senderName = isMe ? 'You' : (state.userCache[msg.sender] || `User ${msg.sender.substring(0, 6)}`);
  const senderInitials = senderName.substring(0, 2).toUpperCase();
  const timeStr = formatMessageTime(msg.timestamp);

  const row = document.createElement('div');
  row.className = `msg-row ${isMe ? 'sent' : 'received'}`;

  row.innerHTML = `
    ${!isMe ? `<div class="avatar sm" title="${senderName}">${senderInitials}</div>` : ''}
    <div class="msg-bubble-container">
      ${!isMe ? `<span class="msg-sender-name">${senderName}</span>` : ''}
      <div class="msg-bubble">${escapeHtml(msg.content)}</div>
      <div class="msg-meta-row">
        <span>${timeStr}</span>
        ${isMe ? `
          <span class="delivered-check" title="Delivered">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        ` : ''}
      </div>
    </div>
  `;

  container.appendChild(row);

  if (shouldScroll) {
    scrollToBottom();
  }
}

function handleSendMessage() {
  if (!state.activeChat) return;
  const input = document.getElementById('messageInput');
  const content = input.value.trim();

  if (!content) return;

  wsManager.sendMessage(state.activeChat.chatId, content);

  // Clear input & stop typing indicator immediately
  input.value = '';
  input.style.height = 'auto';
  stopTyping();
}

/* ==========================================================================
   Typing Indicator Throttle & Debounce
   ========================================================================== */
function onMessageInputChange() {
  if (!state.activeChat) return;

  if (!state.isTypingLocal) {
    state.isTypingLocal = true;
    wsManager.sendTyping(true);
  }

  if (state.typingTimer) clearTimeout(state.typingTimer);
  state.typingTimer = setTimeout(() => {
    stopTyping();
  }, CONFIG.TYPING_DEBOUNCE_MS);
}

function stopTyping() {
  if (state.isTypingLocal) {
    state.isTypingLocal = false;
    wsManager.sendTyping(false);
  }
  if (state.typingTimer) clearTimeout(state.typingTimer);
}

/* ==========================================================================
   Online Presence Polling
   ========================================================================== */
async function checkOnlinePresence() {
  if (!state.activeChat) return;

  try {
    const onlineIds = await api.getOnlineUsers(state.activeChat.chatId);
    state.onlineUserIds = new Set(onlineIds);

    const presenceEl = document.getElementById('activeChatPresenceText');
    const isGroup = Boolean(state.activeChat.groupChat || state.activeChat.GroupChat);

    if (presenceEl) {
      if (isGroup) {
        presenceEl.textContent = `${onlineIds.length} member${onlineIds.length === 1 ? '' : 's'} online`;
      } else {
        // Direct chat: check if partner is online
        const partnerId = state.activeChat.participantIds ? state.activeChat.participantIds[0] : null;
        const isOnline = partnerId && state.onlineUserIds.has(partnerId);
        presenceEl.innerHTML = isOnline
          ? '<span style="color: var(--status-online)">● Online</span>'
          : '<span style="color: var(--text-muted)">Offline</span>';
      }
    }
  } catch (e) {
    console.warn('Online presence check failed', e);
  }
}

/* ==========================================================================
   Search & User Discovery
   ========================================================================== */
let searchDebounceTimer = null;

function handleUserSearchInput(e) {
  const query = e.target.value.trim();
  const clearBtn = document.getElementById('searchClearBtn');
  const resultsBox = document.getElementById('searchResultsBox');

  if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

  if (!query || query.length < 2) {
    if (resultsBox) resultsBox.style.display = 'none';
    return;
  }

  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    try {
      const user = await api.searchUser(query);
      if (user && user.id) {
        cacheUser(user.id, user.username);
        displaySearchResult(user);
      } else {
        displaySearchNotFound();
      }
    } catch (err) {
      displaySearchNotFound();
    }
  }, 400);
}

function displaySearchResult(user) {
  const resultsBox = document.getElementById('searchResultsBox');
  if (!resultsBox) return;

  resultsBox.style.display = 'block';
  resultsBox.innerHTML = `
    <div class="search-result-user">
      <div class="search-user-info">
        <div class="avatar sm">${user.username.substring(0, 2).toUpperCase()}</div>
        <div class="search-user-meta">
          <div class="search-user-name">${user.username}</div>
          <div class="search-user-id">ID: ${user.id.substring(0, 10)}...</div>
        </div>
      </div>
      <button class="btn-start-chat" onclick="startChatWithUser('${user.id}', '${user.username}')">
        Message
      </button>
    </div>
  `;
}

function displaySearchNotFound() {
  const resultsBox = document.getElementById('searchResultsBox');
  if (!resultsBox) return;
  resultsBox.style.display = 'block';
  resultsBox.innerHTML = `
    <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 4px;">
      No registered user found with that username
    </div>
  `;
}

function clearUserSearch() {
  const input = document.getElementById('searchUserInput');
  const clearBtn = document.getElementById('searchClearBtn');
  const resultsBox = document.getElementById('searchResultsBox');
  if (input) input.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  if (resultsBox) resultsBox.style.display = 'none';
}

async function startChatWithUser(targetUserId, targetUsername) {
  if (!state.currentUser || !state.currentUser.id) {
    showToast('Please sign in or create an account first to start chatting!', 'warning');
    openAuthModal('login');
    return;
  }

  if (targetUserId === state.currentUser.id) {
    showToast("You cannot start a direct chat with yourself", 'info');
    return;
  }

  cacheUser(targetUserId, targetUsername);
  clearUserSearch();

  try {
    showToast(`Creating conversation with ${targetUsername}...`, 'info', 1500);

    const chat = await api.createChat({
      name: '',
      participantIds: [targetUserId],
      groupChat: false
    });

    state.chatCustomNames[chat.chatId] = targetUsername;
    saveChatCustomNames();

    // Reload list and switch to newly created or existing chat
    await loadUserChats();
    selectChat(chat);
    showToast(`Connected with ${targetUsername}`, 'success');
  } catch (err) {
    showToast('Failed to create chat: ' + err.message, 'error');
  }
}

/* ==========================================================================
   Group Chat Creation Modal Logic
   ========================================================================== */
let groupParticipants = []; // Array of { id, username }

function openCreateGroupModal() {
  if (!state.currentUser || !state.currentUser.id) {
    showToast('Please sign in first to create a group chat!', 'warning');
    openAuthModal('login');
    return;
  }
  groupParticipants = [];
  renderGroupChips();
  document.getElementById('groupNameInput').value = '';
  document.getElementById('groupUserInput').value = '';
  document.getElementById('createGroupModal').classList.add('active');
}

function closeCreateGroupModal() {
  document.getElementById('createGroupModal').classList.remove('active');
}

async function addParticipantToGroup() {
  const input = document.getElementById('groupUserInput');
  const username = input.value.trim();

  if (!username) return;

  try {
    const user = await api.searchUser(username);
    if (!user || !user.id) {
      showToast('User not found', 'error');
      return;
    }

    if (user.id === state.currentUser.id) {
      showToast('You are automatically included in the group', 'info');
      input.value = '';
      return;
    }

    if (groupParticipants.some(p => p.id === user.id)) {
      showToast('User already added', 'info');
      return;
    }

    cacheUser(user.id, user.username);
    groupParticipants.push({ id: user.id, username: user.username });
    renderGroupChips();
    input.value = '';
  } catch (err) {
    showToast('User not found: ' + username, 'error');
  }
}

function removeGroupParticipant(index) {
  groupParticipants.splice(index, 1);
  renderGroupChips();
}

function renderGroupChips() {
  const container = document.getElementById('groupChipsContainer');
  if (!container) return;

  container.innerHTML = '';
  if (groupParticipants.length === 0) {
    container.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted); align-self: center; padding: 4px;">Search and add usernames below</span>`;
    return;
  }

  groupParticipants.forEach((p, idx) => {
    const chip = document.createElement('div');
    chip.className = 'participant-chip';
    chip.innerHTML = `
      <span>${p.username}</span>
      <span class="chip-remove" onclick="removeGroupParticipant(${idx})">×</span>
    `;
    container.appendChild(chip);
  });
}

async function submitCreateGroup() {
  const nameInput = document.getElementById('groupNameInput');
  const name = nameInput.value.trim();

  if (!name) {
    showToast('Please enter a group name', 'error');
    return;
  }

  if (groupParticipants.length === 0) {
    showToast('Please add at least one member to the group', 'error');
    return;
  }

  // Include current user + participants
  const allParticipantIds = [
    state.currentUser.id,
    ...groupParticipants.map(p => p.id)
  ];

  try {
    showToast('Creating group chat...', 'info', 1500);
    const chat = await api.createChat({
      name: name,
      participantIds: allParticipantIds,
      groupChat: true
    });

    closeCreateGroupModal();
    await loadUserChats();
    selectChat(chat);
    showToast(`Group "${name}" created!`, 'success');
  } catch (err) {
    showToast('Failed to create group: ' + err.message, 'error');
  }
}

/* ==========================================================================
   Modals & UI Helpers
   ========================================================================== */
function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  const title = document.getElementById('authTitle');
  const subtitle = document.getElementById('authSubtitle');
  const submitBtn = document.getElementById('authSubmitBtn');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');

  modal.dataset.mode = mode;

  if (mode === 'login') {
    title.textContent = 'Welcome Back';
    subtitle.textContent = 'Sign in to access your real-time chats';
    submitBtn.textContent = 'Sign In';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    title.textContent = 'Create Account';
    subtitle.textContent = 'Register an account to start chatting';
    submitBtn.textContent = 'Create Account';
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
  }

  modal.classList.add('active');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
}

function quickFillAuth(username, password) {
  document.getElementById('authUsername').value = username;
  document.getElementById('authPassword').value = password;
  showToast(`Autofilled credentials for "${username}"`, 'info', 1500);
}

function copyActiveChatId() {
  const btn = document.getElementById('chatCopyIdBtn');
  const id = btn.dataset.fullId;
  if (!id) return;

  navigator.clipboard.writeText(id).then(() => {
    showToast('Chat ID copied to clipboard!', 'success', 2000);
  }).catch(() => {
    showToast('ID: ' + id, 'info', 4000);
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, next);
  showToast(`Switched to ${next} theme`, 'info', 1500);
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  localStorage.setItem(CONFIG.STORAGE_KEYS.SOUND, state.soundEnabled ? 'true' : 'false');
  const icon = document.getElementById('soundToggleIcon');
  if (icon) {
    icon.innerHTML = state.soundEnabled
      ? '<path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>'
      : '<path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
  }
  showToast(state.soundEnabled ? 'Sound enabled' : 'Sound muted', 'info', 1500);
}

function insertEmoji(emoji) {
  const input = document.getElementById('messageInput');
  if (!input) return;
  input.value += emoji;
  input.focus();
  onMessageInputChange();
}

function scrollToBottom() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function formatMessageTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

function formatDateDivider(ts) {
  try {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return 'Recent';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   Event Listeners Setup
   ========================================================================== */
function setupEventListeners() {
  // Auth Form
  const authForm = document.getElementById('authForm');
  if (authForm) authForm.addEventListener('submit', handleAuthSubmit);

  // Search User
  const searchInput = document.getElementById('searchUserInput');
  if (searchInput) searchInput.addEventListener('input', handleUserSearchInput);

  // Tabs for Chats
  document.querySelectorAll('.chat-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.chat-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.activeTab = e.target.dataset.tab;
      renderChatsList();
    });
  });

  // Message Input Keyboard events
  const msgInput = document.getElementById('messageInput');
  if (msgInput) {
    msgInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
    msgInput.addEventListener('input', onMessageInputChange);
  }

  // Mobile Back Button
  const backBtn = document.getElementById('backToSidebarBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.remove('mobile-hidden');
    });
  }

  // Close modals on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCreateGroupModal();
      clearUserSearch();
    }
  });
}

// Bootstrap on window load
window.addEventListener('DOMContentLoaded', initApp);
