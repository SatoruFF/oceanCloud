import {
  WELCOME_ROUTE,
  REGISTRATION_ROUTE,
  LOGIN_ROUTE,
  FILE_ROUTE,
  PROFILE_ROUTE,
  POMODORO_ROUTE,
  CHATS_ROUTE,
  NOTES_ROUTE,
  TODO_ROUTE,
} from "./consts";

import Welcome from "../pages/Welcome";
import Authorization from "../pages/Authorization";
import FileSpace from "../pages/FileSpace";
import Profile from "../pages/Profile";
import Pomodoro from "../pages/PomodoroTimer";
import Chats from "../pages/Chats";
import Notes from "../pages/Notes";
import Todo from "../pages/Todo";

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
  // {
  //   path: ACTIVATION_ROUTE,
  //   element: Authorization,
  // },
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
    path: CHATS_ROUTE,
    element: Chats,
  },
  {
    path: NOTES_ROUTE,
    element: Notes,
  },
  {
    path: TODO_ROUTE,
    element: Todo,
  },
  {
    path: POMODORO_ROUTE,
    element: Pomodoro,
  },
];
