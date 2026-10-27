FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
# --host 0.0.0.0 is required so the container port is reachable from your browser
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
