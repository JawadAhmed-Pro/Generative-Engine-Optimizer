import { useState } from 'react'
import axios from 'axios'

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
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>
                Analyze Your Content
            </h2>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'url' ? 'active' : ''}`}
                    onClick={() => setActiveTab('url')}
                >
                    🔗 URL
                </button>
                <button
                    className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                    onClick={() => setActiveTab('text')}
                >
                    📝 Direct Text
                </button>
            </div>

            {activeTab === 'url' ? (
                <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
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
                <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
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
                style={{ marginTop: '1.5rem', width: '100%' }}
            >
                {disabled ? 'Analyzing...' : '🚀 Analyze Content'}
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Analysis includes: AI Visibility • Citation Worthiness • Semantic Coverage • Readability
            </p>
        </div>
    )
}

export default InputPanel
