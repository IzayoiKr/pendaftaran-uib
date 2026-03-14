import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "@fontsource-variable/rubik"
import "@fontsource/poppins/index.css"
import './styles/global.scss';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
