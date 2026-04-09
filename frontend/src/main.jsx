import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './AppRouter.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'
import { AnalysisProvider } from './context/AnalysisContext.jsx'
import './styles/globals.css'

// Configure global axios defaults explicitly
axios.defaults.baseURL = 'https://api.geo-tool.site';

// Add a global request interceptor to attach the JWT token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('geo_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AnalysisProvider>
                <ToastProvider>
                    <AppRouter />
                </ToastProvider>
            </AnalysisProvider>
        </BrowserRouter>
    </React.StrictMode>,
)

