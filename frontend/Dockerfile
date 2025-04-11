FROM node:18 AS builder
WORKDIR /dist
COPY package*.json ./
RUN npm install
COPY . . 
RUN npm run build

FROM node:18-alpine
WORKDIR /dist
RUN npm install -g serve
COPY --from=builder /dist /dist
COPY package*.json ./
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]