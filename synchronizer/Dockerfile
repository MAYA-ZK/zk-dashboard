FROM node:20-alpine
WORKDIR /app
COPY ./package.json .
COPY ./common ./common
COPY ./synchronizer ./synchronizer
COPY ./tsconfig.json .
RUN npm install -w common
RUN npm install -w synchronizer

CMD ["npm", "run", "sync:run"]

