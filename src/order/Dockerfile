FROM node:18

WORKDIR /home/

COPY package*.json ./
RUN npm install

COPY . .

RUN [ ! -f orders.json ] && echo "[]" > orders.json || true

EXPOSE 3000
CMD ["node", "order.js"]