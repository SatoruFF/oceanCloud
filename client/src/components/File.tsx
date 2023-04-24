import "../style/file.scss";
import { FolderOutlined, FileOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { Spin } from "antd";
import { useAppDispatch } from "../store/store";
import { setDir } from "../store/reducers/fileSlice";

const File = ({ file }: any) => {

  const dispatch = useAppDispatch()

  const openDirHandler = () => {
    if (file.type == 'dir') {
      dispatch(setDir(file.id))
    }
  }

  return (
    <div className="file-wrapper" onDoubleClick={() => openDirHandler()}>
      {file.type == "dir" ? <FolderOutlined className="folder"/> : <FileOutlined className="file"/>}
      <div className="file-name">{file.name}</div>
      <div className="file-date">{file.updatedAt.slice(0, 10)}</div>
      <div className="file-size">{file.size}</div>
    </div>
  );
};

export default File;
