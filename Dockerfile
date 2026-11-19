FROM node:24-bookworm-slim AS build

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY next.config.ts vite.config.ts postcss.config.mjs tailwind.config.ts tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/
COPY scripts/sync-ffmpeg-core.mjs ./scripts/

ENV GALAXY_BUILD_TARGET=node \
    NEXT_PUBLIC_API_BASE_URL=https://downloader-api.bhwa233.com \
    NEXT_PUBLIC_SITE_URL=http://localhost:3010 \
    NEXT_PUBLIC_SEO_INDEXABLE=false
RUN touch public/sw.js && pnpm build

FROM node:24-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3010
COPY --from=build /app/dist/standalone/ ./
COPY --from=build /app/node_modules/vinext/LICENSE ./node_modules/vinext/LICENSE
COPY LICENSE ./

ARG FFMPEG_CORE_SOURCE_URL
LABEL org.opencontainers.image.source="https://github.com/bhwa233/galaxy-downloader" \
      com.bhwa233.galaxy-downloader.ffmpeg-core.source="${FFMPEG_CORE_SOURCE_URL}"

USER node
EXPOSE 3010
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/robots.txt', { signal: AbortSignal.timeout(3000) }).then(response => { if (!response.ok) process.exitCode = 1 }).catch(() => { process.exitCode = 1 })"]
CMD ["node", "server.js"]
