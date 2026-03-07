FROM golang:latest
LABEL authors="LovesAsuna"

WORKDIR /usr/src/jetbrains_hacker

COPY . .

RUN apt-get update \
  && apt-get install -y wget curl unzip

RUN curl -fsSL "https://github.com/bazelbuild/bazelisk/releases/latest/download/bazelisk-linux-amd64" -o /usr/local/bin/bazel \
  && chmod +x /usr/local/bin/bazel

RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin
CMD ["just"]