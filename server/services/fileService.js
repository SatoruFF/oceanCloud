import { s3 } from "../app.js";
import 'dotenv/config'

class FileServiceClass {
  async createDir(file) {
    let folderPath = `${file.userId}/${file.path}`;
    if (!folderPath.endsWith('/')) {
      folderPath += '/';
    }
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: folderPath,
      Body: '',
    };
    await s3.putObject(params).promise();
    return { message: "Folder was created" };
  }

  async deleteFile(file) {
    if (file.type === 'dir') {
      let filePath = `${String(file.userId)}/${file.path}`
      filePath = filePath.replace(/\/{2,}/g, '/')
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: filePath,
      };
      const { Contents } = await s3.listObjectsV2(params).promise();
      if (Contents.length === 0) {
        return { message: "Folder was deleted" };
      }
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: { Objects: [] },
      };
      Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
      });
      await s3.deleteObjects(deleteParams).promise();
      if (Contents.IsTruncated) {
        await this.deleteFile(file);
      } else {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: filePath }).promise();
      }
      return { message: "Folder was deleted" };
  } else {
      let filePath = `${String(file.userId)}/${file.path}/${file.name}`
      filePath = filePath.replace(/\/{2,}/g, '/')
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath,
      };
      await s3.deleteObject(params).promise();
      return { message: "File was deleted" };
    }
  }
}

export const FileService = new FileServiceClass();