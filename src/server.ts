import express from "express";
import http from "http";
import router from "./routers/router";

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
     * Builder server
     */
    constructor(private PORT: string) {
        this.app = express();
        this.server = http.createServer(this.app);

        this.app.use(router);
    }

    // start server
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
    
    // stop server
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
}