# Use a suitable base image
FROM node:18

# Create and set the working directory
# Set working directory
WORKDIR /usr/src/app

# Install app dependencies by copying
# both package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Next.js uses port 3000 by default
EXPOSE 3000

# Start the development server
CMD [ "npm", "run", "dev" ]