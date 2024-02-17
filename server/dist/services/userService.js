var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from "bcrypt";
import 'dotenv/config';
import { v4 as uuidv4 } from "uuid";
import { generateJwt } from "../utils/generateJwt.js";
import createError from "http-errors";
import { FileService } from "../services/fileService.js";
import { MailService } from "./mailService.js";
import { prisma } from "../app.js";
import { UserDto } from "../dtos/user-dto.js";
class UserServiceClass {
    registration(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate user data
            const candidate = yield prisma.user.findUnique({
                where: {
                    email: userData.email,
                },
            });
            if (candidate) {
                createError(400, `User with email: ${userData.email} already exists`);
            }
            // create user in dataBase
            const hashPassword = yield bcrypt.hash(userData.password, 5);
            let activationLink = uuidv4();
            const user = yield prisma.user.create({
                data: {
                    userName: userData.userName,
                    email: userData.email,
                    password: hashPassword,
                    activationLink,
                },
            });
            activationLink = `${process.env.API_URL}/api/activate/${activationLink}`;
            yield MailService.sendActivationMail(userData.email, activationLink);
            const { accessToken, refreshToken } = generateJwt(user.id);
            yield prisma.user.update({
                where: { id: user.id },
                data: { refreshToken },
            });
            // to-do: add internationalization and select to language option
            yield prisma.userConfig.create({
                data: {
                    userId: user.id,
                },
            });
            const baseDir = { userId: user.id, path: "", type: "dir", name: "" };
            // create new base dir for user
            yield FileService.createDir(baseDir);
            const diskSpace = user.diskSpace.toString();
            const usedSpace = user.usedSpace.toString();
            const userDto = new UserDto({
                token: accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    diskSpace,
                    usedSpace,
                    avatar: user.avatar,
                    role: user.role,
                },
            });
            return userDto;
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: {
                    email,
                },
            });
            if (!user) {
                createError(400, `User with email: ${email} not found`);
            }
            const isPassValid = bcrypt.compareSync(password, user.password);
            if (!isPassValid) {
                createError(400, `Uncorrect data`);
            }
            const { accessToken } = generateJwt(user.id);
            const diskSpace = user.diskSpace.toString();
            const usedSpace = user.usedSpace.toString();
            return {
                token: accessToken,
                user: {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    diskSpace,
                    usedSpace,
                    avatar: user.avatar,
                    role: user.role,
                },
            };
        });
    }
    auth(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: {
                    id,
                },
            });
            const token = generateJwt(user.id);
            const diskSpace = user.diskSpace.toString();
            const usedSpace = user.usedSpace.toString();
            return {
                token,
                user: {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    diskSpace,
                    usedSpace,
                    avatar: user.avatar,
                    role: user.role,
                },
            };
        });
    }
    activate(activationLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findFirst({
                where: {
                    activationLink
                }
            });
            if (!user) {
                createError('404', "user not found");
            }
            yield prisma.user.update({ isActivated: true });
        });
    }
}
export const UserService = new UserServiceClass();
//# sourceMappingURL=userService.js.map