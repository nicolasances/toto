FROM nginx

RUN mkdir /www

COPY www /www
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/config.prod.js /www/js/config.js