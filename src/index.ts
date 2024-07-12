import dotenv from "dotenv";
import process from "process";
import ServerProxy from "./server";
import Package from "../package.json";

/***************************************
 * Settings initial
 ***************************************/

// config environments
const configOutput = dotenv.config();

// check error
if(configOutput.error) {
    throw configOutput.error;
}

// check environment
if(!process.env.PORT) throw new Error("'PORT' environment is'nt defined");


/****************************************
 * Start application
 ***************************************/

// instance server
const server = new ServerProxy(process.env.PORT);

// start server
server.inicialize()
    .then(() => {
        const dateTime = new Date();
        const mode = process.env.NODE_ENV === "production" ? "production" : "development"

        console.log("Server", mode, "V" + Package.version, "-", dateTime.toLocaleString());
        console.log("\nlisten in: http://localhost:" + process.env.PORT);
    })
    .catch((err) => {
        console.error(err);
    });