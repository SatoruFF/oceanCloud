import { useAppDispatch, useAppSelector } from "../store/store";
import { Button, Upload, message } from "antd";
import type { UploadProps } from "antd";
import "../style/profile.scss";
import { useDeleteAvatarMutation } from "../services/file";
import { setUser } from "../store/reducers/userSlice";
import avatarIcon from "../assets/avatar-icon.png";

const Profile = () => {
  const user = useAppSelector((state) => state.users.currentUser);
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");
  const avatar = user.avatar
    ? `http://localhost:3002/${user.avatar}`
    : avatarIcon;
  const [deleteAvatar, { data: userWithoutAvatarData }] =
    useDeleteAvatarMutation();

  // file upload
  const props: UploadProps = {
    name: "file",
    action: "http://localhost:3002/api/file/avatar",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png";
      const isJPEG = file.type === "image/jpeg";
      if (!isPNG && !isJPEG) {
        message.error(`${file.name} is not a png or jpeg file`);
      }
      return isPNG || isJPEG ? true : Upload.LIST_IGNORE;
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
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

  const changeAvatarHandler = async () => {
    try {
      const response: any = await deleteAvatar();
      dispatch(setUser(userWithoutAvatarData));
      message.success("Avatar successfully deleted");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-content">
        <div className="profile__main-card">
          <img src={avatar} alt="avatar" loading="lazy" />
          <div className="profile-btns">
            <Button type="primary" danger onClick={() => changeAvatarHandler()}>
              Delete avatar
            </Button>
            <Upload name="file" multiple={true} {...props}>
              <Button className="upload-btn">Upload avatar</Button>
            </Upload>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
