import { createContext, useContext, useState, useCallback } from 'react'

// Create context for persisting analysis state across navigation
const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
    // Visibility Analysis state
    const [visibilityState, setVisibilityState] = useState({
        url: '',
        contentType: localStorage.getItem('geo_default_domain') || 'general',
        analysisResults: null,
        selectedProject: ''
    })

    // Content Optimization state
    const [optimizationState, setOptimizationState] = useState({
        content: '',
        activeTab: 'rewrite',
        contentType: 'general',
        analysisResults: null,
        optimizedContent: ''
    })

    // AI Simulator state
    const [simulatorState, setSimulatorState] = useState({
        query: '',
        userContent: '',
        simulationResult: null
    })

    // Update functions
    const updateVisibility = useCallback((updates) => {
        setVisibilityState(prev => ({ ...prev, ...updates }))
    }, [])

    const updateOptimization = useCallback((updates) => {
        setOptimizationState(prev => ({ ...prev, ...updates }))
    }, [])

    const updateSimulator = useCallback((updates) => {
        setSimulatorState(prev => ({ ...prev, ...updates }))
    }, [])

    // Clear functions
    const clearVisibility = useCallback(() => {
        setVisibilityState({
            url: '',
            contentType: localStorage.getItem('geo_default_domain') || 'general',
            analysisResults: null,
            selectedProject: ''
        })
    }, [])

    const clearOptimization = useCallback(() => {
        setOptimizationState({
            content: '',
            activeTab: 'rewrite',
            contentType: 'general',
            analysisResults: null,
            optimizedContent: ''
        })
    }, [])

    const clearSimulator = useCallback(() => {
        setSimulatorState({
            query: '',
            userContent: '',
            simulationResult: null
        })
    }, [])

    const value = {
        // Visibility
        visibilityState,
        updateVisibility,
        clearVisibility,
        // Optimization
        optimizationState,
        updateOptimization,
        clearOptimization,
        // Simulator
        simulatorState,
        updateSimulator,
        clearSimulator
    }

    return (
        <AnalysisContext.Provider value={value}>
            {children}
        </AnalysisContext.Provider>
    )
}

// Custom hook for using the context
export function useAnalysisState() {
    const context = useContext(AnalysisContext)
    if (!context) {
        throw new Error('useAnalysisState must be used within an AnalysisProvider')
    }
    return context
}

export default AnalysisContext
