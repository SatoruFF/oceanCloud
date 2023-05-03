import "../style/file.scss";
import { FolderFilled, FileFilled } from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { Button, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../store/store";
import { pushToStack, setDir } from "../store/reducers/fileSlice";

const File = ({ file }: any) => {

  const dispatch = useAppDispatch()
  const currentDir = useAppSelector(state => state.files.currentDir)

  const openDirHandler = () => {
    if (file.type == 'dir') {
      dispatch(pushToStack(currentDir))
      dispatch(setDir(file.id))
    }
  }

  const downloadHandler = async () => {

  }

  const deleteHandler = async () => {
    
  }

  return (
    <div className="file-wrapper" onDoubleClick={() => openDirHandler()}>
      {file.type == "dir" ? <FolderFilled className="folder"/> : <FileFilled className="file"/>}
      <div className="file-name">{file.name}</div>
      <div className="file-date">{file.updatedAt.slice(0, 10)}</div>
      <div className="file-size">{(file.size / (1024 * 1024)).toFixed(3)} mb</div>
      {file.type !== 'dir' && <Button className="file-btn file-download" onClick={() => downloadHandler()} ghost>Download</Button>}
      <Button className="file-btn file-delete" onClick={() => deleteHandler()} ghost>Delete</Button>
    </div>
  );
};

export default File;
