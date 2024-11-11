# Vaihe 1: Buildataan Vite-sovellus
FROM node:18 AS build

# Asetetaan työskentelyhakemisto
WORKDIR /app

# Kopioidaan package.json ja package-lock.json (tai pnpm-lock.yaml / yarn.lock)
COPY package*.json ./

# Asennetaan riippuvuudet
RUN npm install

ARG VITE_API_URL
ARG VITE_RUUVI_SERIAL
ARG VITE_INFLUXDB_BUCKET
ARG VITE_INFLUXDB_ORG
ARG VITE_INFLUXDB_URL
ARG VITE_INFLUXDB_TOKEN

# Asetetaan ympäristömuuttujat käyttöön
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RUUVI_SERIAL=$VITE_RUUVI_SERIAL
ENV VITE_INFLUXDB_BUCKET=$VITE_INFLUXDB_BUCKET
ENV VITE_INFLUXDB_ORG=$VITE_INFLUXDB_ORG
ENV VITE_INFLUXDB_URL=$VITE_INFLUXDB_URL
ENV VITE_INFLUXDB_TOKEN=$VITE_INFLUXDB_TOKEN


# Kopioidaan kaikki muut tiedostot sovellushakemistoon
COPY . .

# Buildataan Vite-sovellus
RUN npm run build

# Vaihe 2: Käytetään Nginxiä ja kopioidaan build-tiedostot
FROM nginx:alpine

# Kopioidaan buildattu Vite-sovellus Nginxin oletushakemistoon
COPY --from=build /app/dist /usr/share/nginx/html

# Kopioidaan Nginxin konfiguraatio, jos tarvitsee mukauttaa (valinnainen)
# COPY nginx.conf /etc/nginx/nginx.conf

# Avaa Nginx-palvelin perusportilla (80)
EXPOSE 80

# Käynnistetään Nginx
CMD ["nginx", "-g", "daemon off;"]
