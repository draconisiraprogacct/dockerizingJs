
FROM node:latest

ARG JS_NAME

WORKDIR /app/${JS_NAME}

RUN echo `npm --version`
# Set up npm to use the right repo
# RUN npm config

COPY ${JS_NAME} ./

RUN echo `ls .`

RUN npm install

COPY ${JS_NAME}/package.json ./

RUN echo `ls .`
CMD ["npm", "run-script", "build"]




