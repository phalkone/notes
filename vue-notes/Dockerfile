FROM node:15.5.0-alpine3.10
WORKDIR /app
COPY package.json .
RUN if [ "$(nc -z docker.for.mac.localhost 4873; echo $?)" = "0" ]; then npm set registry http://docker.for.mac.localhost:4873/ ; fi
RUN npm install
WORKDIR /app/notes
CMD ["npm", "run", "serve"]