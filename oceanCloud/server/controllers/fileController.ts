// DB-models
import { File, User } from "../models/models.js";
import { FileService } from "../services/fileService.js";
// services
import { s3 } from "../app.js";
import { imagekit } from "../app.js";
// Utils
import { v4 as uuidv4 } from 'uuid';
import { createReadStream } from 'streamifier';
import { PassThrough } from "stream";
import 'dotenv/config'
// Tools
import _ from 'lodash'

class FileControllerClass {
  async createDir(req, res) {
    try {
      const { name, type, parent } = req.body;
      const file: any = File.build({
        name,
        type,
        parentId: parent,
        userId: req.user.id,
      });

      const isDouble = await File.findAll({where: {name: name}})
      if (!_.isEmpty(isDouble)) {
        return res.status(400).json({ message: "Folder name is not unique!" });
      }
      if (parent == null) {
        file.path = name;
        await FileService.createDir(file);
      } else {
        const parentFile: any = await File.findOne({
          where: { id: parent, userId: req.user.id },
        });
        if (_.isEmpty(parentFile)) {
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
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getFiles(req, res) {
    try {
      const {sort} = req.query
      const parentId = req.query.parent || null;
      const searchItem = req.query.search
      if (searchItem) {
        let files: any = await File.findAll({where: {userId: req.user.id}})
        files = files.filter(file => file.name.includes(searchItem))
        return res.json(files)
      }
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
      const user: any = await User.findOne({where: {id: currentUserId}})
      if (user.usedSpace + file.size > user.diskSpace) {
        return res.status(400).json({message: 'Not enough space on the disk!'})
      }
      user.usedSpace += file.size
      let filePath
      if (parent) {
        filePath = `${String(user.id)}/${parent.path}/${file.name}`;
      } else {
        filePath = `${String(user.id)}/${file.name}`;
      }
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath, 
        Body: req.files.file.data
      };
      await s3.upload(params).promise()
      const dbFile = await File.create({
        name: file.name,
        type: file.name.split('.').pop(),
        size: file.size,
        path: parent?.path,
        parentId: parent ? parent.id : null,
        userId: user.id,
      });
      await user.save()
      return res.json(dbFile)
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: "Upload error"})
}}

async downloadFile(req, res) {
  try {
    const currentUserId = req.user.id
    const queryId = req.query.id
    const file: any = await File.findOne({ where: { id: queryId, userId: currentUserId } });
    let filePath = `${String(currentUserId)}/${file.path}/${file.name}`
    filePath = filePath.replace(/\/{2,}/g, '/')

    const s3object = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME, 
      Key: `${filePath}`
    }).promise()

    const stream = new PassThrough(); // создаем новый поток

    stream.end(s3object.Body); // записываем данные из s3object.Body в поток

    res.setHeader('Content-disposition', 'attachment; filename=' + file.name);
    res.setHeader('Content-type', file.type);
    res.attachment(file.name);

    stream.pipe(res); // передаем поток в res.download()
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Unable to download file" });
  }
}


async deleteFile(req, res) {
  try {
    const fileId = Number(req.query.id);
    if (isNaN(fileId)) {
      return res.status(400).json({message: 'Invalid file ID'})
    }
    const file: any = await File.findOne({ where: { id: fileId, userId: req.user.id } });
    const existInnerContent = await File.findAll({where: {parentId: file.id}})
    if (!_.isEmpty(existInnerContent)) {
      return res.status(400).json({ message: "You cannot delete a folder while it has content" });
    }
    if (!file) {
      return res.status(400).json({ message: "File not found" });
    }
    FileService.deleteFile(file)
    await file.destroy()
    const user: any = await User.findOne({where: {id: req.user.id}})
    user.usedSpace = user.usedSpace - file.size
    await user.save()
    const allFiles = await File.findAll({where: {userId: req.user.id}})
    return res.json(allFiles)
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Unable to delete file" });
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
  async uploadAvatar(req, res) {
    try {
      const fileBuffer = req.files.file.data;
      const fileStream = createReadStream(fileBuffer);
      const avatarName = uuidv4() + '.png'
      const user: any = await User.findOne({where: {id: req.user.id}})
      // in first, we must delete old avatar
      if (user.avatar) {
        const fileList = await imagekit.listFiles();
        const file = fileList.find((file) => file.url === user.avatar);
        const fileId = file ? file.fileId : null;
        imagekit.deleteFile(fileId, function(error, result) {
          if(error) console.log(error);
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
      user.avatar = response.url
      await user.save()
      return res.json(user.avatar)
    } catch (error: any) {
      console.log(error)
      return res.status(400).json({message: error.message})
    }
  }

  async deleteAvatar(req: any, res: any) {
    try {
      const user: any = await User.findOne({where: {id: req.user.id}})
      if (user.avatar) {
        const fileList: any = await imagekit.listFiles();
        const file = fileList.find((file) => file.url === user.avatar);
        const fileId = file ? file.fileId : null;
        imagekit.deleteFile(fileId, function(error, result) {
          if(error) console.log(error);
          else console.log(result);
        });
        user.avatar = null
        await user.save()
        return res.json(user)
      }
      return res.json({message: 'avatar not found'})
    } catch (error: any) {
      console.log(error)
      return res.status(400).json({message: error.message})
    }
  }
}

export const FileController = new FileControllerClass();