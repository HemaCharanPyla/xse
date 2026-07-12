import { color, style, logoStr, dim, gray, cyan, purple, center, hLine, divider } from './theme.js';

export function showSplash() {
  const width = process.stdout.columns || 80;
  const logoS = logoStr();
  const logoLines = logoS.split('\n');
  const centeredLogo = logoLines.map(l => center(l, width)).join('\n');

  const version = '1.0.0';
  const tagline = 'AI-Powered Browser Automation';

  const titleLine = center(
    style(' X S E  —  ' + version + ' ', color.bold, color.white),
    width
  );
  const taglineLine = center(
    style(' ' + tagline + ' ', color.dim, color.cyan),
    width
  );

  console.log('\n\n');
  console.log(centeredLogo);
  console.log();
  console.log(titleLine);
  console.log(taglineLine);

  const sep = style(hLine(width - 4, '\u2501'), color.darkGray);
  const sepLine = '  ' + sep;
  console.log('\n  ' + sep);
  console.log();
}

const helpHints = [
  `${gray('Type')} ${cyan('your message')} ${gray('to chat with ChatGPT')}`,
  `${gray('Type')} ${cyan('/help')} ${gray('to see all available commands')}`,
  `${gray('Type')} ${cyan('/exit')} ${gray('or press')} ${cyan('Ctrl+C')} ${gray('to quit')}`,
];

export function showWelcome() {
  const width = process.stdout.columns || 80;
  for (const hint of helpHints) {
    console.log('  ' + center(hint, width - 4));
  }
  console.log('\n  ' + style(hLine(width - 4, '\u2501'), color.darkGray));
  console.log();
}
