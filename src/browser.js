import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BrowserManager {
  constructor(config) {
    this.config = config;
    this.chromeProcess = null;
    this.browser = null;
    this.page = null;
    this.initializing = null;
    this._connected = false;
    this._busy = false;
  }

  get connected() {
    return this._connected && this.browser?.connected;
  }

  get busy() {
    return this._busy;
  }

  getStatus() {
    return {
      connected: this.connected,
      chromeRunning: this.chromeProcess !== null && !this.chromeProcess.killed,
      pageCount: this.page ? 1 : 0,
      busy: this._busy,
    };
  }

  resolveChromePath() {
    if (this.config.CHROME_PATH) return this.config.CHROME_PATH;

    const candidatesByPlatform = {
      win32: [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      ],
      darwin: [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ],
      linux: [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
      ],
    };

    const candidates = candidatesByPlatform[process.platform] || candidatesByPlatform.linux;
    return candidates.find(c => existsSync(c)) || candidates[0];
  }

  startChrome() {
    if (this.chromeProcess && !this.chromeProcess.killed) return;

    const chromePath = this.resolveChromePath();
    const userDataDir = this.config.CHROME_USER_DATA_DIR || path.join(process.cwd(), '.chrome-debug');
    const debugPort = this.config.CHROME_DEBUG_PORT || '9222';
    const headless = this.config.HEADLESS !== 'false' ? '--headless=new' : '';

    const args = [
      `--remote-debugging-port=${debugPort}`,
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
      `--user-data-dir=${userDataDir}`,
    ];

    if (headless) args.unshift(headless);

    this.chromeProcess = spawn(chromePath, args, {
      detached: true,
      stdio: 'ignore',
    });

    this.chromeProcess.unref();

    this.chromeProcess.on('exit', () => {
      this.chromeProcess = null;
      this._connected = false;
    });
  }

  async init() {
    if (this.connected) return this.browser;
    if (this.initializing) return this.initializing;

    this.initializing = (async () => {
      const debugPort = this.config.CHROME_DEBUG_PORT || '9222';
      const url = `http://127.0.0.1:${debugPort}`;

      try {
        this.browser = await puppeteer.connect({ browserURL: url, defaultViewport: null });
      } catch (_) {
        this.startChrome();
        await sleep(5000);
        this.browser = await puppeteer.connect({ browserURL: url, defaultViewport: null });
      }

      this._connected = true;

      this.browser.on('disconnected', () => {
        this._connected = false;
        this.browser = null;
        this.page = null;
      });

      return this.browser;
    })();

    try {
      return await this.initializing;
    } finally {
      this.initializing = null;
    }
  }

  loadCookies() {
    const json = process.env.COOKIES_JSON;
    if (json) return JSON.parse(json);

    const paths = [
      this.config.COOKIES_PATH,
      path.join(process.cwd(), 'cookies', 'chatgpt.json'),
      path.join(__dirname, '..', 'cookies', 'chatgpt.json'),
    ].filter(Boolean);

    for (const p of paths) {
      if (existsSync(p)) {
        return JSON.parse(readFileSync(p, 'utf-8'));
      }
    }

    throw new Error(
      `Cookies not found. Set COOKIES_PATH, COOKIES_JSON env, or place file at:\n` +
      `  - ${paths[1]}\n  - ${paths[2]}`
    );
  }

  async preparePage(page) {
    const cookies = this.loadCookies();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
    );

    await page.goto('https://chatgpt.com/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await page.setCookie(...cookies);

    await page.reload({
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await page.waitForSelector('#prompt-textarea', {
      visible: true,
      timeout: 60000,
    });
  }

  async ensurePage() {
    if (this.page && !this.page.isClosed()) return this.page;

    await this.init();
    const pages = await this.browser.pages();
    this.page = pages[0] || await this.browser.newPage();
    await this.preparePage(this.page);
    return this.page;
  }

  async sendMessage(text) {
    await this.ensurePage();
    this._busy = true;

    try {
      const previousCount = await this.page.evaluate(() =>
        document.querySelectorAll('[data-message-author-role="assistant"]').length
      );

      await this.page.click('#prompt-textarea');

      await this.page.evaluate(() => {
        const el = document.querySelector('#prompt-textarea');
        if (el) el.innerText = '';
      });

      await this.page.keyboard.type(text, { delay: 15 });

      await this.page.waitForFunction(() => {
        const btn = document.querySelector('#composer-submit-button');
        return btn && !btn.disabled;
      }, { timeout: 10000 });

      await this.page.click('#composer-submit-button');

      const response = await this.waitForResponse(previousCount);
      return response;
    } finally {
      this._busy = false;
    }
  }

  async waitForResponse(previousCount) {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    await this.page.waitForFunction(
      (count) =>
        document.querySelectorAll('[data-message-author-role="assistant"]').length > count,
      { timeout: 120000 },
      previousCount
    );

    await this.page.waitForFunction(() => {
      const stopButton =
        document.querySelector('[data-testid="stop-button"]') ||
        document.querySelector('button[aria-label*="Stop"]');
      return !stopButton;
    }, { timeout: 180000 });

    await sleep(1000);

    return this.page.evaluate(() => {
      const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
      return messages[messages.length - 1]?.innerText || 'No response found';
    });
  }

  async shutdown() {
    this._busy = true;
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close().catch(() => {});
      }
      this.page = null;

      if (this.browser?.connected) {
        await this.browser.close().catch(() => {});
      }
      this.browser = null;
      this._connected = false;
    } finally {
      this._busy = false;
    }
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
