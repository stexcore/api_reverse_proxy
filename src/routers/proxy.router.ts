import { Router } from "express";

/**
 * Router to segment 'proxy'
 */
const proxyRouter = Router();

// Intercept request to resend to client socket connected
proxyRouter.get("/:proxyName", (req, res, next) => {
    try {
        // TODO: Implement logic
    }
    catch(err) {
        // throw error to next middleware
        next(err);
    }
});

// export router
export default proxyRouter;