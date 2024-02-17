import nodemailer from "nodemailer";
import 'dotenv/config'
import _ from "lodash"

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

    async sendActivationMail(to: string, link: string) {
        await this.transport.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Account activation on ${process.env.SEVICE_NAME}`
            text: "",
            html: `
                <div>
                    <h1>Follow link for activation</h1>
                    <a href="${link}">follow...</a>
                </div>
            `
        })
    }
}

export const MailService = new MailServiceClass()