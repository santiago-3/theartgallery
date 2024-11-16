FROM php:8.3-apache
# Update and upgrade packages
RUN apt-get update && apt-get upgrade -y
# Install CodeIgniter 4 dependencies (ext-intl, ext-gd, ext-zip)
# Enable required PHP extensions
RUN apt-get install -y libicu-dev libpng-dev libzip-dev libjpeg62-turbo-dev libfreetype6-dev
RUN docker-php-ext-install intl gd zip
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install -j$(nproc) gd
# Add required postgresql PHP extensions
RUN apt-get install -y libpq-dev
RUN docker-php-ext-install pdo pdo_pgsql pgsql
# Modify php.ini to increase upload file size to 100MB
RUN echo "upload_max_filesize = 100M" > /usr/local/etc/php/conf.d/uploads.ini
RUN echo "post_max_size = 100M" >> /usr/local/etc/php/conf.d/uploads.ini
# Install git
RUN apt-get install -y git
# Enable mod_rewrite for Apache
RUN a2enmod rewrite
# Copy the Apache configuration file
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
# Restart Apache
RUN service apache2 restart
