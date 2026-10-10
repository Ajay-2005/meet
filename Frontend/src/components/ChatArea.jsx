import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Copy,
  RefreshCw,
  ArrowLeft,
  Check,
  CheckCheck,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ChatArea({
  currentUser,
  activeChat,
  messages,
  isLoadingMessages,
  onSendMessage,
  onTypingChange,
  isTypingOther,
  typingUserName,
  onlineUsersCount,
  isPartnerOnline,
  onBackToSidebar,
  onRefreshMessages,
  onOpenCreateGroup,
  chatDisplayName,
  userCache
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { showToast } = useToast();

  // Scroll to bottom whenever messages change or activeChat changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTypingOther]);

  // Focus input on active chat change
  useEffect(() => {
    if (activeChat) {
      inputRef.current?.focus();
    }
  }, [activeChat]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !activeChat) return;

    onSendMessage(text);
    setInputText('');
    if (onTypingChange) onTypingChange(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (onTypingChange) {
      onTypingChange(true);
    }
  };

  const handleCopyChatId = () => {
    if (!activeChat) return;
    navigator.clipboard.writeText(activeChat.chatId)
      .then(() => showToast('Chat ID copied to clipboard!', 'success', 2000))
      .catch(() => showToast(`Chat ID: ${activeChat.chatId}`, 'info'));
  };

  const handleEmojiClick = (emoji) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
    if (onTypingChange) onTypingChange(true);
  };

  const formatMessageTime = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return '';
    }
  };

  const formatDateDivider = (ts) => {
    try {
      const d = new Date(ts);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return 'Today';
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (_) {
      return 'Recent';
    }
  };

  // If no chat is active, display empty state
  if (!activeChat) {
    return (
      <section className="chat-pane">
        <div className="no-chat-selected">
          <div className="hero-art-circle">
            <MessageSquare size={38} strokeWidth={1.8} />
          </div>
          <h2 className="no-chat-title">Instant Messaging with WebSocket</h2>
          <p className="no-chat-subtitle">
            Select a conversation from the sidebar or search for a registered user to initiate a real-time STOMP messaging session.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenCreateGroup}
            >
              Create Group
            </button>
          </div>
        </div>
      </section>
    );
  }

  const isGroup = Boolean(activeChat.groupChat || activeChat.GroupChat);
  const initials = chatDisplayName ? chatDisplayName.substring(0, 2).toUpperCase() : '#';

  let lastDate = null;

  return (
    <section className="chat-pane">
      <div className="active-chat-wrapper">
        {/* Header */}
        <div className="chat-pane-header">
          <div className="chat-header-info">
            <button
              type="button"
              className="icon-btn back-to-sidebar-btn"
              onClick={onBackToSidebar}
              title="Back to conversations"
            >
              <ArrowLeft size={18} />
            </button>

            <div className={`avatar md ${isGroup ? 'group' : ''}`}>
              {initials}
            </div>

            <div className="chat-title-group">
              <div className="active-chat-title">{chatDisplayName}</div>
              <div className="active-chat-meta">
                {isGroup ? (
                  <span className="active-online-pill">
                    ● {onlineUsersCount} online
                  </span>
                ) : (
                  <span
                    className="active-online-pill"
                    style={{ color: isPartnerOnline ? 'var(--status-online)' : 'var(--text-muted)' }}
                  >
                    ● {isPartnerOnline ? 'Online' : 'Offline'}
                  </span>
                )}
                <span>•</span>
                <span className="mono" style={{ fontSize: '0.72rem' }}>
                  #{activeChat.chatId.substring(0, 8)}
                </span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="chat-header-actions">
            <button
              type="button"
              className="btn-header-action"
              onClick={handleCopyChatId}
              title="Copy Chat ID"
            >
              <Copy size={13} />
              <span>Copy ID</span>
            </button>

            <button
              type="button"
              className="btn-header-action"
              onClick={onRefreshMessages}
              title="Reload messages"
            >
              <RefreshCw size={13} className={isLoadingMessages ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="messages-scroll-area">
          {isLoadingMessages && messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                No messages here yet
              </p>
              <p style={{ fontSize: '0.85rem' }}>Send a greeting to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = currentUser && msg.sender === currentUser.id;
              const senderName = isMe
                ? 'You'
                : userCache[msg.sender] || `User #${msg.sender?.substring(0, 6)}`;
              const senderInitials = senderName.substring(0, 2).toUpperCase();

              // Date divider logic
              let showDivider = false;
              if (msg.timestamp) {
                const msgDate = new Date(msg.timestamp).toLocaleDateString();
                if (msgDate !== lastDate) {
                  lastDate = msgDate;
                  showDivider = true;
                }
              }

              return (
                <React.Fragment key={msg.id || index}>
                  {showDivider && (
                    <div className="date-divider">
                      <span className="date-divider-pill">
                        {formatDateDivider(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  <div className={`msg-row ${isMe ? 'sent' : 'received'}`}>
                    {!isMe && (
                      <div className="avatar sm" title={senderName}>
                        {senderInitials}
                      </div>
                    )}
                    <div className="msg-bubble-container">
                      {!isMe && isGroup && (
                        <span className="msg-sender-name">{senderName}</span>
                      )}
                      <div className="msg-bubble">{msg.content}</div>
                      <div className="msg-meta-row">
                        <span>{formatMessageTime(msg.timestamp)}</span>
                        {isMe && (
                          <span className="delivered-check" title="Delivered">
                            <CheckCheck size={13} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {isTypingOther && (
          <div className="typing-bar">
            <div className="typing-dots">
              <span />
              <span />
              <span />
            </div>
            <span>{typingUserName} is typing...</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="chat-input-bar">
          <div className="quick-emojis-row">
            {['👋', '🚀', '👍', '🎉', '❤️', '🔥'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="emoji-pill-btn"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="input-box-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="message-text-input"
              placeholder="Type your message... (Press Enter to send)"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button
              type="button"
              className="send-btn"
              disabled={!inputText.trim()}
              onClick={handleSend}
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
