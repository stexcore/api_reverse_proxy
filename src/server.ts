import express from "express";
import http from "http";
import router from "./routers/router";
import { Server as ServerIO, Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import "colors";
import ManageTunnelsProxy from "./app/manage.tunnels";
import { ErrorNotAvariableProxyName } from "./classes/errors.class";
import ws from "ws";

export default class ServerProxy {

    /**
     * Application express
     */
    private readonly app: express.Application;

    /**
     * HTTP Server
     */
    private readonly server: http.Server;

    /**
     * IO server
     */
    private readonly io: ServerIO;

    /**
     * Server WS example
     */
    private readonly wsServer: ws.Server;
    
    /**
     * Manage tunnels proxy
     */
    public readonly manageTunnels = new ManageTunnelsProxy();

    /**
     * Builder server
     */
    constructor(private PORT: string) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wsServer = new ws.Server({ noServer: true });
        this.io = new ServerIO(this.server, {
            path: "/connection-io", 
            cors: { origin: "*" },
            
            // allowRequest: (req, next) => {
            //     const [
            //         subdomain,
            //         ...hostname
            //     ] = (req.headers.host || "").split(".");
        
            //     if(!(hostname.length && subdomain == "tunnel-proxy")) {
            //         return next(null, true);
            //     }

            //     return next(null, false);
            // }
        });

        this.server.on("upgrade", (req, socket, head) => {

            if(req.url?.startsWith("/connection-io")) {
                // manage by socket.io
                return;
            }
            else {
                const [
                    subdomain,
                    ...hostname
                ] = (req.headers.host || "").split(".");
    
                // check if is valid subdomain
                if(!(hostname.length && subdomain.endsWith("-proxy"))) {

                    if(req.url == "/example" || req.url == "/example/") {
                        console.log("MANAGING EXAMPLE");
                        // manage upgrade
                        this.wsServer.handleUpgrade(req, socket, head, (ws, request) => {
                            ws.onmessage = (msg =>{
                                console.log(msg.data);
                            })
                            let count = 0;
                            let timer = setInterval(() => {
                                if(ws.readyState === ws.OPEN) {
                                    ws.send("Chunk: " + count++);
                                }
                                else clearTimeout(timer);
                            }, 5000);
                        });
                    }
                    else {
                        // destroy connection
                        return req.destroy(new Error("Unknow Request"));
                    }
                }
    
                // extract proxy name
                const proxyName = subdomain.replace(/-proxy$/, "");

                // check if exists the proxy tunnel
                if(this.manageTunnels.isRegisteredSocket(proxyName)) {
                    console.log("Haddling upgrade")
                    // handle request upgrade
                    this.wsServer.handleUpgrade(req, socket, head, this.HandleProxyWebsocket.bind(this, proxyName));
                }
                else {
                    // destroy connection
                    return req.destroy(new Error("Unknow Request"));
                }
            }
        });

        this.io.use(this.HandleMiddlewareConnection.bind(this));
        this.io.on("connection", this.HandleInitConnection.bind(this));

        this.app.use(router(this));
    }

    /**
     * Start server listen
     * @returns Promise void
     */
    public inicialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // listen server
                this.server.listen(this.PORT, () => {
                    resolve();
                });
            }
            catch(err) {
                reject(err);
            }
        });
    }
    
    /**
     * Stop server
     * @returns Promise void
     */
    public destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // close listen
                this.server.close((err) => {
                    if(err) return reject(err);
                    resolve();
                });
            }
            catch(err) {
                reject(err);
            }
        });
    }

    private HandleMiddlewareConnection(socket: Socket, next: (err?: ExtendedError) => void) {
        const [
            subdomain,
            ...hostname
        ] = (socket.handshake.headers.host || "").split(".");

        if(!(hostname.length && subdomain.endsWith("-proxy"))) {
            // throw error
            return next(new Error("The SearchParam 'ProxyName' is required"));
        }

        // extract proxy name
        const proxyName = subdomain.replace(/-proxy$/, "");

        if(this.manageTunnels.isRegisteredSocket(proxyName)) 
            return next(new ErrorNotAvariableProxyName("NameProxy is'nt avariable"))
        
        // all correct to connect
        next();
    }

    /**
     * Manage a new connection of socket
     * @param socket Socket IO
     */
    private HandleInitConnection(socket: Socket) {
        const [
            subdomain,
            ...hostname
        ] = (socket.handshake.headers.host || "").split(".");

        if(!(hostname.length && subdomain.endsWith("-proxy"))) {
            // throw error
            return socket.disconnect();
        }

        // extract proxy name
        const proxyName = subdomain.replace(/-proxy$/, "");
        console.log("Registering,", subdomain);

        try {
            this.manageTunnels.RegisterSocket(proxyName as string, socket);
        }
        catch(err) {
            console.error(err instanceof Error ? err.message : "Unknow");
            socket.disconnect();
        }
    }

    private HandleProxyWebsocket(proxyName: string, ws: ws, request: http.IncomingMessage) {

        console.log("Connencted!");

        ws.on("close", (code, reason) => {
            console.log("EVENT WEBSOCKET SERVER:", "close");
            connection.close();
        });

        ws.on("error", (err) => {
            console.log("EVENT WEBSOCKET SERVER:", "error");
            connection.close(err);
        });

        ws.on("message", (data, isBinary) => {
            console.log("EVENT WEBSOCKET SERVER:", "message");
            connection.send(isBinary ? new Uint8Array(data instanceof Array ? Buffer.concat(data) : Buffer.from(data)) : data.toString());
        });

        ws.on("open", () => {
            console.log("EVENT WEBSOCKET SERVER:", "open");
        });

        // create instance of connection
        const connection = this.manageTunnels.CreateWebsocketConnection(proxyName, {
            headers: new Headers(request.headers as any),
            path: request.url || "",
        });

        // Connection has been establish
        connection.on("websocket_open", () => {
            console.log("EVENT CLIENT:", "websocket_open");
        });

        // connection has been disconnect
        connection.on("websocket_close", () => {
            console.log("EVENT CLIENT:", "websocket_close");
        });

        // Message received
        connection.on("websocket_message", (message, isBinary) => {
            console.log("EVENT CLIENT:", "websocket_message");
        });

        // Event error
        connection.on("websocket_error", (err) => {
            console.log("EVENT CLIENT:", "websocket_error");
        });
    }
}