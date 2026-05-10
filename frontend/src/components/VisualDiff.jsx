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
                    ? { background: 'rgba(16, 185, 129, 0.25)', color: '#10b981', padding: '0 2px', borderRadius: '2px', fontWeight: '600' }
                    : part.removed
                        ? { background: 'rgba(239, 68, 68, 0.25)', color: '#ef4444', textDecoration: 'line-through', padding: '0 2px', borderRadius: '2px' }
                        : { color: 'var(--text-secondary)', opacity: 0.8 };

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
