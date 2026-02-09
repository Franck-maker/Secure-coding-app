FROM node:lts-alpine3.22

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "npm run db:deploy && npm start"]
