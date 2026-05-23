FROM mcr.microsoft.com/devcontainers/typescript-node:24-trixie
RUN sudo apt-get update && sudo apt-get install -y \
    libxss1 \
    ripgrep \
    && sudo rm -rf /var/lib/apt/lists/*
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx playwright install-deps && npx playwright install chromium
