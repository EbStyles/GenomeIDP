FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    r-base \
    r-base-dev \
    && rm -rf /var/lib/apt/lists/*

RUN Rscript -e "install.packages(c('FNN','dplyr','jsonlite'), repos='https://cloud.r-project.org')" && Rscript -e "library(dplyr); library(FNN); library(jsonlite); print('R packages installed OK')"

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]