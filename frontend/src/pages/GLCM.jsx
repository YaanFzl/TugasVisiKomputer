import React, { useState } from 'react'
import { glcmService } from '../services/api'
import { motion } from 'framer-motion'
import { Upload, Activity } from 'lucide-react'

const GLCM = () => {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [degrees, setDegrees] = useState([0, 45, 90, 135])
    const [distance, setDistance] = useState(1)
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setPreview(URL.createObjectURL(selectedFile))
            setResults(null)
        }
    }

    const handleAnalyze = async () => {
        if (!file) return
        setLoading(true)
        try {
            const data = await glcmService.analyze(file, degrees, distance)
            setResults(data.features)
        } catch (error) {
            console.error("Analysis failed:", error)
            alert("Analysis failed. Ensure backend is running.")
        } finally {
            setLoading(false)
        }
    }

    const toggleDegree = (deg) => {
        setDegrees(prev =>
            prev.includes(deg) ? prev.filter(d => d !== deg) : [...prev, deg].sort((a, b) => a - b)
        )
    }

    return (
        <div className="space-y-8">
            <div className="glass-panel p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <Activity className="text-[#00ff88]" />
                    Analisis Tekstur GLCM
                </h2>

                {/* GLCM Explanation Panel */}
                <div className="mb-6 glass-panel p-6 bg-purple-500/5 border-purple-400/20">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        🔍 Apa itu GLCM?
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                        <p>
                            <strong className="text-[#00ff88]">Gray-Level Co-occurrence Matrix (GLCM)</strong> adalah metode statistik
                            untuk menganalisis tekstur gambar dengan menghitung seberapa sering pasangan piksel dengan nilai intensitas tertentu
                            muncul bersamaan pada jarak dan arah tertentu.
                        </p>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-semibold text-white mb-2">Fitur Tekstur:</p>
                                <ul className="space-y-2 text-xs text-gray-400">
                                    <li>
                                        <strong className="text-blue-400">Contrast:</strong> Mengukur perbedaan intensitas antara piksel tetangga.
                                        Nilai tinggi = tekstur kasar/kontras tinggi.
                                    </li>
                                    <li>
                                        <strong className="text-blue-400">Dissimilarity:</strong> Mirip contrast, tapi meningkat secara linear.
                                        Mengukur ketidaksamaan lokal.
                                    </li>
                                    <li>
                                        <strong className="text-blue-400">Homogeneity:</strong> Mengukur kedekatan distribusi elemen ke diagonal GLCM.
                                        Nilai tinggi = tekstur halus/seragam.
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <ul className="space-y-2 text-xs text-gray-400 mt-6 md:mt-0">
                                    <li>
                                        <strong className="text-pink-400">Energy:</strong> Mengukur keseragaman tekstur (orderliness).
                                        Nilai tinggi = pola sangat teratur/konstan.
                                    </li>
                                    <li>
                                        <strong className="text-pink-400">Correlation:</strong> Mengukur ketergantungan linear nilai abu-abu.
                                        Menunjukkan pola berulang atau struktur linear.
                                    </li>
                                    <li>
                                        <strong className="text-pink-400">ASM:</strong> Angular Second Moment. Ukuran keseragaman tekstur
                                        (kuadrat dari Energy).
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#00ff88] transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {preview ? (
                                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                            ) : (
                                <div className="text-gray-400">
                                    <Upload className="w-12 h-12 mx-auto mb-2" />
                                    <p>Letakkan gambar di sini atau klik untuk upload</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Orientasi (Derajat)</label>
                                <div className="flex gap-2">
                                    {[0, 45, 90, 135].map(deg => (
                                        <button
                                            key={deg}
                                            onClick={() => toggleDegree(deg)}
                                            className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${degrees.includes(deg)
                                                ? 'bg-[#00ff88] text-black font-bold shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                                                : 'bg-white/5 hover:bg-white/10 text-white'
                                                }`}
                                        >
                                            {deg}°
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Jarak Piksel: {distance}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={distance}
                                    onChange={(e) => setDistance(parseInt(e.target.value))}
                                    className="w-full accent-[#00ff88]"
                                />
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!file || loading || degrees.length === 0}
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Memproses...' : 'Analisis Tekstur'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {results ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full"
                            >
                                <h3 className="text-xl font-bold mb-4 text-white">Hasil Analisis</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {Object.entries(results).map(([feature, values]) => (
                                        <div key={feature} className="glass-panel p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="capitalize font-mono text-[#00ff88]">{feature}</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {values.map((val, idx) => (
                                                    <div key={idx} className="text-center">
                                                        <div className="text-xs text-gray-500 mb-1">{degrees[idx]}°</div>
                                                        <div className="font-mono text-sm text-white">{val.toFixed(4)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 border border-white/10 rounded-xl bg-white/5">
                                <p>Hasil akan muncul di sini</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GLCM
