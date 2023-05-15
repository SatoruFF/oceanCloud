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
import {
  Button,
  Spin,
  Modal,
  Input,
  message,
  Upload,
  Select,
  Breadcrumb,
} from "antd";
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
import type { UploadProps } from "antd";
import { generateParams } from "../utils/generateParams";
const { Search } = Input;

const FileSpace = () => {
  //Redux state
  const dispatch = useAppDispatch();
  const currentDir = useAppSelector((state) => state.files.currentDir);
  const dirStack = useAppSelector((state) => state.files.dirStack);
  const paths = useAppSelector((state) => state.files.paths);

  //states
  const [modal, setModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [sort, setSort]: any = useState("");
  const token = localStorage.getItem("token");
  const [search, setSearch] = useState("");
  const onSearch = (value: string) => setSearch(value);
  console.log(dirStack);

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

  // file upload
  const props: UploadProps = {
    name: "file",
    action: "http://localhost:3002/api/file/upload",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      parent: currentDir,
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
        refetch();
      } else if (info.file.status === "error") {
        message.error(
          `${info.file.name} file upload failed. Perhabs file already exist.`
        );
      }
    },
    progress: {
      strokeColor: {
        "0%": "#108ee9",
        "100%": "#87d068",
      },
      strokeWidth: 3,
      format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
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
      setFolderName("");
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
      <img src={diskBack} className="disk-background-img" loading="lazy" />
      <div className="disk-nav">
        <div className="disk-control-btns">
          <Button onClick={() => goBack()}>
            <LeftOutlined />
          </Button>
          <Button onClick={() => setModal(true)}>
            <p className="disc-createFolder-txt">Create new folder</p>
          </Button>

          <Upload
            className="disk-upload"
            name="file"
            multiple={true}
            {...props}
          >
            <Button icon={<UploadOutlined />} className="upload-btn">
              Click to Upload
            </Button>
          </Upload>

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
          <Breadcrumb className="breadcrumb" items={paths} />
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
