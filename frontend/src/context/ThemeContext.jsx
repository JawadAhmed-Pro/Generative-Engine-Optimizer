import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // First check if html already has a class (applied by index.html)
        if (document.documentElement.classList.contains('light-theme')) return 'light';
        if (document.documentElement.classList.contains('dark-theme')) return 'dark';
        
        // Fallback to localStorage or default to dark
        return localStorage.getItem('geo_theme') || 'dark'
    })

    useEffect(() => {
        // Apply theme class to html only if it's different from current
        const currentClass = `${theme}-theme`;
        if (!document.documentElement.classList.contains(currentClass)) {
            document.documentElement.classList.remove('light-theme', 'dark-theme')
            document.documentElement.classList.add(currentClass)
        }

        // Save to localStorage
        localStorage.setItem('geo_theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light'
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export default ThemeContext
