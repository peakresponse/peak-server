# Peak Response Server

This is the server repository for Peak Response. For the iOS
mobile app repository, visit:

https://github.com/peakresponse/peak-ios

Peak Response (formerly NaTriage) was developed as part of the 2019 Tech to
Protect Challenge to create new technologies for emergency responders.

## Getting Started

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop

   1. If you have Windows Home Edition, you will need to install Docker Toolbox instead.
      See the troubleshooting notes below.

2. Clone this git repo to a "local" directory (on your computer), then change
   into the directory.

   ```
   $ git clone https://github.com/peakresponse/peak-server.git
   $ cd peak-server
   ```

3. Open a command-line shell, change into your repo directory, and execute this command:

   ```
   $ docker-compose -f docker-compose.deploy.yml pull
   ```

4. Start the containers:

   ```
   $ docker-compose -f docker-compose.deploy.yml up
   ```

5. While still in the server container, you can create an initial bootstrap user:

   ```
   # bin/create-admin Firstname Lastname email@address.com password
   ```

6. To populate some sample patient data from the contest 010 sample worksheet:

   ```
   # bin/import sample.xlsx
   ```

7. Log in with the bootstrap user credentials in a browser: http://localhost:3000/

   1. If you had to install Docker Toolbox, then replace "localhost" with the IP
      address of the Docker Virtual Machine.

8. To stop the server, press CONTROL-C in the window with the running server.
   If it is successful, you will see something like this:

   ```
   Killing nat-server_db_1           ... done
   Killing nat-server_server_1       ... done
   ```

   If it is not successful, you may see something like this:

   ```
   ERROR: Aborting.
   ```

   If you get an error, the server may still be running on your computer. To force it to stop,
   run the following command and wait for the output to report DONE:

   ```
   $ docker-compose stop
   Stopping peak-server_db_1          ... done
   Stopping peak-server_server_1      ... done
   ```

## Development

1. Open a command-line shell, change into your repo directory, and execute this command:

   ```
   $ docker-compose up
   ```

   When you see messages that look like this, the server is running:

   ```
   server_1       | 2:14:26 AM web.1     |  > app@0.0.0 start /opt/node/app
   server_1       | 2:14:26 AM web.1     |  > nodemon -V --ignore ./client ./bin/www
   server_1       | 2:14:26 AM web.1     |  [nodemon] 1.19.0
   server_1       | 2:14:26 AM web.1     |  [nodemon] to restart at any time, enter `rs`
   server_1       | 2:14:26 AM web.1     |  [nodemon] or send SIGHUP to 57 to restart
   ```

2. The default development docker-compose.yml configuration mounts the repository directory
   inside the running container. Any edits saved to the server source files will be detected
   by nodemon and the server restarted. Any edits saved to the web app client source files
   will be detected by the webpack-development-server, triggering a browser refresh after
   a rebuild.

## Shell Command Quick Reference

- Every directory and file on your computer has a _path_ that describes its location in storage. Special path symbols include:

  - The current _working directory_ you are in: `.`
  - The _parent_ of the current working directory: `..`
  - Your _home_ directory: `~`
  - The _root_ directory: `/` (Mac, Linux) or `\` (Windows)
    - The same symbol is used as a _separator_ when specifying multiple directories in a path
    - If the path _starts_ with the separator, it means the path starts at the _root_
      - For example: `/Users/myusername/Documents`
      - This is called an _absolute_ path
    - If the path _does not start_ with the separator, it means the path starts at the current _working directory_
      - For example, if the current _working directory_ is: `/Users`  
        then the same path as the previous example is: `myusername/Documents`
      - This is called a _relative_ path
    - A path can also start with any of the above special path symbols
      - For example, on Mac the same path as the previous example is: `~/Documents`

- To _print the working directory_ (i.e. to see the full path of the directory you are currently in):

  ```
  $ pwd
  ```

- To _list_ the files in the working directory:

  ```
  $ ls -l
  ```

- To _change_ the working directory:

  ```
  $ cd path
  ```

- To _make_ a new directory inside the working directory:

  ```
  $ mkdir newpath
  ```

- To create a new _empty file_ inside the working directory:

  ```
  $ touch filename.ext
  ```

## git Command Quick Reference

- To check the _status_ of the files in your local repo (i.e. what's been added or changed):

  ```
  $ git status
  ```

- To _add all_ the changed files to the next commit:

  ```
  $ git add .
  ```

  To _add specific file(s)_ to the next commit:

  ```
  $ git add path/to/file1.ext path/to/file2.ext path/with/wildcard/*
  ```

- To _commit_ the added files with a message:

  ```
  $ git commit -m "My description of what's changed"
  ```

- To _push_ the commit to the remote repo:

  ```
  $ git push
  ```

- To _pull_ any new commits from the remote repo:

  ```
  $ git pull
  ```

## Docker Command Quick Reference

- To start all the containers:

  ```
  $ docker-compose up
  ```

- To log in to the running server container:

  ```
  $ docker-compose exec server bash -l
  ```

- To stop all the containers, in case things didn't shutdown properly with CTRL-C:

  ```
  $ docker-compose stop
  ```

- To run the server container without starting everything using the up command:

  ```
  $ docker-compose run --rm server bash -l
  ```

- To re-build the server container:

  ```
  $ docker-compose build server
  ```

## Docker Troubleshooting

- On some PC laptops, a hardware CPU feature called virtualization is disabled by default, which is required by Docker. To enable it, reboot your computer into its BIOS interface (typically by pressing a key like DELETE or F1 during the boot process), and look for an option to enable it. It may be called something like _Intel Virtualization Technology_, _Intel VT_, _AMD-V_, or some similar variation.

- On Windows, Docker Desktop cannot run on Windows Home edition. Install Docker Toolbox instead:

  https://docs.docker.com/toolbox/overview/

  https://github.com/docker/toolbox/releases

  Use the _Docker QuickStart shell_ installed with Docker Toolbox to open a command-line shell that launches Docker for you when it starts. On Windows, right-click on the shotcut and Run as Administrator. Note: this can take a long time to start, depending upon your computer, as it needs to start a virtual machine running Linux.

  The virtual machine will have its own, separate IP address on your computer. In the `.env` file (see step 4 in Getting Started), replace _localhost_ with _192.168.99.100_ in the BASE_HOST and BASE_URL variables. To confirm that this is the correct IP address, run this command in the command-line shell:

  ```
  $ docker-machine ip
  ```

## License

Peak Response
Copyright (C) 2019-2020 Peak Response Inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
