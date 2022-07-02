FROM node:17.8-alpine
WORKDIR /usr/app/
COPY ./ /usr/app/
COPY package.json .
RUN npm install
EXPOSE 8080
CMD ["npm", "start"]