function Header() {
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src="/no_bg_logo.png" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '50%', objectFit: 'contain' }} />
                            <h1 className="logo">GEO Agent</h1>
                        </div>
                        <span className="subtitle">Generative Engine Optimization</span>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
