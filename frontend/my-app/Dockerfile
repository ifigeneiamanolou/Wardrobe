# Pull the base image (Linux for replicability, security and simplicity)
FROM node:14.18.1-buster-slim

# Set up production mode if needed
ARG NODE_ENV production
ENV NODE_ENV $NODE_ENV

# Expose ports and IP address
ARG PORT 19006
ENV NODE_PORT $PORT
EXPOSE 19006 19002 19001
ENV REACT_NATIVE_PACKAGER_HOSTNAME = "192.168.1.188"

# Set up global dependancies
ENV NPM_CONFIG_PATH = /home/node/.npm_global
ENV PATH /home/node/.npm-global/bin:$PATH
RUN npm i --unsafe-perm -g npm@latest expo-cli@latest

# Set up ngrok.io to access the Expo servers from outside the local network
RUN yarn install @expo/ngrok

# Set up local dependancies
RUN mkdir /opt/my-app && chown root:root /opt/my-app
ENV PATH /opt/my-app/.bin:$PATH
WORKDIR /opt/my-app
USER root
COPY package.json package-lock.json ./
RUN yarn add

# Copy the source code
WORKDIR /opt/my-app
COPY . /opt/my-app/

# Start the server
CMD ["npx", "expo", "start", "--port", "19006"]