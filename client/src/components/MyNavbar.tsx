import React, { useState } from "react";
import "../style/navbar.scss";
import { NavLink, useNavigate } from "react-router-dom";
import mainLogo from "../assets/turtle-logo-without-back.png";
import {
  FILE_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  REGISTRATION_ROUTE,
  WELCOME_ROUTE,
} from "../utils/consts";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  Button,
  notification,
  Typography,
  Drawer,
  Divider,
  Tooltip,
} from "antd";
const { Title, Paragraph } = Typography;
import { logout } from "../store/reducers/userSlice";
import {
  ApiOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import AccountSettings from "./AccountSettings.";
import avatarIcon from "../assets/avatar-icon.png";

const MyNavbar: React.FC = () => {
  const isAuth = useAppSelector((state) => state.users.isAuth);
  const user = useAppSelector((state) => state.users.currentUser);
  const [profile, setProfile] = useState(false);
  const [burger, setBurger] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const avatar = user.avatar
    ? user.avatar
    : avatarIcon;

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
        <img src={mainLogo} alt="" onClick={() => navigate(WELCOME_ROUTE)} />
      </div>
      {isAuth ? (
        <div className="nav__items">
          <div className="nav-files">
            <Button ghost>
              <NavLink to={FILE_ROUTE}>My files</NavLink>
            </Button>
          </div>
          <Button
            className="nav-logout"
            type="primary"
            onClick={() => logOut()}
          >
            Log out
          </Button>
          <div className="nav-user">
            <Tooltip title="Account Settings">
              <div className="user-info" onClick={() => setProfile(true)}>
                <p>{user.userName}</p>
                <SettingOutlined />
              </div>
            </Tooltip>
            <div className="avatar">
              <img src={avatar} onClick={() => navigate(PROFILE_ROUTE)} />
            </div>
          </div>
          <Drawer
            title="Settings"
            placement="right"
            onClose={() => setProfile(false)}
            open={profile}
            style={{backgroundColor: 'white'}}
          >
            <AccountSettings />
          </Drawer>
        </div>
      ) : (
        <div className="nav__items">
          <div className="navbar__item">
            <Button ghost>
              <NavLink to={LOGIN_ROUTE}>authorization</NavLink>
            </Button>
          </div>
          <div className="navbar__item">
            <Button ghost>
              <NavLink to={REGISTRATION_ROUTE}>registration</NavLink>
            </Button>
          </div>
          <div className="nav-burger">
            {!burger ? (
              <MenuFoldOutlined
                className="burger-icon"
                onClick={() => setBurger(true)}
              />
            ) : (
              <MenuUnfoldOutlined className="burger-icon" />
            )}
            <Drawer
              title="Pages"
              placement="left"
              onClose={() => setBurger(false)}
              open={burger}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="burger__item"
              >
                <Divider>
                  <NavLink to={WELCOME_ROUTE}>Home page</NavLink>
                </Divider>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="burger__item"
              >
                <Divider>
                  <NavLink to={LOGIN_ROUTE}>Log in</NavLink>
                </Divider>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="burger__item"
              >
                <Divider>
                  <NavLink to={REGISTRATION_ROUTE}>Registration</NavLink>
                </Divider>
              </motion.div>
            </Drawer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNavbar;
