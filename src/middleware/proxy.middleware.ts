import { RequestHandler } from "express";
import { ErrorNotFoundTunnelProxy } from "../classes/errors.class";
import ServerProxy from "../server";

type IChunkPush = 
    | { type: "end" } 
    | { type: "chunk", data: Uint8Array };


/**
 * Make the structure of router proxy segment
 * @param server Server Proxy
 * @returns router
 */
export default function makeProxyMiddleware(server: ServerProxy) {
    // middleware
    const proxyMiddleware: RequestHandler = (req, res, next) => {
        try {
            const [
                subdomain,
                ...hostname
            ] = req.hostname.split(".");

            if(!(hostname.length && subdomain.endsWith("-proxy"))) {
                // next middleware
                return next();
            }

            // extract proxy name
            const proxyName = subdomain.replace(/-proxy$/, "");
            
            const chunks: IChunkPush[] = [];
            const request = server.manageTunnels.CreateRequestHTTP(proxyName, {
                headers: new Headers(req.headers as {[key: string]: string}),
                method: req.method,
                path: req.url
            });
    
            let readyToSend = false;
    
            /**
             * push chunk to client tunnel
             */
            const applyToSend = () => {
    
                // check if is'nt ready to send chunk
                if(!readyToSend) return;
                
                const chunkItem = chunks.shift();
                // check if does not has chunk to send
                if(!chunkItem) return;
    
                // select type chunk or end
                switch(chunkItem.type) {
                    case "chunk":
                        request.write(chunkItem.data);
                        break;
    
                    case "end":
                        request.end();
                        break;
    
                    default:
                        throw new Error("Unknow type chunk data");
                }
    
                // next to send, in a timeout to prevent the function call limit from
                // being reached and also to block the main thread
                setTimeout(applyToSend)
            }
    
            req.on("data", (chunk) => {
                chunks.push({ 
                    type: "chunk", 
                    data: chunk
                });
                applyToSend();
            });
    
            req.on("end", () => {
                ended = true;
                chunks.push({ type: "end" });
                applyToSend();
            });
    
            let ended = false;
            let errored = false;
    
            req.on("error", (err) => {
                errored = true;
                request.abort(err);
            });
    
            req.on("close", () => {
                if(!ended && !errored && !endedResponse && !erroredResponse) {
                    request.abort(new Error("Lost connection TCP"));
                }
            });
    
            let endedResponse = false;
            let erroredResponse = false;
    
    
            // res.on("finish", () => {
            //     console.log("RES FINISH");
            // });
    
            // res.on("error", (err) => {
            //     console.log("RES ERROR");
            // });
            
            res.on("close", () => {
                if(!endedResponse && !erroredResponse) {
                    request.abort(new Error("Lost connection TCP"));
                }
            });
    
    
            request.on("http_init", () => {
                readyToSend = true;
                applyToSend();
            });
    
            // request.on("http_finish", () => {
            //     console.log("HTTP FINISH");
            // });
    
            // request.on("http_upgrade", () => {
            //     console.log("HTTP UPGRADE");
            // });
    
            request.on("http_response", (headers, statusCode) => {
                if(!res.destroyed) {
                    res.status(statusCode);
                    headers.forEach((value, key) => {
                        res.setHeader(key, value);
                    });
                }
            });
    
            request.on("http_data", (chunk) => {
                if(!res.destroyed) {
                    res.write(chunk);
                }
            });
    
            request.on("http_end", () => {
                if(!res.destroyed) {
                    endedResponse = true;
                    res.end();
                }
            });
    
            // request.on("http_close", () => {
            //     console.log("HTTP CLOSE");
            // });
    
            request.on("http_error", (err) => {
                erroredResponse = true;
    
                if(!req.destroyed) {
                    req.destroy()
                }
                if(!res.destroyed) {
                    res.destroy();
                }
            });
        }
        catch(err) {
            if(err instanceof ErrorNotFoundTunnelProxy) {
                return res.status(502).json({
                    success: false,
                    status: 502,
                    message: err.message,
                });
            }
            // throw error to next middleware
            next(err);
        }
    };
    
    return proxyMiddleware;
}