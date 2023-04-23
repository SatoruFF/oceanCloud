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
            await file.save()
            return {message: 'File was created'}
        } else {
            throw new Error('File already exist')
        }
    }
}

export const FileService = new FileServiceClass()