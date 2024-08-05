export interface IWebsocketRequest {
    headers: Headers,
    path: string,
}

export type ITypeEventRequestHTTP =
    | "websocket_request"
    | "websocket_init"
    | "websocket_data"
    | "websocket_finish"
    | "websocket_response"
    | "websocket_upgrade"
    | "websocket_close"
    | "websocket_error"
    | "websocket_end"


export interface IWebsocketConnection {

    /**
     * ID connection
     */
    id_connection: number;

    /**
     * Proxy name
     */
    proxyName: string;

    /**
     * Emitted when the connection has been establish
     * @param eventType Event Type
     * @param callback Callback
     */
    on(eventType: "websocket_open", callback: () => void): void;

    /**
     * Emitted when the connection has been disconnect
     * @param eventType Event Type
     * @param callback Callback
     */
    on(eventType: "websocket_close", callback: () => void): void;

    /**
     * Emitted when the connection has occured an error
     * @param eventType Event Type
     * @param callback Callback
     */
    on(eventType: "websocket_error", callback: (err: Error) => void): void;

    /**
     * Emitted when the connection receive a message
     * @param eventType Event Type
     * @param callback Callback
     */
    on(eventType: "websocket_message", callback: (message: Buffer, isBinary: boolean) => void): void;

    /**
     * Emitted when the connection has been establish
     * @param eventType Event Type
     * @param callback Callback
     */
    emit(eventType: "websocket_open"): void;

    /**
     * Emitted when the connection has been disconnect
     * @param eventType Event Type
     * @param callback Callback
     */
    emit(eventType: "websocket_close"): void;

    /**
     * Emitted when the connection has occured an error
     * @param eventType Event Type
     * @param callback Callback
     */
    emit(eventType: "websocket_error", error: Error): void;

    /**
     * Emitted when the connection receive a message
     * @param eventType Event Type
     * @param callback Callback
     */
    emit(eventType: "websocket_message", message: Buffer, isBinary: boolean): void;
    
    /**
     * Close the connection
     * @param err Associated error 
     */
    close(err?: Error): void;

    /**
     * Send message
     * @param chunk Chunk to send
     */
    send(chunk: Uint8Array | string): void;
}