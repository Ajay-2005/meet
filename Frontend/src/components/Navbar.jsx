import React from 'react';
import { MessageSquare, Volume2, VolumeX, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar({
  currentUser,
  wsStatus,
  onReconnectWs,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
  onLogout,
  onOpenAuth
}) {
  const getWsStatusText = () => {
    switch (wsStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  const userInitials = currentUser?.username
    ? currentUser.username.substring(0, 2).toUpperCase()
    : '?';

  return (
    <header className="top-navbar">
      {/* Brand logo & title */}
      <div className="brand-section">
        <div className="brand-logo" aria-hidden="true">
          <MessageSquare size={20} strokeWidth={2.4} />
        </div>
        <div className="brand-title">
          PulseChat
        </div>
      </div>

      {/* Live WebSocket Status Pill */}
      <div className="nav-center">
        <button
          type="button"
          className="ws-status-pill"
          onClick={onReconnectWs}
          title="Click to reconnect WebSocket STOMP"
        >
          <span className={`status-dot ${wsStatus}`} />
          <span>{getWsStatusText()}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="nav-actions">
        {/* Sound Toggle */}
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Message Sounds' : 'Enable Message Sounds'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Current User Profile Chip */}
        {currentUser ? (
          <div
            className="user-profile-chip"
            title={`Logged in as ${currentUser.username} (${currentUser.id})`}
          >
            <div className="avatar sm">{userInitials}</div>
            <div className="user-chip-info">
              <span className="user-chip-name">{currentUser.username}</span>
              <span className="user-chip-id">#{currentUser.id.substring(0, 6)}</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAuth}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            Sign In
          </button>
        )}

        {/* Logout Button */}
        {currentUser && (
          <button
            type="button"
            className="icon-btn"
            onClick={onLogout}
            title="Sign Out"
          >
            <LogOut size={17} />
          </button>
        )}
      </div>
    </header>
  );
}
