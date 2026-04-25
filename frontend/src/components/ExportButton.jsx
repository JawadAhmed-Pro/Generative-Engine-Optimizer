import { useState, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, Check, Loader2, Code, FileJson } from 'lucide-react'
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

            doc.setFillColor(59, 130, 246)
            doc.rect(0, 0, pageWidth, 40, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(24)
            doc.setFont('helvetica', 'bold')
            doc.text('GEO Analysis Report', 20, 25)

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(new Date().toLocaleDateString(), 20, 35)

            doc.setTextColor(0, 0, 0)
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text('Overall GEO Score', 20, 55)

            const overallScore = calculateOverallScore()
            doc.setFontSize(36)
            const r = overallScore >= 75 ? 16 : overallScore >= 50 ? 245 : 239;
            const g = overallScore >= 75 ? 185 : overallScore >= 50 ? 158 : 68;
            const b = overallScore >= 75 ? 129 : overallScore >= 50 ? 11 : 68;
            doc.setTextColor(r, g, b)
            doc.text(`${overallScore}`, 20, 75)
            doc.setFontSize(14)
            doc.text('/ 100', 55, 75)

            doc.setTextColor(0, 0, 0)
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text('Core Metrics', 20, 95)

            const metricsData = [
                ['Structural Score', (results.structural_score?.score || results.ai_visibility_score || 0).toFixed(1)],
                ['Semantic Probability', (results.semantic_score?.score || results.semantic_coverage_score || 0).toFixed(1)],
                ['Citation Worthiness', (results.citation_worthiness_score || 0).toFixed(1)],
                ['Technical Readability', (results.technical_readability_score || 0).toFixed(1)]
            ]

            autoTable(doc, {
                startY: 100,
                head: [['Metric', 'Score']],
                body: metricsData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] },
                margin: { left: 20, right: 20 }
            })

            let currentY = (doc.lastAutoTable?.finalY || 140) + 15
            if (results.suggestions?.length > 0) {
                if (currentY > 240) { doc.addPage(); currentY = 20; }
                doc.setFontSize(16)
                doc.setFont('helvetica', 'bold')
                doc.text('Recommendations', 20, currentY)

                const suggestionsData = results.suggestions.slice(0, 10).map((s, i) => {
                    const text = typeof s === 'string' ? s : (s.text || s.suggestion || s.message || 'N/A')
                    const cat = typeof s === 'string' ? 'General' : (s.category || 'General')
                    return [`${i + 1}`, cat, text]
                })

                autoTable(doc, {
                    startY: currentY + 5,
                    head: [['#', 'Category', 'Recommendation']],
                    body: suggestionsData,
                    theme: 'striped',
                    headStyles: { fillColor: [59, 130, 246] },
                    margin: { left: 20, right: 20 },
                    styles: { fontSize: 9 }
                })
            }

            doc.save(`GEO_Report_${new Date().toISOString().split('T')[0]}.pdf`)
            setExportSuccess('pdf')
            setTimeout(() => setExportSuccess(null), 2000)
        } catch (error) {
            console.error('PDF export failed:', error)
            alert('Failed to export PDF.')
        } finally {
            setExporting(false)
            setShowOptions(false)
        }
    }

    const exportToMarkdown = () => {
        setExporting(true)
        try {
            let md = `# GEO Analysis Report\n\n`
            md += `*Generated: ${new Date().toLocaleString()}*\n\n`
            md += `## Overall Score: ${calculateOverallScore()}/100\n\n`
            md += `### Core Metrics\n`
            md += `| Metric | Score |\n`
            md += `| :--- | :--- |\n`
            md += `| Structural Score | ${(results.structural_score?.score || results.ai_visibility_score || 0).toFixed(1)} |\n`
            md += `| Semantic Probability | ${(results.semantic_score?.score || results.semantic_coverage_score || 0).toFixed(1)} |\n`
            md += `| Citation Worthiness | ${(results.citation_worthiness_score || 0).toFixed(1)} |\n`
            md += `| Technical Readability | ${(results.technical_readability_score || 0).toFixed(1)} |\n\n`
            
            if (results.suggestions?.length > 0) {
                md += `### Recommendations\n`
                results.suggestions.forEach((s, i) => {
                    const text = typeof s === 'string' ? s : (s.text || s.suggestion || s.message || 'N/A')
                    md += `${i+1}. ${text}\n`
                })
            }

            const blob = new Blob([md], { type: 'text/markdown' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `GEO_Report_${new Date().toISOString().split('T')[0]}.md`
            link.click()
            setExportSuccess('md')
            setTimeout(() => setExportSuccess(null), 2000)
        } catch (err) { alert('Markdown export failed') }
        finally { setExporting(false); setShowOptions(false); }
    }

    const exportToHTML = () => {
        setExporting(true)
        try {
            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>GEO Analysis Report</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 2rem; }
        h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        .score-box { background: #f3f4f6; padding: 2rem; border-radius: 1rem; text-align: center; margin: 2rem 0; }
        .score-val { font-size: 4rem; font-weight: 800; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
        th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
    </style>
</head>
<body>
    <h1>GEO Analysis Report</h1>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <div class="score-box">
        <div style="font-size: 0.875rem; text-transform: uppercase; color: #6b7280;">Overall GEO Score</div>
        <div class="score-val">${calculateOverallScore()}</div>
        <div style="font-weight: 600;">/ 100</div>
    </div>
    <h2>Core Metrics</h2>
    <table>
        <thead><tr><th>Metric</th><th>Score</th></tr></thead>
        <tbody>
            <tr><td>Structural Score</td><td>${(results.structural_score?.score || results.ai_visibility_score || 0).toFixed(1)}</td></tr>
            <tr><td>Semantic Probability</td><td>${(results.semantic_score?.score || results.semantic_coverage_score || 0).toFixed(1)}</td></tr>
            <tr><td>Citation Worthiness</td><td>${(results.citation_worthiness_score || 0).toFixed(1)}</td></tr>
            <tr><td>Technical Readability</td><td>${(results.technical_readability_score || 0).toFixed(1)}</td></tr>
        </tbody>
    </table>
    <h2>Recommendations</h2>
    <ul>
        ${(results.suggestions || []).map(s => {
            const text = typeof s === 'string' ? s : (s.text || s.suggestion || s.message || 'N/A')
            return `<li>${text}</li>`
        }).join('')}
    </ul>
</body>
</html>`
            const blob = new Blob([html], { type: 'text/html' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `GEO_Report_${new Date().toISOString().split('T')[0]}.html`
            link.click()
            setExportSuccess('html')
            setTimeout(() => setExportSuccess(null), 2000)
        } catch (err) { alert('HTML export failed') }
        finally { setExporting(false); setShowOptions(false); }
    }

    const exportToCSV = () => {
        setExporting(true)
        try {
            const rows = [
                ['GEO Analysis Report'],
                ['Generated', new Date().toISOString()],
                ['Metric', 'Score'],
                ['Overall Score', calculateOverallScore()],
                ['Structural Score', results.structural_score?.score || results.ai_visibility_score || 0],
                ['Semantic Probability', results.semantic_score?.score || results.semantic_coverage_score || 0],
                ['Citation Worthiness', results.citation_worthiness_score || 0],
                ['Technical Readability', results.technical_readability_score || 0]
            ]
            const csvContent = rows.map(row => `"${row.join('","')}"`).join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `GEO_Report_${new Date().toISOString().split('T')[0]}.csv`
            link.click()
            setExportSuccess('csv')
            setTimeout(() => setExportSuccess(null), 2000)
        } catch (error) { alert('Failed to export CSV.') }
        finally { setExporting(false); setShowOptions(false); }
    }

    const exportToWord = () => {
        setExporting(true)
        try {
            const html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>GEO Report</title></head>
            <body>
                <h1>GEO Analysis Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <h2>Overall Score: ${calculateOverallScore()} / 100</h2>
                <hr/>
                <h2>Core Metrics</h2>
                <ul>
                    <li>Structural Score: ${(results.structural_score?.score || results.ai_visibility_score || 0).toFixed(1)}</li>
                    <li>Semantic Probability: ${(results.semantic_score?.score || results.semantic_coverage_score || 0).toFixed(1)}</li>
                    <li>Citation Worthiness: ${(results.citation_worthiness_score || 0).toFixed(1)}</li>
                    <li>Technical Readability: ${(results.technical_readability_score || 0).toFixed(1)}</li>
                </ul>
                <h2>Recommendations</h2>
                <ol>
                    ${(results.suggestions || []).map(s => `<li>${typeof s === 'string' ? s : (s.text || s.suggestion || 'N/A')}</li>`).join('')}
                </ol>
            </body>
            </html>`;
            const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `GEO_Report_${new Date().toISOString().split('T')[0]}.doc`;
            link.click();
            setExportSuccess('doc');
            setTimeout(() => setExportSuccess(null), 2000);
        } catch (err) { alert('Word export failed') }
        finally { setExporting(false); setShowOptions(false); }
    }

    const exportToJSON = () => {
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `geo-analysis-${results.content_item_id || 'export'}.json`
        a.click()
        URL.revokeObjectURL(url)
        setExportSuccess('json')
        setTimeout(() => setExportSuccess(null), 2000)
        setShowOptions(false)
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
            >
                {exporting ? <Loader2 size={16} className="spin" /> : exportSuccess ? <Check size={16} color="#10B981" /> : <Download size={16} />}
                {exportSuccess ? 'Exported!' : 'Export Report'}
            </button>

            {showOptions && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    zIndex: 100,
                    minWidth: '180px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                    <button onClick={exportToPDF} className="export-option-btn"><FileText size={16} color="#EF4444" /> Export PDF</button>
                    <button onClick={exportToWord} className="export-option-btn"><FileText size={16} color="#2B579A" /> Export Word (.doc)</button>
                    <button onClick={exportToMarkdown} className="export-option-btn"><Code size={16} color="#3B82F6" /> Export MD</button>
                    <button onClick={exportToHTML} className="export-option-btn"><Download size={16} color="#10B981" /> Export HTML</button>
                    <button onClick={exportToCSV} className="export-option-btn"><FileSpreadsheet size={16} color="#10B981" /> Export CSV</button>
                    <button onClick={exportToJSON} className="export-option-btn"><FileJson size={16} color="#8B5CF6" /> Export JSON</button>
                </div>
            )}
            <style>{`
                .export-option-btn {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: transparent;
                    border: none;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-size: 0.875rem;
                    text-align: left;
                }
                .export-option-btn:hover {
                    background: rgba(255,255,255,0.05);
                }
            `}</style>
        </div>
    )
}

export default ExportButton
