var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// imports
import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { PrismaClient } from '@prisma/client';
import router from './routes/index.js';
import fileUpload from 'express-fileupload';
import ImageKit from "imagekit";
import AWS from 'aws-sdk';
import { logger } from './logger.js';
import 'dotenv/config';
// assets upload
export const imagekit = new ImageKit({
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
    urlEndpoint: process.env.IK_URL_ENDPOINT
});
// s3
AWS.config.update({ region: process.env.S3_REGION, accessKeyId: process.env.YK_IDENTIFIER, secretAccessKey: process.env.YK_SECRET });
export const s3 = new AWS.S3({
    endpoint: 'https://storage.yandexcloud.net',
});
// prisma init
export const prisma = new PrismaClient({ log: ['query', 'info', 'error'] });
// base consts
const app = express();
const port = process.env.PORT || 3002;
// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload({}));
// app.use(express.static('static'))
// routes
app.use('/api', router);
// check health
app.get('/', (_, res) => {
    res.send("backend");
});
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
//# sourceMappingURL=app.js.map