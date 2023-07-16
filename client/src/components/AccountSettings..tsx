import { Button, Divider, notification } from "antd";
import "../style/accountSettings.scss";
import { useAppSelector, useAppDispatch } from "../store/store";
import { sizeFormat } from "../utils/sizeFormat";
import { logout } from "../store/reducers/userSlice";
import { WELCOME_ROUTE } from "../utils/consts";
import { ApiOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import InfoModal from "./modals/InfoModal";
import PasswordModal from "./modals/PasswordModal";
import DeleteModal from "./modals/DeleteModal";

const AccountSettings = () => {
  const [changeInfoModal, setChangeInfoModal] = useState(false)
  const [changePassModal, setChangePassModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const user = useAppSelector((state) => state.users.currentUser);
  const totalSpace = sizeFormat(user.diskSpace);
  const usedSize = sizeFormat(user.usedSpace);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logOut = () => {
    dispatch(logout());
    navigate(WELCOME_ROUTE);
    notification.open({
      message: "You succesfully log out",
      description: "You have successfully logged out of your account",
      placement: "topLeft",
      icon: <ApiOutlined style={{ color: "#ff7875" }} />,
    });
  };

  return (
    <div className="account-wrapper">
      <div className="account-personal">
        <p className="personal-item">Username: {user.userName}</p>
        <p className="personal-item">Email: {user.email}</p>
        <p className="personal-item">Role: {user.role}</p>
        <Button className="personal-logout" type="primary" onClick={() => logOut()}>
          Log out
        </Button>
      </div>
      <div className="account-settings">
        <Divider orientation="left">Edit</Divider>
        <Button className="account-btn" onClick={() => setChangeInfoModal(true)}>Change profile info</Button>
        {/* <Button className="account-btn" onClick={() => setChangePassModal(true)}>Change password</Button> */}
        {/* <Button className="account-btn" danger onClick={() => setDeleteModal(true)}>
          Delete account
        </Button> */}
      </div>
      <InfoModal status={changeInfoModal} def={setChangeInfoModal}/>
      <PasswordModal status={changePassModal} def={setChangePassModal}/>
      <DeleteModal status={deleteModal} def={setDeleteModal}/>
    </div>
  );
};

export default AccountSettings;
