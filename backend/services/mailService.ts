import _ from "lodash"
import nodemailer from "nodemailer";
import 'dotenv/config.js'
import { getTemplate } from "../utils/getTemplate.js";

class MailServiceClass {
    transport: any;

    constructor() {
        this.transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        })
    }

    async sendActivationMail(to: string, userData: any) {
        await this.transport.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Account activation on ${process.env.SEVICE_NAME}`,
            text: "",
            html: getTemplate(userData)
        })
    }
}

export const MailService = new MailServiceClass()