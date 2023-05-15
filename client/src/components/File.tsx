import "../style/file.scss";
import { FolderFilled, FileFilled } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Button, Spin, message } from "antd";
import { useAppDispatch, useAppSelector } from "../store/store";
import { pushToPath, pushToStack, setDir } from "../store/reducers/fileSlice";
import {
  useDeleteFileMutation,
  useDownloadFileMutation,
  useGetFilesQuery,
} from "../services/file";
import { sizeFormat } from "../utils/sizeFormat";
import { motion } from "framer-motion";

const File = ({ file }: any) => {
  //size format
  const size = sizeFormat(file.size);

  //redux
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector((state) => state.files.currentDir);
  const fileView = useAppSelector((state) => state.files.view);

  //rtk-query
  const [downloadFile] = useDownloadFileMutation();
  const [deleteFile] = useDeleteFileMutation();
  const { refetch } = useGetFilesQuery(currentDir);

  const openDirHandler = () => {
    if (file.type == "dir") {
      dispatch(setDir(file.id));
      dispatch(pushToStack(currentDir));
      dispatch(pushToPath({title: file.name}))
    }
  };

  const downloadHandler = async () => {
    try {
      const response: any = await downloadFile({
        file,
      });
    } catch (error: any) {
      console.log(error);
      message.error(`Request failed with error: ${error.message}`);
    }
  };

  const deleteHandler = async (e: any) => {
    try {
      e.stopPropagation();
      const response: any = await deleteFile({
        file,
      });
      message.info(response.data.message);
    } catch (error: any) {
      message.error(`Request failed: ${error.message}`);
    } finally {
      refetch();
    }
  };

  if (fileView == "plate") {
    return (
      <motion.div
        key={Math.random()}
        className="fileplate-file-wrapper"
        onDoubleClick={() => openDirHandler()}
      >
        {file.type == "dir" ? (
          <FolderFilled className="folder" />
        ) : (
          <FileFilled className="file" />
        )}
        <div className="file-name">{file.name}</div>
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
          <Button
            className="file-btn file-delete"
            type="link"
            onClick={(e) => deleteHandler(e)}
            danger
          >
            Delete
          </Button>
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
      {file.type == "dir" ? (
        <FolderFilled className="folder" />
      ) : (
        <FileFilled className="file" />
      )}
      <div className="file-name">{file.name}</div>
      <div className="file-date">{file.updatedAt.slice(0, 10)}</div>
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
      <Button
        className="file-btn file-delete"
        onClick={(e) => deleteHandler(e)}
        danger
      >
        Delete
      </Button>
    </motion.div>
  );
};

export default File;
