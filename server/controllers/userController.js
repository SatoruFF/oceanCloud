import {
    validationResult
} from "express-validator";
import {
    User
} from "../models/models.js";
import config from 'config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { FileService } from "../services/fileService.js"
import { File } from "../models/models.js"

const generateJwt = (id) => {
    return jwt.sign({
            id
        },
        config.get("SECRET-KEY"), {
            expiresIn: '12h'
        },
    )
}

class UserControllerClass {
    // контроллер регистрации
    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            const {
                firstName,
                lastName,
                email,
                password
            } = req.body
            const candidate = await User.findOne({
                where: {
                    email
                }
            })

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Uncorrect request',
                    errors
                })
            }
            if (candidate) {
                return res.status(400).json({
                    message: `User with email: ${email} already exist`
                })
            }

            const hashPassword = await bcrypt.hash(password, 5)

            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashPassword
            })
            const token = generateJwt(user.id)

            await FileService.createDir(new File({user: user.id, name: ''}))

            return res.json({
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar,
                    role: user.role
                }
            })
        } catch (error) {
            console.log(error)
            res.send({
                message: error.message
            })
        }
    }

    // Контроллер логина
    async login(req, res, next) {
        try {
            const {
                email,
                password
            } = req.body;
            const user = await User.findOne({
                where: {
                    email
                }
            });

            if (!user) {
                return res
                    .status(404)
                    .json({
                        message: `User with email: ${email} not found`
                    });
            }

            const isPassValid = bcrypt.compareSync(password, user.password);

            if (!isPassValid) {
                return res.status(400).json({
                    message: `Incorrect password`
                });
            }

            const token = generateJwt(user.id);

            return res.json({
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar,
                    role: user.role
                }
            })
        } catch (error) {
            console.log(error)
            res.send({
                message: error.message
            })
        }
    }

    // Контроллер авторизации
    async auth(req, res, next) {
        try {
            const id = req.user.id
            const user = await User.findOne({
                where: {
                    id
                }
            })
            const token = generateJwt(user.id);
            return res.json({
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar,
                    role: user.role
                }
            })
        } catch (error) {
            console.log(error)
            res.send({
                message: error.message
            })
        }
    }
}

export const UserController = new UserControllerClass();