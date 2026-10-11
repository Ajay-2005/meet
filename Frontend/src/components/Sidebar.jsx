import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Users, MessageSquare, X } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Sidebar({
  currentUser,
  chats,
  activeChat,
  onSelectChat,
  onOpenCreateGroup,
  userCache,
  onCacheUser,
  chatCustomNames,
  onSaveChatCustomName,
  isMobileHidden,
  onReloadChats
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'direct' | 'group'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const { showToast } = useToast();
  const searchTimeoutRef = useRef(null);

  // Debounced user search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSearchResult(null);
      setSearchNotFound(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchNotFound(false);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await api.searchUser(query, currentUser?.id);
        const found = Array.isArray(result) ? result[0] : result;

        if (found && found.id) {
          onCacheUser(found.id, found.username);
          setSearchResult(found);
          setSearchNotFound(false);
        } else {
          setSearchResult(null);
          setSearchNotFound(true);
        }
      } catch (err) {
        setSearchResult(null);
        setSearchNotFound(true);
      } finally {
        setIsSearching(false);
      }
    }, 380);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, currentUser?.id, onCacheUser]);

  const handleStartChatWithUser = async (targetUser) => {
    if (!currentUser?.id) {
      showToast('Please sign in first to start a conversation', 'warning');
      return;
    }

    if (targetUser.id === currentUser.id) {
      showToast('You cannot start a direct chat with yourself', 'info');
      return;
    }

    try {
      showToast(`Connecting with ${targetUser.username}...`, 'info', 1500);
      const chat = await api.createChat({
        name: '',
        participantIds: [targetUser.id],
        groupChat: false,
        senderId: currentUser.id
      });

      onCacheUser(targetUser.id, targetUser.username);
      onSaveChatCustomName(chat.chatId, targetUser.username);

      setSearchQuery('');
      setSearchResult(null);

      await onReloadChats();
      onSelectChat(chat);
      showToast(`Connected with ${targetUser.username}`, 'success');
    } catch (err) {
      showToast(`Failed to create chat: ${err.message}`, 'error');
    }
  };

  const getChatDisplayName = (chat) => {
    const isGroup = Boolean(chat.groupChat || chat.GroupChat);
    if (isGroup) {
      return chat.name || 'Group Chat';
    }

    if (chatCustomNames[chat.chatId]) {
      return chatCustomNames[chat.chatId];
    }

    if (chat.participantIds && chat.participantIds.length > 0) {
      const partnerId = chat.participantIds[0];
      if (userCache[partnerId]) {
        return userCache[partnerId];
      }
      return `User #${partnerId.substring(0, 6)}`;
    }

    return chat.name || 'Direct Message';
  };

  // Filter chats by tab
  const filteredChats = chats.filter((c) => {
    const isGroup = Boolean(c.groupChat || c.GroupChat);
    if (activeTab === 'direct') return !isGroup;
    if (activeTab === 'group') return isGroup;
    return true;
  });

  return (
    <aside className={`sidebar ${isMobileHidden ? 'mobile-hidden' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <h2 className="sidebar-title">Chats</h2>
          <button
            type="button"
            className="action-btn-pill"
            onClick={onOpenCreateGroup}
            title="Create a new group chat"
          >
            <Plus size={14} strokeWidth={2.6} />
            <span>New Group</span>
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="search-wrapper">
          <div className="search-input-box">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Search user by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {(searchResult || searchNotFound || isSearching) && (
            <div className="search-results-box">
              {isSearching && (
                <div style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Searching...
                </div>
              )}
              {searchResult && (
                <div className="search-result-item">
                  <div className="search-user-info">
                    <div className="avatar sm">
                      {searchResult.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="search-user-name">{searchResult.username}</div>
                      <div className="search-user-id">#{searchResult.id.substring(0, 8)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-start-chat"
                    onClick={() => handleStartChatWithUser(searchResult)}
                  >
                    Message
                  </button>
                </div>
              )}
              {searchNotFound && !isSearching && (
                <div style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No user found with username "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="chat-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'direct' ? 'active' : ''}`}
          onClick={() => setActiveTab('direct')}
        >
          Direct
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'group' ? 'active' : ''}`}
          onClick={() => setActiveTab('group')}
        >
          Groups
        </button>
      </div>

      {/* Chat List */}
      <div className="chats-list-container">
        {filteredChats.length === 0 ? (
          <div className="empty-chats">
            <div className="empty-icon">
              <MessageSquare size={22} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              No conversations yet
            </p>
            <p style={{ fontSize: '0.8rem' }}>
              Search for a user or create a group to start chatting.
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isGroup = Boolean(chat.groupChat || chat.GroupChat);
            const title = getChatDisplayName(chat);
            const initials = title.substring(0, 2).toUpperCase();
            const isActive = activeChat && activeChat.chatId === chat.chatId;

            return (
              <div
                key={chat.chatId}
                className={`chat-card ${isActive ? 'active' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="chat-avatar-wrapper">
                  <div className={`avatar md ${isGroup ? 'group' : ''}`}>
                    {initials}
                  </div>
                </div>

                <div className="chat-content">
                  <div className="chat-header-row">
                    <span className="chat-name">{title}</span>
                    {isGroup && <span className="group-tag">GROUP</span>}
                  </div>
                  <div className="chat-preview-row">
                    <span className="chat-preview-text">
                      {chat.lastPreview || 'Open conversation'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
