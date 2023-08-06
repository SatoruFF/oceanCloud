import {
    Dropdown,
    MenuProps,
    Space,
  } from "antd";
import {
    DownOutlined,
    FieldTimeOutlined,
    SendOutlined,
    SnippetsOutlined,
    CarryOutOutlined,
  } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { POMODORO_ROUTE } from "../../utils/consts";

const WorkspacesDropdown = () => {
    const items: MenuProps["items"] = [
        {
          key: "1",
          label: (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.antgroup.com"
            >
              Chats
            </a>
          ),
          icon: <SendOutlined />
        },
        {
          key: "2",
          label: (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.aliyun.com"
            >
              Notes
            </a>
          ),
          icon: <SnippetsOutlined />,
        },
        {
          key: "3",
          label: (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.luohanacademy.com"
            >
              To-do
            </a>
          ),
          icon: <CarryOutOutlined />
        },
        {
          key: "4",
          label: (
            <NavLink to={POMODORO_ROUTE}>Pomodoro</NavLink>
          ),
          danger: true,
          icon: <FieldTimeOutlined />
        },
      ];
    return (
        <Dropdown menu={{ items }}>
        <a onClick={(e) => e.preventDefault()}>
          <Space style={{cursor: 'default'}}>
            workspace
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
    );
}

export default WorkspacesDropdown;