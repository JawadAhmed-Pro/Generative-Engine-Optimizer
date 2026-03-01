import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './AppRouter.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'
import { AnalysisProvider } from './context/AnalysisContext.jsx'
import './styles/globals.css'

// Configure global axios defaults explicitly
axios.defaults.baseURL = 'https://generative-engine-optimizer.onrender.com';

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

