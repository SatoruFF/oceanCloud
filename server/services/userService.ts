import { prisma } from "../app";
import bcrypt from "bcrypt";
import { generateJwt } from "../utils/generateJwt";
import { FileService } from "../services/fileService.js";
import uuid from "uuid";
import { MailService } from "./mailService";
import { UserDto } from "../dtos/user-dto";
import _ from "lodash";

interface IUserData {
  email: string;
  password: string;
  userName?: string;
}

class UserServiceClass {
  async registration(userData: IUserData) {
    // to-do: add custom error like feather-error
    // Validate user data
    const candidate = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (candidate) {
      throw new Error(`User with email: ${userData.email} already exist`);
    }

    // create user in dataBase
    const hashPassword = await bcrypt.hash(userData.password, 5);

    const activationLink: string = uuid.v4();

    const user = await prisma.user.create({
      data: {
        userName: userData.userName,
        email: userData.email,
        password: hashPassword,
        activationLink,
      },
    });

    await MailService.sendActivationMail(userData.email, activationLink);

    const { accessToken, refreshToken } = generateJwt(user.id);

    // update refresh token in init state? maybe is not correct idknow right now, see you later:)
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

  async login(email: string, password: string) {}
}

export const UserService = new UserServiceClass();
