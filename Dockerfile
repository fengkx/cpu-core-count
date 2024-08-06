FROM imbios/bun-node:1-22-debian

COPY --from=denoland/deno:bin-1.45.5 /deno /usr/local/bin/deno
WORKDIR /app
COPY . /app/
