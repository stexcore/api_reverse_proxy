import express from "express";
import http from "http";

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
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);


    }
    
}