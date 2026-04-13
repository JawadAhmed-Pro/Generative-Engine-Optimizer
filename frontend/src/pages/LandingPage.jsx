import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import FeatureSection from '../components/landing/FeatureSection'
import WhyGeo from '../components/landing/WhyGeo'
import Footer from '../components/landing/Footer'

function LandingPage() {
    return (
        <div className="landing-page" style={{ background: 'transparent', minHeight: '100vh', position: 'relative' }}>
            <div className="noise-overlay" style={{ opacity: 0.03 }}></div>
            {/* Background Atmosphere Layer (Z-Index: 0 via CSS) */}
            <div className="aurora-container">
                <div className="aurora-blob aurora-blob-1"></div>
                <div className="aurora-blob aurora-blob-2"></div>
                <div className="aurora-blob aurora-blob-3"></div>
            </div>

            {/* Content Stacking Layer (Z-Index: 10) */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <Navbar />
                <Hero />
                <FeatureSection />
                <WhyGeo />
                <Footer />
            </div>
        </div>
    )
}

export default LandingPage
