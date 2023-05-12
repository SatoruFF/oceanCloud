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
      const {sort} = req.query
      const parentId = req.query.parent || null;
      let files;
      switch (sort) {
        case 'name':
          files = await File.findAll({where: { userId: req.user.id, parentId }, include: [{ model: File, as: "child" }], order: [['name', 'ASC']],})
          break;
        case 'type':
          files = await File.findAll({where: { userId: req.user.id, parentId },include: [{ model: File, as: "child" }], order: [['type', 'DESC']],})
          break;
        case 'date':
          files = await File.findAll({where: { userId: req.user.id, parentId },include: [{ model: File, as: "child" }], order: [['createdAt', 'ASC']],})
          break;
        default:
          files = await File.findAll({where: { userId: req.user.id, parentId },include: [{ model: File, as: "child" }],});
          break;
      }
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
  
      let parent;
      if (req.body.parent !== 'null') {
        parent = await File.findOne({where: {userId: currentUserId, id: req.body.parent}})
      }

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
          parentId: parent ? parent.id : null,
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

  async downloadFile(req, res) {
    try {
      const currentUserId = req.user.id
      const queryId = req.query.id
      const file = await File.findOne({where: {id: queryId, userId: currentUserId}})
      const filePath = path.join(__dirname, '..', 'static', String(currentUserId), file.path, file.name);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, file.name)
      }
      return res.status(500).json({message: "File not found"})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: error.message})
    }
  }

  async deleteFile(req, res) {
    try {
      const fileId = Number(req.query.id);
  
      if (isNaN(fileId)) {
        return res.status(400).json({message: 'Invalid file ID'})
      }
  
      const file = await File.findOne({where: {id: fileId, userId: req.user.id}})
      if (!file) {
        return res.status(400).json({message: 'file not found'})
      }
      FileService.deleteFile(file)
      await file.destroy()
      return res.json({message: 'File was destroyed'})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: error.message})
    }
  }
}

export const FileController = new FileControllerClass();