# XSE

**AI-Powered Browser Automation CLI**

Chat with ChatGPT directly from your terminal via browser automation. XSE launches a headless Chrome instance, connects to ChatGPT, and gives you a polished interactive CLI experience.

```bash
npx xse
```

## Features

- **Terminal chat** — full interactive session with ChatGPT from the command line
- **Polished UI** — box-drawn messages, color-coded output, streaming text, spinners
- **Command system** — `/help`, `/new`, `/clear`, `/history`, `/browser`, `/session`, `/config`, and more
- **Session management** — message history, timing, session tracking
- **Automation backend** — Puppeteer-driven headless Chrome
- **API server** — Express REST API (start with `npm run api`)

## Requirements

- **Node.js 18+**
- **Google Chrome** installed
- **ChatGPT cookies** exported to `cookies/chatgpt.json`

### Getting Cookies

1. Install a cookie export extension (e.g. "EditThisCookie" or similar)
2. Log into `https://chatgpt.com/`
3. Export cookies as JSON (Puppeteer-compatible format)
4. Save to `cookies/chatgpt.json`

## Install & Run

```bash
# Run directly without install
npx xse

# Or install globally
npm install -g xse
xse

# Or clone and run locally
git clone <repo-url>
cd xse
npm install
npm start
```

## Usage

```
  ❯ what is the meaning of life?

  ┌─────────────────────────────────────┐
  │ You                       14:30:01  │
  ├─────────────────────────────────────┤
  │ What is the meaning of life?        │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ XSE                        14:30:05 │
  ├─────────────────────────────────────┤
  │ That's a profound question...       │
  └─────────────────────────────────────┘
```

### Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `/help` | `/h` `/?` | Show available commands |
| `/new` | `/n` | Start a fresh session |
| `/clear` | `/c` | Clear terminal |
| `/exit` | `/q` `/x` | Quit XSE |
| `/history` | `/hist` | Show message history |
| `/model` | `/m` | View active model |
| `/browser` | `/b` | Browser automation status |
| `/session` | `/ss` `/sess` | Session information |
| `/config` | `/cfg` | Configuration summary |
| `/logs` | `/log` | Recent events |
| `/splash` | — | Show XSE branding |

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CHROME_PATH` | Auto-detect | Chrome executable path |
| `CHROME_DEBUG_PORT` | `9222` | Remote debugging port |
| `CHROME_USER_DATA_DIR` | `./.chrome-debug` | Chrome profile directory |
| `COOKIES_PATH` | `./cookies/chatgpt.json` | Cookie file |
| `HEADLESS` | `true` | Run Chrome headless |
| `XSE_AUTO_INIT` | `true` | Auto-connect on startup |

### PowerShell Example

```powershell
$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
$env:HEADLESS="true"
npx xse
```

## Architecture

```
xse/
├── bin/xse.js         # CLI entry point
├── src/
│   ├── cli.js         # Main loop, input, orchestration
│   ├── theme.js       # Colors, styles, box drawing, logo
│   ├── splash.js      # Branding splash screen
│   ├── chat.js        # Message rendering, code blocks
│   ├── commands.js    # Command system (12 commands)
│   ├── browser.js     # Chrome/Puppeteer automation
│   └── session.js     # History, state, timing
├── index.js           # Express API server (optional)
└── ai.js              # Original CLI script (legacy)
```

## API Server

XSE includes a standalone Express REST API:

```bash
npm run api
```

See `index.js` for endpoint documentation.

## License

ISC
