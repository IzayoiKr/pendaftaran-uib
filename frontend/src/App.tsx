import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import '@fontsource-variable/rubik';
// import '@fontsource/poppins';
import './styles/global.scss';
import ScrollToHash from './components/ScrollToHash';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterPage from './pages/Register/RegisterPage';
import NotFound from './components/NotFound/NotFound';

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToHash />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='*' element={<NotFound />} />
                <Route path='/register/:id' element={<RegisterPage />} />
            </Routes>
        </BrowserRouter>
    );
}

