var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// base
import { prisma, imagekit } from "../configs/config.js";
// utils
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import createError from "http-errors";
import { createReadStream } from "streamifier";
class AvatarClass {
    uploadAvatar(fileBuffer, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileStream = createReadStream(fileBuffer);
            const avatarName = uuidv4() + ".png";
            const user = yield prisma.user.findFirst({
                where: { id: userId },
            });
            // in first, we must delete old avatar
            if (user.avatar) {
                const fileList = yield imagekit.listFiles();
                const file = _.isArray(fileList) &&
                    fileList.find((file) => file.url === user.avatar);
                const fileId = file ? file.fileId : null;
                yield imagekit.deleteFile(fileId);
            }
            const uploadedImage = yield imagekit.upload({
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
            user.avatar = uploadedImage.url;
            yield prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    avatar: user.avatar,
                },
            });
            return user.avatar;
        });
    }
    deleteAvatar(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findFirst({
                where: { id: userId },
            });
            if (!user.avatar) {
                throw createError(404, "avatar not found");
            }
            const fileList = yield imagekit.listFiles();
            const file = _.isArray(fileList) && fileList.find((file) => file.url === user.avatar);
            const fileId = file ? file.fileId : null;
            yield imagekit.deleteFile(fileId);
            user.avatar = null;
            yield prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    avatar: user.avatar,
                },
            });
            user.diskSpace = user.diskSpace.toString();
            user.usedSpace = user.usedSpace.toString();
            return user;
        });
    }
}
export const Avatar = new AvatarClass();
//# sourceMappingURL=avatar.js.map