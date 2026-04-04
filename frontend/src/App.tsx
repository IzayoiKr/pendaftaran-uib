import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@fontsource-variable/rubik';
import '@fontsource/poppins';
import './styles/global.scss';
import ScrollToHash from './components/ScrollToHash';
import Home from './pages/Home';
import Login from './pages/Login';
import Forgot from './pages/ForgotPassword';
import BuktiTransfer from './pages/TransferProof';
import UploadBuktiTransferPage from './pages/UploadTransferProof/UploadBuktiTransferPage';
import PrasyaratOspekPage from './pages/PrasyaratOSPEK/PrasyaratOspekPage';
import RegisterGelombang from './pages/RegisterGelombang';
import Register from './pages/RegisterPage';
import Account from './pages/MyAccountPage';
import NotFound from './components/NotFound/NotFound';

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToHash />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register/:id' element={<RegisterGelombang />} />
                <Route path='*' element={<NotFound />} />
                <Route path='/register' element= {<Register/>} />
                <Route path='/forgot' element= {<Forgot/>} />
                <Route path='/account' element= {<Account/>} />
                <Route path='/transferproof' element={<BuktiTransfer />} />
                <Route path='/uploadtransferproof' element={<UploadBuktiTransferPage />} />
                <Route path='/prasyaratospek' element={<PrasyaratOspekPage />} />
            
                
            </Routes>
        </BrowserRouter>
    );
}

