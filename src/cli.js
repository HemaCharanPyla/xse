import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { color, style, cyan, purple, green, yellow, red, gray, dim, bold, sym, timestamp, divider, tag } from './theme.js';
import { showSplash, showWelcome } from './splash.js';
import { renderUserMessage, renderAssistantMessage, streamAssistantMessage, renderSystemMessage, renderToolMessage, renderError, renderSuccess, renderDivider } from './chat.js';
import { parseCommand, executeCommand, getCommandList } from './commands.js';
import { BrowserManager } from './browser.js';
import { SessionManager } from './session.js';

class Logger {
  constructor() {
    this.entries = [];
  }

  log(message) {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.entries.push({ level: 'info', timestamp: ts, message });
  }

  warn(message) {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.entries.push({ level: 'warn', timestamp: ts, message });
  }

  error(message) {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.entries.push({ level: 'error', timestamp: ts, message });
  }

  getEntries(count = 10) {
    return this.entries.slice(-count);
  }
}

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[0f');
}

function getConfig() {
  return {
    CHROME_PATH: process.env.CHROME_PATH || '',
    CHROME_DEBUG_PORT: process.env.CHROME_DEBUG_PORT || '9222',
    CHROME_USER_DATA_DIR: process.env.CHROME_USER_DATA_DIR || '',
    COOKIES_PATH: process.env.COOKIES_PATH || '',
    HEADLESS: process.env.HEADLESS || 'true',
    AUTO_INIT: process.env.XSE_AUTO_INIT || 'true',
  };
}

async function spinner(message) {
  const frames = ['\u25D0', '\u25D3', '\u25D1', '\u25D2'];
  let i = 0;
  let stopped = false;
  const interval = setInterval(() => {
    if (!stopped) {
      process.stdout.write('\r  ' + cyan(frames[i]) + ' ' + message);
      i = (i + 1) % frames.length;
    }
  }, 120);
  const finish = (success) => {
    if (stopped) return;
    stopped = true;
    clearInterval(interval);
    const icon = success ? green('\u2713') : red('\u2717');
    process.stdout.write('\r  ' + icon + ' ' + message + '\n');
  };
  return finish;
}

export async function run() {
  const config = getConfig();
  const logger = new Logger();
  const sessionManager = new SessionManager();
  const browserManager = new BrowserManager(config);

  let running = true;
  let rl;

  const context = {
    sessionManager,
    browserManager,
    config,
    logger,
    exitCallback: () => { running = false; },
    clearCallback: () => clearScreen(),
  };

  clearScreen();
  showSplash();
  showWelcome();
  renderSystemMessage('Initializing XSE...');

  if (config.AUTO_INIT === 'true') {
    try {
      const done = await spinner('Launching browser engine...');
      try {
        await browserManager.init();
      } catch (e) {
        done(false);
        throw e;
      }
      done(true);

      const done2 = await spinner('Connecting to ChatGPT...');
      try {
        await browserManager.ensurePage();
      } catch (e) {
        done2(false);
        throw e;
      }
      done2(true);

      renderSuccess('Session ready');
      renderDivider();
    } catch (err) {
      renderError('Browser initialization failed: ' + err.message);
      renderToolMessage('XSE will start in limited mode. Some commands may not work.\nCheck cookies and Chrome path, then try /browser to retry.');
      renderDivider();
    }
  } else {
    renderSystemMessage('Auto-init disabled. Use /browser to start manually.');
    renderDivider();
  }

  rl = readline.createInterface({
    input,
    output,
    prompt: '',
  });

  rl.on('SIGINT', () => {
    console.log();
    renderSystemMessage('Shutting down XSE...');
    running = false;
    rl.close();
  });

  const promptStr = '\n  ' + cyan(sym.prompt + ' ');

  while (running) {
    let input;
    try {
      input = await rl.question(promptStr);
    } catch {
      break;
    }

    const trimmed = input.trim();

    if (!trimmed) continue;

    const cmd = parseCommand(trimmed);

    if (cmd) {
      if (cmd.name === 'exit') {
        executeCommand(cmd, context);
        break;
      }
      executeCommand(cmd, context);
      continue;
    }

    sessionManager.addEntry('user', trimmed);
    renderUserMessage(trimmed);

    try {
      process.stdout.write('\n  ' + yellow(sym.quadBlock) + dim(' Sending message to ChatGPT...') + '\n');

      const response = await browserManager.sendMessage(trimmed);
      sessionManager.addEntry('assistant', response);

      process.stdout.write('\x1b[1A\x1b[2K');
      process.stdout.write('\x1b[1A\x1b[2K');

      await renderAssistantMessage(response);
    } catch (err) {
      process.stdout.write('\x1b[1A\x1b[2K');
      process.stdout.write('\x1b[1A\x1b[2K');
      renderError('Failed: ' + err.message);
      renderToolMessage('Check browser connection with /browser and try again.');
    }

    renderDivider();
  }

  renderSystemMessage('Cleaning up browser resources...');
  await browserManager.shutdown().catch(() => {});
  renderSuccess('XSE shut down successfully');
  console.log();

  rl.close();
  process.exit(0);
}
