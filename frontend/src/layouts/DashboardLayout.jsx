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

    // Handle responsive window resizing
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="app-layout">
            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${sidebarCollapsed && isMobile ? 'active' : ''}`}
                onClick={() => setSidebarCollapsed(false)}
            />

            <Sidebar collapsed={!isMobile && sidebarCollapsed} mobileOpen={sidebarCollapsed && isMobile} />

            <div className={`main-content ${sidebarCollapsed && !isMobile ? 'collapsed' : ''}`}>
                <TopBar onMenuToggle={toggleSidebar} />
                <main style={{ flex: 1, padding: isMobile ? '1rem' : '2rem' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
