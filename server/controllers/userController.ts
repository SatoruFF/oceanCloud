import { prisma } from "../app.js";
import { NextFunction, Request, Response } from "express";
import "dotenv/config";
import  _ from 'lodash'
import { UserService } from "../services/userService.js";
import bcrypt from "bcrypt";
import { generateJwt } from "../utils/generateJwt";
import { logger } from "../logger.js";

interface IUser {
  id: number;
  userName: string;
  email: string;
  diskSpace: number;
  usedSpace: number;
  avatar: string | null;
  role: "USER" | "ROOT";
}

class UserControllerClass {
  // контроллер регистрации
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { userName, email, password } = req.body;
      const userData = await UserService.registration({userName, email, password})
      return res.json(userData);
    } catch (error: any) {
      res.status(400).send({
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
          message: `Uncorrect data`,
        });
      }

      const { accessToken } = generateJwt(user.id);

      const diskSpace = user.diskSpace.toString();
      const usedSpace = user.usedSpace.toString();

      return res.json({
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
      });
    } catch (error: any) {
      logger.error(error)
      res.send({
        message: error.message,
      });
    }
  }


  // Контроллер аутентификации
  async auth(req: any, res: Response) {
    try {
      const id = req.user?.id;
      const user: any = await prisma.user.findUnique({
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

  async activate(req: any, res: Response) {
    try {
      const {link} = req.params
    } catch (error) {
      
    }
  }

  async refresh(req: any, res: Response) {
    try {
    } catch (error) {
      
    }
  }

  // Need create
  async logout(req: any, res: Response) {
    try {
      const id = req.user?.id;
      const user: any = await prisma.user.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      
    }
  }
}

export const UserController = new UserControllerClass();
