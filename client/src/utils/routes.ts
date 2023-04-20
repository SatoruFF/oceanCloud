import {
  WELCOME_ROUTE,
  REGISTRATION_ROUTE,
  LOGIN_ROUTE,
  FILE_ROUTE,
} from "./consts";
import Welcome from "../pages/Welcome";
import Authorization from "../pages/Authorization";
import FileSpace from "../pages/FileSpace";

export const routes = [
  {
    path: WELCOME_ROUTE,
    element: Welcome,
  },
  {
    path: LOGIN_ROUTE,
    element: Authorization,
  },
  {
    path: REGISTRATION_ROUTE,
    element: Authorization,
  },
];

export const privateRoutes = [
  {
    path: WELCOME_ROUTE,
    element: Welcome,
  },
  {
    path: LOGIN_ROUTE,
    element: Authorization,
  },
  {
    path: REGISTRATION_ROUTE,
    element: Authorization,
  },
  {
    path: FILE_ROUTE,
    element: FileSpace,
  },
]
