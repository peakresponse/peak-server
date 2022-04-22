FROM nginx:1.21.6-alpine

RUN apk add --update python3 py3-pip && \
    apk add certbot && \
    pip install certbot-nginx

EXPOSE 3000
