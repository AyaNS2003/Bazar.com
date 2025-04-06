FROM ubuntu:latest

WORKDIR /home/

COPY . .

RUN apt-get update -y

RUN apt-get install -y nodejs npm

COPY package*.json ./

RUN npm install
RUN npm install express
RUN npm install axios
EXPOSE 5000
CMD ["node", "frontend.js"]