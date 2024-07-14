import { Socket } from "socket.io";
import { IRequest, IRequestHTTP } from "../models/requests.model";
import { ErrorNotFoundTunnelProxy } from "../classes/errors.class";

export default class ManageTunnelsProxy {

    private hIdRequest: number = 0;

    private requests: IRequestHTTP[];
    
    private tunnels: {
        socket: Socket,
        proxyName: string
    }[];

    constructor() {
        this.tunnels = [];
        this.requests = [];
    }

    async inicialize() {

    }

    destroy() {

    }

    public RegisterSocket(proxyName: string, socket: Socket): void {
        
        if(!socket.connected) {
            throw new Error("The socket is'nt connected!");
        }
        
        if(this.tunnels.some(tunnelItem => tunnelItem.proxyName === proxyName)) {
            throw new Error("The socket '" + proxyName + "' has been registered");
        }

        console.log(
            "Connection to proxy".green, String(proxyName).cyan, 
            "via socket has been established successfully".green
        );

        // register tunnel
        this.tunnels.push({
            proxyName: proxyName,
            socket: socket
        });

        function abortRequest(id_request: number) {
            socket.emit("http_abort", id_request, "Does not exist the request '" + id_request + "'");
        }

        // listen when disconnect
        socket.on("disconnect", (reason, description) => {
            // remove of memory
            this.tunnels = this.tunnels.filter(tunnelItem => tunnelItem.proxyName !== proxyName);

            // get requests by associated proxyname
            const requestToEnd: IRequestHTTP[] = this.requests.filter(requestItem => (
                requestItem.proxyName === proxyName
            ));

            // earch all request for send events error and close, 
            // earch all request and check if distint of current proxyname 
            // of property **this.requests**
            requestToEnd.forEach(requestItem => {
                requestItem.emit("http_error", new Error("Lost connection to tunnel proxy"));
                requestItem.emit("http_close");
            });

            console.log(
                "Lost Connection to proxy".red, String(proxyName).yellow,
            );
        });

        socket.on("http_init", (id_request: number) => {
            const requestHttp = this.GetRequestHTTP(id_request);

            if(requestHttp) {
                requestHttp.emit("http_init");
            }
            else abortRequest(id_request);
        });

        socket.on("http_finish", (id_request: number) => {
            const requestHttp = this.GetRequestHTTP(id_request);

            if(requestHttp) {
                requestHttp.emit("http_finish");
            }
            else abortRequest(id_request);
        });

        socket.on("http_upgrade", (id_request: number) => {
            const requestHttp = this.GetRequestHTTP(id_request);

            if(requestHttp) {
                requestHttp.emit("http_upgrade");
            }
            else abortRequest(id_request);
        });

        socket.on("http_response", (id_request: number, headers: {[key: string]: string}, statusCode: number) => {
            const requestHttp = this.GetRequestHTTP(id_request);

            if(requestHttp) {
                requestHttp.emit("http_response", new Headers(headers), statusCode);
            }
            else abortRequest(id_request);
        });

        socket.on("http_data", (id_request: number, chunk: Uint8Array) => {
            const requestHttp = this.GetRequestHTTP(id_request);

            if(requestHttp) {
                requestHttp.emit("http_data", chunk);
            }
            else abortRequest(id_request);
        });

        socket.on("http_end", (id_request: number) => {
            const requestHttp = this.GetRequestHTTP(id_request);

            if(requestHttp) {
                requestHttp.emit("http_end");
            }
            else abortRequest(id_request);
        });

        socket.on("http_close", (id_request: number) => {
            const requestHttp = this.GetRequestHTTP(id_request);

            if(requestHttp) {
                requestHttp.emit("http_close");
            }
            else abortRequest(id_request);
        });

        socket.on("http_error", (id_request: number, errorMsg: string) => {
            const requestHttp = this.GetRequestHTTP(id_request);

            if(requestHttp) {
                requestHttp.emit("http_error", new Error(errorMsg));
            }
            else abortRequest(id_request);
        });
    }

    public CreateRequestHTTP(proxyName: string, request: IRequest): IRequestHTTP {
        const tunnel = this.tunnels.find(tunnelItem => tunnelItem.proxyName === proxyName);

        // check if is'nt exist
        if(!tunnel) {
            throw new ErrorNotFoundTunnelProxy("Does not exist the tunnel '" + proxyName + "'");
        }
        
        // request url
        // const url = new URL(request.path, this.hostproxy_url);
        const id_request = ++this.hIdRequest;
        const listenner: {
            eventType: string,
            callback: (...args: any[]) => void
        }[] = [];

        function emitEvent(eventName: string, ...args: any[]) {
            if(tunnel?.socket.connected) {
                tunnel.socket.emit(eventName, ...args);
            }
        }

        const requestHTTP: IRequestHTTP = {

            // ID request
            id_request: id_request,

            // proxyName
            proxyName: proxyName,

            // Add listen
            on(eventType: string, callback: (...args: any[]) => void): void {
                // add listenner
                listenner.push({ eventType, callback })
            },

            // write body
            write(chunk): void {
                emitEvent("http_data", id_request, chunk);
            },

            emit(eventType: string, ...args: any[]): void {
                listenner.forEach(listennerItem => {
                    try {
                        if(listennerItem.eventType === eventType) {
                            listennerItem.callback(...args);
                        }
                    }
                    catch(err) {
                        console.error(err);
                    }
                });
            },

            // end and emit request
            end(): void {
                emitEvent("http_end", id_request);
            },

            // abort request
            abort(err?: Error): void {
                emitEvent("http_abort", id_request, err?.message ?? "Unknow Error");
            }
        };

        // Append listen to close socket tcp
        requestHTTP.on("http_close", () => {
            // remove of memory
            this.requests = this.requests.filter(requestItem => requestItem.id_request !== id_request);
        });

        // Add request of array
        this.requests.push(requestHTTP);

        const headers: {[key: string]: string} = {};

        request.headers.forEach((value, key) => {
            headers[key] = value;
        });

        tunnel.socket.emit("http_request", id_request, {
            ...request,
            headers: headers
        });

        return requestHTTP;
    }

    public GetRequestHTTP(id_request: number): IRequestHTTP | null {
        const request = this.requests.find(requestItem => requestItem.id_request === id_request);
        return request ?? null;
    }


}