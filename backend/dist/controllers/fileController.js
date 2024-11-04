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
import { prisma } from "../configs/config.js";
import { FileService } from "../services/fileService.js";
import { Avatar } from "../helpers/avatar.js";
// Utils
import _ from "lodash";
import { PassThrough } from "stream";
import createError from "http-errors";
import { logger } from "../logger.js";
import "dotenv/config.js";
class FileControllerClass {
    /**
     * Creates a new directory for the user.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<Response>} The created directory information or error message.
     */
    createDir(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, type, parent } = req.body;
                const userId = _.get(req, ["user", "id"]);
                const doubledFolder = yield prisma.file.findFirst({
                    where: { name, parentId: parent },
                });
                if (!_.isEmpty(doubledFolder)) {
                    return res.status(400).json({ message: "Folder name is not unique!" });
                }
                const fileInstance = {
                    name,
                    type,
                    parentId: parent,
                    userId,
                    path: "",
                    url: "",
                };
                let itemUrl;
                if (parent == null) {
                    fileInstance.path = name;
                    itemUrl = yield FileService.createDir(fileInstance);
                }
                else {
                    const parentFile = yield prisma.file.findFirst({
                        where: { id: parent, userId },
                    });
                    if (_.isEmpty(parentFile)) {
                        throw createError(400, "Parent directory not found");
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
                logger.error(error);
                return res.status(400).json({ message: error.message });
            }
        });
    }
    /**
     * Retrieves files for the user based on sort, search, and parent folder.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<Response>} The list of files or error message.
     */
    getFiles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sort, search } = req.query;
                let parentId = parseInt(req.query.parent) || null;
                const userId = _.get(req, ["user", "id"]);
                const files = yield FileService.getFiles(sort, search, parentId, userId);
                return res.json(files);
            }
            catch (error) {
                logger.error(error);
                return res.status(500).json({ message: "Unable to retrieve files" });
            }
        });
    }
    /**
     * Uploads a file for the user to the storage.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<Response>} The uploaded file data or error message.
     */
    uploadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = req.files.file;
                const userId = req.user.id;
                const parentId = req.body.parent;
                const savedFile = yield FileService.uploadFile(file, userId, parentId);
                return res.json(savedFile);
            }
            catch (error) {
                logger.error(error);
                return res.status(400).json({ message: "Upload error" });
            }
        });
    }
    /**
     * Downloads a file for the user.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<Response>} The downloaded file stream or error message.
     */
    downloadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const queryId = req.query.id;
                const { s3object, file } = yield FileService.downloadFile(queryId, userId);
                const stream = new PassThrough();
                stream.end(s3object.Body);
                res.setHeader("Content-disposition", "attachment; filename=" + file.name);
                res.setHeader("Content-type", file.type);
                res.attachment(file.name);
                stream.pipe(res);
            }
            catch (error) {
                logger.error(error);
                return res.status(500).json({ message: "Unable to download file" });
            }
        });
    }
    /**
     * Deletes a file for the user.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<Response>} The updated file list or error message.
     */
    deleteFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileId = Number(req.query.id);
                const userId = req.user.id;
                const allFiles = yield FileService.deleteFile(fileId, userId);
                return res.json(allFiles);
            }
            catch (error) {
                logger.error(error);
                return res.status(500).json({ message: error.message });
            }
        });
    }
    /**
     * Uploads an avatar for the user.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<Response>} The avatar URL or error message.
     */
    uploadAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileBuffer = req.files.file.data;
                const userId = req.user.id;
                const avatarUrl = yield Avatar.uploadAvatar(fileBuffer, userId);
                return res.json(avatarUrl);
            }
            catch (error) {
                logger.error(error);
                return res.status(400).json({ message: error.message });
            }
        });
    }
    /**
     * Deletes the user's avatar.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<Response>} The user data after avatar deletion or error message.
     */
    deleteAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const user = yield Avatar.deleteAvatar(userId);
                return res.json(user);
            }
            catch (error) {
                logger.error(error);
                return res.status(400).json({ message: error.message });
            }
        });
    }
}
export const FileController = new FileControllerClass();
//# sourceMappingURL=fileController.js.map