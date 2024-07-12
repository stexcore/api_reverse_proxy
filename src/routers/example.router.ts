import { Router } from "express";

/**
 * Router to segment 'example'
 */
const exampleRouter = Router();

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

// export router
export default exampleRouter;