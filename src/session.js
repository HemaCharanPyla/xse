export class SessionManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.history = [];
    this.startedAt = new Date();
    this.sessionId = this.generateId();
    this.currentModel = 'ChatGPT (via browser)';
  }

  generateId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'xse-';
    for (let i = 0; i < 8; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  addEntry(role, content) {
    this.history.push({
      role,
      content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    });
  }

  getHistory() {
    return this.history;
  }

  getInfo() {
    const now = new Date();
    const diff = now - this.startedAt;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const duration = minutes > 0
      ? `${minutes}m ${seconds}s`
      : `${seconds}s`;

    return {
      sessionId: this.sessionId,
      startedAt: this.startedAt.toLocaleTimeString('en-US', { hour12: false }),
      messageCount: this.history.length,
      duration,
    };
  }
}
