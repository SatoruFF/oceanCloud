var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { s3 } from "../app.js";
import 'dotenv/config';
class FileServiceClass {
    createDir(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let folderPath = `${file.userId}/${file.path}`;
            if (!folderPath.endsWith('/')) {
                folderPath += '/';
            }
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: folderPath,
                Body: '',
            };
            const getParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: folderPath,
            };
            yield s3.putObject(params).promise();
            const newDirUrl = yield s3.getSignedUrl('getObject', getParams);
            console.log(typeof newDirUrl);
            return newDirUrl;
        });
    }
    deleteFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file.type === 'dir') {
                let filePath = `${String(file.userId)}/${file.path}`;
                filePath = filePath.replace(/\/{2,}/g, '/');
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
                yield s3.deleteObjects(deleteParams).promise();
                if (Contents.IsTruncated) {
                    yield this.deleteFile(file);
                }
                else {
                    yield s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: filePath }).promise();
                }
                return { message: "Folder was deleted" };
            }
            else {
                let filePath = `${String(file.userId)}/${file.path}/${file.name}`;
                filePath = filePath.replace(/\/{2,}/g, '/');
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: filePath,
                };
                yield s3.deleteObject(params).promise();
                return { message: "File was deleted" };
            }
        });
    }
}
export const FileService = new FileServiceClass();
//# sourceMappingURL=fileService.js.map