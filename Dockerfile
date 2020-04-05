FROM node:alpine
WORKDIR /opt/counter
COPY ./package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
