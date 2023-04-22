import '../style/fileSpace.scss'
import { useAppSelector } from '../store/store';
import { useAppDispatch } from '../store/store';
import { useEffect } from 'react';
import { EnterOutlined, LeftOutlined } from "@ant-design/icons";
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const FileSpace = () => {

    const dispatch = useAppDispatch()
    const currentDir = useAppSelector(state => state.files.currentDir)
    const navigate = useNavigate()

    useEffect(() => {
        const check = async () => {
            console.log(1)
        }
        check()
    }, [currentDir])

    const goBack = () => {
        navigate(-1)
    }
    
    return (
        <div className="disk-wrapper">
            <div className="disk-title"> <p>Files</p> </div>
            <div className="disk-wrapper-btns">
                <Button onClick={() => goBack()}>
                    <LeftOutlined />
                </Button>
                <Button>
                    <p className='disc-createFolder-txt'>Create new folder</p>
                </Button>
            </div>
        </div>
    );
}

export default FileSpace;