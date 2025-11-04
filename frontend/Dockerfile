FROM node:24.4.0-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the app
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]