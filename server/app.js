// imports
import config from 'config';
import express from "express";
import cors from 'cors';
import {pool} from './models/db.js'
import router from './routes/index.js';
import fileUpload from 'express-fileupload';
import ImageKit from "imagekit";
import AWS from 'aws-sdk';

// assets upload
export const imagekit = new ImageKit({
    publicKey : config.get("IK-public-key"),
    privateKey : config.get("IK-private-key"),
    urlEndpoint : config.get("IK-url-endpoint")
})

//S3
AWS.config.update({region: config.get("S3-region"), accessKeyId: config.get("YK-identidier"), secretAccessKey: config.get("YK-secret")})
export const s3 = new AWS.S3({
    endpoint: 'https://storage.yandexcloud.net',
});

// base consts
const app = express()
const port = config.get('PORT')

// middleware
app.use(express.json())
app.use(cors())
app.use(fileUpload({}))
app.use(express.static('static'))

//routes
app.use('/api', router)

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