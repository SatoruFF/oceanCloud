import "../style/file.scss";
import {
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  Button,
  Popconfirm,
  Tooltip,
  message,
} from "antd";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  pushToPath,
  pushToStack,
  setDir,
  setFiles,
} from "../store/reducers/fileSlice";
import {
  useDeleteFileMutation,
  useDownloadFileMutation,
  useGetFilesQuery,
} from "../services/file";
import { sizeFormat } from "../utils/sizeFormat";
import { motion } from "framer-motion";
import { unwrapResult } from "@reduxjs/toolkit";
import _ from "lodash";
import FileViewer from "./file-viewer/FileViewer";

const File = ({ file }: any) => {
  //size format
  const size = sizeFormat(file.size);

  //redux
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector((state) => state.files.currentDir);
  const fileView = useAppSelector((state) => state.files.view);

  //rtk-query
  const [downloadFile] = useDownloadFileMutation();
  const [deleteFile, { isLoading: rmLoading }] = useDeleteFileMutation();

  //Check is image url
  const fileType = _.get(file, "type", "");

  const openDirHandler = () => {
    if (file.type == "dir") {
      dispatch(setDir(file.id));
      dispatch(pushToStack(currentDir));
      dispatch(pushToPath({ title: file.name }));
    }
  };

  const downloadHandler = async () => {
    try {
      const response: any = await downloadFile({
        file,
      });
      unwrapResult(response);
    } catch (error: any) {
      console.log(error);
      message.error(`Request failed with error: ${error.message}`);
    }
  };

  const deleteHandler = async () => {
    try {
      const response: any = await deleteFile({
        file,
      });
      unwrapResult(response);
      dispatch(setFiles(response.data));
      message.info("File was destroyed");
    } catch (error: any) {
      message.error(`Request failed: ${error.data.message}`);
    }
  };

  if (rmLoading) {
    message.info("loading...");
  }

  if (fileView == "plate") {
    return (
      <motion.div
        key={Math.random()}
        className="fileplate-file-wrapper"
        onDoubleClick={() => openDirHandler()}
      >

        <FileViewer type={fileType} url={file.url}/>

        <Tooltip title={file.name}>
          <div className="file-name">{file.name}</div>
        </Tooltip>
        <div className="file-btns">
          {file.type !== "dir" && (
            <Button
              className="file-btn file-download"
              onClick={() => downloadHandler()}
              type="link"
            >
              Download
            </Button>
          )}
          <Popconfirm
            title="Delete"
            description="Exactly?"
            onConfirm={deleteHandler}
            okText="Yes"
            cancelText="No"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          >
            <Button className="file-btn file-delete" type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={Math.random()}
      className="file-wrapper"
      onDoubleClick={() => openDirHandler()}
    >

      <FileViewer type={fileType} url={file.url}/>

      <Tooltip title={file.name}>
        <div className="file-name">{file.name}</div>
      </Tooltip>
      <div className="file-date">
        {file.updatedAt ? file.updatedAt.slice(0, 10) : "unknown"}
      </div>
      <div className="file-size">{size}</div>
      {file.type !== "dir" && (
        <Button
          className="file-btn file-download"
          onClick={() => downloadHandler()}
          ghost
        >
          Download
        </Button>
      )}
      <Popconfirm
        title="Delete"
        description="Exactly?"
        onConfirm={deleteHandler}
        okText="Yes"
        cancelText="No"
        icon={<QuestionCircleOutlined style={{ color: "red" }} />}
      >
        <Button className="file-btn file-delete" type="link" danger>
          Delete
        </Button>
      </Popconfirm>
    </motion.div>
  );
};

export default File;
