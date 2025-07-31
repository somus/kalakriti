FROM oven/bun:alpine

USER bun
WORKDIR /app

COPY . .

RUN bun install --lockfile-only

RUN bun run prod:api:build

ARG PORT
EXPOSE ${PORT:-3000}

CMD ["bun", "run", "prod:api"]
