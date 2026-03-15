import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@fontsource-variable/rubik';
import '@fontsource/poppins/index.css';
import './styles/global.scss';
import ScrollToHash from './components/ScrollToHash';
import Home from './pages/Home';
import Login from './pages/Login';

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToHash />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}

