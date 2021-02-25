FROM node:14.3-alpine

COPY ./client ./client
COPY ./server ./server

WORKDIR /client
RUN npm install
RUN npm run build

WORKDIR /server
RUN npm install

CMD node server.js