import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AuthModal from './components/AuthModal';
import CreateGroupModal from './components/CreateGroupModal';
import { api } from './services/api';
import { wsService } from './services/websocket';
import { soundService } from './services/sound';
import { useToast } from './context/ToastContext';
import './App.css';

const STORAGE_KEYS = {
  USER_ID: 'meetchat_user_id',
  USERNAME: 'meetchat_username',
  USER_CACHE: 'meetchat_user_cache',
  CHAT_NAMES: 'meetchat_chat_names',
  THEME: 'meetchat_theme',
  SOUND: 'meetchat_sound_enabled'
};

export default function App() {
  const { showToast } = useToast();

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const id = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
    const username = sessionStorage.getItem(STORAGE_KEYS.USERNAME);
    return id && username ? { id, username } : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(!currentUser);

  // App Settings State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false';
  });

  // Cached Mappings
  const [userCache, setUserCache] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_CACHE) || '{}');
    } catch {
      return {};
    }
  });

  const [chatCustomNames, setChatCustomNames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_NAMES) || '{}');
    } catch {
      return {};
    }
  });

  // Chat and Messaging State
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Real-time State
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [isTypingOther, setIsTypingOther] = useState(false);
  const [typingUserName, setTypingUserName] = useState('');
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isMobileHidden, setIsMobileHidden] = useState(false);

  const typingTimerRef = useRef(null);
  const typingDismissRef = useRef(null);
  const presencePollRef = useRef(null);
  const activeChatRef = useRef(activeChat);

  // Keep activeChatRef updated
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Apply sound setting
  useEffect(() => {
    soundService.setEnabled(soundEnabled);
    localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  // Cache user helper
  const handleCacheUser = useCallback((id, username) => {
    if (!id || !username) return;
    setUserCache((prev) => {
      const updated = { ...prev, [id]: username };
      try {
        localStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  }, []);

  // Save custom chat name
  const handleSaveChatCustomName = useCallback((chatId, name) => {
    if (!chatId || !name) return;
    setChatCustomNames((prev) => {
      const updated = { ...prev, [chatId]: name };
      try {
        localStorage.setItem(STORAGE_KEYS.CHAT_NAMES, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  }, []);

  // Fetch user chats
  const loadUserChats = useCallback(async (user = currentUser) => {
    if (!user?.id) return;
    try {
      const data = await api.getUserChats(user.id);
      setChats(data || []);
    } catch (err) {
      console.warn('Failed to load user chats:', err);
    }
  }, [currentUser]);

  // Fetch messages for active chat
  const loadMessages = useCallback(async (chatId, userId) => {
    if (!chatId) return;
    setIsLoadingMessages(true);
    try {
      const msgs = await api.getMessages(chatId, userId);
      setMessages(msgs || []);
    } catch (err) {
      showToast('Failed to load messages', 'error');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [showToast]);

  // Check online users for active chat
  const checkPresence = useCallback(async (chatId, userId) => {
    if (!chatId) return;
    try {
      const users = await api.getOnlineUsers(chatId, userId);
      setOnlineUserIds(new Set(users || []));
    } catch (_) {}
  }, []);

  // Incoming WebSocket Message Handler
  const handleIncomingMessage = useCallback((msg) => {
    const current = activeChatRef.current;
    if (current && msg.chat === current.chatId) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      if (currentUser && msg.sender !== currentUser.id) {
        soundService.playReceive();
      }
    }

    // Update preview in chats list
    setChats((prev) =>
      prev.map((c) =>
        c.chatId === msg.chat ? { ...c, lastPreview: msg.content } : c
      )
    );
  }, [currentUser]);

  // Incoming Typing Indicator Handler
  const handleIncomingTyping = useCallback((data) => {
    const current = activeChatRef.current;
    if (!current || data.chatId !== current.chatId) return;
    if (currentUser && data.userId === currentUser.id) return;

    const isTyping = data.isTyping === true || data.isTyping === 'true';

    if (isTyping) {
      const senderName = userCache[data.userId] || `User #${data.userId.substring(0, 6)}`;
      setTypingUserName(senderName);
      setIsTypingOther(true);

      if (typingDismissRef.current) clearTimeout(typingDismissRef.current);
      typingDismissRef.current = setTimeout(() => {
        setIsTypingOther(false);
      }, 2500);
    } else {
      setIsTypingOther(false);
    }
  }, [currentUser, userCache]);

  // Subscribe/unsubscribe STOMP when activeChat changes
  useEffect(() => {
    if (!activeChat) {
      wsService.unsubscribeCurrentChat();
      if (presencePollRef.current) clearInterval(presencePollRef.current);
      return;
    }

    wsService.subscribeToChat(
      activeChat.chatId,
      handleIncomingMessage,
      handleIncomingTyping
    );

    loadMessages(activeChat.chatId, currentUser?.id);
    checkPresence(activeChat.chatId, currentUser?.id);

    if (presencePollRef.current) clearInterval(presencePollRef.current);
    presencePollRef.current = setInterval(() => {
      checkPresence(activeChat.chatId, currentUser?.id);
    }, 8000);

    return () => {
      if (presencePollRef.current) clearInterval(presencePollRef.current);
    };
  }, [activeChat, currentUser?.id, handleIncomingMessage, handleIncomingTyping, loadMessages, checkPresence]);

  // Connect STOMP WebSocket on login / status listener
  useEffect(() => {
    const unsubscribe = wsService.onStatusChange(setWsStatus);

    if (currentUser?.id) {
      handleCacheUser(currentUser.id, currentUser.username);
      wsService.connect(currentUser.id);
      loadUserChats(currentUser);
    } else {
      wsService.disconnect();
    }

    return () => {
      unsubscribe();
    };
  }, [currentUser, handleCacheUser, loadUserChats]);

  // Handlers
  const handleLoginSuccess = (user) => {
    sessionStorage.setItem(STORAGE_KEYS.USER_ID, user.id);
    sessionStorage.setItem(STORAGE_KEYS.USERNAME, user.username);
    setCurrentUser(user);
    handleCacheUser(user.id, user.username);
    setIsAuthOpen(false);
    wsService.connect(user.id);
    loadUserChats(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
    sessionStorage.removeItem(STORAGE_KEYS.USERNAME);
    setCurrentUser(null);
    setActiveChat(null);
    setChats([]);
    setMessages([]);
    wsService.disconnect();
    setIsAuthOpen(true);
    showToast('Logged out successfully', 'info');
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    if (window.innerWidth <= 768) {
      setIsMobileHidden(true);
    }
  };

  const handleSendMessage = (content) => {
    if (!activeChat || !currentUser) return;

    const sentWs = wsService.sendMessage(activeChat.chatId, currentUser.id, content);
    if (sentWs) {
      soundService.playSend();
    } else {
      // Fallback to REST
      api.sendMessageRest(activeChat.chatId, currentUser.id, content)
        .then((msg) => {
          handleIncomingMessage(msg);
          soundService.playSend();
        })
        .catch((err) => {
          showToast(`Failed to send message: ${err.message}`, 'error');
        });
    }
  };

  const handleTypingChange = (isTyping) => {
    if (!activeChat || !currentUser) return;

    if (isTyping) {
      wsService.sendTyping(activeChat.chatId, currentUser.id, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        wsService.sendTyping(activeChat.chatId, currentUser.id, false);
      }, 1500);
    } else {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      wsService.sendTyping(activeChat.chatId, currentUser.id, false);
    }
  };

  const getChatDisplayName = (chat) => {
    if (!chat) return '';
    const isGroup = Boolean(chat.groupChat || chat.GroupChat);
    if (isGroup) return chat.name || 'Group Chat';
    if (chatCustomNames[chat.chatId]) return chatCustomNames[chat.chatId];

    if (chat.participantIds && chat.participantIds.length > 0) {
      const partnerId = chat.participantIds[0];
      if (userCache[partnerId]) return userCache[partnerId];
      return `User #${partnerId.substring(0, 6)}`;
    }
    return chat.name || 'Direct Message';
  };

  const partnerId = activeChat?.participantIds ? activeChat.participantIds[0] : null;
  const isPartnerOnline = partnerId ? onlineUserIds.has(partnerId) : false;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        wsStatus={wsStatus}
        onReconnectWs={() => currentUser && wsService.connect(currentUser.id)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Workspace */}
      <main className="main-workspace">
        <Sidebar
          currentUser={currentUser}
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
          userCache={userCache}
          onCacheUser={handleCacheUser}
          chatCustomNames={chatCustomNames}
          onSaveChatCustomName={handleSaveChatCustomName}
          isMobileHidden={isMobileHidden}
          onReloadChats={() => loadUserChats(currentUser)}
        />

        <ChatArea
          currentUser={currentUser}
          activeChat={activeChat}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          onSendMessage={handleSendMessage}
          onTypingChange={handleTypingChange}
          isTypingOther={isTypingOther}
          typingUserName={typingUserName}
          onlineUsersCount={onlineUserIds.size}
          isPartnerOnline={isPartnerOnline}
          onBackToSidebar={() => setIsMobileHidden(false)}
          onRefreshMessages={() => activeChat && loadMessages(activeChat.chatId, currentUser?.id)}
          onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
          chatDisplayName={getChatDisplayName(activeChat)}
          userCache={userCache}
        />
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => currentUser && setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        currentUser={currentUser}
        onCreateGroupSuccess={(newChat) => {
          loadUserChats(currentUser);
          setActiveChat(newChat);
        }}
        onCacheUser={handleCacheUser}
      />
    </div>
  );
}
