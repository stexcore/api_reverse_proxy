import { ErrorRequestHandler } from "express";
import { isHttpError } from "http-errors";

/**
 * Catch all error HTTP of others middlewares
 * @param req Request data
 * @param res Response data
 * @param next Next middleware
 */
const catchHttpErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    try {
        if(isHttpError(err)) {

            // manage error
            res.status(err.statusCode).json({
               status: err.statusCode,
               message: err.message
            });
        }
        else throw err;
    }
    catch(err) {
        // throw error to next middleware
        next(err);
    }
}

export default catchHttpErrorMiddleware;