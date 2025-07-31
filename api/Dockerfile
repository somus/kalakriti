FROM oven/bun:alpine

USER bun
WORKDIR /app

ENV NODE_ENV="production"

FROM base as build

COPY --link bun.lock package.json ./
RUN bun install --lockfile-only

RUN bun run prod:api:build

COPY . .

FROM base

COPY --from=build /app /app

ARG PORT
EXPOSE ${PORT:-3000}

CMD ["bun", "run", "prod:api"]
