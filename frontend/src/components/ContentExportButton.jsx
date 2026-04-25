import { useState, useEffect } from 'react'
import { Download, FileText, FileCode, FileType, Check, ChevronDown, Loader2 } from 'lucide-react'

function ContentExportButton({ content, title = 'optimized-content' }) {
    const [showOptions, setShowOptions] = useState(false)
    const [exportSuccess, setExportSuccess] = useState(null)

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showOptions && !e.target.closest('.content-export-container')) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showOptions]);

    const downloadFile = (blob, extension) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}-${Date.now()}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
        
        setExportSuccess(extension);
        setShowOptions(false);
        setTimeout(() => setExportSuccess(null), 2000);
    };

    const exportAsMarkdown = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        downloadFile(blob, 'md');
    };

    const exportAsHTML = () => {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1, h2, h3 { color: #1a1a1a; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { font-family: monospace; background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 15px; color: #666; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    ${content.replace(/\n/g, '<br/>')} 
</body>
</html>`;
        // Note: Simple newline replacement is a bit naive for Markdown, 
        // but since we are just exporting the text as HTML, it's a starting point.
        // If we want real MD-to-HTML conversion, we'd need a library here too.
        // However, for "export as HTML", users often just want the raw text in an HTML shell.
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        downloadFile(blob, 'html');
    };

    const exportAsDocx = () => {
        // The common trick for .docx from browser is to use a specific HTML format
        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Export</title></head><body>`;
        const footer = "</body></html>";
        const html = header + content.replace(/\n/g, '<p>') + footer;

        const blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });
        downloadFile(blob, 'docx');
    };

    return (
        <div className="content-export-container" style={{ position: 'relative' }}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                }}
                className="btn btn-outline"
                style={{ 
                    gap: '0.5rem', 
                    fontSize: '0.85rem', 
                    padding: '0.6rem 1.25rem', 
                    borderRadius: '100px',
                    minWidth: '130px'
                }}
                aria-haspopup="true"
                aria-expanded={showOptions}
            >
                {exportSuccess ? (
                    <Check size={16} color="var(--success)" />
                ) : (
                    <Download size={16} />
                )}
                {exportSuccess ? `${exportSuccess.toUpperCase()} Done` : 'Download'}
                <ChevronDown size={14} style={{ 
                    transition: 'transform 0.2s', 
                    transform: showOptions ? 'rotate(180deg)' : 'rotate(0)' 
                }} />
            </button>

            {showOptions && (
                <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 10px)',
                    right: 0,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    minWidth: '180px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    padding: '0.5rem'
                }}>
                    <div style={{ padding: '0.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        FORMAT OPTIONS
                    </div>
                    <button
                        onClick={exportAsDocx}
                        style={optionStyle}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <FileText size={16} color="#2b579a" />
                        <span>Microsoft Word (.docx)</span>
                    </button>
                    <button
                        onClick={exportAsMarkdown}
                        style={optionStyle}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <FileType size={16} color="var(--accent-primary)" />
                        <span>Markdown (.md)</span>
                    </button>
                    <button
                        onClick={exportAsHTML}
                        style={optionStyle}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <FileCode size={16} color="#e44d26" />
                        <span>HTML Document (.html)</span>
                    </button>
                </div>
            )}
        </div>
    )
}

const optionStyle = {
    width: '100%',
    padding: '0.75rem 0.8rem',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background 0.2s',
    borderRadius: '8px',
    textAlign: 'left'
}

export default ContentExportButton
