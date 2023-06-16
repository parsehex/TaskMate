# Use a multi-stage build to install dependencies and build the application
FROM node:16 as builder

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm install --only=production

COPY . .

RUN npm run build

# Start a new stage for the final image
FROM node:16

WORKDIR /app

COPY --from=builder /app .

COPY .env ./
COPY crossbar/.crossbar/config.json crossbar/.crossbar/
COPY database.sqlite3 ./

# Create a script to start both the Node.js server and Crossbar.io
RUN echo "#!/bin/sh" > start.sh
RUN echo "crossbar start --cbdir /mynode/.crossbar &" >> start.sh
RUN echo "node dist/backend/index.js" >> start.sh
RUN chmod +x start.sh

CMD ["sh", "start.sh"]

EXPOSE 8080 8585
