# Start with the latest Node.js LTS release
FROM node:14.21.3-bullseye

# Support for multi-architecture builds
ARG TARGETARCH

# Set an env variable for the location of the app files
ENV APP_HOME=/opt/node/app

# update path to include any installed node module executables
RUN echo "export PATH=$APP_HOME/node_modules/.bin:~/minio-binaries:\$PATH\n" >> /root/.bashrc

RUN wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | apt-key add - && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ bullseye-pgdg main" >> /etc/apt/sources.list.d/pgdg.list && \
    apt-get update -y && \
    apt-get install -y cron less libxml2-utils mandoc maven postgresql-client-12 python && \
    rm -rf /var/lib/apt/lists/* && \
    ARCH=`uname -m` && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-$ARCH.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm awscliv2.zip && rm -Rf aws && \
    curl https://dl.min.io/client/mc/release/linux-$TARGETARCH/mc --create-dirs -o ~/minio-binaries/mc && \
    chmod +x ~/minio-binaries/mc

# Create a directory for the server app to run from
RUN mkdir -p $APP_HOME

# Add the project files into the app directory and set as working directory
ADD . $APP_HOME

# Build Angular apps
WORKDIR $APP_HOME/angular
RUN npm install && \
    npm run build -- shared && \
    npm run build -- design && \
    npm run build -- auth && \
    npm run build -- onboarding && \
    npm run build -- admin && \
    npm run build -- app

# Build Server and Java dependencies
WORKDIR $APP_HOME
RUN npm install && \
    mvn install

CMD ["bash", "./bin/entrypoint"]

EXPOSE 3000
