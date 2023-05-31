import { useLocation } from "react-router-dom";
import Register from "../components/Register";
import "../style/auth.scss";
import Login from "../components/Login";
import ParticleEffect from "../components/ParticleEffect";

const Authorization = () => {
  const whereIAm = useLocation();

  return (
    <div className="auth__wrapper">

      <div className="auth__space">
        <div className="auth__left-side">
          <div className="left-side__title">Its time <br /> to wake up.</div>
        </div>
        <div className="auth__right-side">
          <ParticleEffect/>
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
