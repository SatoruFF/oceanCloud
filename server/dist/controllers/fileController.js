var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// services
import { prisma, s3 } from "../app.js";
import { imagekit } from "../app.js";
import { FileService } from "../services/fileService.js";
// Utils
import { v4 as uuidv4 } from "uuid";
import { createReadStream } from "streamifier";
import { PassThrough } from "stream";
// Config
import "dotenv/config";
// Tools
import _ from "lodash";
class FileControllerClass {
    createDir(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, type, parent } = req.body;
                const isDouble = yield prisma.file.findFirst({ where: { name, parentId: parent } });
                if (!_.isEmpty(isDouble)) {
                    return res.status(400).json({ message: "Folder name is not unique!" });
                }
                const fileInstance = {
                    name,
                    type,
                    parentId: parent,
                    userId: req.user.id,
                    path: "",
                    url: '',
                };
                let itemUrl;
                if (parent == null) {
                    fileInstance.path = name;
                    itemUrl = yield FileService.createDir(fileInstance);
                }
                else {
                    const parentFile = yield prisma.file.findFirst({
                        where: { id: parent, userId: req.user.id },
                    });
                    if (_.isEmpty(parentFile)) {
                        return res
                            .status(400)
                            .json({ message: "Parent directory not found" });
                    }
                    fileInstance.path = `${parentFile.path}/${name}`;
                    itemUrl = yield FileService.createDir(fileInstance);
                }
                fileInstance.url = itemUrl;
                const file = yield prisma.file.create({
                    data: fileInstance,
                });
                return res.json(file);
            }
            catch (error) {
                console.log(error);
                return res.status(400).json({ message: error.message });
            }
        });
    }
    getFiles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sort } = req.query;
                let parentId = req.query.parent || null;
                if (typeof parentId == 'string') {
                    parentId = Number(parentId);
                }
                const searchItem = req.query.search;
                if (searchItem) {
                    let files = yield prisma.file.findMany({
                        where: { userId: req.user.id },
                    });
                    files = _.filter(files, (file) => _.includes(file.name, searchItem));
                    return res.json(files);
                }
                let files;
                switch (sort) {
                    case "name":
                        files = yield prisma.file.findMany({
                            where: {
                                AND: [{ userId: req.user.id }, { parentId }],
                            },
                            orderBy: { name: "asc" },
                        });
                        break;
                    case "type":
                        files = yield prisma.file.findMany({
                            where: {
                                AND: [{ userId: req.user.id }, { parentId }],
                            },
                            orderBy: { type: "asc" },
                        });
                        break;
                    case "date":
                        files = yield prisma.file.findMany({
                            where: {
                                AND: [{ userId: req.user.id }, { parentId }],
                            },
                            orderBy: { createdAt: "asc" },
                        });
                        break;
                    default:
                        files = yield prisma.file.findMany({
                            where: {
                                AND: [{ userId: req.user.id }, { parentId }],
                            },
                        });
                        break;
                }
                return res.json(files);
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Unable to retrieve files" });
            }
        });
    }
    uploadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = req.files.file;
                const currentUserId = req.user.id;
                let parent;
                if (req.body.parent !== "null") {
                    parent = yield prisma.file.findFirst({
                        where: { userId: currentUserId, id: Number(req.body.parent) },
                    });
                }
                const user = yield prisma.user.findFirst({
                    where: { id: currentUserId },
                });
                if (user.usedSpace + BigInt(file.size) > user.diskSpace) {
                    return res
                        .status(400)
                        .json({ message: "Not enough space on the disk!" });
                }
                user.usedSpace += BigInt(file.size);
                let filePath;
                if (parent) {
                    filePath = `${String(user.id)}/${parent.path}/${file.name}`;
                }
                else {
                    filePath = `${String(user.id)}/${file.name}`;
                }
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: filePath,
                    Body: req.files.file.data,
                };
                const newFile = yield s3.upload(params).promise();
                const fileUrl = _.get(newFile, 'Location', "");
                const dbFile = yield prisma.file.create({
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
                yield prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        usedSpace: user.usedSpace
                    }
                });
                return res.json(dbFile);
            }
            catch (error) {
                console.log(error);
                return res.status(400).json({ message: "Upload error" });
            }
        });
    }
    downloadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUserId = req.user.id;
                const queryId = req.query.id;
                const file = yield prisma.file.findFirst({
                    where: { id: Number(queryId), userId: currentUserId },
                });
                let filePath = `${String(currentUserId)}/${file.path}/${file.name}`;
                filePath = filePath.replace(/\/{2,}/g, "/");
                const s3object = yield s3
                    .getObject({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `${filePath}`,
                })
                    .promise();
                const stream = new PassThrough(); // создаем новый поток
                stream.end(s3object.Body); // записываем данные из s3object.Body в поток
                res.setHeader("Content-disposition", "attachment; filename=" + file.name);
                res.setHeader("Content-type", file.type);
                res.attachment(file.name);
                stream.pipe(res); // передаем поток в res.download()
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Unable to download file" });
            }
        });
    }
    deleteFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileId = Number(req.query.id);
                if (isNaN(fileId)) {
                    return res.status(400).json({ message: "Invalid file ID" });
                }
                const file = yield prisma.file.findFirst({
                    where: { id: fileId, userId: req.user.id },
                });
                const existInnerContent = yield prisma.file.findMany({
                    where: { parentId: file.id },
                });
                if (!_.isEmpty(existInnerContent)) {
                    return res
                        .status(400)
                        .json({ message: "You cannot delete a folder while it has content" });
                }
                if (!file) {
                    return res.status(400).json({ message: "File not found" });
                }
                FileService.deleteFile(file);
                yield prisma.file.delete({ where: { id: fileId } });
                const user = yield prisma.user.findFirst({
                    where: { id: req.user.id },
                });
                user.usedSpace = user.usedSpace - BigInt(file.size);
                yield prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        usedSpace: user.usedSpace
                    }
                });
                const allFiles = yield prisma.file.findMany({ where: { userId: req.user.id } });
                return res.json(allFiles);
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Unable to delete file" });
            }
        });
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    uploadAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileBuffer = req.files.file.data;
                const fileStream = createReadStream(fileBuffer);
                const avatarName = uuidv4() + ".png";
                const user = yield prisma.user.findFirst({ where: { id: req.user.id } });
                // in first, we must delete old avatar
                if (user.avatar) {
                    const fileList = yield imagekit.listFiles();
                    const file = fileList.find((file) => file.url === user.avatar);
                    const fileId = file ? file.fileId : null;
                    imagekit.deleteFile(fileId, function (error, result) {
                        if (error)
                            console.log(error);
                        else
                            console.log(result);
                    });
                }
                const response = yield imagekit.upload({
                    file: fileStream,
                    fileName: avatarName,
                    extensions: [
                        {
                            name: "google-auto-tagging",
                            maxTags: 5,
                            minConfidence: 95,
                        },
                    ],
                });
                user.avatar = response.url;
                yield prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        avatar: user.avatar
                    }
                });
                return res.json(user.avatar);
            }
            catch (error) {
                console.log(error);
                return res.status(400).json({ message: error.message });
            }
        });
    }
    deleteAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma.user.findFirst({ where: { id: req.user.id } });
                if (user.avatar) {
                    const fileList = yield imagekit.listFiles();
                    const file = fileList.find((file) => file.url === user.avatar);
                    const fileId = file ? file.fileId : null;
                    imagekit.deleteFile(fileId, function (error, result) {
                        if (error)
                            console.log(error);
                        else
                            console.log(result);
                    });
                    user.avatar = null;
                    yield prisma.user.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            avatar: user.avatar
                        }
                    });
                    user.diskSpace = user.diskSpace.toString();
                    user.usedSpace = user.usedSpace.toString();
                    return res.json(user);
                }
                return res.json({ message: "avatar not found" });
            }
            catch (error) {
                console.log(error);
                return res.status(400).json({ message: error.message });
            }
        });
    }
}
export const FileController = new FileControllerClass();
//# sourceMappingURL=fileController.js.map