import { json, Router, urlencoded } from "express";
import exampleRouter from "./example.router";
import proxyRouter from "./proxy.router";
import catchHttpErrorMiddleware from "../middleware/catchHttpError.middleware";
import catchGlobalErrorMiddleware from "../middleware/catchGlobalError.middleware";
import morgan from "morgan";

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
router.use("/example", ...middlewares, exampleRouter);
router.use("/proxy", proxyRouter);

// append middleware errors
router.use(catchHttpErrorMiddleware);
router.use(catchGlobalErrorMiddleware);

// export router
export default router;