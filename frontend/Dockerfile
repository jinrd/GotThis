FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG BACKEND_URL=http://gotthis-backend:8080
ENV BACKEND_URL=${BACKEND_URL}
# 공유 미리보기(og:image)의 절대 주소. 빌드할 때 메타데이터에 들어가므로 빌드 단계에서 넣는다.
ARG SITE_URL=https://gotthis.199510280.xyz
ENV SITE_URL=${SITE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p public && npm run build

FROM node:24-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

CMD ["node", "server.js"]
