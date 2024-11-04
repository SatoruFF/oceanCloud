var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// bases
import express from "express";
import router from "./routes/index.js";
// middleware
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
// utils
import { logger } from "./logger.js";
import "dotenv/config.js";
// performing
import cluster from "cluster";
import { cpus } from "os";
const numCPU = cpus().length;
// base consts
const app = express();
const port = process.env.PORT || 3002;
// middleware
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({}));
// app.use(express.static('static'))
// routes
app.use("/api", router);
// check health
app.get("/", (_, res) => {
    res.send("i am alive ;)");
});
if (cluster.isPrimary) {
    // Create a worker for each CPU
    for (let i = 0; i < 1; i++) {
        cluster.fork();
    }
    cluster.on("online", function (worker) {
        logger.info("Worker " + worker.process.pid + " is alive.");
    });
    cluster.on("exit", function (worker, code, signal) {
        logger.error("worker " + worker.process.pid + " died.");
    });
}
else {
    // main def
    const start = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            app.listen(port, () => {
                logger.info(`⚡️[server]: 🚀 Server is running at: ${port}`);
            });
        }
        catch (e) {
            logger.warn(e);
        }
    });
    start();
}
//# sourceMappingURL=app.js.map