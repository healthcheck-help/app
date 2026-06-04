ARG BASE_IMAGE=scratch
ARG BUILDER_FROM_PLATFORM=linux/arm64
ARG DENO_VERSION=2.8.2

FROM --platform=$BUILDER_FROM_PLATFORM ${BASE_IMAGE} AS builder

FROM docker.io/denoland/deno:${DENO_VERSION} AS base
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y git

FROM base AS release
COPY --from=builder /usr/src/app/apps/core/.deno-deploy ./.deno-deploy
COPY --from=builder /usr/src/app/apps/core/.deno-deploy/migrate.js ./migrate.js
COPY --from=builder /usr/src/app/libs/db/src/db/migrations ./db/migrations
COPY --from=builder /usr/src/app/apps/core/scripts/entrypoint.sh ./entrypoint.sh

RUN deno install --node-modules-dir=auto --allow-scripts=npm:libsql npm:libsql \
 && chmod +x ./entrypoint.sh

ENV NODE_ENV=production

EXPOSE 8000/tcp
ENTRYPOINT [ "./entrypoint.sh" ]
