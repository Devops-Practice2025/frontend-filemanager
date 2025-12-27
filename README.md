# File Manager with Nginx

A static file management interface served by Nginx web server.

## Features
- 📁 **File Upload** - Upload files via drag & drop or file selection
- 🔍 **Search Files** - Search by name, type, or size
- ⬇️ **Download Files** - Download files to your computer
- 👁️ **File Preview** - Preview file details
- 🗑️ **Delete Files** - Remove files from the list
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Fast** - Served by Nginx, optimized for performance

## How It Works
This is a **100% frontend application**:
- Files are stored in your browser's memory
- No server-side processing needed
- Nginx serves the static files (HTML, CSS, JS)
- When you close the browser, files are gone (download to save permanently)

## Quick Start

### 1. Install Nginx (if not already installed)
```bash
sudo apt update
sudo apt install nginx -y