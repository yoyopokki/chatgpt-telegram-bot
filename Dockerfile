FROM node:16-alpine3.14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install @nestjs/cli --location=global
RUN npm install --omit=dev

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
