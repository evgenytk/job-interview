FROM --platform=linux/amd64 node:18-alpine

USER root
COPY ./. ./
RUN [ "yarn" ]
RUN [ "yarn", "build" ]

EXPOSE 8080
CMD [ "yarn", "start" ]