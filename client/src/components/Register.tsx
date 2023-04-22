import { Form, Input, Button, message, Spin, notification } from "antd";
import Divider from "antd/es/divider";
import { NavLink, useNavigate } from "react-router-dom";
import { LOGIN_ROUTE } from "../utils/consts";
import { useState } from "react";
import { userApi } from "../services/user";
import { useAppDispatch } from "../store/store";
import { setUser } from "../store/reducers/userSlice";
import { current } from "@reduxjs/toolkit";
import { FILE_ROUTE } from "../utils/consts";
import { SmileOutlined } from "@ant-design/icons";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [regUser, { isLoading, error }]: any =
    userApi.useRegistrationMutation();

  const handleCreate = async () => {
    try {
      if (email == "" && password == "") {
        return message.error(`error: some field are empty`);
      }
      const user = await regUser({
        firstName,
        lastName,
        email,
        password,
      });
      dispatch(setUser(user.data as any));
      notification.open({
        message: "Success registration",
        description: `User with email: ${email} was created`,
        placement: "topLeft",
        icon: <SmileOutlined style={{ color: "#108ee9" }} />,
      });
      navigate(FILE_ROUTE);
    } catch (e: any) {
      message.error(`error: ${error.data.message}`);
      console.log(error.data.message);
    }
  };

  return (
    <div className="right-side__form">
      <div className="auth-form__title">Registration</div>
      <Form layout="vertical">
        <Form.Item
          label="first name:"
          name="firstName"
          rules={[{ required: true, message: "Please input your first name!" }]}
        >
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="please input your first name here..."
          />
        </Form.Item>
        <Form.Item
          label="last name:"
          name="lastName"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="please input your last name here..."
          />
        </Form.Item>
        <Form.Item
          label="email:"
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="please input your email here..."
          />
        </Form.Item>
        <Form.Item
          label="password:"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="please input your password here..."
          />
        </Form.Item>
      </Form>
      <div>
        {isLoading ? (
          <Spin />
        ) : (
          <Button
            onClick={() => handleCreate()}
            type="primary"
            htmlType="submit"
          >
            Submit
          </Button>
        )}
      </div>
      <Divider orientation="left">Already have account?</Divider>
      <Button>
        <NavLink to={LOGIN_ROUTE}>Log in</NavLink>{" "}
      </Button>
    </div>
  );
};

export default Register;
