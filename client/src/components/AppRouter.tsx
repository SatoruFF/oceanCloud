import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { WELCOME_ROUTE } from "../utils/consts";
import { routes, privateRoutes } from "../utils/routes";
import { useAppDispatch, useAppSelector } from "../store/store";
import { useAuthQuery } from "../actions/user";
import { setUser } from "../store/reducers/userSlice";
import { Spin, notification } from "antd";
import { ApiOutlined } from "@ant-design/icons";
import { logout } from "../store/reducers/userSlice";

const AppRouter = () => {
  const isAuth = useAppSelector((state) => state.users.isAuth);
  const dispatch = useAppDispatch()
  const { data: authData, isLoading: isAuthLoading } = useAuthQuery();

  useEffect(() => {
    if (authData) {
      dispatch(setUser(authData as any));
    } else {
      dispatch(logout());
    }
  }, [authData, dispatch]);

  if (isAuthLoading) {
    return  <Spin/>;
  }

  return (
    <Routes>
      {isAuth ? (
        <>
          {privateRoutes.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={<item.element />}
            />
          ))}
        </>
      ) : (
        <>
          {routes.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={<item.element />}
            />
          ))}
        </>
      )}
      <Route path="/*" element={<Navigate replace to={WELCOME_ROUTE} />} />
    </Routes>
  );
};

export default AppRouter;
