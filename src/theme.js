const is256 = process.env.COLORTERM === 'truecolor' || process.env.COLORTERM === '24bit' || process.env.TERM_PROGRAM === 'iTerm.app';
const esc = (n) => `\x1b[${n}m`;
const c = (n) => `\x1b[38;5;${n}m`;
const bg = (n) => `\x1b[48;5;${n}m`;

export const color = {
  reset: esc(0),
  bold: esc(1),
  dim: esc(2),
  italic: esc(3),
  underline: esc(4),
  reverse: esc(7),

  cyan: c(51),
  purple: c(129),
  green: c(46),
  yellow: c(220),
  red: c(196),
  blue: c(33),
  gray: c(245),
  darkGray: c(240),
  white: c(255),
  black: c(0),
  orange: c(208),

  bgDark: bg(236),
  bgDarker: bg(235),
  bgBlack: bg(0),
};

export const sym = {
  arrow: '\u2192',
  bullet: '\u25CF',
  dimBullet: '\u25CB',
  prompt: '\u276F',
  check: '\u2713',
  cross: '\u2717',
  line: '\u2500',
  dash: '\u2501',
  cornerTL: '\u250C',
  cornerTR: '\u2510',
  cornerBL: '\u2514',
  cornerBR: '\u2518',
  hLine: '\u2500',
  vLine: '\u2502',
  tRight: '\u251C',
  tLeft: '\u2524',
  tDown: '\u252C',
  tUp: '\u2534',
  crossH: '\u253C',
  block: '\u2588',
  halfBlock: '\u258C',
  quadBlock: '\u2591',
  ellipsis: '\u2026',
};

export function style(text, ...codes) {
  return codes.join('') + text + color.reset;
}

export function cyan(text) {
  return style(text, color.cyan);
}

export function purple(text) {
  return style(text, color.purple);
}

export function green(text) {
  return style(text, color.green);
}

export function yellow(text) {
  return style(text, color.yellow);
}

export function red(text) {
  return style(text, color.red);
}

export function gray(text) {
  return style(text, color.gray);
}

export function dim(text) {
  return style(text, color.dim);
}

export function bold(text) {
  return style(text, color.bold);
}

export function header(text) {
  return style(text, color.bold, color.white);
}

export function muted(text) {
  return style(text, color.dim, color.gray);
}

export function success(text) {
  return style(` ${sym.check} ${text}`, color.green);
}

export function error(text) {
  return style(` ${sym.cross} ${text}`, color.red);
}

export function info(text) {
  return style(` ${sym.bullet} ${text}`, color.cyan);
}

export function warning(text) {
  return style(` ${sym.bullet} ${text}`, color.yellow);
}

export function center(text, width) {
  const pad = Math.max(0, width - text.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

export function hLine(width, char = sym.hLine) {
  return char.repeat(width);
}

export function boxed(text, opts = {}) {
  const {
    width = 60,
    padding = 1,
    borderColor = color.cyan,
    textColor = color.white,
  } = opts;
  const innerWidth = width - 2 * (padding + 1);
  const lines = text.split('\n');
  const result = [];
  const tl = style(sym.cornerTL + hLine(innerWidth + 2 * padding, sym.hLine) + sym.cornerTR, borderColor);
  const bl = style(sym.cornerBL + hLine(innerWidth + 2 * padding, sym.hLine) + sym.cornerBR, borderColor);
  const vl = style(sym.vLine, borderColor);

  result.push(tl);
  if (padding > 0) {
    result.push(vl + ' '.repeat(innerWidth + 2 * padding) + vl);
  }
  for (const line of lines) {
    const padStr = ' '.repeat(padding);
    const content = (line + ' '.repeat(innerWidth)).slice(0, innerWidth);
    result.push(vl + padStr + style(content, textColor) + padStr + vl);
  }
  if (padding > 0) {
    result.push(vl + ' '.repeat(innerWidth + 2 * padding) + vl);
  }
  result.push(bl);
  return result.join('\n');
}

export function divider(width, opts = {}) {
  const { char = sym.dash, color: dividerColor = color.darkGray } = opts;
  return style(char.repeat(width), dividerColor);
}

export function tag(text, bgColor = color.bgDark, textColor = color.cyan) {
  return style(` ${text} `, bgColor, textColor);
}

export function timestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
}

export const logo = [
  `${color.cyan}╔══╗ ${color.purple}╔═╗ ${color.cyan}╔══╗${color.reset}`,
  `${color.cyan}║  ║ ${color.purple}║   ${color.cyan}║${color.reset}  `,
  `${color.cyan}╠══╣ ${color.purple}╠═╣ ${color.cyan}╠══╣${color.reset}`,
  `${color.cyan}║  ║ ${color.purple}  ║ ${color.cyan}║${color.reset}  `,
  `${color.cyan}╚══╝ ${color.purple}╚═╝ ${color.cyan}╚══╝${color.reset}`,
];

export function logoStr() {
  return logo.join('\n');
}
