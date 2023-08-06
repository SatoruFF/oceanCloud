// services
import { prisma, s3 } from "../app.js";
import { imagekit } from "../app.js";
import { FileService } from "../services/fileService.js";
// Utils
import { v4 as uuidv4 } from "uuid";
import { createReadStream } from "streamifier";
import { PassThrough } from "stream";
// Config
import "dotenv/config";
// Tools
import _ from "lodash";
import { Request, Response } from "express";

class FileControllerClass {
  async createDir(req, res) {
    try {
      const { name, type, parent } = req.body;

      const isDouble = await prisma.file.findFirst({ where: { name, parentId: parent } });

      if (!_.isEmpty(isDouble)) {
        return res.status(400).json({ message: "Folder name is not unique!" });
      }

      const fileInstance = {
        name,
        type,
        parentId: parent,
        userId: req.user.id,
        path: "",
        url: '',
      }

      let itemUrl;

      if (parent == null) {
        fileInstance.path = name;
        itemUrl = await FileService.createDir(fileInstance);
      } else {
        const parentFile: any = await prisma.file.findFirst({
          where: { id: parent, userId: req.user.id },
        });
        if (_.isEmpty(parentFile)) {
          return res
            .status(400)
            .json({ message: "Parent directory not found" });
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
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getFiles(req: any, res: Response) {
    try {
      const { sort } = req.query;
      let parentId = req.query.parent || null;
      if (typeof parentId == 'string') {
        parentId = Number(parentId)
      }
      const searchItem = req.query.search;
      if (searchItem) {
        let files: any = await prisma.file.findMany({
          where: { userId: req.user.id },
        });
        files = _.filter(files, (file) => _.includes(file.name, searchItem));
        return res.json(files);
      }
      let files: any;
      switch (sort) {
        case "name":
          files = await prisma.file.findMany({
            where: {
              AND: [{ userId: req.user.id }, { parentId }],
            },
            orderBy: { name: "asc" },
          });
          break;
        case "type":
          files = await prisma.file.findMany({
            where: {
              AND: [{ userId: req.user.id }, { parentId }],
            },
            orderBy: { type: "asc" },
          });
          break;
        case "date":
          files = await prisma.file.findMany({
            where: {
              AND: [{ userId: req.user.id }, { parentId }],
            },
            orderBy: { createdAt: "asc" },
          });
          break;
        default:
          files = await prisma.file.findMany({
            where: {
              AND: [{ userId: req.user.id }, { parentId }],
            },
          });
          break;
      }
      return res.json(files);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Unable to retrieve files" });
    }
  }

  async uploadFile(req: any, res: Response) {
    try {
      const file = req.files.file;
      const currentUserId = req.user.id;
      let parent;
      if (req.body.parent !== "null") {
        parent = await prisma.file.findFirst({
          where: { userId: currentUserId, id: Number(req.body.parent) },
        });
      }
      const user: any = await prisma.user.findFirst({
        where: { id: currentUserId },
      });
      if (user.usedSpace + BigInt(file.size) > user.diskSpace) {
        return res
          .status(400)
          .json({ message: "Not enough space on the disk!" });
      }
      user.usedSpace += BigInt(file.size);
      let filePath;
      if (parent) {
        filePath = `${String(user.id)}/${parent.path}/${file.name}`;
      } else {
        filePath = `${String(user.id)}/${file.name}`;
      }
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath,
        Body: req.files.file.data,
      };
      const newFile = await s3.upload(params).promise();
      const fileUrl = _.get(newFile, 'Location', "")
      const dbFile = await prisma.file.create({
        data: {
          name: file.name,
          type: file.name.split(".").pop(),
          size: file.size,
          path: parent?.path,
          parentId: parent ? parent.id : null,
          userId: user.id,
          url: fileUrl,
        },
      });
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          usedSpace: user.usedSpace
        }
      })
      return res.json(dbFile);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Upload error" });
    }
  }

  async downloadFile(req, res) {
    try {
      const currentUserId = req.user.id;
      const queryId = req.query.id;
      const file: any = await prisma.file.findFirst({
        where: { id: Number(queryId), userId: currentUserId },
      });
      let filePath = `${String(currentUserId)}/${file.path}/${file.name}`;
      filePath = filePath.replace(/\/{2,}/g, "/");

      const s3object = await s3
        .getObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${filePath}`,
        })
        .promise();

      const stream = new PassThrough(); // создаем новый поток

      stream.end(s3object.Body); // записываем данные из s3object.Body в поток

      res.setHeader("Content-disposition", "attachment; filename=" + file.name);
      res.setHeader("Content-type", file.type);
      res.attachment(file.name);

      stream.pipe(res); // передаем поток в res.download()
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Unable to download file" });
    }
  }

  async deleteFile(req: any, res: Response) {
    try {
      const fileId = Number(req.query.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      const file: any = await prisma.file.findFirst({
        where: { id: fileId, userId: req.user.id },
      });
      const existInnerContent = await prisma.file.findMany({
        where: { parentId: file.id },
      });
      if (!_.isEmpty(existInnerContent)) {
        return res
          .status(400)
          .json({ message: "You cannot delete a folder while it has content" });
      }
      if (!file) {
        return res.status(400).json({ message: "File not found" });
      }
      FileService.deleteFile(file);
      await prisma.file.delete({where: {id: fileId}});
      const user: any = await prisma.user.findFirst({
        where: { id: req.user.id },
      });
      user.usedSpace = user.usedSpace - BigInt(file.size);
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          usedSpace: user.usedSpace
        }
      })
      const allFiles = await prisma.file.findMany({ where: { userId: req.user.id } });
      return res.json(allFiles);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Unable to delete file" });
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  async uploadAvatar(req: any, res: Response) {
    try {
      const fileBuffer = req.files.file.data;
      const fileStream = createReadStream(fileBuffer);
      const avatarName = uuidv4() + ".png";
      const user: any = await prisma.user.findFirst({ where: { id: req.user.id } });
      // in first, we must delete old avatar
      if (user.avatar) {
        const fileList = await imagekit.listFiles();
        const file = fileList.find((file) => file.url === user.avatar);
        const fileId = file ? file.fileId : null;
        imagekit.deleteFile(fileId, function (error, result) {
          if (error) console.log(error);
          else console.log(result);
        });
      }
      const response = await imagekit.upload({
        file: fileStream,
        fileName: avatarName,
        extensions: [
          {
            name: "google-auto-tagging",
            maxTags: 5,
            minConfidence: 95,
          },
        ],
      });
      user.avatar = response.url;
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          avatar: user.avatar
        }
      })
      return res.json(user.avatar);
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async deleteAvatar(req: any, res: any) {
    try {
      const user: any = await prisma.user.findFirst({ where: { id: req.user.id } });
      if (user.avatar) {
        const fileList: any = await imagekit.listFiles();
        const file = fileList.find((file) => file.url === user.avatar);
        const fileId = file ? file.fileId : null;
        imagekit.deleteFile(fileId, function (error, result) {
          if (error) console.log(error);
          else console.log(result);
        });
        user.avatar = null;
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            avatar: user.avatar
          }
        })
        user.diskSpace = user.diskSpace.toString();
        user.usedSpace = user.usedSpace.toString();
        return res.json(user);
      }
      return res.json({ message: "avatar not found" });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }
}

export const FileController = new FileControllerClass();
