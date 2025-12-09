import React, { useState } from 'react'
import { glcmService, lbpService } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Activity, Box, Grid3X3, BarChart3 } from 'lucide-react'
import GLCM3D from '../components/visualizations/GLCM3D'
import VisualizationModal from '../components/visualizations/VisualizationModal'
import GLCMGeneral3D from '../components/visualizations/GLCMGeneral3D'

const GLCM = () => {
    // Tab state
    const [activeTab, setActiveTab] = useState('glcm') // 'glcm' or 'lbp'

    // GLCM states
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [degrees, setDegrees] = useState([0, 45, 90, 135])
    const [distance, setDistance] = useState(1)
    const [results, setResults] = useState(null)
    const [glcmMatrices, setGlcmMatrices] = useState(null)
    const [selectedAngle, setSelectedAngle] = useState(0)
    const [show3D, setShow3D] = useState(false)
    const [showGeneral3D, setShowGeneral3D] = useState(false)
    const [loading, setLoading] = useState(false)

    // LBP states
    const [lbpFile, setLbpFile] = useState(null)
    const [lbpPreview, setLbpPreview] = useState(null)
    const [lbpRadius, setLbpRadius] = useState(1)
    const [lbpPoints, setLbpPoints] = useState(8)
    const [lbpMethod, setLbpMethod] = useState('uniform')
    const [lbpResult, setLbpResult] = useState(null)
    const [lbpLoading, setLbpLoading] = useState(false)

    // GLCM handlers
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
            setGlcmMatrices(data.glcm_matrices)
            if (data.degrees && data.degrees.length > 0) {
                setSelectedAngle(data.degrees[0])
            }
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

    // LBP handlers
    const handleLbpFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setLbpFile(selectedFile)
            setLbpPreview(URL.createObjectURL(selectedFile))
            setLbpResult(null)
        }
    }

    const handleLbpAnalyze = async () => {
        if (!lbpFile) return
        setLbpLoading(true)
        try {
            const data = await lbpService.analyze(lbpFile, lbpRadius, lbpPoints, lbpMethod)
            setLbpResult(data)
        } catch (error) {
            console.error("LBP Analysis failed:", error)
            alert("LBP Analysis failed. Ensure backend is running.")
        } finally {
            setLbpLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Main Tab Navigation */}
            <div className="glass-panel p-2 flex gap-2">
                <button
                    onClick={() => setActiveTab('glcm')}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'glcm'
                        ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <Activity size={18} />
                    Analisis GLCM
                </button>
                <button
                    onClick={() => setActiveTab('lbp')}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'lbp'
                        ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <Grid3X3 size={18} />
                    Analisis LBP
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'glcm' ? (
                    <motion.div
                        key="glcm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* GLCM Content - Original */}
                        <div className="glass-panel p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                                    <Activity className="text-[#00ff88]" />
                                    Analisis Tekstur GLCM
                                </h2>
                                <button
                                    onClick={() => setShowGeneral3D(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-sm transition-colors border border-blue-500/30"
                                >
                                    <Box size={18} />
                                    Visualisasi Konsep
                                </button>
                            </div>

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
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-bold text-white">Hasil Analisis</h3>
                                                <button
                                                    onClick={() => setShow3D(true)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-sm transition-colors border border-blue-500/30"
                                                >
                                                    <Box size={16} />
                                                    Lihat Visualisasi 3D
                                                </button>
                                            </div>

                                            <VisualizationModal
                                                isOpen={show3D}
                                                onClose={() => setShow3D(false)}
                                                title="Visualisasi GLCM 3D"
                                            >
                                                {glcmMatrices && (
                                                    <div className="h-full flex flex-col relative">
                                                        {/* Angle Selector */}
                                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-md p-1 rounded-lg border border-white/10 flex gap-1">
                                                            {Object.keys(glcmMatrices).map((deg) => (
                                                                <button
                                                                    key={deg}
                                                                    onClick={() => setSelectedAngle(parseInt(deg))}
                                                                    className={`px-3 py-1 rounded text-xs font-mono transition-colors ${selectedAngle === parseInt(deg)
                                                                        ? 'bg-[#00ff88] text-black font-bold'
                                                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                                        }`}
                                                                >
                                                                    {deg}°
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <GLCM3D
                                                            matrix={glcmMatrices[selectedAngle]}
                                                            angle={selectedAngle}
                                                            distance={distance}
                                                            features={results}
                                                        />
                                                    </div>
                                                )}
                                            </VisualizationModal>

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

                        <VisualizationModal
                            isOpen={showGeneral3D}
                            onClose={() => setShowGeneral3D(false)}
                            title="Konsep GLCM: Pixel to Matrix"
                        >
                            <GLCMGeneral3D />
                        </VisualizationModal>
                    </motion.div>
                ) : (
                    <motion.div
                        key="lbp"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* LBP Content */}
                        <div className="glass-panel p-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-white mb-6">
                                <Grid3X3 className="text-[#00ff88]" />
                                Analisis Tekstur LBP
                            </h2>

                            {/* LBP Explanation Panel */}
                            <div className="mb-6 glass-panel p-6 bg-emerald-500/5 border-emerald-400/20">
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    🔍 Apa itu LBP?
                                </h3>
                                <div className="space-y-3 text-sm text-gray-300">
                                    <p>
                                        <strong className="text-[#00ff88]">Local Binary Pattern (LBP)</strong> adalah operator tekstur
                                        yang melabeli setiap piksel dengan membandingkan nilai tetangganya. Hasilnya adalah pola biner
                                        yang menggambarkan karakteristik tekstur lokal.
                                    </p>
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                            <p className="font-semibold text-blue-400 text-sm mb-1">Cara Kerja</p>
                                            <p className="text-xs text-gray-400">
                                                Bandingkan piksel pusat dengan tetangganya. Jika tetangga ≥ pusat, beri nilai 1, jika tidak 0.
                                                Gabungkan menjadi bilangan biner.
                                            </p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                            <p className="font-semibold text-pink-400 text-sm mb-1">Uniform Patterns</p>
                                            <p className="text-xs text-gray-400">
                                                Pola dengan maksimal 2 transisi 0-1. Contoh: 00000000, 00011100.
                                                Representasi tekstur yang lebih ringkas.
                                            </p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                            <p className="font-semibold text-yellow-400 text-sm mb-1">Aplikasi</p>
                                            <p className="text-xs text-gray-400">
                                                Klasifikasi tekstur, pengenalan wajah, deteksi cacat, analisis medis.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left: Upload & Settings */}
                                <div className="space-y-6">
                                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#00ff88] transition-colors relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLbpFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {lbpPreview ? (
                                            <img src={lbpPreview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                                        ) : (
                                            <div className="text-gray-400">
                                                <Upload className="w-12 h-12 mx-auto mb-2" />
                                                <p>Letakkan gambar di sini atau klik untuk upload</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-300">Radius: {lbpRadius}</label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                value={lbpRadius}
                                                onChange={(e) => setLbpRadius(parseInt(e.target.value))}
                                                className="w-full accent-[#00ff88]"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Jarak dari piksel pusat ke tetangga</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-300">Jumlah Titik Sampling: {lbpPoints}</label>
                                            <div className="flex gap-2">
                                                {[8, 16, 24].map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setLbpPoints(p)}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-mono transition-all ${lbpPoints === p
                                                            ? 'bg-[#00ff88] text-black font-bold'
                                                            : 'bg-white/5 hover:bg-white/10 text-white'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-300">Metode</label>
                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'uniform', label: 'Uniform' },
                                                    { id: 'default', label: 'Default' },
                                                    { id: 'ror', label: 'Rotation Inv.' }
                                                ].map(m => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => setLbpMethod(m.id)}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${lbpMethod === m.id
                                                            ? 'bg-[#00ff88] text-black font-bold'
                                                            : 'bg-white/5 hover:bg-white/10 text-white'
                                                            }`}
                                                    >
                                                        {m.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLbpAnalyze}
                                            disabled={!lbpFile || lbpLoading}
                                            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {lbpLoading ? 'Memproses...' : 'Analisis LBP'}
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Results */}
                                <div className="space-y-4">
                                    {lbpResult ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <h3 className="text-xl font-bold text-white">Hasil LBP</h3>

                                            {/* LBP Image */}
                                            <div className="glass-panel p-4">
                                                <p className="text-sm font-medium text-gray-300 mb-2">Gambar LBP</p>
                                                <img
                                                    src={`data:image/png;base64,${lbpResult.lbp_image}`}
                                                    alt="LBP Result"
                                                    className="w-full rounded-lg"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="glass-panel p-4">
                                                <p className="text-sm font-medium text-gray-300 mb-2">Parameter</p>
                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Radius</p>
                                                        <p className="font-mono text-[#00ff88]">{lbpResult.info.radius}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Points</p>
                                                        <p className="font-mono text-[#00ff88]">{lbpResult.info.n_points}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Patterns</p>
                                                        <p className="font-mono text-[#00ff88]">{lbpResult.info.unique_patterns}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Uniformity */}
                                            <div className="glass-panel p-4">
                                                <p className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                                    <BarChart3 size={16} className="text-[#00ff88]" />
                                                    Analisis Tekstur
                                                </p>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-gray-400">Tipe Tekstur</span>
                                                        <span className={`text-xs font-bold ${lbpResult.uniformity.texture_type === 'uniform' ? 'text-green-400' :
                                                            lbpResult.uniformity.texture_type === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                                                            }`}>
                                                            {lbpResult.uniformity.texture_type.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-gray-400">Skor Keseragaman</span>
                                                        <span className="text-xs font-mono text-white">
                                                            {(lbpResult.uniformity.uniformity_score * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-gray-400">Entropy</span>
                                                        <span className="text-xs font-mono text-white">
                                                            {lbpResult.uniformity.entropy.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Top Patterns */}
                                            <div className="glass-panel p-4">
                                                <p className="text-sm font-medium text-gray-300 mb-2">Pola Dominan</p>
                                                <div className="space-y-1">
                                                    {lbpResult.uniformity.top_patterns.map((p, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                                <div
                                                                    className="bg-[#00ff88] h-2 rounded-full"
                                                                    style={{ width: `${p.percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-400 w-20 text-right">
                                                                {p.percentage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500 border border-white/10 rounded-xl bg-white/5 min-h-[400px]">
                                            <p>Hasil akan muncul di sini</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default GLCM
