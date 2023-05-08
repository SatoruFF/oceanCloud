import "../style/file.scss";
import { FolderFilled, FileFilled } from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { Button, Spin, message } from "antd";
import { useAppDispatch, useAppSelector } from "../store/store";
import { pushToStack, setDir } from "../store/reducers/fileSlice";
import {useDeleteFileMutation, useDownloadFileMutation, useGetFilesQuery}  from '../services/file'
import { sizeFormat } from "../utils/sizeFormat";

const File = ({ file }: any) => {
  
  //size format
  const size = sizeFormat(file.size)

  //redux
  const dispatch = useAppDispatch()
  const currentDir = useAppSelector(state => state.files.currentDir)

  //rtk-query
  const [downloadFile] = useDownloadFileMutation()
  const [deleteFile] = useDeleteFileMutation()
  const { refetch } = useGetFilesQuery(currentDir);

  const openDirHandler = () => {
    if (file.type == 'dir') {
      dispatch(pushToStack(currentDir))
      dispatch(setDir(file.id))
    }
  }

  const downloadHandler = async () => {
    try {
      const response: any = await downloadFile({
        file
      })
    } catch (error: any) {
      console.log(error)
      message.error(`Request failed with error: ${error.message}`)
    }

  }

  const deleteHandler = async (e: any) => {
    try {
      e.stopPropagation()
      const response: any = await deleteFile({
        file
      })
    } catch (error: any) {
      console.log(error)
      message.error(`Request failed with error: ${error.message}`)
    } finally {
      refetch()
    }
  }

  return (
    <div className="file-wrapper" onDoubleClick={() => openDirHandler()}>
      {file.type == "dir" ? <FolderFilled className="folder"/> : <FileFilled className="file"/>}
      <div className="file-name">{file.name}</div>
      <div className="file-date">{file.updatedAt.slice(0, 10)}</div>
      <div className="file-size">{size}</div>
      {file.type !== 'dir' && <Button className="file-btn file-download" onClick={() => downloadHandler()} ghost>Download</Button>}
      <Button className="file-btn file-delete" onClick={(e) => deleteHandler(e)} ghost>Delete</Button>
    </div>
  );
};

export default File;
