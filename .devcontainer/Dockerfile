FROM mcr.microsoft.com/devcontainers/typescript-node:24-trixie
COPY .tool-versions /tmp/.tool-versions
RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s "v$(awk '/^deno/{print $2}' /tmp/.tool-versions)" && \
    rm /tmp/.tool-versions
RUN sudo apt-get update && sudo apt-get install -y \
    libxss1 \
    ripgrep \
    && sudo rm -rf /var/lib/apt/lists/*
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx playwright install-deps && npx playwright install chromium
