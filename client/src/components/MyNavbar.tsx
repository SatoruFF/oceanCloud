import React, { useState } from "react";
import "../style/navbar.scss";
import { NavLink, useNavigate } from "react-router-dom";
import mainLogo from "../assets/logo-without-back.png";
import {
  FILE_ROUTE,
  LOGIN_ROUTE,
  REGISTRATION_ROUTE,
  WELCOME_ROUTE,
} from "../utils/consts";
import { useAppDispatch, useAppSelector } from "../store/store";
import { Button, notification, Typography, Drawer } from "antd";
const { Title, Paragraph } = Typography;
import { logout } from "../store/reducers/userSlice";
import { ApiOutlined, SettingOutlined } from "@ant-design/icons";

const MyNavbar: React.FC = () => {
  const isAuth = useAppSelector((state) => state.users.isAuth);
  const user = useAppSelector((state) => state.users.currentUser);
  const [drawer, setDrawer] = useState(false);
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
    <div className="navbar">
      <div className="main-logo">
        <img src={mainLogo} alt="" />
      </div>
      {isAuth ? (
        <div className="nav__items">
          <div className="navbar__item">
            <NavLink to={WELCOME_ROUTE}>home page</NavLink>
          </div>
          <div className="navbar__item">
            <NavLink to={FILE_ROUTE}>My files</NavLink>
          </div>
          <Button type="primary" onClick={() => logOut()}>
            Log out
          </Button>
          <div className="user-info" onClick={() => setDrawer(true)}>
            <p>{user.firstName}</p>
            <p>{user.lastName}</p>
            <SettingOutlined />
          </div>
          <Drawer
            title="Settings"
            placement="right"
            onClose={() => setDrawer(false)}
            open={drawer}
          >
          </Drawer>
        </div>
      ) : (
        <div className="nav__items">
          <div className="navbar__item">
            <NavLink to={LOGIN_ROUTE}>authorization</NavLink>
          </div>
          <div className="navbar__item">
            <NavLink to={REGISTRATION_ROUTE}>registration</NavLink>
          </div>
          <div className="navbar__item">
            <NavLink to={WELCOME_ROUTE}>HOME PAGE</NavLink>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNavbar;
