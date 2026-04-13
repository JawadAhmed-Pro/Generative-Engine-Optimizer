import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function BackButton({ to, label = "Back" }) {
    const navigate = useNavigate()

    const handleBack = () => {
        if (to) {
            navigate(to)
        } else {
            navigate(-1)
        }
    }

    return (
        <button
            onClick={handleBack}
            className="btn btn-outline"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)'
            }}
            aria-label={`Go back ${label === "Back" ? "" : "to " + label}`}
        >
            <ArrowLeft size={18} />
            <span>{label}</span>
        </button>
    )
}

export default BackButton
