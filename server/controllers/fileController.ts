// base
import { Request, Response } from "express";

// services
import { prisma, imagekit } from "../configs/config.js";
import { FileService } from "../services/fileService.js";
import { Avatar } from "../helpers/avatar.js";

// Utils
import _ from "lodash";
import { PassThrough } from "stream";
import createError from "http-errors";
import { logger } from "../logger.js";
import "dotenv/config";

class FileControllerClass {
  async createDir(req: Request, res: Response) {
    try {
      const { name, type, parent } = req.body;

      // user id from token in auth middleware
      const userId = _.get(req, ["user", "id"]);

      const isDouble = await prisma.file.findFirst({
        where: { name, parentId: parent },
      });

      if (!_.isEmpty(isDouble)) {
        return res.status(400).json({ message: "Folder name is not unique!" });
      }

      const fileInstance = {
        name,
        type,
        parentId: parent,
        userId,
        path: "",
        url: "",
      };

      let itemUrl;

      // if not exist parent => create new folder in root directory on s3
      if (parent == null) {
        fileInstance.path = name;

        itemUrl = await FileService.createDir(fileInstance);
      } else {
        // find parent folder to this file
        const parentFile: any = await prisma.file.findFirst({
          where: { id: parent, userId },
        });

        if (_.isEmpty(parentFile)) {
          throw createError(400, "Parent directory not found");
        }

        fileInstance.path = `${parentFile.path}/${name}`;

        itemUrl = await FileService.createDir(fileInstance);
      }

      fileInstance.url = itemUrl;

      const file: any = await prisma.file.create({
        data: fileInstance,
      });

      return res.json(file);
    } catch (error: any) {
      logger.error(error);

      return res.status(400).json({ message: error.message });
    }
  }

  async getFiles(req: any, res: Response) {
    try {
      const { sort, search } = req.query;

      let parentId = parseInt(req.query.parent) || null;

      const userId = _.get(req, ["user", "id"]);

      const files = await FileService.getFiles(sort, search, parentId, userId);

      return res.json(files);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: "Unable to retrieve files" });
    }
  }

  async uploadFile(req: any, res: Response) {
    try {
      const file = req.files.file;

      const userId = req.user.id;

      const parentId = req.body.parent;

      const savedFile = await FileService.uploadFile(file, userId, parentId);

      return res.json(savedFile);
    } catch (error) {
      logger.error(error);

      return res.status(400).json({ message: "Upload error" });
    }
  }

  async downloadFile(req, res) {
    try {
      const userId = req.user.id;

      const queryId = req.query.id;

      const { s3object, file } = await FileService.downloadFile(
        queryId,
        userId
      );

      const stream = new PassThrough(); // создаем новый поток

      stream.end(s3object.Body); // записываем данные из s3object.Body в поток

      res.setHeader("Content-disposition", "attachment; filename=" + file.name);

      res.setHeader("Content-type", file.type);

      res.attachment(file.name);

      stream.pipe(res); // передаем поток в res.download()
    } catch (error) {
      logger.error(error);

      return res.status(500).json({ message: "Unable to download file" });
    }
  }

  async deleteFile(req: any, res: Response) {
    try {
      const fileId = Number(req.query.id);

      const userId = req.user.id;

      const allFiles = await FileService.deleteFile(fileId, userId);

      return res.json(allFiles);
    } catch (error: any) {
      logger.error(error);

      return res.status(500).json({ message: error.message });
    }
  }

  // to-do: move this into user, cause this is not a file logic
  async uploadAvatar(req: any, res: Response) {
    try {
      const fileBuffer = req.files.file.data;
      const userId = req.user.id;

      const avatarUrl = await Avatar.uploadAvatar(fileBuffer, userId);

      return res.json(avatarUrl);
    } catch (error: any) {
      logger.error(error);

      return res.status(400).json({ message: error.message });
    }
  }

  async deleteAvatar(req: any, res: any) {
    try {
      const userId = req.user.id;

      const user = await Avatar.deleteAvatar(userId);

      return res.json(user);
    } catch (error: any) {
      logger.error(error);
      return res.status(400).json({ message: error.message });
    }
  }
}

export const FileController = new FileControllerClass();
