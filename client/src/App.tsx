import { useState } from "react";
import AppRouter from "./components/AppRouter";
import { BrowserRouter } from "react-router-dom";
import MyNavbar from "./components/MyNavbar";
import './style/global.scss'

function App() {
  return (
    <BrowserRouter>
      <MyNavbar />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
