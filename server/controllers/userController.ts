import { validationResult } from "express-validator";
import { User } from "../models-sequelize/models.js";
import { prisma } from "../app.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import "dotenv/config";
import { FileService } from "../services/fileService.js";
import { File } from "../models-sequelize/models.js";

interface IUser {
  id: number;
  userName: string;
  email: string;
  diskSpace: number;
  usedSpace: number;
  avatar: string | null;
  role: "USER" | "ROOT";
}

const generateJwt = (id: number) => {
  return jwt.sign(
    {
      id,
    },
    process.env.SECRET_KEY as string,
    {
      expiresIn: "12h",
    }
  );
};

class UserControllerClass {
  // контроллер регистрации
  async registration(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      const { userName, email, password } = req.body;
      const candidate = await prisma.user.findUnique({
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

      const hashPassword = await bcrypt.hash(password, 5);

      const user = await prisma.user.create({data: {
        userName,
        email,
        password: hashPassword,
      }})
      const token = generateJwt(user.id);

      const newFile: any = await prisma.file.create({ data: {userId: user.id, name: "" }});

      await FileService.createDir(newFile);

      return res.json({
        token,
        user: {
          id: user.id,
          userName: user.userName,
          email: user.email,
          diskSpace: user.diskSpace,
          usedSpace: user.usedSpace,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.send({
        message: error.message,
      });
    }
  }

  // Контроллер логина
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user: any = await prisma.user.findUnique({
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
          message: `Uncorrect password`,
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
          role: user.role,
        },
      });
    } catch (error: any) {
      res.send({
        message: error.message,
      });
    }
  }

  // Контроллер аутентикации
  async auth(req: any, res: Response) {
    try {
      const id = req.user?.id;
      const user: any = await prisma.user.findUnique({
        where: {
          id,
        },
      });
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
          role: user.role,
        },
      });
    } catch (error: any) {
      res.send({
        message: error.message,
      });
    }
  }

  async changeInfo(req: Request, res: Response) {
    try {
      // const {email, firstName, lastName} = req.body
      // const user = await User.findOne({where: {id: req.user.id}})
      // user.email = email
      // user.firstName = firstName
      // user.lastName = lastName
      // user.save()
      // return res.json(user)
    } catch (error) {
      return res.status(400).json({ message: "change profile info error" });
    }
  }
}

export const UserController = new UserControllerClass();
