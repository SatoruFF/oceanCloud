import { Form, Input, Modal } from "antd";
import { useAppSelector, useAppDispatch } from "../../store/store";

const InfoModal = ({ status, def }) => {
  const user = useAppSelector((state) => state.users.currentUser);
  const changeInfo = () => {
    // ...
    def(false);
  };
  return (
    <Modal
      title="Change profile info"
      open={status}
      onOk={changeInfo}
      onCancel={() => def(false)}
    >
      <Form
        name="changeInfo"
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="First name"
          name="first-name"
        >
          <Input placeholder={user.firstName}/>
        </Form.Item>
        <Form.Item
          label="Last name"
          name="last-name"
        >
          <Input placeholder={user.lastName}/>
        </Form.Item>
        <Form.Item
          label="Email"
          name="username"
        >
          <Input placeholder={user.email}/>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InfoModal;
