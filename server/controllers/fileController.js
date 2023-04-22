import { FileService } from "../services/fileService.js"
import { File } from "../models/models.js"
import { User } from "../models/models.js"
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FileControllerClass {
    async createDir(req, res) {
        try {
            const {name, type, parent} = req.body
            const file = File.build({name, type, parentId: parent, userId: req.user.id})
            console.log(file)
            const parentFile = await File.findOne({where: {id: parent}})
            if (!parentFile) {
                file.path = name
                await FileService.createDir(file)
            } else {
                file.path = `${parentFile.path}/${file.name}`
                await FileService.createDir(file)
                parentFile.childs.push(file.id)
                await parentFile.save()
            }
            await file.save()
            return res.json(file)
        } catch (error) {
            console.log(error)
            return res.status(400).json({message: `${error.message}`})
        }
    }
}

export const FileController = new FileControllerClass()