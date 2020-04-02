FROM node:12.16

RUN apt-get update \
	&& apt-get install ffmpeg -y 

# RUN apt -y install software-properties-common dirmngr apt-transport-https lsb-release ca-certificates

# RUN add-apt-repository ppa:chris-lea/redis-server && apt-get update \
# 	&& apt-get install redis-server -y --no-install-recommends

RUN apt-get update && apt-get upgrade && apt-get install -y --no-install-recommends build-essential tcl apt-utils

RUN wget http://download.redis.io/redis-stable.tar.gz \
&& tar xvzf redis-stable.tar.gz \
&& cd redis-stable \
&& make && make install && cd utils/ && bash install_server.sh

WORKDIR /app

COPY ./package.json ./converter_bot/package.json
COPY ./package-lock.json ./converter_bot/package-lock.json

WORKDIR /app/converter_bot

RUN npm install

WORKDIR /app

COPY ./ ./converter_bot
COPY ./.env_prod ./converter_bot/.env

WORKDIR /app/converter_bot

RUN npm run build

EXPOSE 80
EXPOSE 443
# EXPOSE 6379
RUN cat /etc/os-release
RUN redis-server -v
#RUN redis-server --requirepass 6T9NCEUh43cT4382NuLhrpZmLtaGtLbJwxpQ33aA8SgumgMxajckpGHmhQtJ &

CMD redis-server --requirepass 6T9NCEUh4hrpZmLtaG33aA8SgumgMpGHmhQtJ & node -r ts-node/register/transpile-only -r tsconfig-paths/register -r dotenv/config ./build/index.js
# CMD ["node", "-r", "ts-node/register/transpile-only", "-r", "tsconfig-paths/register", "-r", "dotenv/config", "./build/index.js"]
