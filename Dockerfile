FROM node:10-alpine

RUN mkdir -p /cache

WORKDIR /cache

COPY package*.json ./

RUN npm i
RUN npm i -g npm-run-all
RUN npm rebuild grpc --target_libc=musl --target_platform=linux

RUN mkdir -p /app

WORKDIR /app

COPY tsconfig.json ./
COPY . .

ENTRYPOINT ["sh", "/app/.docker/entrypoint.sh"]

EXPOSE 3000
EXPOSE 27017