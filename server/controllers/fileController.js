import { File, User } from "../models/models.js";
import { FileService } from "../services/fileService.js";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FileControllerClass {
  async createDir(req, res) {
    try {
      const { name, type, parent } = req.body;
      const file = File.build({
        name,
        type,
        parentId: parent,
        userId: req.user.id,
      });

      if (!parent) {
        file.path = name;
        await FileService.createDir(file);
      } else {
        const parentFile = await File.findOne({
          where: { id: parent, userId: req.user.id },
        });

        if (!parentFile) {
          return res
            .status(400)
            .json({ message: "Parent directory not found" });
        }

        file.path = `${parentFile.path}/${name}`;
        await FileService.createDir(file);
        await parentFile.addChild(file);
      }

      await file.save();
      return res.json(file);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getFiles(req, res) {
    try {
      const parentId = req.query.parent || null;
      const files = await File.findAll({
        where: { userId: req.user.id, parentId },
        include: [{ model: File, as: "child" }],
      });

      return res.json(files);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Unable to retrieve files" });
    }
  }

  async uploadFile(req, res) {
    try {
      const file = req.files.file
      const currentUserId = req.user.id

      if (req.body.parent == undefined) {
        req.body.parent = null
      }

      const parent = await File.findOne({where: {userId: currentUserId, id: req.body.parent}})
      const user = await User.findOne({where: {id: currentUserId}})

      if (user.usedSpace + file.size > user.diskSpace) {
        return res.status(400).json({message: 'Not enough space on the disk!'})
      }

      user.usedSpace += file.size

      let filePath;

      if (parent) {
        filePath = path.join(__dirname, '..', 'static', String(user.id), parent.path, file.name);
      } else {
        filePath = path.join(__dirname, '..', 'static', String(user.id), file.name);
      }

      if (!fs.existsSync(filePath)) {
        file.mv(filePath)
        const type = file.name.split('.').pop()
        const dbFile = await File.create({
          name: file.name,
          type,
          size: file.size,
          path: parent?.path,
          parent: parent?.id,
          userId: user.id,
        })

        await user.save()

        return res.json(dbFile)
      } else {
          throw new Error('File already exist')
      }

    } catch (error) {
      console.log(error)
      return res.status(400).json({message: "Upload error"})
    }
  }
}

export const FileController = new FileControllerClass();