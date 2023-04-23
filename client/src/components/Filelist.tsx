import { Divider } from 'antd';
import '../style/fileList.scss'
import { useAppSelector } from '../store/store';
import File from './File'

const Filelist = () => {

    const files = useAppSelector(state => state.files.files)

    return (
        <div className="fileList-wrapper animate__animated animate__fadeIn">
            <div className="fileList-header">
                <p className='name'>Name</p>
                <p className='date'>Date</p>
                <p className='size'>Size</p>
            </div>
            {files.map((file: any) => (
                <File key={Math.random()} file={file}/>
            ))}
        </div>
    );
}

export default Filelist;