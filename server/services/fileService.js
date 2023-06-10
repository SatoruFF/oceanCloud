import config from 'config';
import { s3 } from "../app.js";

class FileServiceClass {
  async createDir(file) {
    let folderPath = `${file.userId}/${file.path}`;
    if (!folderPath.endsWith('/')) {
      folderPath += '/';
    }
    const params = {
      Bucket: config.get('S3-bucket-name'),
      Key: folderPath,
      Body: '',
    };
    await s3.putObject(params).promise();
    return { message: "Folder was created" };
  }

  async deleteFile(file) {
    if (file.type === 'dir') {
      const filePath = `${String(file.userId)}/${file.path}`
      console.log(filePath)
      const params = {
        Bucket: config.get('S3-bucket-name'),
        Key: filePath,
      };
      await s3.deleteObject(params).promise();
      return { message: "File was deleted" };
  } else {
      const filePath = `${String(file.userId)}/${file.path}/${file.name}`
      const params = {
        Bucket: config.get('S3-bucket-name'),
        Key: filePath,
      };
      await s3.deleteObject(params).promise();
      return { message: "File was deleted" };
    }
  }
}

export const FileService = new FileServiceClass();