FROM node:10

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm i
RUN npm i -g npm-run-all
RUN npm rebuild grpc --target_libc=musl --target_platform=linux

COPY . .

ENTRYPOINT ["sh", "/app/.docker/entrypoint.sh"]

EXPOSE 3000
EXPOSE 27017