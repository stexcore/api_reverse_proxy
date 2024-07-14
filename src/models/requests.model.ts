export interface IRequest {
    headers: Headers,
    method: string,
    path: string,
}

export type ITypeEventRequestHTTP =
    | "http_request"
    | "http_init"
    | "http_data"
    | "http_finish"
    | "http_response"
    | "http_upgrade"
    | "http_close"
    | "http_error"
    | "http_end"



export interface IRequestHTTP {

    /**
     * ID of request
     */
    readonly id_request: number;

    /**
     * ProxyName
     */
    readonly proxyName: string;

    /**
     * Emitted event of http init, is issued when it is ready to send data to the server
     * @param eventType Http Init Event
     * @param callback callback
     */
    on(eventType: "http_init", callback: () => void): void;

    /**
     * Emitted after you call the end method and it has been determined 
     * that the server has received all the chunks
     * @param eventType Http finish event
     * @param callback callback
     */
    on(eventType: "http_finish", callback: () => void): void;

    /**
     * Emitted when the server sends the response header, along with the HTTP status code
     * @param eventType Http response event
     * @param callback Callback
     */
    on(eventType: "http_response", callback: (headers: Headers, statusCode: number) => void): void;

    /**
     * Emitted after receiving the response headers from the server. Emit the data 
     * chunks of the request body
     * @param eventType Http data event
     * @param callback Callback
     */
    on(eventType: "http_data", callback: (chunk: Uint8Array) => void): void;

    /**
     * Emitted when the transmission of chunks of the HTTP request body ends
     * @param eventType Http end event
     * @param callback Callback
     */
    on(eventType: "http_end", callback: () => void): void;

    /**
     * Emitted when the TCP connection is closed
     * @param eventType HTTP close event
     * @param callback Callback
     */
    on(eventType: "http_close", callback: () => void): void;

    /**
     * Emitted when some Error occurs
     * @param eventType Http error event
     * @param callback Callback
     */
    on(eventType: "http_error", callback: (err: Error) => void): void;

    /**
     * Emitted when the upgrade is found in the headers response HTTP
     * @param eventType Http upgrade event
     * @param callback Callback
     */
    on(eventType: "http_upgrade", callback: () => void): void;

    /**
     * Emitted event of http init, is issued when it is ready to send data to the server
     * @param eventType Http Init Event
     */
    emit(eventType: "http_init"): void;

    /**
     * Emitted after you call the end method and it has been determined 
     * that the server has received all the chunks
     * @param eventType Http finish event
     */
    emit(eventType: "http_finish"): void;

    /**
     * Emitted when the server sends the response header, along with the HTTP status code
     * @param eventType Http response event
     * @param headers headers
     * @param statusCode code of response HTTP
     */
    emit(eventType: "http_response", headers: Headers, statusCode: number): void;

    /**
     * Emitted after receiving the response headers from the server. Emit the data 
     * chunks of the request body
     * @param eventType Http data event
     * @param callback Callback
     */
    emit(eventType: "http_data", chunk: Uint8Array): void;

    /**
     * Emitted when the transmission of chunks of the HTTP request body ends
     * @param eventType Http end event
     */
    emit(eventType: "http_end"): void;

    /**
     * Emitted when the TCP connection is closed
     * @param eventType HTTP close event
     */
    emit(eventType: "http_close"): void;

    /**
     * Emitted when some Error occurs
     * @param eventType Http error event
     * @param err Error
     */
    emit(eventType: "http_error", err: Error): void;

    /**
     * Emitted when the upgrade is found in the headers response HTTP
     * @param eventType Http upgrade event
     */
    emit(eventType: "http_upgrade"): void;

    /**
     * Abort the request HTTP
     * @param err Associated error 
     */
    abort(err?: Error): void;

    /**
     * Write a chunk to send to request HTTP
     * @param chunk Chunk to send
     */
    write(chunk: Uint8Array): void;

    /**
     * End to write chunks and emit request to get response
     */
    end(): void;
}