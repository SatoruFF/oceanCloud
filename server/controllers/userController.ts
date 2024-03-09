import _ from "lodash";
import "dotenv/config";
import { logger } from "../logger.js";

import { UserService } from "../services/userService.js";

import { NextFunction, Request, Response } from "express";

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
  // reg controller
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { userName, email, password } = req.body;

      const userData = await UserService.registration({
        userName,
        email,
        password,
      });

      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message);
      res.status(400).send({
        message: error.message,
      });
    }
  }

  // Login controller
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const userData = await UserService.login(email, password);

      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message);
      res.status(error.status).send({
        message: error.message,
      });
    }
  }

  // auth controller
  async auth(req: any, res: Response) {
    try {
      const id = req.user?.id;

      const userData = await UserService.auth(id);

      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message);
      res.send({
        message: error.message,
      });
    }
  }

  async activate(req: any, res: Response) {
    try {
      const { link } = req.params;

      await UserService.activate(link);

      return res.redirect(process.env.CLIENT_URL || "")
    } catch (error: any) {
      logger.error(error.message);
      res.send({
        message: error.message,
      });
    }
  }

  async refresh(req: any, res: Response) {
    try {
      const { refreshToken } = req.cookies

      const userData = await UserService.refresh(refreshToken);

      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

      return res.json(userData);
    } catch (error: any) {
      logger.error(error.message);
      res.send({
        message: error.message,
      });
    }
  }

  // Need create
  async logout(req: any, res: Response) {
    try {
      const { refreshToken } = req.cookies;

      const user = await UserService.logout(refreshToken)

      res.clearCookie("refreshToken");

      return res.status(200).json({message: `User ${user.email} was successfully logout`});
    } catch (error: any) {
      logger.error(error.message);
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
