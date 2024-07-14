import { json, Router, urlencoded } from "express";
import ServerProxy from "../server";

/**
 * Make the structure of example router segment
 * @param server Server Proxy
 * @returns router
 */
export default function makeExampleRouter(server: ServerProxy) {
    /**
     * Router to segment 'example'
     */
    const exampleRouter = Router();
    
    // request headers
    exampleRouter.get("/headers/abort", (req, res, next) => {
        try {
            req.destroy();
        }
        catch(err) {
            next(err);
        }
    });
    
    exampleRouter.get("/headers/continue", (req, res, next) => {
        try {
            
        }
        catch(err) {
            next(err);
        }
    });
    
    // append middlewares
    exampleRouter.use(json(), urlencoded({ extended: true }));
    
    // Request Example
    exampleRouter.get("/", (req, res, next) => {
        try {
            res.json({
                status: 200,
                message: "This is a example of request HTTP"
            });
        }
        catch(err) {
            // throw error to next middleware
            next(err);
        }
    });
    
    // Request Example With Pause
    exampleRouter.get("/pause", (req, res, next) => {
        try {
            const data = JSON.stringify({
                success: true,
                message: "This is a example with pause during request HTTP"
            });
    
            // Fragments of data
            const firtsData = data.slice(0, Math.ceil(data.length / 2));
            const lastsData = data.slice(Math.ceil(data.length / 2));
    
            // send headers
            res.setHeader("Content-Type", "application/json");
            
            // send firts data
            res.write(firtsData);
    
            // emit pause event
            req.pause();
    
            // wait 10 seconds to end response
            setTimeout(() => {
                req.resume();
                res.write(lastsData);
                res.end();
            }, 10000);
        }
        catch(err) {
            // throw error to next middleware
            next(err);
        }
    });
    
    // Request Example with Abort
    exampleRouter.get("/abort", (req, res, next) => {
        try {
            res.setHeader("Content-Type", "application/json");
            res.write("{\"success\":true");
    
            setTimeout(() => {
                res.destroy();
            }, 2000);
        }
        catch(err) {
            // throw error to next middleware
            next(err);
        }
    });
    
    // export router
    return exampleRouter;
}