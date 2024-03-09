// bases
import express, { Express, Request, Response } from "express";
import router from "./routes/index.js";

// middleware
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

// utils
import { logger } from "./logger.js";
import "dotenv/config";

// performing
import cluster from "cluster";
import { cpus } from "os";
const numCPU = cpus().length;

// base consts
const app: Express = express();
const port = process.env.PORT || 3002;

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload({}));
// app.use(express.static('static'))

// routes
app.use("/api", router);

// check health
app.get("/", (_, res: Response) => {
  res.send("i am alive ;)");
});

if (cluster.isPrimary) {
  // Create a worker for each CPU
  for (let i = 0; i < numCPU; i++) {
    cluster.fork();
  }

  cluster.on("online", function (worker) {
    logger.info("Worker " + worker.process.pid + " is alive.");
  });

  cluster.on("exit", function (worker, code, signal) {
    logger.error("worker " + worker.process.pid + " died.");
  });

} else {

  // main def
  const start = async () => {
    try {
      app.listen(port, () => {
        logger.info(`⚡️[server]: 🚀 Server is running at: ${port}`);
      });
    } catch (e) {
      logger.warn(e);
    }
  };

  start();
  
}
