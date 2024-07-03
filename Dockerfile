FROM node:21-alpine

WORKDIR /app

COPY package.json .

RUN npm install 

COPY . .

EXPOSE 8100

CMD [ "yarn", "dev" ]