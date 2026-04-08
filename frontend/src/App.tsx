import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToHash from './components/ScrollToHash';
import Home from './pages/Home';
import Login from './pages/Login';
import Forgot from './pages/ForgotPassword';
import BuktiTransfer from './pages/TransferProof';
import UploadBuktiTransferPage from './pages/UploadTransferProof/UploadBuktiTransferPage';
import PrasyaratOspekPage from './pages/PrasyaratOSPEK/PrasyaratOspekPage';
import PerubahanProdiPage from './pages/ProdiChange/PerubahanProdiPage';
import RequestPindahProdiPage from './pages/RequestProdiChange/RequestPindahProdiPage';
import UbahPasswordPage from './pages/PasswordChange/UbahPasswordPage';
import UbahProfilePage from './pages/ProfilChange/UbahProfilePage';
import RegisterGelombang from './pages/RegisterGelombang';
import Register from './pages/RegisterPage';
import Account from './pages/MyAccountPage';
import NotFound from './components/NotFound/NotFound';

function RootLayout() {
    return (
        <>
            <Toaster
                toastOptions={{
                    classNames: {
                        toast: 'toast',
                        title: 'toast-title',
                        description: 'toast-desc',
                        closeButton: 'toast-closeBtn'
                    }
                }}
                position="top-center"
                richColors
                closeButton
                duration={4000}
            />
            <ScrollRestoration />
            <ScrollToHash />
            <Outlet />
        </>
    )
}

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/login', element: <Login /> },
            { path: '/login/forgot', element: <Forgot /> },
            { path: '/login/passwordchange', element: <UbahPasswordPage /> },
            { path: '/register', element: <Register /> },
            { path: '/register/:id', element: <RegisterGelombang /> },
            { path: '/account', element: <Account /> },
            { path: '/transferproof', element: <BuktiTransfer /> },
            { path: '/uploadtransferproof', element: <UploadBuktiTransferPage /> },
            { path: '/prasyaratospek', element: <PrasyaratOspekPage /> },
            { path: '/changeprodi', element: <PerubahanProdiPage /> },
            { path: '/requestchangeprodi', element: <RequestPindahProdiPage /> },
            { path: '/profilechange', element: <UbahProfilePage /> },
            { path: '*', element: <NotFound /> }
        ]
    }
])

export default function App() {
    return <RouterProvider router={router} />;
}
