FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM nginx:alpine

RUN apk add --no-cache apache2-utils && mkdir -p /app/logs

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["sh", "-c", "/app/docker-entrypoint.sh \"$@\" 2>&1 | rotatelogs -n 10 ${LOG_FILE:-/app/logs/frontend.log} 5M", "--"]
CMD ["nginx", "-g", "daemon off;"]
