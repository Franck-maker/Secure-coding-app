FROM node:lts-alpine3.22

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run generate

RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "npm run migrate:deploy && npm start"]

HEALTHCHECK --interval=10s --timeout=10s --start-period=15s --retries=3 CMD [ "curl", "-f", "http://localhost:3000/api/health" ]
