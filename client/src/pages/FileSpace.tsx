import "../style/fileSpace.scss";
import { useAppSelector } from "../store/store";
import { useAppDispatch } from "../store/store";
import { useEffect, useState } from "react";
import { LeftOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Spin, Modal, Input, message, Upload } from "antd";
import { useCreateDirMutation, useGetFilesQuery } from "../services/file";
import Filelist from "../components/Filelist";
import {
  setFiles,
  addNewFile,
  setDir,
  popToStack,
} from "../store/reducers/fileSlice";
import type { UploadProps } from "antd";

const FileSpace = () => {
  const [modal, setModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const token = localStorage.getItem("token");

  //Redux state
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector((state) => state.files.currentDir);
  const dirStack = useAppSelector((state) => state.files.dirStack);

  //RTK query
  const { data, isLoading, refetch } = useGetFilesQuery(currentDir);
  const [addFile, { data: dirData, error: dirError, isLoading: dirLoad }] =
    useCreateDirMutation();

  useEffect(() => {
    refetch()
  }, [])

  useEffect(() => {
    if (data) {
      dispatch(setFiles(data));
    }
  }, [data, currentDir]);

  useEffect(() => {
    dispatch(setDir(currentDir));
  }, [currentDir]);

  useEffect(() => {
    if (dirData) {
      dispatch(addNewFile(dirData));
      refetch()
    }
    if (dirError) {
      message.error("Create dir error");
    }
  }, [dirData, dirError]);

  const goBack = () => {
    if (dirStack.length > 0) {
      dispatch(popToStack());
    }
  };

  // file upload
  const props: UploadProps = {
    name: "file",
    action: "http://localhost:3002/api/file/upload",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      parent: currentDir
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
        refetch()
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  // Добавить новую папку
  const addNewFolder = async () => {
    try {
      if (folderName.length === 0) {
        return message.info("The file name should not be empty");
      }
      await addFile({
        name: folderName,
        type: "dir",
        parent: currentDir,
      });
      setModal(false);
      setFolderName("")
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading || !data) {
    return (
      <Spin style={{ width: "100%", height: "100%", marginTop: "400px" }} />
    );
  }

  return (
    <div className="disk-wrapper">
      <div className="disk-nav">
        <div className="disk-wrapper-btns">
          <Button onClick={() => goBack()}>
            <LeftOutlined />
          </Button>
          <Button onClick={() => setModal(true)}>
            <p className="disc-createFolder-txt">Create new folder</p>
          </Button>

          <Upload className="disk-upload" name="file" multiple={true} {...props}>
            <Button icon={<UploadOutlined />} className="upload-btn">
              Click to Upload
            </Button>
          </Upload>
        </div>
      </div>
      <Modal
        title="Create new folder"
        open={modal}
        onCancel={() => setModal(false)}
        footer={[
          <Button type="primary" onClick={addNewFolder}>
            create
          </Button>,
        ]}
      >
        <Input
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter a folder name..."
        />
      </Modal>
      <Filelist />
    </div>
  );
};

export default FileSpace;
