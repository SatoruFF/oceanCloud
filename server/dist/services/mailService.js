var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from "nodemailer";
import 'dotenv/config';
import { getTemplate } from "../utils/getTemplate.js";
class MailServiceClass {
    constructor() {
        this.transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        });
    }
    sendActivationMail(to, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transport.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject: `Account activation on ${process.env.SEVICE_NAME}`,
                text: "",
                html: getTemplate(userData)
            });
        });
    }
}
export const MailService = new MailServiceClass();
//# sourceMappingURL=mailService.js.map