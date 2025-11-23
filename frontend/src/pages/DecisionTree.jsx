import React, { useState } from 'react'
import { decisionTreeService } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { TreeDeciduous, Play, Calculator } from 'lucide-react'

const DecisionTree = () => {
    const [treeData, setTreeData] = useState(null)
    const [prediction, setPrediction] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Prediction form state
    const [outlook, setOutlook] = useState('Sunny')
    const [temperature, setTemperature] = useState('Hot')
    const [humidity, setHumidity] = useState('High')
    const [windy, setWindy] = useState('False')

    const handleTrain = async () => {
        setLoading(true)
        setError(null)
        setPrediction(null)
        try {
            const data = await decisionTreeService.trainGolf()
            setTreeData(data)
        } catch (error) {
            console.error("Training failed:", error)
            setError(`Training gagal: ${error.response?.data?.detail || error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handlePredict = async () => {
        setLoading(true)
        setPrediction(null)
        try {
            const result = await decisionTreeService.predict({
                Outlook: outlook,
                Temperature: temperature,
                Humidity: humidity,
                Windy: windy
            })
            setPrediction(result)
        } catch (error) {
            console.error("Prediction failed:", error)
            setError(`Prediksi gagal: ${error.response?.data?.detail || error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const renderCompactTree = (treeObj, depth = 0) => {
        if (typeof treeObj === 'string') {
            return (
                <div className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-[#00ff88]/20 to-transparent border border-[#00ff88]/40 text-[#00ff88]">
                    {treeObj === 'Yes' ? '⛳' : '🏠'} {treeObj}
                </div>
            )
        }

        const attribute = Object.keys(treeObj)[0]
        const branches = treeObj[attribute]

        return (
            <div className="inline-flex flex-col">
                <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-400/30 rounded-md text-blue-300 font-medium text-xs mb-2">
                    ❓ {attribute}
                </div>
                <div className="flex gap-3 pl-4 border-l-2 border-white/10">
                    {Object.entries(branches).map(([value, subtree], idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                            <div className="text-[10px] text-gray-400 font-mono">→ {value}</div>
                            {renderCompactTree(subtree, depth + 1)}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="glass-panel p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <TreeDeciduous className="text-[#00ff88]" />
                    Decision Tree - Play Golf
                </h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Training & Results */}
                    <div className="space-y-6">
                        <button
                            onClick={handleTrain}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Play size={20} />
                            {loading && !treeData ? 'Training...' : 'Train Decision Tree'}
                        </button>

                        {treeData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-panel p-4 text-center bg-gradient-to-br from-[#00ff88]/10 to-transparent border-[#00ff88]/30">
                                        <div className="text-3xl font-bold text-[#00ff88]">
                                            {(treeData.accuracy * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Akurasi</div>
                                    </div>
                                    <div className="glass-panel p-4 text-center">
                                        <div className="text-3xl font-bold text-blue-400">
                                            {treeData.dataset_size}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Sampel Data</div>
                                    </div>
                                </div>

                                {/* Calculation Details */}
                                <div className="glass-panel p-4">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                        <Calculator size={16} className="text-yellow-400" />
                                        Information Gain
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(treeData.feature_importance)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([feature, gain]) => (
                                                <div key={feature} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-300">{feature}</span>
                                                        <span className="text-[#00ff88] font-mono">{gain.toFixed(4)}</span>
                                                    </div>
                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#00ff88] to-[#00ccff]"
                                                            style={{ width: `${(gain / Math.max(...Object.values(treeData.feature_importance))) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Compact Tree Structure */}
                                <div className="glass-panel p-4 max-h-[400px] overflow-y-auto">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Struktur Pohon</h3>
                                    <div className="overflow-x-auto">
                                        <div className="text-sm inline-block">
                                            {renderCompactTree(treeData.tree_structure)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right: Prediction */}
                    <div className="space-y-6">
                        {!treeData ? (
                            <div className="glass-panel p-6 h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🎯</div>
                                    <div className="text-xl font-semibold text-gray-300 mb-2">
                                        Train Model Terlebih Dahulu
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Klik tombol "Train Decision Tree" untuk memulai
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-panel p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Prediksi Bermain Golf</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">
                                            Kondisi Cuaca (Outlook)
                                        </label>
                                        <select
                                            value={outlook}
                                            onChange={(e) => setOutlook(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                                        >
                                            <option value="Sunny">☀️ Sunny (Cerah)</option>
                                            <option value="Overcast">☁️ Overcast (Mendung)</option>
                                            <option value="Rainy">🌧️ Rainy (Hujan)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">
                                            Suhu (Temperature)
                                        </label>
                                        <select
                                            value={temperature}
                                            onChange={(e) => setTemperature(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                                        >
                                            <option value="Hot">🔥 Hot (Panas)</option>
                                            <option value="Mild">🌤️ Mild (Sedang)</option>
                                            <option value="Cool">❄️ Cool (Dingin)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">
                                            Kelembaban (Humidity)
                                        </label>
                                        <select
                                            value={humidity}
                                            onChange={(e) => setHumidity(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                                        >
                                            <option value="High">💧 High (Tinggi)</option>
                                            <option value="Normal">✨ Normal</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">
                                            Angin (Windy)
                                        </label>
                                        <select
                                            value={windy}
                                            onChange={(e) => setWindy(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                                        >
                                            <option value="False">🍃 False (Tidak)</option>
                                            <option value="True">🌬️ True (Ya)</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handlePredict}
                                        disabled={loading}
                                        className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading && treeData ? 'Memprediksi...' : 'Prediksi'}
                                    </button>
                                </div>

                                {prediction && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`mt-6 p-6 rounded-lg text-center ${prediction.prediction === 'Yes'
                                                ? 'bg-gradient-to-br from-[#00ff88]/20 to-transparent border border-[#00ff88]/50'
                                                : 'bg-gradient-to-br from-pink-500/20 to-transparent border border-pink-500/50'
                                            }`}
                                    >
                                        <div className="text-6xl mb-4">
                                            {prediction.prediction === 'Yes' ? '⛳' : '🏠'}
                                        </div>
                                        <div className={`text-3xl font-bold mb-2 ${prediction.prediction === 'Yes' ? 'text-[#00ff88]' : 'text-pink-400'
                                            }`}>
                                            {prediction.prediction === 'Yes' ? 'Main Golf!' : 'Tidak Main'}
                                        </div>
                                        <div className="text-sm text-gray-400 mb-4">
                                            Tingkat Keyakinan: {(prediction.confidence * 100).toFixed(0)}%
                                        </div>
                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                                            <div
                                                className={`h-full ${prediction.prediction === 'Yes' ? 'bg-[#00ff88]' : 'bg-pink-500'
                                                    }`}
                                                style={{ width: `${prediction.confidence * 100}%` }}
                                            />
                                        </div>

                                        <div className="text-left mt-4 pt-4 border-t border-white/10">
                                            <div className="text-xs text-gray-400 mb-2">
                                                <strong className="text-gray-300">Cara Perhitungan Keyakinan:</strong>
                                            </div>
                                            <div className="text-xs text-gray-400 space-y-1">
                                                <p>• Sistem mencari data training yang cocok dengan input Anda</p>
                                                <p>• Jika ada data exact match, confidence = prediksi benar / total match</p>
                                                <p>• Jika tidak ada exact match, sistem cek partial match (Outlook atau Temperature)</p>
                                                <p>• Semakin banyak data training yang mendukung prediksi, semakin tinggi keyakinannya</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DecisionTree
