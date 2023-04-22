import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FileServiceClass {
    async createDir(file) {
        console.log(file)
        const filePath = path.join(__dirname, '..', 'static', String(file.userId), file.path);
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath)
            //return {message: `File was created`}
            await file.save()
        } else {
            throw new Error('File already exist')
        }
    }
}

export const FileService = new FileServiceClass()

// import { File } from '../models/models.js';
// import { v4 as uuidv4 } from 'uuid';
// import config from 'config';