# Use a lightweight web server
FROM nginx:alpine

# Copy your site files into nginx
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80
