FROM node:latest
ENV NODE_ENV=production

COPY . /wtpc-bot
WORKDIR /wtpc-bot

RUN npm install 

# This is needed for SQLite to work
RUN npm rebuild

CMD ["node", "bot.js"]
