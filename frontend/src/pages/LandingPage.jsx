import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import FeatureSection from '../components/landing/FeatureSection'
import WhyGeo from '../components/landing/WhyGeo'
import Footer from '../components/landing/Footer'

function LandingPage() {
    return (
        <div className="landing-page" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Navbar />
            <Hero />
            <FeatureSection />
            <WhyGeo />
            <Footer />
        </div>
    )
}

export default LandingPage
