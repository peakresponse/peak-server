# Start with the latest Node.js LTS release
FROM node:14.16.0

# Set an env variable for the location of the app files
ENV APP_HOME=/opt/node/app

# update path to include any installed node module executables
RUN echo "export PATH=$APP_HOME/node_modules/.bin:\$PATH\n" >> /root/.bashrc

RUN wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | apt-key add - && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ stretch-pgdg main" >> /etc/apt/sources.list.d/pgdg.list && \
    apt-get update -y && \
    apt-get install -y libxml2-utils maven postgresql-client-11

# Create a directory for the server app to run from
RUN mkdir -p $APP_HOME

# Add the project files into the app directory and set as working directory
ADD . $APP_HOME

WORKDIR $APP_HOME/angular
RUN npm install && \
    npm run build design

WORKDIR $APP_HOME
RUN mvn install && \
    npm install && \
    npm run build

CMD ["node", "./bin/www"]

EXPOSE 3000
