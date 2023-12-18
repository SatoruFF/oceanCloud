// imports
import express, { Express, Request, Response } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { PrismaClient } from '@prisma/client'
import router from './routes/index.js';
import fileUpload from 'express-fileupload';
import ImageKit from "imagekit";
import AWS from 'aws-sdk';
import { logger } from './logger.js'
import 'dotenv/config'

interface ImageKitConfig {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
  }

// assets upload
export const imagekit = new ImageKit({
    publicKey : process.env.IK_PUBLIC_KEY,
    privateKey : process.env.IK_PRIVATE_KEY,
    urlEndpoint : process.env.IK_URL_ENDPOINT
} as ImageKitConfig)

// s3
AWS.config.update({region: process.env.S3_REGION, accessKeyId: process.env.YK_IDENTIFIER, secretAccessKey: process.env.YK_SECRET})
export const s3: any = new AWS.S3({
    endpoint: 'https://storage.yandexcloud.net',
});

// prisma init
export const prisma = new PrismaClient({ log: ['query', 'info', 'error'] })

// base consts
const app: Express = express()
const port = process.env.PORT || 3002

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(fileUpload({}))
// app.use(express.static('static'))

// routes
app.use('/api', router)

// check health
app.get('/', (_, res: Response) => {
    res.send("backend")
})

// main def
const start = async () => {
    try {
        app.listen(port, () => {
            logger.info(`⚡️[server]: 🚀 Server is running at: ${port}`)
        })
    } catch (e) {
        logger.warn(e)
    }
}
start()