import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToHash from './components/ScrollToHash';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import NotFound from './components/NotFound/NotFound';
import useAuthStore from './store/useAuthStore';
import InfoUmum from "./pages/InfoUmum";

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Account = lazy(() => import('./pages/MyAccountPage/AccountPage'))
const Forgot = lazy(() => import('./pages/ForgotPassword'))
const BuktiTransfer = lazy(() => import('./pages/TransferProof'))
const UploadBuktiTransferPage = lazy(() => import('./pages/UploadTransferProof/UploadBuktiTransferPage'))
const PrasyaratOspekPage = lazy(() => import('./pages/PrasyaratOSPEK/PrasyaratOspekPage'))
const PerubahanProdiPage = lazy(() => import('./pages/ProdiChange/PerubahanProdiPage'))
const RequestPindahProdiPage = lazy(() => import('./pages/RequestProdiChange/RequestPindahProdiPage'))
const UbahPasswordPage = lazy(() => import('./pages/PasswordChange/UbahPasswordPage'))
const UbahProfilePage = lazy(() => import('./pages/ProfilChange/UbahProfilePage'))
const RegisterGelombang = lazy(() => import('./pages/RegisterGelombang'))

function RootLayout() {
    const restoreSession = useAuthStore((state) => state.restoreSession);

    useEffect(() => { restoreSession() }, []);

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
            { path: '/forgot', element: <Forgot /> },
            { path: '/register', element: <Register /> },
            { path: '/infoumum', element: <InfoUmum /> },

            {
                element: <ProtectedRoute />,
                children: [
                    { path: '/passwordchange', element: <UbahPasswordPage /> },
                    { path: '/account', element: <Account /> },
                    { path: '/transferproof', element: <BuktiTransfer /> },
                    { path: '/uploadtransferproof', element: <UploadBuktiTransferPage /> },
                    { path: '/prasyaratospek', element: <PrasyaratOspekPage /> },
                    { path: '/changeprodi', element: <PerubahanProdiPage /> },
                    { path: '/requestchangeprodi', element: <RequestPindahProdiPage /> },
                    { path: '/profilechange', element: <UbahProfilePage /> },
                    { path: '/register/:id', element: <RegisterGelombang /> },
                ]
            },

            { path: '*', element: <NotFound /> }
        ]
    }
])

export default function App() {
    return (
        <Suspense fallback={<div>Loading pages...</div>}>
            <RouterProvider router={router} />
        </Suspense>
    )
}
