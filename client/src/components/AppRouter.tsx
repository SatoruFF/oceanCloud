import { Routes, Route, Navigate } from "react-router-dom";
import { WELCOME_ROUTE } from "../utils/consts";
import { routes, privateRoutes } from "../utils/routes";
import { useAppSelector } from "../store/store";

const AppRouter = () => {
  const isAuth = useAppSelector((state) => state.users.isAuth);

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
