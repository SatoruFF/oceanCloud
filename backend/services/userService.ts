// base
import { FileService } from "./fileService.js";
import { MailService } from "./mailService.js";
import { prisma } from "../configs/config.js";
import { UserDto } from "../dtos/user-dto.js";

// utils
import _ from "lodash";
import bcrypt from "bcrypt";
import "dotenv/config.js";
import { v4 as uuidv4 } from "uuid";
import { generateJwt } from "../utils/generateJwt.js";
import createError from "http-errors";
import { validateRefreshToken } from "../utils/validateJwt.js";

interface IUserData {
  email: string;
  password: string;
  userName?: string;
}

class UserServiceClass {
  // async createUser() {

  // }  
  
  async registration(userData: IUserData) {
    return prisma.$transaction(async (trx) => {
      // Validate user data
      const candidate = await trx.user.findUnique({
        where: {
          email: userData.email,
        },
      });

      if (candidate) {
        throw createError(
          400,
          `User with email: ${userData.email} already exists`
        );
      }

      // create user in dataBase
      const hashPassword = await bcrypt.hash(userData.password, 5);

      let activationLink: string = uuidv4();

      const user = await trx.user.create({
        data: {
          userName: userData.userName,
          email: userData.email,
          password: hashPassword,
          activationLink,
        },
      });

      activationLink = `${process.env.API_URL}/api/user/activate/${activationLink}`;

      await MailService.sendActivationMail(userData.email, {
        ...user,
        activationLink,
      });

      const { accessToken, refreshToken } = generateJwt(user.id);

      await trx.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // to-do: add internationalization and select to language option
      await trx.userConfig.create({
        data: {
          userId: user.id,
        },
      });

      const baseDir = { userId: user.id, path: "", type: "dir", name: "" };

      // create new base dir for user
      await FileService.createDir(baseDir);

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
          isActivated: user.isActivated,
          role: user.role,
        },
      });

      return userDto;
    });
  }

  // async createInvite(userName: string, email: string, password: string) {

  // }

  async login(email: string, password: string) {
    return prisma.$transaction(async (trx) => {
      const user: any = await trx.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw createError(400, `User with email: ${email} not found`);
      }

      const isPassValid = bcrypt.compareSync(password, user.password);

      if (!isPassValid) {
        throw createError(400, `Uncorrect data`);
      }

      const { accessToken, refreshToken } = generateJwt(user.id);

      await trx.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

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

  async auth(id: number | undefined) {
    const user: any = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    const { accessToken, refreshToken } = generateJwt(user.id);

    const diskSpace = user.diskSpace.toString();
    const usedSpace = user.usedSpace.toString();

    return new UserDto({
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
  }

  async activate(activationLink: string) {
    return prisma.$transaction(async (trx) => {
      const user = await trx.user.findFirst({
        where: {
          activationLink,
        },
      });

      if (!user) {
        throw createError(404, "user not found");
      }

      await trx.user.update({
        where: { id: user.id },
        data: { isActivated: true },
      });
    });
  }

  async refresh(refreshToken) {
    return prisma.$transaction(async (trx) => {
      if (!refreshToken) {
        throw createError(404, "Not found token");
      }

      const userId = validateRefreshToken(refreshToken);

      const foundedUser = await trx.user.findFirst({
        where: { refreshToken },
      });

      if (!foundedUser || !userId) {
        throw createError(404, "User not found");
      }

      const { accessToken, refreshToken: newToken } = generateJwt(
        foundedUser.id
      );

      const user = await trx.user.update({
        where: {
          id: foundedUser.id,
        },
        data: { refreshToken: newToken },
      });

      return new UserDto({
        user,
        token: accessToken,
      });
    });
  }

  async logout(refreshToken: string) {
    return prisma.$transaction(async (trx) => {
      const user = await trx.user.update({
        where: {
          refreshToken,
        },
        data: { refreshToken: null },
      });

      return user;
    });
  }
}

export const UserService = new UserServiceClass();
