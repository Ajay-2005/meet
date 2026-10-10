import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.statusListeners = new Set();
    this.status = 'disconnected'; // 'connected' | 'connecting' | 'disconnected' | 'error'
    this.currentChatSubscription = null;
    this.currentTypingSubscription = null;
    this.userId = null;
  }

  onStatusChange(listener) {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  setStatus(status) {
    this.status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  connect(userId) {
    if (!userId) return;
    this.userId = userId;

    if (this.client && this.client.active) {
      return;
    }

    this.setStatus('connecting');

    const getWsUrl = () => {
      const explicitBase = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL;
      if (explicitBase) {
        return `${explicitBase.replace(/^http/, 'ws')}/ws`;
      }
      return `${window.location.origin}/ws`;
    };

    const wsUrl = getWsUrl();

    this.client = new Client({
      // Provide SockJS fallback factory
      webSocketFactory: () => {
        const sockJsUrl = (import.meta.env.VITE_API_URL || '') + '/ws';
        return new SockJS(sockJsUrl);
      },
      connectHeaders: {
        userId: userId
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {}, // Quiet logs for minimal clean console
      onConnect: () => {
        this.setStatus('connected');
      },
      onStompError: (frame) => {
        console.warn('Broker STOMP error', frame.headers['message']);
        this.setStatus('error');
      },
      onWebSocketClose: () => {
        this.setStatus('disconnected');
      },
      onDisconnect: () => {
        this.setStatus('disconnected');
      }
    });

    try {
      this.client.activate();
    } catch (e) {
      console.error('Failed to activate STOMP client', e);
      this.setStatus('error');
    }
  }

  subscribeToChat(chatId, onMessage, onTyping) {
    this.unsubscribeCurrentChat();

    if (!this.client || !this.client.connected) {
      return;
    }

    try {
      this.currentChatSubscription = this.client.subscribe(
        `/topic/chat/${chatId}`,
        (msg) => {
          try {
            const data = JSON.parse(msg.body);
            if (onMessage) onMessage(data);
          } catch (err) {
            console.error('Failed to parse incoming message', err);
          }
        }
      );

      this.currentTypingSubscription = this.client.subscribe(
        `/topic/chat/${chatId}/typing`,
        (msg) => {
          try {
            const data = JSON.parse(msg.body);
            if (onTyping) onTyping(data);
          } catch (err) {
            console.error('Failed to parse incoming typing event', err);
          }
        }
      );
    } catch (e) {
      console.warn('Subscription error', e);
    }
  }

  unsubscribeCurrentChat() {
    if (this.currentChatSubscription) {
      try {
        this.currentChatSubscription.unsubscribe();
      } catch (_) {}
      this.currentChatSubscription = null;
    }
    if (this.currentTypingSubscription) {
      try {
        this.currentTypingSubscription.unsubscribe();
      } catch (_) {}
      this.currentTypingSubscription = null;
    }
  }

  sendMessage(chatId, senderId, content) {
    if (!this.client || !this.client.connected) {
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/chat/send',
        body: JSON.stringify({
          chatId,
          senderId,
          content
        })
      });
      return true;
    } catch (err) {
      console.error('Failed to publish message via STOMP', err);
      return false;
    }
  }

  sendTyping(chatId, userId, isTyping) {
    if (!this.client || !this.client.connected) return;

    try {
      this.client.publish({
        destination: '/app/typing',
        body: JSON.stringify({
          chatId,
          userId,
          isTyping: isTyping ? 'true' : 'false'
        })
      });
    } catch (_) {}
  }

  disconnect() {
    this.unsubscribeCurrentChat();
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (_) {}
      this.client = null;
    }
    this.setStatus('disconnected');
  }
}

export const wsService = new WebSocketService();
