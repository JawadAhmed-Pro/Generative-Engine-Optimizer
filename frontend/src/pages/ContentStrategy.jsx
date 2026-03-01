import { useState } from 'react';
import { SparklesIcon, MagnifyingGlassIcon, BookOpenIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function ContentStrategy() {
    const [keyword, setKeyword] = useState('');
    const [niche, setNiche] = useState('general');
    const [prompts, setPrompts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDiscover = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/discover-prompts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keyword, niche }),
            });

            const data = await response.json();

            if (response.ok) {
                setPrompts(data.prompts || []);
            } else {
                throw new Error(data.detail || 'Failed to discover prompts');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getVolumeColor = (volume) => {
        switch (volume?.toLowerCase()) {
            case 'high': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'low': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-purple-400" />
                    Content Strategy Discovery
                </h1>
                <p className="text-gray-400 mt-1">Discover what users are asking AI in your niche.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Input */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-xl">
                        <h2 className="text-lg font-semibold text-white mb-4">Discovery Engine</h2>
                        <form onSubmit={handleDiscover} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Target Keyword / Topic</label>
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                                    placeholder="e.g., ai automation tools"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Industry / Niche</label>
                                <select
                                    value={niche}
                                    onChange={(e) => setNiche(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                                >
                                    <option value="general">General</option>
                                    <option value="ecommerce">E-Commerce</option>
                                    <option value="saas">SaaS / Software</option>
                                    <option value="finance">Finance</option>
                                    <option value="health">Healthcare</option>
                                    <option value="education">Education</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300
                  ${isLoading
                                        ? 'bg-purple-600/50 text-white/50 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Discovering...
                                    </>
                                ) : (
                                    <>
                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                        Generate Strategy
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Results */}
                <div className="lg:col-span-2">
                    {prompts.length === 0 ? (
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
                            <BookOpenIcon className="w-16 h-16 text-gray-600 mb-4" />
                            <h3 className="text-xl font-medium text-gray-300">No Prompts Discovered Yet</h3>
                            <p className="text-gray-500 mt-2 max-w-sm">
                                Enter a target keyword and your niche to uncover what questions real users are asking AI platforms.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-emerald-400" />
                                Recommended Content Strategy ({prompts.length} Opportunities)
                            </h2>

                            <div className="grid gap-4">
                                {prompts.map((item, index) => (
                                    <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                                            <h3 className="text-lg font-medium text-white group cursor-text">
                                                "{item.prompt}"
                                            </h3>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getVolumeColor(item.search_volume_estimate)}`}>
                                                    Vol: {item.search_volume_estimate?.toUpperCase() || 'UNKNOWN'}
                                                </span>
                                                <span className="px-2.5 py-1 text-xs font-medium rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                    {item.intent?.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                            <p className="text-sm font-medium text-purple-400 mb-1">Content Gap Challenge:</p>
                                            <p className="text-sm text-gray-300">
                                                {item.content_gap}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => {/* future action: map to optimization pipeline */ }}
                                                className="text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Write Content
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
