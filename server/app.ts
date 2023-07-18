// imports
import express, { Express, Request, Response } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
//import {pool} from './models/db.js'
import router from './routes/index.js';
import fileUpload from 'express-fileupload';
import ImageKit from "imagekit";
import AWS from 'aws-sdk';
import 'dotenv/config'

interface ImageKitConfig {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
  }

// assets upload
export const imagekit: any = new ImageKit({
    publicKey : process.env.IK_PUBLIC_KEY,
    privateKey : process.env.IK_PRIVATE_KEY,
    urlEndpoint : process.env.IK_URL_ENDPOINT
} as ImageKitConfig)

//S3
AWS.config.update({region: process.env.S3_REGION, accessKeyId: process.env.YK_IDENTIFIER, secretAccessKey: process.env.YK_SECRET})
export const s3: any = new AWS.S3({
    endpoint: 'https://storage.yandexcloud.net',
});

//Prisma init
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()

// base consts
const app = express()
const port = process.env.PORT || 3002

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(fileUpload({}))
app.use(express.static('static'))

//routes
app.use('/api', router)

app.get('/', (_, res: Response) => {
    res.send("backend")
})

// main def
const start = async () => {
    try {
        // await pool.authenticate()
        // await pool.sync({alter: true})
        app.listen(port, () => {
            console.log(`⚡️[server]: 🚀 Server is running at: ${port}`)
        })
    } catch (e) {
        console.log(e)
    }
}
start()