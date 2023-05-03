import "../style/file.scss";
import { FolderFilled, FileFilled } from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { Spin } from "antd";
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

  return (
    <div className="file-wrapper" onDoubleClick={() => openDirHandler()}>
      {file.type == "dir" ? <FolderFilled className="folder"/> : <FileFilled className="file"/>}
      <div className="file-name">{file.name}</div>
      <div className="file-date">{file.updatedAt.slice(0, 10)}</div>
      <div className="file-size">{file.size}</div>
    </div>
  );
};

export default File;
