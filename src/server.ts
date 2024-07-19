import express from "express";
import http from "http";
import router from "./routers/router";
import { Server as ServerIO, Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import "colors";
import ManageTunnelsProxy from "./app/manage.tunnels";
import { ErrorNotAvariableProxyName } from "./classes/errors.class";

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
     * Manage tunnels proxy
     */
    public readonly manageTunnels = new ManageTunnelsProxy();

    /**
     * Builder server
     */
    constructor(private PORT: string) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new ServerIO(this.server, { cors: { origin: "*" }});

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

        try {
            this.manageTunnels.RegisterSocket(proxyName as string, socket);
        }
        catch(err) {
            console.error(err instanceof Error ? err.message : "Unknow");
            socket.disconnect();
        }
    }
}