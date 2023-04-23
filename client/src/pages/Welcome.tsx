import React from "react";
import "../style/welcome.scss";

const Welcome = () => {

  return (
    <div className="welcome__wrapper">
      <div className="welcome__card">
        <div className="welcome-card__title animate__animated animate__fadeIn">Ocean cloud</div>
        <div className="welcome-card__description animate__animated animate__fadeInDown">
          Ocean - its a nice web cloud for everyone. each person is given as much
          as 100 free megabytes
        </div>
      </div>
    </div>
  );
};

export default Welcome;
