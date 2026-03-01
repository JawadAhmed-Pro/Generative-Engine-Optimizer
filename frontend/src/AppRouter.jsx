import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import App from './App'
import OnboardingWizard from './components/OnboardingWizard'

function AppRouter() {
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [checkingOnboarding, setCheckingOnboarding] = useState(true)

    useEffect(() => {
        // Check if onboarding is complete
        const isComplete = localStorage.getItem('geo_onboarding_complete')
        if (!isComplete) {
            setShowOnboarding(true)
        }
        setCheckingOnboarding(false)
    }, [])

    const handleOnboardingComplete = () => {
        setShowOnboarding(false)
    }

    // Show nothing while checking
    if (checkingOnboarding) {
        return null
    }

    // Show onboarding for first-time users
    if (showOnboarding) {
        return (
            <AuthProvider>
                <OnboardingWizard onComplete={handleOnboardingComplete} />
            </AuthProvider>
        )
    }

    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/app/*" element={<App />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    )
}

export default AppRouter
