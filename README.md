# api_reverse_proxy

Server (API) that allows creating a reverse proxy and establishing connection with devices outside the global scope

## Install dependencies

Before running the project itself, first of all it is necessary to install the dependencies for its correct functioning.

>     npm install

## Configuring environments
Before executing, a crucial step is also necessary which is to configure the environments.

The current application or API server requires that the environment variables be configured throught the **.env** file in the root of the project. Because the platforms vary from a local computer (Development Mode) to a computer hosted on a server (Production Mode) it is necessary to configure it manually. The content of said file is similar to:

```py
# DEVELOPMENT MODE
NODE_ENV=<"development" | "production">

#SERVER
PORT=7000
HOSTNAME="localhost"
```

Another thing to keep in mind is that this project works in conjunction with **tunnel_proxy_http** which will be the intermediary for all incoming HTTP requests. The project can be found at:

[https://github.com/stexcore/tunnel_proxy_http](https://github.com/stexcore/tunnel_proxy_http)

## Run project
to run the application in development mode, it is as simple as running a command line.

>     npm run dev

## Build Project
To generate the minified project assets, run the command:

>     npm run build

All files javascript generated is in **/dist** folder.
To run the project in production mode, run the command:

>     npm run start

!!Congratulations!! If you have started the reverse proxy server, you can now try establishing connections within the **tunnel_proxy_http** project.

Although, there is not much to explain the functionality of the API, since it oonly works as an intermediary between tunnel_proxy_http and external HTTP requests.

## Deploy project
To bring your server to production, you will need to upload the files:

- **dist**
- **package.json**
- **.env**

Remember before uploading the .env file, abjust the values according to your needs (Port, Hostname) and most importantly abjust the value of the **NODE_ENV** field to **production**.

After that, you connect to a VPS server, via ssh

>     ssh user@XXX.XXX.XXX.XXX

Assuming you already have nodejs installed on the server, simply locate the root of the previously uploaded files, and run the command to install dependencies:

>     npm install

After run the command start to inicialize server:

>     npm run start


⚙️ Made with effort and dedication, team stexcore ❤️