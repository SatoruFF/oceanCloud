import React from "react";
import "../style/navbar.scss";
import { NavLink } from "react-router-dom";
import mainLogo from "../assets/logo-without-back.png";
import { FILE_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE, WELCOME_ROUTE } from "../utils/consts";

const MyNavbar = () => {
  return (
    <div className="navbar">
      <div className="main-logo">
        <img src={mainLogo} alt="" />
      </div>
      <div className="navbar__item">
        <NavLink to={LOGIN_ROUTE}>authorization</NavLink>
      </div>
      <div className="navbar__item">
        <NavLink to={REGISTRATION_ROUTE}>registration</NavLink>
      </div>
      <div className="navbar__item">
        <NavLink to={WELCOME_ROUTE}>MAIN</NavLink>
      </div>
      <div className="navbar__item">
        <NavLink to={FILE_ROUTE}>file</NavLink>
      </div>
    </div>
  );
};

export default MyNavbar;
