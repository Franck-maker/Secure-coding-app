FROM node:lts-alpine3.22

RUN npm install

RUN npm run build

RUN npm run db:deploy

EXPOSE 3000

CMD ["sh", "-c", "npm run db:deploy && npm start"]
