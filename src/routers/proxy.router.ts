import { Router } from "express";
import ServerProxy from "../server";

type IChunkPush = 
    | { type: "end" } 
    | { type: "chunk", data: Uint8Array };

/**
 * Make the structure of router proxy segment
 * @param server Server Proxy
 * @returns router
 */
export default function makeProxyRouter(server: ServerProxy) {
    /**
     * Router to segment 'proxy'
     */
    const proxyRouter = Router();
    
    // Intercept request to resend to client socket connected
    proxyRouter.use("/:proxyName", (req, res, next) => {
        try {
            const chunks: IChunkPush[] = [];
            const request = server.manageTunnels.CreateRequestHTTP(req.params.proxyName, {
                headers: new Headers(req.headers as {[key: string]: string}),
                method: req.method,
                path: req.url
            });

            const appendChunk = (chunk: Uint8Array) => {
            }

            req.on("data", (chunk) => {
                chunks.push({ 
                    type: "chunk", 
                    data: chunk
                });
            });

            req.on("end", () => {
                chunks.push({ type: "end" });
            });

            req.on("error", (err) => {

            });

            request.on("http_init", () => {

            });

            request.on("http_finish", () => {

            });

            request.on("http_upgrade", () => {

            });

            request.on("http_response", (headers, statusCode) => {

            });

            request.on("http_data", (chunk) => {

            });

            request.on("http_end", () => {

            });

            request.on("http_close", () => {

            });

            request.on("http_error", (err) => {

            });
        }
        catch(err) {
            // throw error to next middleware
            next(err);
        }
    });
    
    // export router
    return proxyRouter;
}