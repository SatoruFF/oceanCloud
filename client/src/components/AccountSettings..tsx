import { Button, Divider } from 'antd';
import '../style/accountSettings.scss'
import { useAppSelector } from '../store/store';
import { sizeFormat } from '../utils/sizeFormat';


const AccountSettings = () => {
    const user = useAppSelector(state => state.users.currentUser)
    const totalSpace = sizeFormat(user.diskSpace)
    const usedSize = sizeFormat(user.usedSpace)

    return (
        <div className="account-wrapper">
            <div className="account-personal">
                <p className='personal-item'>First name: {user.firstName}</p>
                <p className='personal-item'>Last name: {user.lastName}</p>
                <p className='personal-item'>Email: {user.email}</p>
                <p className='personal-item'>Role: {user.role}</p>
                <p className='personal-item'>Total disk space: {totalSpace}</p>
                <p className='personal-item'>Used space: {usedSize}</p>
            </div>
            <div className="account-settings">
                <Divider orientation='left'>Edit</Divider>
                <Button className='account-btn'>Change profile info</Button>
                <Button className='account-btn'>Change password</Button>
                <Button className='account-btn' danger>Delete account</Button>
            </div>
        </div>
    );
}

export default AccountSettings;