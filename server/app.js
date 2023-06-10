// imports
import express from "express";
import cors from 'cors';
import {pool} from './models/db.js'
import router from './routes/index.js';
import fileUpload from 'express-fileupload';
import ImageKit from "imagekit";
import AWS from 'aws-sdk';
import 'dotenv/config'

// assets upload
export const imagekit = new ImageKit({
    publicKey : process.env.IK_PUBLIC_KEY,
    privateKey : process.env.IK_PRIVATE_KEY,
    urlEndpoint : process.env.IK_URL_ENDPOINT
})

//S3
AWS.config.update({region: process.env.S3_REGION, accessKeyId: process.env.YK_IDENTIFIER, secretAccessKey: process.env.YK_SECRET})
export const s3 = new AWS.S3({
    endpoint: 'https://storage.yandexcloud.net',
});

// base consts
const app = express()
const port = process.env.PORT || 3002

// middleware
app.use(express.json())
app.use(cors())
app.use(fileUpload({}))
app.use(express.static('static'))

//routes
app.use('/api', router)

app.get('/', (_, res) => {
    res.send("backend")
})

// main def
const start = async () => {
    try {
        await pool.authenticate()
        await pool.sync()
        app.listen(port, () => {
            console.log(`App listen on port: ${port}`)
        })
    } catch (e) {
        console.log(e)
    }
}
start()