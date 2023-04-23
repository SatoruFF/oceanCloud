import "../style/fileSpace.scss";
import { useAppSelector } from "../store/store";
import { useAppDispatch } from "../store/store";
import { useEffect, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { Button, Spin, Modal, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useCreateDirMutation, useGetFilesQuery } from "../services/file";
import Filelist from "../components/Filelist";
import { setFiles, addNewFile } from "../store/reducers/fileSlice";

const FileSpace = () => {
  const [modal, setModal] = useState(false);
  const [fileName, setFileName] = useState('')
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector((state) => state.files.currentDir);
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetFilesQuery(null);
  const [addFile, { data: dirData, error: dirError, isLoading: dirLoad }] = useCreateDirMutation();

  useEffect(() => {
    if (data) {
      const check = async () => {
        console.log(data);
        dispatch(setFiles(data));
      };
      check();
    }
  }, [currentDir]);

  const goBack = () => {
    navigate(-1);
  };

  const addNewFolder = async () => {
    try {
      if (fileName.length === 0) {
        return message.info('The file name should not be empty')
      }
      await addFile({
        name: fileName,
        type: "dir",
        parent: currentDir,
      });
      if (dirError) {
        return message.error('Create dir error')
      }
      dispatch(addNewFile(dirData))
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading || dirLoad) {
    return (
      <Spin style={{ width: "100%", height: "100vh", marginTop: "400px" }} />
    );
  }

  return (
    <div className="disk-wrapper">
      <div className="disk-nav">
        <div className="disk-title">
          {" "}
          <p>Files</p>{" "}
        </div>
        <div className="disk-wrapper-btns">
          <Button onClick={() => goBack()}>
            <LeftOutlined />
          </Button>
          <Button onClick={() => setModal(true)}>
            <p className="disc-createFolder-txt">Create new folder</p>
          </Button>
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
        <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Enter a folder name..." />
      </Modal>
      <Filelist />
    </div>
  );
};

export default FileSpace;
