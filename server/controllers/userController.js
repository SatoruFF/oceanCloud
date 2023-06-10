import {
    validationResult
} from "express-validator";
import {
    User
} from "../models/models.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import 'dotenv/config'
import { FileService } from "../services/fileService.js"
import { File } from "../models/models.js"

const generateJwt = (id) => {
    return jwt.sign({
            id
        },
        process.env.SECRET_KEY, {
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
                userName,
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
                userName,
                email,
                password: hashPassword
            })
            const token = generateJwt(user.id)

            const newFile = File.build({userId: user.id, name: ''})

            await FileService.createDir(newFile)

            return res.json({
                token,
                user: {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar,
                    role: user.role
                }
            })
        } catch (error) {
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
                    message: `Uncorrect password`
                });
            }

            const token = generateJwt(user.id);

            return res.json({
                token,
                user: {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar,
                    role: user.role
                }
            })
        } catch (error) {
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
                    userName: user.userName,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar,
                    role: user.role
                }
            })
        } catch (error) {
            res.send({
                message: error.message
            })
        }
    }

    async changeInfo(req, res) {
        try {
            // const {email, firstName, lastName} = req.body
            // const user = await User.findOne({where: {id: req.user.id}})
            // user.email = email
            // user.firstName = firstName
            // user.lastName = lastName
            // user.save()
            // return res.json(user)
        } catch (error) {
            return res.status(400).json({message: "change profile info error"})
        }
    }
}

export const UserController = new UserControllerClass();