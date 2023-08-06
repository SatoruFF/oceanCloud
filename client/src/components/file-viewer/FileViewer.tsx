import { Image, Modal, Button } from "antd";
import React, { useState } from "react";
import {
  FolderFilled,
  FileFilled,
  PlayCircleOutlined,
} from "@ant-design/icons";
import "../../style/fileViewer.scss";
import ReactPlayer from "react-player";

const FileViewer = ({ type, url }) => {
  const [isOpenPlayer, setIsOpenPlayer] = useState(false);

  const isImage =
    type == "png" || type == "jpg" || type == "jpeg" || type == "gif";
  const isPlayer =
    type == "mp4" ||
    type == "webm" ||
    type == "ogv" ||
    type == "mp3" ||
    type == "hls" ||
    type == "dash";
  // need to destructure, cause in future this a big module
  const determineViewer = (fileType: String, url: any) => {
    if (fileType === "dir") {
      return <FolderFilled className="folder" />;
    } else if (isImage) {
      return <Image src={url} className="image-file" />;
    } else if (isPlayer) {
      return <PlayCircleOutlined className="playerIcon" onClick={() => setIsOpenPlayer(true)}/>;
    } else {
      return <FileFilled className="file" />;
    }
  };
  return (
    <div className="allFile-viewer">
      {determineViewer(type, url)}
      <Modal
        title="Player"
        className="playerModal-file-viewer"
        open={isOpenPlayer}
        onCancel={() => setIsOpenPlayer(false)}
        footer={[
            <Button key="back" onClick={() => setIsOpenPlayer(false)}>
              cancel
            </Button>,
          ]}
      >
        <ReactPlayer className="mainPlayer" controls={true} url={url} />
      </Modal>
    </div>
  );
};

export default FileViewer;
