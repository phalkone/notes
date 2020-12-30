FROM node:15.5.0-alpine3.10
WORKDIR /app
COPY package.json .
RUN npm install
WORKDIR /app/notes
CMD ["npm", "run", "start"]