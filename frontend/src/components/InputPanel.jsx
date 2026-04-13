import { useState } from 'react'
import axios from 'axios'
import { Link as LinkIcon, FileText, Zap } from 'lucide-react'

function InputPanel({ onAnalysisStart, onAnalysisComplete, onError, disabled }) {
    const [activeTab, setActiveTab] = useState('url')
    const [urlInput, setUrlInput] = useState('')
    const [textInput, setTextInput] = useState('')

    const handleAnalyze = async () => {
        if (activeTab === 'url' && !urlInput.trim()) {
            onError('Please enter a URL')
            return
        }
        if (activeTab === 'text' && !textInput.trim()) {
            onError('Please enter some text to analyze')
            return
        }

        onAnalysisStart()

        try {
            let response
            if (activeTab === 'url') {
                response = await axios.post('/api/analyze-url', {
                    url: urlInput
                })
            } else {
                response = await axios.post('/api/analyze-text', {
                    content: textInput
                })
            }

            onAnalysisComplete(response.data)
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || 'Analysis failed'
            onError(errorMessage)
        }
    }

    return (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
                Analyze Your Content
            </h2>

            <div className="tabs" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px' }}>
                <button
                    className={`tab ${activeTab === 'url' ? 'active' : ''}`}
                    onClick={() => setActiveTab('url')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
                >
                    <LinkIcon size={16} /> URL
                </button>
                <button
                    className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                    onClick={() => setActiveTab('text')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
                >
                    <FileText size={16} /> Direct Text
                </button>
            </div>

            {activeTab === 'url' ? (
                <div style={{ marginTop: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                        Enter URL to analyze
                    </label>
                    <input
                        type="url"
                        className="input"
                        placeholder="https://example.com/article"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        disabled={disabled}
                    />
                </div>
            ) : (
                <div style={{ marginTop: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                        Paste your content
                    </label>
                    <textarea
                        className="input textarea"
                        placeholder="Paste your content here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        disabled={disabled}
                    />
                </div>
            )}

            <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={disabled}
                style={{ marginTop: '2rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }}
            >
                {disabled ? 'Analyzing...' : <><Zap size={18} /> Analyze Content</>}
            </button>

            <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.8 }}>
                Analysis includes: AI Visibility • Citation Worthiness • Semantic Coverage • Readability
            </p>
        </div>
    )
}

export default InputPanel
