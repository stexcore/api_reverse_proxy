import { json, Router, urlencoded } from "express";
import exampleRouter from "./example.router";
import proxyRouter from "./proxy.router";
import catchHttpErrorMiddleware from "../middleware/catchHttpError.middleware";
import catchGlobalErrorMiddleware from "../middleware/catchGlobalError.middleware";
import morgan from "morgan";
import ServerProxy from "../server";

/**
 * Make the router base of server proxy
 * @param server Server Proxy
 * @returns router base
 */
export default function makeRouter(server: ServerProxy) {

    /**
     * Router of server
     */
    const router = Router();
    
    // middleware to local API
    const middlewares = [
        json(),
        urlencoded({ extended: true })
    ];
    
    // append middlewares
    router.use(morgan("dev"));
    
    // Append segments of other routers
    router.use("/example", exampleRouter(server));
    router.use("/proxy", proxyRouter(server));
    
    // append middleware errors
    router.use(catchHttpErrorMiddleware);
    router.use(catchGlobalErrorMiddleware);
    
    return router;
}