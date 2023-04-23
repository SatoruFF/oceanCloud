import "../style/file.scss";
import { FolderOutlined, FileOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { Spin } from "antd";

const File = ({ file }: any) => {
  return (
    <div className="file-wrapper">
      {file.type == "dir" ? <FolderOutlined /> : <FileOutlined />}
      <div className="file-name">{file.name}</div>
      <div className="file-date">{file.updatedAt.slice(0, 10)}</div>
      <div className="file-size">{file.size}</div>
    </div>
  );
};

export default File;
