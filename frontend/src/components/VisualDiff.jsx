import React from 'react';
import * as diff from 'diff';

const VisualDiff = ({ oldText, newText }) => {
    const differences = diff.diffWords(oldText || '', newText || '');

    return (
        <div style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            lineHeight: '1.8',
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            background: 'var(--bg-tertiary)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--card-border)',
            maxHeight: '600px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap'
        }}>
            {differences.map((part, index) => {
                const style = part.added
                    ? { 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        color: '#10b981', 
                        padding: '2px 4px', 
                        borderRadius: '4px', 
                        fontWeight: '600',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        margin: '0 1px'
                      }
                    : part.removed
                        ? { 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444', 
                            textDecoration: 'line-through', 
                            padding: '1px 3px', 
                            borderRadius: '3px',
                            opacity: 0.7
                          }
                        : { color: 'var(--text-secondary)', opacity: 0.9 };

                return (
                    <span key={index} style={style}>
                        {part.value}
                    </span>
                );
            })}
        </div>
    );
};

export default VisualDiff;
