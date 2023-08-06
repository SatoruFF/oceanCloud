var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { validationResult } from "express-validator";
import { prisma } from "../app.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { FileService } from "../services/fileService.js";
const generateJwt = (id) => {
    return jwt.sign({
        id,
    }, process.env.SECRET_KEY, {
        expiresIn: "12h",
    });
};
class UserControllerClass {
    // контроллер регистрации
    registration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = validationResult(req);
                const { userName, email, password } = req.body;
                const candidate = yield prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });
                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        message: "Uncorrect request",
                        errors,
                    });
                }
                if (candidate) {
                    return res.status(400).json({
                        message: `User with email: ${email} already exist`,
                    });
                }
                const hashPassword = yield bcrypt.hash(password, 5);
                const user = yield prisma.user.create({ data: {
                        userName,
                        email,
                        password: hashPassword,
                    } });
                const userSettings = yield prisma.userConfig.create({ data: {
                        userId: user.id
                    } });
                const token = generateJwt(user.id);
                const baseDir = { userId: user.id, path: "", type: 'dir', name: "" };
                yield FileService.createDir(baseDir);
                const diskSpace = user.diskSpace.toString();
                const usedSpace = user.usedSpace.toString();
                return res.json({
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
                });
            }
            catch (error) {
                res.send({
                    message: error.message,
                });
            }
        });
    }
    // Контроллер логина
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield prisma.user.findUnique({
                    where: {
                        email,
                    },
                });
                if (!user) {
                    return res.status(404).json({
                        message: `User with email: ${email} not found`,
                    });
                }
                const isPassValid = bcrypt.compareSync(password, user.password);
                if (!isPassValid) {
                    return res.status(400).json({
                        message: `Uncorrect data`,
                    });
                }
                const token = generateJwt(user.id);
                const diskSpace = user.diskSpace.toString();
                const usedSpace = user.usedSpace.toString();
                return res.json({
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
                });
            }
            catch (error) {
                res.send({
                    message: error.message,
                });
            }
        });
    }
    // Контроллер аутентификации
    auth(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const user = yield prisma.user.findUnique({
                    where: {
                        id,
                    },
                });
                const token = generateJwt(user.id);
                const diskSpace = user.diskSpace.toString();
                const usedSpace = user.usedSpace.toString();
                return res.json({
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
                });
            }
            catch (error) {
                res.send({
                    message: error.message,
                });
            }
        });
    }
    changeInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const {email, firstName, lastName} = req.body
                // const user = await User.findOne({where: {id: req.user.id}})
                // user.email = email
                // user.firstName = firstName
                // user.lastName = lastName
                // user.save()
                // return res.json(user)
            }
            catch (error) {
                return res.status(400).json({ message: "change profile info error" });
            }
        });
    }
}
export const UserController = new UserControllerClass();
//# sourceMappingURL=userController.js.map