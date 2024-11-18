# Vaihe 1: Buildataan Vite-sovellus
FROM node:18 AS build

# Asetetaan työskentelyhakemisto
WORKDIR /app

# Kopioidaan package.json ja package-lock.json (tai pnpm-lock.yaml / yarn.lock)
COPY package*.json ./
COPY ./entrypoint.sh /entrypoint.sh
# Asennetaan riippuvuudet
RUN npm install

# Kopioidaan kaikki muut tiedostot sovellushakemistoon
COPY . .

# Buildataan Vite-sovellus
RUN npm run build

RUN chmod +x /entrypoint.sh

# Vaihe 2: Käytetään Nginxiä ja kopioidaan build-tiedostot
FROM nginx:alpine

# Kopioidaan buildattu Vite-sovellus Nginxin oletushakemistoon
COPY --from=build /app/dist /usr/share/nginx/html

# Kopioidaan Nginxin konfiguraatio, jos tarvitsee mukauttaa (valinnainen)
# COPY nginx.conf /etc/nginx/nginx.conf

# Avaa Nginx-palvelin perusportilla (80)
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
# Käynnistetään Nginx
CMD ["nginx", "-g", "daemon off;"]
