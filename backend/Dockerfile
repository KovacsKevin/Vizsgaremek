FROM node:16-alpine
WORKDIR /dist
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8081
CMD ["npm", "run", "dev"]