import "../style/fileSpace.scss";
import { useAppSelector } from "../store/store";
import { useAppDispatch } from "../store/store";
import { useEffect, useState } from "react";
import {
  LeftOutlined,
  UploadOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Button, Spin, Modal, Input, message, Select, Breadcrumb } from "antd";
import { useCreateDirMutation, useGetFilesQuery } from "../services/file";
import Filelist from "../components/Filelist";
import diskBack from "../assets/disk-back.jpg";
import {
  setFiles,
  addNewFile,
  setDir,
  popToStack,
  setView,
  popToPath,
} from "../store/reducers/fileSlice";
import { generateParams } from "../utils/generateParams";
import UploadModal from "../components/modals/UploadModal";
import { unwrapResult } from "@reduxjs/toolkit";
const { Search } = Input;

const FileSpace = () => {
  //Redux state
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector((state) => state.files.currentDir);
  const dirStack = useAppSelector((state) => state.files.dirStack);
  const paths = useAppSelector((state) => state.files.paths);

  //states
  const [modal, setModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false)
  const [folderName, setFolderName] = useState("");
  const [sort, setSort]: any = useState("");
  const [search, setSearch] = useState("");
  const onSearch = (value: string) => setSearch(value);

  //RTK query
  const params = generateParams(currentDir, sort, search);
  const { data, isLoading, refetch } = useGetFilesQuery(params ? params : null);
  const [addFile, { data: dirData, error: dirError }] = useCreateDirMutation();

  useEffect(() => {
    refetch();
  }, [sort]);

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
      refetch();
    }
    if (dirError) {
      message.error("Create dir error");
    }
  }, [dirData, dirError]);

  const goBack = () => {
    if (dirStack.length > 0) {
      dispatch(popToStack());
      dispatch(popToPath());
    }
  };

  // Добавить новую папку
  const addNewFolder = async () => {
    try {
      if (folderName.length === 0) {
        return message.info("The file name should not be empty");
      }
      let folderNameValid = folderName.replace(/[^\p{L}\d\s]/gu, '').trim();
      const response: any = await addFile({
        name: folderNameValid,
        type: "dir",
        parent: currentDir,
      });
      unwrapResult(response)
      setModal(false);
      setFolderName("");
    } catch (e: any) {
      message.error(`Request failed: ${e.data.message}`);
    }
  };

  if (isLoading || !data) {
    return (
      <Spin style={{ width: "100%", height: "100%", marginTop: "400px" }} />
    );
  }

  return (
    <div className="disk-wrapper">
      <img src={diskBack} className="disk-background-img" loading="lazy" />
      <div className="disk-nav">
        <div className="disk-control-btns">
          <Button onClick={() => goBack()}>
            <LeftOutlined />
          </Button>
          <Button onClick={() => setModal(true)}>
            <p className="disc-createFolder-txt">Create new folder</p>
          </Button>

          <Button icon={<UploadOutlined />} onClick={() => setUploadModal(true)} className="upload-btn disk-upload">
            Click to Upload
          </Button>
          <UploadModal status={uploadModal} def={setUploadModal}/>
          <Select
            className="disk-order"
            defaultValue="Order by"
            onChange={(value) => setSort(value)}
            options={[
              { value: "name", label: "name" },
              { value: "type", label: "type" },
              { value: "date", label: "date" },
            ]}
          />
          <Search
            placeholder="What are you looking for?"
            className="search-files"
            onSearch={onSearch}
            enterButton
          />
          <div className="visual">
            <UnorderedListOutlined
              className="visual-by-list"
              onClick={() => dispatch(setView("list"))}
            />
            <AppstoreOutlined
              className="visual-by-file"
              onClick={() => dispatch(setView("plate"))}
            />
          </div>
          <Breadcrumb separator=">" className="breadcrumb" items={paths} />
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
