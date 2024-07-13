import express from "express";
import http from "http";
import router from "./routers/router";
import { Server as ServerIO, Socket } from "socket.io";

export default class ServerProxy {

    /**
     * Application express
     */
    private app: express.Application;

    /**
     * HTTP Server
     */
    private server: http.Server;

    /**
     * IO server
     */
    private io: ServerIO;

    /**
     * Builder server
     */
    constructor(private PORT: string) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new ServerIO(this.server, { cors: { origin: "*" }});

        this.app.use(router);
        this.io.on("connection", this.HandleInitConnection.bind(this));
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

    /**
     * Manage a new connection of socket
     * @param socket Socket IO
     */
    private HandleInitConnection(socket: Socket) {
        console.log("Socket connected!");

        // TODO: Implement Logic
    }
}