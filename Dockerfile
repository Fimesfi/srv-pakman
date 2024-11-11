# Vaihe 1: Rakenna React-sovellus
FROM node:16 AS build

# Luo ja siirry sovelluskansioon
WORKDIR /app

# Kopioi package.json ja package-lock.json ja asenna riippuvuudet
COPY package*.json ./
RUN npm install

# Kopioi kaikki tiedostot ja rakenna sovellus
COPY . .
RUN npm run build

# Vaihe 2: Palvele sovellus Nginxillä
FROM nginx:alpine

# Kopioi rakennettu sovellus Nginxin www-kansioon
COPY --from=build /app/build /usr/share/nginx/html

# Kopioi mukautettu Nginx-konfiguraatio
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponoi portti 80
EXPOSE 80

# Käynnistä Nginx-palvelin
CMD ["nginx", "-g", "daemon off;"]
