#!/bin/bash

# File Manager Installation Script for Nginx
# Run with: sudo bash install.sh

set -e

echo "========================================="
echo "File Manager with Nginx - Installation"
echo "========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "Updating system packages..."
dnf update -y
dnf upgrade -y

# Install Nginx
echo "Installing Nginx..."
dnf install nginx -y

# Create directory structure
echo "Creating directory structure..."
mkdir -p /var/www/html
mkdir -p /var/www/html/css
mkdir -p /var/www/html/js
mkdir -p /var/www/html/images

# Copy HTML files
echo "Copying HTML files..."
cp -r html/* /var/www/html/

# Set permissions
echo "Setting permissions..."
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# Copy Nginx configuration
echo "Configuring Nginx..."
cp nginx-config/file-manager.conf /etc/nginx/sites-available/file-manager

# Enable the site
ln -sf /etc/nginx/sites-available/file-manager /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Restart Nginx
echo "Restarting Nginx..."
systemctl restart nginx

# Enable Nginx to start on boot
systemctl enable nginx

# Get IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo ""
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
echo "File Manager is now running!"
echo ""
echo "Access it at:"
echo "  Local:  http://localhost:8080"
echo "  Network: http://$IP_ADDRESS:8080"
echo ""
echo "To manage Nginx:"
echo "  Check status: sudo systemctl status nginx"
echo "  Restart:      sudo systemctl restart nginx"
echo "  Stop:         sudo systemctl stop nginx"
echo "  Start:        sudo systemctl start nginx"
echo ""
echo "Files are located at: /var/www/html"
echo "Nginx config: /etc/nginx/sites-available/file-manager"
echo ""