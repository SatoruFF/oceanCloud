var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { prisma, s3 } from "../configs/config.js";
import createError from "http-errors";
import _ from "lodash";
import "dotenv/config.js";
class FileServiceClass {
    // create dir or file
    createDir(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let folderPath = `${file.userId}/${file.path}`;
            if (!folderPath.endsWith("/")) {
                folderPath += "/";
            }
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: folderPath,
                Body: "",
            };
            const getParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: folderPath,
            };
            yield s3.putObject(params).promise();
            const newDirUrl = yield s3.getSignedUrl("getObject", getParams);
            return newDirUrl;
        });
    }
    // delete file or directory
    deleteBucketFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file.type === "dir") {
                let filePath = `${String(file.userId)}/${file.path}`;
                filePath = filePath.replace(/\/{2,}/g, "/");
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Prefix: filePath,
                };
                const { Contents } = yield s3.listObjectsV2(params).promise();
                if (Contents.length === 0) {
                    return { message: "Folder was deleted" };
                }
                const deleteParams = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Delete: { Objects: [] },
                };
                Contents.forEach(({ Key }) => {
                    deleteParams.Delete.Objects.push({ Key });
                });
                // remove all inner files in directory
                yield s3.deleteObjects(deleteParams).promise();
                if (Contents.IsTruncated) {
                    yield this.deleteBucketFile(file);
                }
                else {
                    yield s3
                        .deleteObject({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: filePath,
                    })
                        .promise();
                }
                return { message: "Folder was deleted" };
            }
            else {
                let filePath = `${String(file.userId)}/${file.path}/${file.name}`;
                filePath = filePath.replace(/\/{2,}/g, "/");
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: filePath,
                };
                yield s3.deleteObject(params).promise();
                return { message: "File was deleted" };
            }
        });
    }
    // get files with search params
    getFiles(sort, search, parentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let files;
            // find by file name
            if (search) {
                files = yield prisma.file.findMany({
                    where: { userId },
                });
                files = _.filter(files, (file) => _.includes(file.name, search));
                return files;
            }
            // find with sort query
            switch (sort) {
                case "name":
                    files = yield prisma.file.findMany({
                        where: {
                            AND: [{ userId }, { parentId }],
                        },
                        orderBy: { name: "asc" },
                    });
                    break;
                case "type":
                    files = yield prisma.file.findMany({
                        where: {
                            AND: [{ userId }, { parentId }],
                        },
                        orderBy: { type: "asc" },
                    });
                    break;
                case "date":
                    files = yield prisma.file.findMany({
                        where: {
                            AND: [{ userId }, { parentId }],
                        },
                        orderBy: { createdAt: "asc" },
                    });
                    break;
                default:
                    files = yield prisma.file.findMany({
                        where: {
                            AND: [{ userId }, { parentId }],
                        },
                    });
                    break;
            }
            return files;
        });
    }
    // upload file
    uploadFile(file, userId, parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.$transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                let parent;
                if (parentId !== "null") {
                    parent = yield trx.file.findFirst({
                        where: { userId, id: Number(parentId) },
                    });
                }
                const user = yield trx.user.findFirst({
                    where: { id: userId },
                });
                // check size on disc after upload
                if (user.usedSpace + BigInt(file.size) > user.diskSpace) {
                    throw createError(400, "Not enough space on the disk");
                }
                user.usedSpace += BigInt(file.size);
                let filePath;
                // find parent with his path
                if (parent) {
                    filePath = `${String(user.id)}/${parent.path}/${file.name}`;
                }
                else {
                    filePath = `${String(user.id)}/${file.name}`;
                }
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: filePath,
                    Body: file.data,
                };
                const newFile = yield s3.upload(params).promise();
                // get url for download new file
                const fileUrl = _.get(newFile, "Location", "");
                const dbFile = yield trx.file.create({
                    data: {
                        name: file.name,
                        type: file.name.split(".").pop(),
                        size: file.size,
                        path: parent === null || parent === void 0 ? void 0 : parent.path,
                        parentId: parent ? parent.id : null,
                        userId: user.id,
                        url: fileUrl,
                    },
                });
                // after we must fill used space
                yield trx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        usedSpace: user.usedSpace,
                    },
                });
                return dbFile;
            }));
        });
    }
    downloadFile(queryId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield prisma.file.findFirst({
                where: { id: Number(queryId), userId },
            });
            let filePath = `${String(userId)}/${file.path}/${file.name}`;
            filePath = filePath.replace(/\/{2,}/g, "/");
            const s3object = yield s3
                .getObject({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `${filePath}`,
            })
                .promise();
            return { file, s3object };
        });
    }
    deleteFile(fileId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.$transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                if (_.isNaN(fileId)) {
                    throw createError(400, "Invalid file ID");
                }
                const file = yield trx.file.findFirst({
                    where: { id: fileId, userId },
                });
                // directory have a content?
                const existInnerContent = yield trx.file.findMany({
                    where: { parentId: file.id },
                });
                if (!_.isEmpty(existInnerContent)) {
                    throw createError(400, "You cannot delete a folder while it has content");
                }
                if (!file) {
                    throw createError(400, "File not found");
                }
                yield this.deleteBucketFile(file);
                yield trx.file.delete({ where: { id: fileId } });
                const user = yield trx.user.findFirst({
                    where: { id: userId },
                });
                user.usedSpace = user.usedSpace - BigInt(file.size);
                yield trx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        usedSpace: user.usedSpace,
                    },
                });
                const allFiles = yield trx.file.findMany({
                    where: { userId },
                });
                return allFiles;
            }));
        });
    }
}
export const FileService = new FileServiceClass();
//# sourceMappingURL=fileService.js.map