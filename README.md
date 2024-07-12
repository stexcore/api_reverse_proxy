# api_reverse_proxy

Server (API) that allows creating a reverse proxy and establishing connection with devices outside the global scope

# Environments

The urrent application or API server requires that the environment variables be configured throught the **.env** file in the root of the project. Because the platforms vary from a local computer (Development Mode) to a computer hosted on a server (Production Mode) it is necessary to configure it manually. The content of said file is similar to:

```py
# DEVELOPMENT MODE
NODE_ENV=<"development" | "production">

#SERVER
PORT=7000
HOSTNAME="localhost"
```