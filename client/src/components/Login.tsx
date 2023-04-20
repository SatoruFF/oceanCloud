import React, { useState } from "react";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Spin,
  message,
  notification,
} from "antd";
import Divider from "antd/es/divider";
import { NavLink, useNavigate } from "react-router-dom";
import { FILE_ROUTE, REGISTRATION_ROUTE } from "../utils/consts";
import { useAppDispatch } from "../store/store";
import { setUser } from "../store/reducers/userSlice";
import { userApi } from "../actions/user";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [setLogin, { isLoading, error }]: any = userApi.useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      if (email == '' && password == '') {
        return message.error(`error: some field are empty`);
      }
      const user: any = await setLogin({
        email,
        password,
      });
      dispatch(setUser(user.data as any));
      notification.open({
        message: "Success log in",
        description: `User with email: ${email} has log in`,
      });
      navigate(FILE_ROUTE);
    } catch (e: any) {
      message.error(`error: ${error.data.message}`);
      console.log(error.data.message);
    }
  };

  return (
    <div className="right-side__form">
      <div className="auth-form__title">Login</div>
      <Form layout="vertical">
        <Form.Item label="email:">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="please input your email here..."
          />
        </Form.Item>
        <Form.Item label="password:">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="please input your password here..."
          />
        </Form.Item>
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <Form.Item>
          <div>
            {isLoading ? (
              <Spin />
            ) : (
              <Button
                onClick={() => handleClick()}
                type="primary"
                htmlType="submit"
              >
                Submit
              </Button>
            )}
          </div>
        </Form.Item>
        <Divider orientation="left">No account?</Divider>
        <Button>
          <NavLink to={REGISTRATION_ROUTE}>Create profile</NavLink>{" "}
        </Button>
      </Form>
    </div>
  );
};

export default Login;
