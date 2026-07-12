import {
  color, style, cyan, purple, green, yellow, red, gray, dim, bold,
  sym, center, hLine, divider, tag, muted, logoStr, logo
} from './theme.js';
import { showSplash } from './splash.js';
import { renderSystemMessage, renderError, renderSuccess } from './chat.js';

const COMMANDS = {
  help: {
    description: 'Show available commands',
    usage: '/help [command]',
  },
  new: {
    description: 'Start a fresh chat session',
    usage: '/new',
  },
  clear: {
    description: 'Clear the terminal output',
    usage: '/clear',
  },
  exit: {
    description: 'Quit XSE',
    usage: '/exit',
  },
  history: {
    description: 'Show recent message history',
    usage: '/history [count]',
  },
  model: {
    description: 'View or switch the active model',
    usage: '/model [model-name]',
  },
  browser: {
    description: 'Show browser automation status',
    usage: '/browser',
  },
  session: {
    description: 'Show current session information',
    usage: '/session',
  },
  config: {
    description: 'Show configuration summary',
    usage: '/config',
  },
  logs: {
    description: 'Show recent events and logs',
    usage: '/logs [count]',
  },
  splash: {
    description: 'Show the XSE splash screen',
    usage: '/splash',
  },
};

const ALIASES = {
  '?': 'help',
  'h': 'help',
  'n': 'new',
  'c': 'clear',
  'q': 'exit',
  'x': 'exit',
  'hist': 'history',
  'm': 'model',
  'b': 'browser',
  'ss': 'session',
  'sess': 'session',
  'cfg': 'config',
  'log': 'logs',
};

export function parseCommand(input) {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return null;
  const parts = trimmed.slice(1).split(/\s+/);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);
  const resolved = ALIASES[name] || name;
  if (COMMANDS[resolved]) {
    return { name: resolved, args };
  }
  return { name, args, unknown: true };
}

function showHelp(command) {
  const w = process.stdout.columns || 80;

  if (command && COMMANDS[command]) {
    const cmd = COMMANDS[command];
    console.log();
    console.log(`  ${bold(cyan('/' + command))}`);
    console.log(`  ${dim(cmd.description)}`);
    console.log(`  ${gray('Usage:')} ${cyan(cmd.usage)}`);
    console.log();
    return;
  }

  console.log();
  console.log(`  ${bold('XSE Commands')}`);
  console.log(`  ${dim('─'.repeat(40))}`);

  const entries = Object.entries(COMMANDS);
  const cmdWidth = 14;
  for (const [name, cmd] of entries) {
    const cmdStr = cyan('/' + name.padEnd(cmdWidth - 1));
    console.log(`  ${cmdStr} ${gray(cmd.description)}`);
  }

  console.log(`  ${dim('─'.repeat(40))}`);
  console.log(`  ${gray('Aliases:')} ${cyan('/? /h /n /c /q /x /hist /m /b /ss /cfg /log')}`);
  console.log(`  ${gray('Tip:')} ${cyan('/help <command>')} ${gray('for details on a specific command')}`);
  console.log();
}

function showHistory(sessionManager) {
  const history = sessionManager.getHistory();
  if (history.length === 0) {
    renderSystemMessage('No messages in this session yet.');
    return;
  }
  console.log();
  console.log(`  ${bold('Session History')}`);
  console.log(`  ${dim('─'.repeat(40))}`);
  for (const entry of history) {
    const icon = entry.role === 'user' ? cyan(sym.prompt) : purple('\u25C8');
    const role = entry.role === 'user' ? cyan('You') : purple('XSE');
    const preview = entry.content.slice(0, 60) + (entry.content.length > 60 ? '...' : '');
    console.log(`  ${icon} ${role} ${gray(entry.timestamp)}`);
    console.log(`    ${dim(preview)}`);
  }
  console.log();
}

function showModel(currentModel) {
  console.log();
  console.log(`  ${bold('Active Model')}`);
  console.log(`  ${dim('─'.repeat(40))}`);
  console.log(`  ${cyan('\u25C9')} ${currentModel || 'ChatGPT (via browser)'}`);
  console.log(`  ${gray('Models are managed through the ChatGPT interface.')}`);
  console.log();
}

function showBrowserStatus(browserManager) {
  const status = browserManager.getStatus();
  console.log();
  console.log(`  ${bold('Browser Status')}`);
  console.log(`  ${dim('─'.repeat(40))}`);
  const connectedIcon = status.connected ? green('\u25C9') : red('\u25CB');
  console.log(`  ${connectedIcon} ${gray('Connected:')} ${status.connected ? green('Yes') : red('No')}`);
  console.log(`  ${cyan('\u25C9')} ${gray('Chrome:')} ${status.chromeRunning ? green('Running') : red('Stopped')}`);
  console.log(`  ${cyan('\u25C9')} ${gray('Pages:')} ${status.pageCount}`);
  console.log(`  ${cyan('\u25C9')} ${gray('Busy:')} ${status.busy ? yellow('Yes') : green('No')}`);
  if (status.sessionCount !== undefined) {
    console.log(`  ${cyan('\u25C9')} ${gray('Sessions:')} ${status.sessionCount}`);
  }
  console.log();
}

function showSession(sessionManager) {
  const info = sessionManager.getInfo();
  console.log();
  console.log(`  ${bold('Session Info')}`);
  console.log(`  ${dim('─'.repeat(40))}`);
  console.log(`  ${cyan('\u25C9')} ${gray('Status:')} ${green('Active')}`);
  console.log(`  ${cyan('\u25C9')} ${gray('Messages:')} ${info.messageCount}`);
  console.log(`  ${cyan('\u25C9')} ${gray('Started:')} ${info.startedAt || 'N/A'}`);
  console.log(`  ${cyan('\u25C9')} ${gray('Duration:')} ${info.duration || 'N/A'}`);
  console.log(`  ${cyan('\u25C9')} ${gray('Session ID:')} ${dim(info.sessionId || 'N/A')}`);
  console.log();
}

function showConfig(config) {
  console.log();
  console.log(`  ${bold('Configuration')}`);
  console.log(`  ${dim('─'.repeat(40))}`);
  const entries = [
    ['Chrome Path', config.CHROME_PATH || 'Auto-detected'],
    ['Debug Port', config.CHROME_DEBUG_PORT || '9222'],
    ['Cookies Path', config.COOKIES_PATH],
    ['Headless', config.HEADLESS !== 'false' ? 'Yes' : 'No'],
    ['Auto-init', config.AUTO_INIT !== 'false' ? 'Yes' : 'No'],
  ];
  for (const [key, val] of entries) {
    console.log(`  ${cyan('\u25C9')} ${gray(key + ':')} ${val}`);
  }
  console.log();
}

function showLogs(logger, count) {
  const num = Math.min(Math.max(1, parseInt(count) || 10), 50);
  const entries = logger.getEntries(num);
  if (entries.length === 0) {
    renderSystemMessage('No log entries available.');
    return;
  }
  console.log();
  console.log(`  ${bold('Recent Events')}`);
  console.log(`  ${dim('─'.repeat(40))}`);
  for (const entry of entries) {
    const icon = entry.level === 'error' ? red(sym.cross)
      : entry.level === 'warn' ? yellow(sym.bullet)
      : gray(sym.dimBullet);
    console.log(`  ${icon} ${gray(entry.timestamp)} ${entry.message}`);
  }
  console.log();
}

export function executeCommand(command, context) {
  const { name, args, unknown } = command;
  const { sessionManager, browserManager, config, logger, exitCallback, clearCallback } = context;

  if (unknown) {
    renderError(`Unknown command: /${name}. Type /help for available commands.`);
    return;
  }

  switch (name) {
    case 'help':
      showHelp(args[0]);
      break;
    case 'new':
      logger.log('Starting new session...');
      sessionManager.reset();
      renderSuccess('New session started');
      break;
    case 'clear':
      if (clearCallback) clearCallback();
      break;
    case 'exit':
      renderSystemMessage('Shutting down XSE...');
      if (exitCallback) exitCallback();
      break;
    case 'history':
      showHistory(sessionManager);
      break;
    case 'model':
      showModel(sessionManager.currentModel);
      break;
    case 'browser':
      showBrowserStatus(browserManager);
      break;
    case 'session':
      showSession(sessionManager);
      break;
    case 'config':
      showConfig(config);
      break;
    case 'logs':
      showLogs(logger, args[0]);
      break;
    case 'splash':
      showSplash();
      break;
    default:
      renderError(`Unknown command: /${name}`);
  }
}

export function getCommandList() {
  return Object.keys(COMMANDS).map(k => '/' + k);
}
