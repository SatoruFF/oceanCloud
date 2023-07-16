import { s3 } from "../app.js";
import 'dotenv/config'

interface File {
  userId: number;
  path: string;
  name?: string;
  type: 'dir' | 'file';
}

interface CreateDirResponse {
  message: string;
}

interface DeleteFileResponse {
  message: string;
}

interface IS3 {
  Bucket: string | undefined,
  Body?: any,
  Key?: string,
  Prefix?: string,
  Delete?: any,
}

class FileServiceClass {
  async createDir(file: File): Promise<CreateDirResponse> {
    let folderPath = `${file.userId}/${file.path}`;
    if (!folderPath.endsWith('/')) {
      folderPath += '/';
    }
    const params: IS3 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: folderPath,
      Body: '',
    };
    await s3.putObject(params as any).promise();
    return { message: "Folder was created" };
  }

  async deleteFile(file: File): Promise<DeleteFileResponse> {
    if (file.type === 'dir') {
      let filePath = `${String(file.userId)}/${file.path}`
      filePath = filePath.replace(/\/{2,}/g, '/')
      const params: IS3 = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: filePath,
      };
      const { Contents }: any = await s3.listObjectsV2(params as any).promise();
      if (Contents.length === 0) {
        return { message: "Folder was deleted" };
      }
      const deleteParams: IS3 = {
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: { Objects: [] },
      };
      Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
      });
      await s3.deleteObjects(deleteParams as any).promise();
      if (Contents.IsTruncated) {
        await this.deleteFile(file);
      } else {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: filePath } as any).promise();
      }
      return { message: "Folder was deleted" };
  } else {
      let filePath = `${String(file.userId)}/${file.path}/${file.name}`
      filePath = filePath.replace(/\/{2,}/g, '/')
      const params: IS3 = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath,
      };
      await s3.deleteObject(params as any).promise();
      return { message: "File was deleted" };
    }
  }
}

export const FileService = new FileServiceClass();