# Start with the latest Node.js LTS release
FROM node:14.19.1-bullseye

# Set an env variable for the location of the app files
ENV APP_HOME=/opt/node/app

# update path to include any installed node module executables
RUN echo "export PATH=$APP_HOME/node_modules/.bin:\$PATH\n" >> /root/.bashrc

RUN wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | apt-key add - && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ bullseye-pgdg main" >> /etc/apt/sources.list.d/pgdg.list && \
    apt-get update -y && \
    apt-get install -y cron libxml2-utils maven postgresql-client-12 python && \
    rm -rf /var/lib/apt/lists/* && \
    ARCH=`uname -m` && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-$ARCH.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm awscliv2.zip

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

# Build Java dependencies and (legacy) Angular apps
WORKDIR $APP_HOME
RUN mvn install && \
    npm install && \
    npm run build

CMD ["bash", "./bin/entrypoint"]

EXPOSE 3000
