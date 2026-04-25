# Lightweight image
FROM node:18-alpine

# Set Working Dir
WORKDIR /app

# Copy only packages files first (cache optimisation)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the code
COPY . .

# Expose port 
EXPOSE 5000

# Start app
CMD ["npm", "start"] 
