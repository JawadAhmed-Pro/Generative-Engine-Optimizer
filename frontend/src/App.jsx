import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import ContentOptimization from './pages/ContentOptimization'
import AISimulator from './pages/AISimulator'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import VisibilityAnalysis from './pages/VisibilityAnalysis'
import CitationTracking from './pages/CitationTracking'
import CompetitorAnalysis from './pages/CompetitorAnalysis'
import ContentStrategy from './pages/ContentStrategy'
import Settings from './pages/Settings'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <ThemeProvider>
            <ErrorBoundary>
                <ProtectedRoute>
                    <Routes>
                        <Route element={<DashboardLayout />}>
                            <Route index element={<DashboardHome />} />
                            <Route path="dashboard" element={<DashboardHome />} />
                            <Route path="optimization" element={<ContentOptimization />} />
                            <Route path="ai-simulator" element={<AISimulator />} />
                            <Route path="projects" element={<Projects />} />
                            <Route path="projects/:id" element={<ProjectDetail />} />
                            <Route path="visibility" element={<VisibilityAnalysis />} />
                            <Route path="citations" element={<CitationTracking />} />
                            <Route path="competitors" element={<CompetitorAnalysis />} />
                            <Route path="strategy" element={<ContentStrategy />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </ProtectedRoute>
            </ErrorBoundary>
        </ThemeProvider>
    )
}

export default App
