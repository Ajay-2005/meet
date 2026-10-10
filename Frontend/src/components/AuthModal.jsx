import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      showToast('Please enter both username and password', 'error');
      return;
    }

    setIsLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await api.login(u, p);
        showToast(`Welcome back, ${res.username || u}!`, 'success');
      } else {
        res = await api.register(u, p);
        showToast(`Account created! Welcome, ${res.username || u}!`, 'success');
      }

      onLoginSuccess({
        id: res.id,
        username: res.username || u
      });
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (name, pass) => {
    setUsername(name);
    setPassword(pass);
    showToast(`Autofilled demo account "${name}"`, 'info', 1400);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <MessageSquare size={26} strokeWidth={2.4} />
          </div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome to PulseChat' : 'Create an Account'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to begin real-time messaging'
              : 'Register your username to start connecting'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Create Account
          </button>
        </div>

        {/* Quick Fill Pills for Demoing */}
        <div className="auth-quick-pills">
          <span>Demo Accounts:</span>
          <button
            type="button"
            className="quick-user-btn"
            onClick={() => handleQuickFill('alice', 'password123')}
          >
            Alice
          </button>
          <button
            type="button"
            className="quick-user-btn"
            onClick={() => handleQuickFill('bob', 'password123')}
          >
            Bob
          </button>
          <button
            type="button"
            className="quick-user-btn"
            onClick={() => handleQuickFill('charlie', 'password123')}
          >
            Charlie
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 20px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-username">
              Username
            </label>
            <input
              id="auth-username"
              type="text"
              className="form-input"
              placeholder="e.g. alex_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px' }}
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
