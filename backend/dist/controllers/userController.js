var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "dotenv/config.js";
import { logger } from "../logger.js";
import { UserService } from "../services/userService.js";
class UserControllerClass {
    // reg controller
    registration(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userName, email, password } = req.body;
                const userData = yield UserService.registration({
                    userName,
                    email,
                    password,
                });
                res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
                return res.json(userData);
            }
            catch (error) {
                logger.error(error.message);
                res.status(400).send({
                    message: error.message,
                });
            }
        });
    }
    // Login controller
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const userData = yield UserService.login(email, password);
                res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
                return res.json(userData);
            }
            catch (error) {
                logger.error(error.message);
                res.status(error.status).send({
                    message: error.message,
                });
            }
        });
    }
    // auth controller
    auth(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const userData = yield UserService.auth(id);
                return res.json(userData);
            }
            catch (error) {
                logger.error(error.message);
                res.send({
                    message: error.message,
                });
            }
        });
    }
    activate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { link } = req.params;
                yield UserService.activate(link);
                return res.redirect(process.env.CLIENT_URL || "");
            }
            catch (error) {
                logger.error(error.message);
                res.send({
                    message: error.message,
                });
            }
        });
    }
    refresh(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.cookies;
                const userData = yield UserService.refresh(refreshToken);
                res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
                return res.json(userData);
            }
            catch (error) {
                logger.error(error.message);
                res.send({
                    message: error.message,
                });
            }
        });
    }
    // Need create
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.cookies;
                const user = yield UserService.logout(refreshToken);
                res.clearCookie("refreshToken");
                return res.status(200).json({ message: `User ${user.email} was successfully logout` });
            }
            catch (error) {
                logger.error(error.message);
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