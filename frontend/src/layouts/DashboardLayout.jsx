import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'

function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
    }

    return (
        <div className="app-layout" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar collapsed={sidebarCollapsed} />
            <div style={{
                marginLeft: sidebarCollapsed ? '72px' : '280px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                transition: 'margin-left 0.3s ease'
            }}>
                <TopBar onMenuToggle={toggleSidebar} />
                <main style={{ flex: 1, padding: '2rem' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
