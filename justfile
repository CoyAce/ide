default: backend frontend caddy
    caddy run --config ./Caddyfile

caddy:
    mkdir -p /var/log/caddy
    curl -o /usr/local/bin/caddy "https://caddyserver.com/api/download?os=linux&arch=amd64" && chmod +x /usr/local/bin/caddy

frontend:
    just frontend/

backend: build_backend
    bazel run //:jetbrains_hacker -- run-server --addr :8080 &

build_backend:
    bazel build //:jetbrains_hacker

