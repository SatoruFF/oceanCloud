import "dotenv/config";
// services
import ImageKit from "imagekit";
import AWS from "aws-sdk";
import { PrismaClient } from "@prisma/client";
// assets upload
export const imagekit = new ImageKit({
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
    urlEndpoint: process.env.IK_URL_ENDPOINT,
});
// s3
AWS.config.update({
    region: process.env.S3_REGION,
    accessKeyId: process.env.YK_IDENTIFIER,
    secretAccessKey: process.env.YK_SECRET,
});
export const s3 = new AWS.S3({
    endpoint: "https://storage.yandexcloud.net",
});
// prisma init
export const prisma = new PrismaClient({ log: ["query", "info", "error"] });
//# sourceMappingURL=config.js.map