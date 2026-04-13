import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'

function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
    }

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    // Handle responsive window resizing and keyboard ESC
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSidebarCollapsed(false)
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <div className="app-layout">
            <div className="noise-overlay"></div>
            <div className="aurora-container">
                <div className="aurora-blob aurora-blob-1"></div>
                <div className="aurora-blob aurora-blob-2"></div>
                <div className="aurora-blob aurora-blob-3"></div>
            </div>
            {/* Mobile Overlay */}
            <div
                role="button"
                tabIndex={sidebarCollapsed && isMobile ? 0 : -1}
                aria-label="Close sidebar overlay"
                className={`mobile-overlay ${sidebarCollapsed && isMobile ? 'active' : ''}`}
                onClick={() => setSidebarCollapsed(false)}
                onKeyDown={(e) => e.key === 'Enter' && setSidebarCollapsed(false)}
            />

            <Sidebar
                collapsed={!isMobile && sidebarCollapsed}
                mobileOpen={sidebarCollapsed && isMobile}
                onToggle={toggleSidebar}
            />

            <div className={`main-content ${sidebarCollapsed && !isMobile ? 'collapsed' : ''}`}>
                <TopBar onMenuToggle={toggleSidebar} isMobile={isMobile} />
                <main style={{ flex: 1, padding: isMobile ? '1rem' : '2rem' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
