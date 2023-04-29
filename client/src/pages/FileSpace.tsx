import "../style/fileSpace.scss";
import { useAppSelector } from "../store/store";
import { useAppDispatch } from "../store/store";
import { useEffect, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { Button, Spin, Modal, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useCreateDirMutation, useGetFilesQuery } from "../services/file";
import Filelist from "../components/Filelist";
import { setFiles, addNewFile, setDir, popToStack } from "../store/reducers/fileSlice";

const FileSpace = () => {
  const [modal, setModal] = useState(false);
  const [fileName, setFileName] = useState('')
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector((state) => state.files.currentDir);
  const files = useAppSelector(state => state.files.files)
  const dirStack = useAppSelector(state => state.files.dirStack)
  const { data, error, isLoading } = useGetFilesQuery(currentDir);
  const [addFile, { data: dirData, error: dirError, isLoading: dirLoad }] = useCreateDirMutation();

  useEffect(() => {
    if (data) {
      const check = async () => {
        dispatch(setFiles(data));
      };
      check();
    }
  }, [data, currentDir, files, dirData]);

  const goBack = () => {
    if (dirStack.length > 0) {
      // const backDirId = dirStack.pop()
      // console.log(backDirId)
      // dispatch(setDir(backDirId))
      dispatch(popToStack())
    }
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
      message.success('Directory created')
      if (dirError) {
        return message.error('Create dir error')
      }
      if (dirData) {
        dispatch(addNewFile(dirData))
      }
      setModal(false)
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading || dirLoad || !data) {
    return (
      <Spin style={{ width: "100%", height: "100vh", marginTop: "400px" }} />
    );
  }

  return (
    <div className="disk-wrapper">
      <div className="disk-nav">
        <div className="disk-title">
          <p>Files</p>
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
