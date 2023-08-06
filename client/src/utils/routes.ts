import {
  WELCOME_ROUTE,
  REGISTRATION_ROUTE,
  LOGIN_ROUTE,
  FILE_ROUTE,
  PROFILE_ROUTE,
  POMODORO_ROUTE,
} from "./consts";
import Welcome from "../pages/Welcome";
import Authorization from "../pages/Authorization";
import FileSpace from "../pages/FileSpace";
import Profile from "../pages/Profile";
import Pomodoro from "../pages/PomodoroTimer";

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
    path: FILE_ROUTE,
    element: FileSpace,
  },
  {
    path: PROFILE_ROUTE,
    element: Profile,
  },
  {
    path: POMODORO_ROUTE,
    element: Pomodoro,
  },
];
