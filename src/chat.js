import {
  color, style, cyan, purple, green, yellow, red, gray, dim, bold,
  sym, timestamp, divider, tag, muted, success, warning
} from './theme.js';

const WIDTH = () => Math.min(process.stdout.columns || 80, 100);

function wrapText(text, maxWidth) {
  if (text.length <= maxWidth) return [text];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxWidth) {
      lines.push(current.trim());
      current = word;
    } else {
      current += ' ' + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

export function renderUserMessage(text) {
  const w = WIDTH() - 6;
  console.log();
  console.log('  ' + style('\u250C' + '\u2500'.repeat(w - 2) + '\u2510', color.cyan));
  const lines = text.split('\n');
  for (const line of lines) {
    const wrapped = wrapText(line, w - 4);
    for (const wl of wrapped) {
      console.log('  ' + style('\u2502 ', color.cyan) + wl + ' '.repeat(Math.max(0, w - 2 - wl.length)) + style(' \u2502', color.cyan));
    }
  }
  console.log('  ' + style('\u2514' + '\u2500'.repeat(w - 2) + '\u2518', color.cyan));
}

export async function renderAssistantMessage(text) {
  const w = WIDTH() - 6;
  const ts = timestamp();
  console.log();
  console.log('  ' + style('\u250C' + '\u2500'.repeat(w - 2) + '\u2510', color.purple));
  console.log('  ' + style('\u2502 ', color.purple) + bold(style(' XSE ', color.purple)) + gray(ts) + ' '.repeat(Math.max(0, w - 2 - 10)) + style(' \u2502', color.purple));
  console.log('  ' + style('\u251C' + '\u2500'.repeat(w - 2) + '\u2524', color.purple));

  const segments = parseMessage(text);
  let codeBlock = null;
  let codeLang = '';

  for (const seg of segments) {
    if (seg.type === 'code') {
      const codeLines = seg.content.split('\n');
      for (const cl of codeLines) {
        console.log('  ' + style('\u2502 ', color.purple) + style('  ' + cl, color.cyan) + ' '.repeat(Math.max(0, w - 4 - cl.length)) + style(' \u2502', color.purple));
      }
    } else {
      const paras = seg.content.split('\n\n');
      for (const para of paras) {
        const lines = para.split('\n');
        for (const line of lines) {
          const wrapped = wrapText(line, w - 4);
          for (const wl of wrapped) {
            console.log('  ' + style('\u2502 ', color.purple) + ' ' + wl + ' '.repeat(Math.max(0, w - 3 - wl.length)) + style(' \u2502', color.purple));
          }
        }
      }
    }
  }
  console.log('  ' + style('\u2514' + '\u2500'.repeat(w - 2) + '\u2518', color.purple));
}

export async function streamAssistantMessage(text) {
  const w = WIDTH() - 6;
  const ts = timestamp();

  const topLine = '  ' + style('\u250C' + '\u2500'.repeat(w - 2) + '\u2510', color.purple);
  const headLine = '  ' + style('\u2502 ', color.purple) + bold(style(' XSE ', color.purple)) + gray(ts) + ' '.repeat(Math.max(0, w - 2 - 10)) + style(' \u2502', color.purple);
  const sepLine = '  ' + style('\u251C' + '\u2500'.repeat(w - 2) + '\u2524', color.purple);

  console.log();
  process.stdout.write(topLine + '\n');
  process.stdout.write(headLine + '\n');
  process.stdout.write(sepLine + '\n');

  const chars = text.split('');
  let currentLine = '';

  const prefix = '  ' + style('\u2502 ', color.purple);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    currentLine += ch;

    if (ch === '\n' || currentLine.length >= w - 5) {
      const lineContent = currentLine.replace('\n', '');
      const padding = ' '.repeat(Math.max(0, w - 3 - lineContent.length));
      process.stdout.write(prefix + ' ' + lineContent + padding + style(' \u2502', color.purple) + '\n');
      currentLine = '';
    } else {
      process.stdout.write(ch);
    }
    if (ch !== '\n' && i % 2 === 0) {
      await new Promise(r => setTimeout(r, 5));
    }
  }

  if (currentLine.length > 0) {
    const padding = ' '.repeat(Math.max(0, w - 3 - currentLine.length));
    process.stdout.write(prefix + ' ' + currentLine + padding + style(' \u2502', color.purple) + '\n');
  }

  const botLine = '  ' + style('\u2514' + '\u2500'.repeat(w - 2) + '\u2518', color.purple);
  process.stdout.write(botLine + '\n');
}

export function renderSystemMessage(text) {
  const w = WIDTH() - 6;
  console.log();
  console.log('  ' + style('\u250C' + '\u2500'.repeat(w - 2) + '\u2510', color.darkGray));
  const lines = text.split('\n');
  for (const line of lines) {
    const wrapped = wrapText(line, w - 4);
    for (const wl of wrapped) {
      console.log('  ' + style('\u2502 ', color.darkGray) + dim(wl) + ' '.repeat(Math.max(0, w - 2 - wl.length)) + style(' \u2502', color.darkGray));
    }
  }
  console.log('  ' + style('\u2514' + '\u2500'.repeat(w - 2) + '\u2518', color.darkGray));
}

export function renderToolMessage(text) {
  const w = WIDTH() - 6;
  console.log();
  console.log('  ' + warning(sym.dash.repeat(w - 2)));
  const lines = text.split('\n');
  for (const line of lines) {
    const wrapped = wrapText(line, w - 4);
    for (const wl of wrapped) {
      console.log('    ' + dim(wl));
    }
  }
  console.log('  ' + warning(sym.dash.repeat(w - 2)));
}

export function renderError(text) {
  const w = WIDTH() - 6;
  console.log('  ' + red(sym.cross + ' ' + text));
}

export function renderSuccess(text) {
  console.log('  ' + green(sym.check + ' ' + text));
}

function parseMessage(text) {
  const segments = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', language: match[1], content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}

export function renderDivider() {
  const w = WIDTH();
  console.log('\n  ' + divider(w - 2));
  console.log();
}
