FROM node:18

WORKDIR /home/

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD ["node", "frontend.js"]