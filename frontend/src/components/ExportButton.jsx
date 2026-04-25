import { useState, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, Check, Loader2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function ExportButton({ results, title = 'GEO Analysis Report' }) {
    const [exporting, setExporting] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const [exportSuccess, setExportSuccess] = useState(null)

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showOptions && !e.target.closest('.export-container')) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showOptions]);

    const calculateOverallScore = () => {
        if (!results) return 0
        
        // Try new structural/semantic average first
        if (results.structural_score && results.semantic_score) {
            return Math.round((results.structural_score.score + results.semantic_score.score) / 2);
        }

        const score = (
            ((results.ai_visibility_score || 0) +
                (results.citation_worthiness_score || 0) +
                (results.semantic_coverage_score || 0) +
                (results.technical_readability_score || 0)) / 4
        )
        return isNaN(score) ? 0 : Math.round(score)
    }

    const exportToPDF = async () => {
        setExporting(true)
        try {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()

            // Header
            doc.setFillColor(59, 130, 246)
            doc.rect(0, 0, pageWidth, 40, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(24)
            doc.setFont('helvetica', 'bold')
            doc.text('GEO Analysis Report', 20, 25)

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }), 20, 35)

            // Reset text color
            doc.setTextColor(0, 0, 0)

            // Overall Score
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text('Overall GEO Score', 20, 55)

            const overallScore = calculateOverallScore()
            doc.setFontSize(36)
            doc.setTextColor(overallScore >= 70 ? 34 : overallScore >= 50 ? 234 : 239,
                overallScore >= 70 ? 197 : overallScore >= 50 ? 179 : 68,
                overallScore >= 70 ? 94 : overallScore >= 50 ? 8 : 68)
            doc.text(`${overallScore}`, 20, 75)
            doc.setFontSize(14)
            doc.text('/ 100', 55, 75)

            doc.setTextColor(0, 0, 0)

            // Metrics Table - Main 4 scores
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text('Core Metrics', 20, 95)

            const metricsData = [
                ['Structural Score', Number(results.structural_score?.score || results.ai_visibility_score || 0).toFixed(1)],
                ['Semantic Probability', Number(results.semantic_score?.score || results.semantic_coverage_score || 0).toFixed(1)],
                ['Citation Worthiness', Number(results.citation_worthiness_score || 0).toFixed(1)],
                ['Technical Readability', Number(results.technical_readability_score || 0).toFixed(1)]
            ]

            autoTable(doc, {
                startY: 100,
                head: [['Metric', 'Score']],
                body: metricsData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] },
                margin: { left: 20, right: 20 }
            })

            // Detailed LLM Metrics - Match what ResultsPanel displays
            const detailedMetrics = []

            // Helper to format metric name
            const formatMetricName = (key) => {
                return key.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')
            }

            // Extract from llm_scores - nested under category.details
            // Structure: llm_scores.ai_visibility.details, llm_scores.semantic_richness.details, etc.
            if (results.llm_scores) {
                const categories = ['ai_visibility', 'citation_worthiness', 'semantic_richness', 'technical_readability']

                categories.forEach(category => {
                    const categoryData = results.llm_scores[category]
                    if (categoryData && categoryData.details) {
                        Object.entries(categoryData.details).forEach(([key, value]) => {
                            if (typeof value === 'number') {
                                detailedMetrics.push([formatMetricName(key), value.toFixed(1)])
                            }
                        })
                    }
                })
            }

            // Add detailed metrics table if we have any
            if (detailedMetrics.length > 0) {
                const detailedY = (doc).lastAutoTable.finalY + 15
                doc.setFontSize(16)
                doc.setFont('helvetica', 'bold')
                doc.text('Detailed Analysis', 20, detailedY)

                autoTable(doc, {
                    startY: detailedY + 5,
                    head: [['Metric', 'Score']],
                    body: detailedMetrics,
                    theme: 'striped',
                    headStyles: { fillColor: [37, 99, 235] },
                    margin: { left: 20, right: 20 },
                    styles: { fontSize: 9 }
                })
            }

            // Suggestions
            const suggestionsY = (doc).lastAutoTable.finalY + 15
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text('Recommendations', 20, suggestionsY)

            if (results.suggestions && results.suggestions.length > 0) {
                // Helper function to extract readable text from suggestion
                const getSuggestionText = (suggestion) => {
                    if (typeof suggestion === 'string') return suggestion
                    if (suggestion.message) return suggestion.message
                    if (suggestion.suggestion) return suggestion.suggestion
                    if (suggestion.text) return suggestion.text
                    // If it's an object with nested suggestions array
                    if (suggestion.suggestions && Array.isArray(suggestion.suggestions)) {
                        return suggestion.suggestions.join('; ')
                    }
                    // Try to stringify if nothing else works
                    try {
                        const str = JSON.stringify(suggestion)
                        if (str !== '{}') return str.substring(0, 100)
                    } catch (e) { }
                    return 'See detailed analysis'
                }

                const getCategory = (suggestion) => {
                    if (typeof suggestion === 'string') return 'General'
                    return suggestion.category || suggestion.type || suggestion.metric || 'General'
                }

                const suggestionsData = results.suggestions.slice(0, 10).map((s, i) => [
                    `${i + 1}`,
                    getCategory(s),
                    getSuggestionText(s)
                ])

                autoTable(doc, {
                    startY: suggestionsY + 5,
                    head: [['#', 'Category', 'Recommendation']],
                    body: suggestionsData,
                    theme: 'striped',
                    headStyles: { fillColor: [59, 130, 246] },
                    margin: { left: 20, right: 20 },
                    columnStyles: {
                        0: { cellWidth: 10 },
                        1: { cellWidth: 30 },
                        2: { cellWidth: 'auto' }
                    },
                    styles: {
                        fontSize: 9,
                        cellPadding: 4
                    }
                })
            }

            // Footer
            const pageCount = doc.internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(128, 128, 128)
                doc.text(
                    `Generated by GEO Agent | Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                )
            }

            doc.save(`GEO_Report_${new Date().toISOString().split('T')[0]}.pdf`)
            setExportSuccess('pdf')
            setTimeout(() => setExportSuccess(null), 2000)
        } catch (error) {
            console.error('PDF export failed:', error)
            alert('Failed to export PDF. Please try again.')
        } finally {
            setExporting(false)
            setShowOptions(false)
        }
    }

    const exportToCSV = () => {
        setExporting(true)
        try {
            const rows = [
                ['GEO Analysis Report'],
                ['Generated', new Date().toISOString()],
                [''],
                ['Metric', 'Score'],
                ['Overall Score', calculateOverallScore()],
                ['Structural Score', results.structural_score?.score || results.ai_visibility_score || 0],
                ['Semantic Probability', results.semantic_score?.score || results.semantic_coverage_score || 0],
                ['Citation Worthiness', results.citation_worthiness_score || 0],
                ['Technical Readability', results.technical_readability_score || 0],
                [''],
                ['Recommendations']
            ]

            if (results.suggestions) {
                // Reuse the same helper logic
                const getSuggestionText = (suggestion) => {
                    if (typeof suggestion === 'string') return suggestion
                    if (suggestion.message) return suggestion.message
                    if (suggestion.suggestion) return suggestion.suggestion
                    if (suggestion.text) return suggestion.text
                    if (suggestion.suggestions && Array.isArray(suggestion.suggestions)) {
                        return suggestion.suggestions.join('; ')
                    }
                    return 'See detailed analysis'
                }
                const getCategory = (suggestion) => {
                    if (typeof suggestion === 'string') return 'General'
                    return suggestion.category || suggestion.type || suggestion.metric || 'General'
                }

                results.suggestions.forEach((s, i) => {
                    rows.push([`${i + 1}`, getCategory(s), getSuggestionText(s)])
                })
            }

            const csvContent = rows.map(row => row.join(',')).join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `GEO_Report_${new Date().toISOString().split('T')[0]}.csv`
            link.click()

            setExportSuccess('csv')
            setTimeout(() => setExportSuccess(null), 2000)
        } catch (error) {
            console.error('CSV export failed:', error)
            alert('Failed to export CSV. Please try again.')
        } finally {
            setExporting(false)
            setShowOptions(false)
        }
    }

    if (!results) return null

    return (
        <div className="export-container" style={{ position: 'relative' }}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                }}
                className="btn btn-outline"
                style={{ gap: '0.5rem', fontSize: '0.875rem' }}
                disabled={exporting}
                aria-label="Export analysis report"
                aria-haspopup="true"
                aria-expanded={showOptions}
            >
                {exporting ? (
                    <Loader2 size={16} className="spin" />
                ) : exportSuccess ? (
                    <Check size={16} color="#10B981" />
                ) : (
                    <Download size={16} />
                )}
                {exportSuccess ? 'Exported!' : 'Export'}
            </button>

            {showOptions && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    zIndex: 100,
                    minWidth: '160px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                    <button
                        onClick={exportToPDF}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <FileText size={16} color="#EF4444" />
                        Export as PDF
                    </button>
                    <button
                        onClick={exportToCSV}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <FileSpreadsheet size={16} color="#10B981" />
                        Export as CSV
                    </button>
                </div>
            )}
        </div>
    )
}

export default ExportButton
