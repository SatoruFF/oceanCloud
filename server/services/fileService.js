import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FileServiceClass {
    async createDir(file) {
        const folderPath = path.join(__dirname, '..', 'static', String(file.userId), file.path);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath)
            return {message: 'Folder was created'}
        } else {
            throw new Error('Folder already exist')
        }
    }
}

export const FileService = new FileServiceClass()