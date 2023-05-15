import { useLocation } from "react-router-dom";
import Register from "../components/Register";
import "../style/auth.scss";
import Login from "../components/Login";
import regBack from '../assets/reg-back.jpg'

const Authorization = () => {
  const whereIAm = useLocation();

  return (
    <div className="auth__wrapper">

      <div className="auth__space">
        <div className="auth__left-side">
          <div className="left-side__title">Its time <br /> to wake up.</div>
        </div>
        <div className="auth__right-side">
        <img src={regBack} className="auth-background-img" loading="lazy" />
          {whereIAm.pathname == "/login" ? (
            <Login/>
          ) : (
            <Register/>
          )}
        </div>
      </div>
    </div>
  );
};

export default Authorization;
