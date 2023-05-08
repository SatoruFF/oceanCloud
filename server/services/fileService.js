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

    async deleteFile(file) {
        if (file.type === 'dir') {
            const filePath = path.join(__dirname, '..', 'static', String(file.userId), file.path);
            fs.rmdir(filePath, () => {
                console.log('file was deleted')
            })
        } else {
            const filePath = path.join(__dirname, '..', 'static', String(file.userId), file.path, file.name);
            fs.unlink(filePath, () => {
                console.log('file was deleted')
            })
        }
    }
}

export const FileService = new FileServiceClass()