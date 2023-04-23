import { File } from "../models/models.js";
import { FileService } from "../services/fileService.js";

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

      console.log(file);

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

      return res.json({ files });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Unable to retrieve files" });
    }
  }
}

export const FileController = new FileControllerClass();