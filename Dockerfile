FROM  node:21.6.2-alpine
# FROM  node:hydrogen-slim


COPY package.json package.json 
COPY package-lock.json package-lock.json 
COPY app.js app.js
COPY upload upload
COPY download download
COPY views views

RUN npm install
RUN apk add openjdk8-jre
RUN apk add libreoffice
ENTRYPOINT [ "node","app.js" ]
