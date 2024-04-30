FROM php:8.3-apache
COPY . /
WORKDIR /

RUN apt-get update && apt-get upgrade
RUN apt-get install -y zlib1g-dev libwebp-dev libzip-dev libpng-dev && docker-php-ext-install gd && docker-php-ext-install zip && docker-php-ext-install pdo_mysql

# Apache
RUN a2enmod rewrite headers

RUN echo "ServerName twitter" >> /etc/apache2/apache2.conf
RUN echo "Header always set Access-Control-Allow-Origin '*'" >> /etc/apache2/apache2.conf
RUN service apache2 restart

# Start php server
WORKDIR /var/www/html/back-end/

EXPOSE 80