import _, { create } from "lodash";
import bcrypt from "bcrypt";
import 'dotenv/config'
import { v4 as uuidv4 } from "uuid";
import { generateJwt } from "../utils/generateJwt.js";
import createError from "http-errors"

import { FileService } from "../services/fileService.js";
import { MailService } from "./mailService.js";
import { prisma } from "../app.js";
import { UserDto } from "../dtos/user-dto.js";


interface IUserData {
  email: string;
  password: string;
  userName?: string;
}

class UserServiceClass {
  async registration(userData: IUserData) {
    // Validate user data
    const candidate = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (candidate) {
      createError(400, `User with email: ${userData.email} already exists`)
    }

    // create user in dataBase
    const hashPassword = await bcrypt.hash(userData.password, 5);

    let activationLink: string = uuidv4();

    const user = await prisma.user.create({
      data: {
        userName: userData.userName,
        email: userData.email,
        password: hashPassword,
        activationLink,
      },
    });

    activationLink = `${process.env.API_URL}/api/activate/${activationLink}`

    await MailService.sendActivationMail(userData.email, activationLink);

    const { accessToken, refreshToken } = generateJwt(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // to-do: add internationalization and select to language option
    await prisma.userConfig.create({
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
        role: user.role,
      },
    });

    return userDto;
  }

  async login(email: string, password: string) {
    const user: any = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      createError(400, `User with email: ${email} not found`)
    }

    const isPassValid = bcrypt.compareSync(password, user.password);

    if (!isPassValid) {
      createError(400, `Uncorrect data`)
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
  }

  async auth(id: number | undefined) {
    const user: any = await prisma.user.findUnique({
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
    }
  }

  async activate(activationLink: string) {
    const user = await prisma.user.findFirst({
      where: {
        activationLink
      }
    })

    if (!user) {
      createError('404', "user not found")
    }

    await prisma.user.update({ isActivated: true })
  }
}

export const UserService = new UserServiceClass();
