import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './AppRouter.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'
import { AnalysisProvider } from './context/AnalysisContext.jsx'
import './styles/globals.css'

// Configure global axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

