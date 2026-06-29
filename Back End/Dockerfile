FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y \
    r-base \
    r-base-dev \
    && rm -rf /var/lib/apt/lists/*

RUN Rscript -e "install.packages(c('FNN','dplyr','jsonlite'), dependencies=TRUE, repos='https://cloud.r-project.org')"

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
