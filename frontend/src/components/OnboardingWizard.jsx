import { useState } from 'react'
import { ArrowRight, ArrowLeft, Check, Sparkles, Target, FileText, ShoppingCart, GraduationCap, BarChart2, Zap, PenTool } from 'lucide-react'

const STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to GEO',
        subtitle: 'Generative Engine Optimizer',
        description: 'Optimize your content for AI-powered search engines like ChatGPT, Perplexity, and Google AI Overview.',
        type: 'intro'
    },
    {
        id: 'goal',
        title: 'What\'s your main goal?',
        description: 'This helps us personalize your experience',
        type: 'select',
        key: 'user_goal',
        options: [
            { value: 'visibility', label: 'Improve AI Visibility', icon: <Target size={24} />, desc: 'Get cited more by AI systems' },
            { value: 'optimize', label: 'Optimize Existing Content', icon: <PenTool size={24} />, desc: 'Rewrite for better performance' },
            { value: 'monitor', label: 'Monitor & Analyze', icon: <BarChart2 size={24} />, desc: 'Track how AI sees my content' }
        ]
    },
    {
        id: 'domain',
        title: 'What type of content do you create?',
        description: 'We\'ll set this as your default domain',
        type: 'select',
        key: 'geo_default_domain',
        options: [
            { value: 'educational', label: 'Educational', icon: <GraduationCap size={24} />, desc: 'Courses, tutorials, academic' },
            { value: 'ecommerce', label: 'E-commerce', icon: <ShoppingCart size={24} />, desc: 'Products, reviews, shopping' },
            { value: 'general', label: 'Blog / General', icon: <FileText size={24} />, desc: 'Articles, news, general content' }
        ]
    },
    {
        id: 'ready',
        title: 'You\'re all set!',
        description: 'Here\'s what you can do with GEO:',
        type: 'features',
        features: [
            { icon: <BarChart2 size={20} />, title: 'Visibility Analysis', desc: 'Analyze URLs for AI search visibility' },
            { icon: <PenTool size={20} />, title: 'Content Optimizer', desc: 'Rewrite content for better citations' },
            { icon: <Zap size={20} />, title: 'AI Simulator', desc: 'Test if AI would cite your content' }
        ]
    }
]

function OnboardingWizard({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState({})

    const step = STEPS[currentStep]
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === STEPS.length - 1

    const handleNext = () => {
        if (isLastStep) {
            // Save all answers to localStorage
            Object.entries(answers).forEach(([key, value]) => {
                localStorage.setItem(key, value)
            })
            // Mark onboarding as complete
            localStorage.setItem('geo_onboarding_complete', 'true')
            onComplete()
        } else {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSelect = (key, value) => {
        setAnswers({ ...answers, [key]: value })
    }

    const canProceed = () => {
        if (step.type === 'select') {
            return answers[step.key]
        }
        return true
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #0a0a12 0%, #1a1a2e 50%, #0f0f1a 100%)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
            overflowY: 'auto'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }} />

            <div style={{
                width: '100%',
                maxWidth: '600px',
                position: 'relative',
                margin: 'auto'
            }}>
                {/* Progress dots */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem'
                }}>
                    {STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: idx === currentStep ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: idx <= currentStep ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>

                {/* Content card */}
                <div className="glass-card animate-fade-in" style={{
                    padding: '3rem',
                    textAlign: 'center'
                }} key={currentStep}>
                    {/* Welcome step */}
                    {step.type === 'intro' && (
                        <>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <Sparkles size={40} color="white" />
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{step.title}</h1>
                            <div style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>{step.subtitle}</div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{step.description}</p>
                        </>
                    )}

                    {/* Select step */}
                    {step.type === 'select' && (
                        <>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{step.title}</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{step.description}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {step.options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSelect(step.key, option.value)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1.25rem',
                                            background: answers[step.key] === option.value
                                                ? 'rgba(59, 130, 246, 0.2)'
                                                : 'rgba(255,255,255,0.05)',
                                            border: answers[step.key] === option.value
                                                ? '2px solid var(--accent-primary)'
                                                : '2px solid transparent',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: answers[step.key] === option.value ? 'var(--accent-primary)' : 'var(--text-secondary)'
                                        }}>
                                            {option.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{option.label}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{option.desc}</div>
                                        </div>
                                        {answers[step.key] === option.value && (
                                            <Check size={20} color="var(--accent-primary)" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Features step */}
                    {step.type === 'features' && (
                        <>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'var(--success)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <Check size={32} color="white" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{step.title}</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{step.description}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                                {step.features.map((feature, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '10px'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'rgba(59, 130, 246, 0.2)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--accent-primary)'
                                        }}>
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '0.15rem' }}>{feature.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{feature.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Navigation buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '2rem'
                }}>
                    <button
                        onClick={handleBack}
                        disabled={isFirstStep}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: isFirstStep ? 'var(--text-tertiary)' : 'var(--text-primary)',
                            cursor: isFirstStep ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="btn btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 2rem',
                            fontSize: '0.9rem',
                            opacity: canProceed() ? 1 : 0.5,
                            cursor: canProceed() ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {isLastStep ? (
                            <>Get Started <Sparkles size={18} /></>
                        ) : (
                            <>Continue <ArrowRight size={18} /></>
                        )}
                    </button>
                </div>

                {/* Skip button */}
                {!isLastStep && (
                    <button
                        onClick={() => {
                            localStorage.setItem('geo_onboarding_complete', 'true')
                            onComplete()
                        }}
                        style={{
                            display: 'block',
                            margin: '1.5rem auto 0',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-tertiary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        Skip for now
                    </button>
                )}
            </div>
        </div>
    )
}

export default OnboardingWizard
