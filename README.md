# XSE

**AI-Powered Browser Automation CLI**

Chat with ChatGPT directly from your terminal via browser automation. XSE launches a headless Chrome instance, connects to ChatGPT, and gives you a polished interactive CLI experience.

```bash
npx github:HemaCharanPyla/xse
```

## Quick Start

### 1. Install Chrome

Make sure Google Chrome is installed. XSE uses your existing Chrome — no extra browser download.

### 2. Export ChatGPT Cookies

XSE needs your ChatGPT session cookies to authenticate.

- Install a cookie export extension (e.g. **EditThisCookie** or **Get cookies.txt**)
- Log in to `https://chatgpt.com/` in Chrome
- Export cookies as **JSON** (Puppeteer-compatible format)
- Save the file as `cookies/chatgpt.json`

### 3. Run

Open a terminal in the **same folder** as your `cookies/chatgpt.json` and run:

```bash
npx github:HemaCharanPyla/xse
```

That's it. The CLI will:
1. Show the XSE splash screen
2. Auto-connect to Chrome and ChatGPT
3. Present a prompt — start chatting

## Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `/help` | `/h` `/?` | Show all commands |
| `/new` | `/n` | Start a fresh session |
| `/clear` | `/c` | Clear the terminal |
| `/exit` | `/q` `/x` | Quit XSE |
| `/history` | `/hist` | View message history |
| `/model` | `/m` | Show active model |
| `/browser` | `/b` | Browser automation status |
| `/session` | `/ss` `/sess` | Session info |
| `/config` | `/cfg` | Configuration summary |
| `/logs` | `/log` | Recent events |
| `/splash` | — | Replay the splash screen |

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CHROME_PATH` | Auto-detect | Chrome executable location |
| `CHROME_DEBUG_PORT` | `9222` | Remote debugging port |
| `CHROME_USER_DATA_DIR` | `./.chrome-debug` | Chrome profile directory |
| `COOKIES_PATH` | `./cookies/chatgpt.json` | Path to cookie file |
| `HEADLESS` | `true` | Run Chrome headless |
| `XSE_AUTO_INIT` | `true` | Auto-connect on startup |

### PowerShell

```powershell
$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
$env:HEADLESS="true"
npx github:HemaCharanPyla/xse
```

### macOS / Linux

```bash
CHROME_PATH=/usr/bin/google-chrome npx github:HemaCharanPyla/xse
```

## Install Locally

```bash
git clone https://github.com/HemaCharanPyla/xse.git
cd xse
npm install
npm start
```

## Features

- **Terminal chat** — full interactive ChatGPT session from the command line
- **Polished UI** — box-drawn messages, color-coded output, streaming text, animated spinners
- **Smart rendering** — code blocks, multi-line responses, typewriter-style output
- **Session tracking** — message history, timestamps, session duration
- **Zero bloat** — uses your existing Chrome (puppeteer-core, no Chromium download)

## Architecture

```
xse/
├── bin/xse.js         # CLI entry point
├── src/
│   ├── cli.js         # Main loop, input, orchestration
│   ├── theme.js       # Colors, styles, box drawing, XSE logo
│   ├── splash.js      # Branding splash screen
│   ├── chat.js        # Message rendering, code blocks, streaming
│   ├── commands.js    # Command system (11 commands + aliases)
│   ├── browser.js     # Chrome/Puppeteer automation
│   └── session.js     # History, state, timing
├── index.js           # Express REST API (legacy)
└── ai.js              # Original CLI script (legacy)
```

## Troubleshooting

**"Cookies file not found"**
Run the command from the folder that contains `cookies/chatgpt.json`, or set `COOKIES_PATH` to the full path.

**"Failed to connect to Chrome"**
Make sure Chrome is installed. If Chrome is already running, XSE will connect to it automatically. Set `CHROME_PATH` if auto-detection fails.

**"Waiting failed" timeout**
ChatGPT may be slow to respond. If it times out, ChatGPT's page selectors might have changed — check for ChatGPT UI updates.

## Docker (24/7)

XSE runs perfectly in Docker — no local Node.js or Chrome needed.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- `cookies/chatgpt.json` in your project folder

### Build & Run

```bash
# Build the image
docker compose build

# Run interactively
docker compose run --rm xse

# Or run in background (24/7 mode)
docker compose up -d
docker attach xse    # attach to interact
```

### One-liner (no clone needed)

```bash
docker run -it --rm \
  -v "%cd%/cookies:/app/cookies:ro" \
  ghcr.io/HemaCharanPyla/xse
```

The container auto-starts Chrome headless and connects to ChatGPT. Stop with `Ctrl+C` or `docker compose down`.

## API Server

XSE also includes a standalone Express REST API (the original backend):

```bash
npm run api
```

## License

ISC
