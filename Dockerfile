FROM node:20-slim

RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates \
    --no-install-recommends && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && apt-get install -y \
    google-chrome-stable \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 xse && \
    mkdir -p /app/cookies && \
    chown -R xse:xse /app

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY bin/ ./bin/
COPY src/ ./src/
COPY index.js ai.js ./

ENV HEADLESS=true
ENV CHROME_PATH=/usr/bin/google-chrome-stable
ENV CHROME_USER_DATA_DIR=/tmp/xse-chrome

USER xse

CMD ["node", "bin/xse.js"]
