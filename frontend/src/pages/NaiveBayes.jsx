import React, { useState, useEffect } from 'react'
import { naiveBayesService } from '../services/api'
import { motion } from 'framer-motion'
import { Network, Play, RefreshCw, Info } from 'lucide-react'

const NaiveBayes = () => {
    const [dataset, setDataset] = useState([])
    const [features, setFeatures] = useState([])
    const [target, setTarget] = useState('')
    const [testCase, setTestCase] = useState({})
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadDefaultDataset()
    }, [])

    const loadDefaultDataset = async () => {
        try {
            const data = await naiveBayesService.getDefaultDataset()
            setDataset(data.data)
            setFeatures(data.features)
            setTarget(data.target)
            setTestCase(data.default_test)
        } catch (error) {
            console.error("Failed to load default dataset:", error)
            setError('Gagal memuat dataset default')
        }
    }

    const handlePredict = async () => {
        if (dataset.length === 0) return
        setLoading(true)
        setError(null)
        try {
            const data = await naiveBayesService.trainAndPredict(dataset, features, target, testCase)
            setResults(data)
        } catch (error) {
            console.error("Prediction failed:", error)
            setError(`Prediksi gagal: ${error.response?.data?.detail || error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <Network className="text-[#00ff88]" />
                        Klasifikasi Naive Bayes
                    </h2>
                    <button
                        onClick={loadDefaultDataset}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Reset Dataset
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Dataset */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Dataset Training</h3>
                        <div className="glass-panel p-4 overflow-x-auto max-h-96 overflow-y-auto">
                            {dataset.length > 0 && (
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-black/50">
                                        <tr className="border-b border-white/10">
                                            <th className="px-3 py-2 text-left text-gray-400 font-mono">#</th>
                                            {Object.keys(dataset[0]).map((col) => (
                                                <th key={col} className="px-3 py-2 text-left text-gray-400 font-mono">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataset.map((row, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                                                {Object.values(row).map((val, i) => (
                                                    <td key={i} className="px-3 py-2 text-white font-mono">{val}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Test Case Input */}
                        <div className="glass-panel p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <Info size={16} className="text-blue-400" />
                                Kasus Uji
                            </h4>
                            {features.map((feature) => (
                                <div key={feature}>
                                    <label className="block text-xs text-gray-400 mb-1">{feature}</label>
                                    <input
                                        type="text"
                                        value={testCase[feature] || ''}
                                        onChange={(e) => setTestCase({ ...testCase, [feature]: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-[#00ff88] focus:outline-none"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={handlePredict}
                                disabled={loading || dataset.length === 0}
                                className="w-full py-2 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00cc70] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} />
                                        Prediksi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="space-y-4">
                        {results ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {/* Manual Calculation */}
                                <div className="glass-panel p-4">
                                    <h4 className="text-sm font-semibold text-gray-300 mb-3">📊 Perhitungan Manual</h4>

                                    {/* Prior */}
                                    <div className="mb-3">
                                        <div className="text-xs text-gray-500 mb-1">Prior Probability:</div>
                                        <div className="flex gap-2">
                                            {Object.entries(results.manual_calculation.prior).map(([k, v]) => (
                                                <div key={k} className="flex-1 bg-white/5 rounded px-2 py-1 text-center">
                                                    <div className="text-xs text-gray-400">{k}</div>
                                                    <div className="text-sm font-mono text-blue-400">{v.toFixed(4)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Posterior */}
                                    <div className="mb-3">
                                        <div className="text-xs text-gray-500 mb-1">Posterior Probability:</div>
                                        <div className="flex gap-2">
                                            {Object.entries(results.manual_calculation.posterior).map(([k, v]) => (
                                                <div key={k} className="flex-1 bg-white/5 rounded px-2 py-1 text-center">
                                                    <div className="text-xs text-gray-400">{k}</div>
                                                    <div className="text-lg font-bold text-[#00ff88]">{(v * 100).toFixed(2)}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Prediction */}
                                    <div className="bg-gradient-to-r from-[#00ff88]/20 to-transparent border border-[#00ff88]/30 rounded-lg p-3 text-center">
                                        <div className="text-xs text-gray-400">Prediksi Manual:</div>
                                        <div className="text-2xl font-bold text-[#00ff88]">{results.manual_calculation.prediction}</div>
                                    </div>
                                </div>

                                {/* Sklearn Calculation */}
                                <div className="glass-panel p-4">
                                    <h4 className="text-sm font-semibold text-gray-300 mb-3">🤖 Perhitungan Sklearn</h4>

                                    <div className="mb-3">
                                        <div className="text-xs text-gray-500 mb-1">Probabilities:</div>
                                        <div className="flex gap-2">
                                            {Object.entries(results.sklearn_calculation.probabilities).map(([k, v]) => (
                                                <div key={k} className="flex-1 bg-white/5 rounded px-2 py-1 text-center">
                                                    <div className="text-xs text-gray-400">{k}</div>
                                                    <div className="text-lg font-bold text-purple-400">{(v * 100).toFixed(2)}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-500/20 to-transparent border border-purple-400/30 rounded-lg p-3 text-center">
                                        <div className="text-xs text-gray-400">Prediksi Sklearn:</div>
                                        <div className="text-2xl font-bold text-purple-400">{results.sklearn_calculation.prediction}</div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="glass-panel p-3 bg-blue-500/10 border-blue-400/20">
                                    <div className="text-xs text-gray-400">
                                        ✅ Total sampel: <span className="text-white font-mono">{results.num_samples}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 border border-white/10 rounded-xl bg-white/5 min-h-[400px]">
                                <div className="text-center">
                                    <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Hasil prediksi akan muncul di sini</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="glass-panel p-4 bg-blue-500/10 border-blue-400/30">
                <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                    <Info size={16} />
                    Tentang Naive Bayes
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Naive Bayes adalah algoritma klasifikasi probabilistik berdasarkan <strong>Teorema Bayes</strong> dengan asumsi independensi antar fitur.
                    Algoritma ini menghitung <em>prior probability</em> dan <em>likelihood</em> untuk setiap kelas, kemudian menggunakan Teorema Bayes
                    untuk menghitung <em>posterior probability</em>. Implementasi di atas menggunakan <strong>Laplace smoothing</strong> untuk menangani nilai yang belum pernah muncul.
                </p>
            </div>
        </div>
    )
}

export default NaiveBayes
