{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 FROM node:20-bullseye\
\
WORKDIR /app\
\
RUN apt-get update && apt-get install -y \\\
    r-base \\\
    r-base-dev \\\
    && rm -rf /var/lib/apt/lists/*\
\
RUN Rscript -e "install.packages(c('FNN','dplyr','jsonlite'), repos='https://cloud.r-project.org')"\
\
COPY package*.json ./\
RUN npm install\
\
COPY . .\
\
ENV NODE_ENV=production\
ENV RSCRIPT_PATH=Rscript\
\
EXPOSE 10000\
\
CMD ["npm", "start"]}