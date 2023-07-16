import { Empty } from "antd";
import "../style/fileList.scss";
import { useAppSelector } from "../store/store";
import File from "./File";

const Filelist = () => {
  const files = useAppSelector((state) => state.files.files);
  const fileView = useAppSelector((state) => state.files.view);

  if (files.length === 0) {
    return <h1 className="files-not-found animate__animated animate__fadeIn"> <Empty className="empty-folder"/> </h1>
  }

  if (fileView == 'plate') {
    return (
      <div className="fileplate-list-wrapper animate__animated animate__fadeIn">
        {files.map((file: any) => (
          <File key={Math.random()} file={file} />
        ))}
      </div>
    );
  }

  return (
    <div className="filelist-wrapper animate__animated animate__fadeIn">
      <div className="fileList-header">
        <p className="name">Name</p>
        <p className="date">Date</p>
        <p className="size">Size</p>
      </div>

      {files.map((file: any) => (
        <File key={Math.random()} file={file} />
      ))}
    </div>
  );

};

export default Filelist;
