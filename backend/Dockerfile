FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Create directory for uploads (technician photo and signatures)
RUN mkdir -p /var/www/html/uploads/photos /var/www/html/uploads/signatures && \
    chmod -R 777 /var/www/html/uploads

# Set Apache DocumentRoot to point to html
RUN sed -ri -e 's!/var/www/html!/var/www/html!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!/var/www/html/!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

EXPOSE 80
