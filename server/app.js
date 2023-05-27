// imports
import config from 'config';
import express from "express";
import cors from 'cors';
import {pool} from './models/db.js'
import router from './routes/index.js';
import fileUpload from 'express-fileupload'

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