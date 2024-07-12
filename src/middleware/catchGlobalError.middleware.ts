import { ErrorRequestHandler } from "express";
import { InternalServerError } from "http-errors";

/**
 * Catch all error globals of others middlewares
 * @param req Request data
 * @param res Response data
 * @param next Next middleware
 */
const catchGlobalErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    try {
        const internalError = InternalServerError();

        // response error info
        res.status(internalError.statusCode).json({
            status: internalError.statusCode,
            message: internalError.message
        });
    }
    catch(err) {
        // throw error to next middleware
        next(err);
    }
}

export default catchGlobalErrorMiddleware;