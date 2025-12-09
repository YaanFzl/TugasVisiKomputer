import React, { useState, useEffect } from 'react'
import { naiveBayesService } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, Box, Play, RotateCcw, ChevronDown, Plus, Trash2, X, Check } from 'lucide-react'
import VisualizationModal from '../components/visualizations/VisualizationModal'
import NaiveBayes3D from '../components/visualizations/NaiveBayes3D'
import NaiveBayesGeneral3D from '../components/visualizations/NaiveBayesGeneral3D'

const NaiveBayes = () => {
    const [dataset, setDataset] = useState([])
    const [features, setFeatures] = useState([])
    const [target, setTarget] = useState('')
    const [testCase, setTestCase] = useState({})
    const [featureValues, setFeatureValues] = useState({})
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [show3D, setShow3D] = useState(false)
    const [showGeneral3D, setShowGeneral3D] = useState(false)

    // New data form state
    const [showAddForm, setShowAddForm] = useState(false)
    const [newRow, setNewRow] = useState({})
    const [editingIndex, setEditingIndex] = useState(null)

    // Load default dataset on mount
    useEffect(() => {
        loadDefaultDataset()
    }, [])

    // Update feature values when dataset changes
    useEffect(() => {
        if (dataset.length > 0 && features.length > 0) {
            const values = {}
            features.forEach(feat => {
                values[feat] = [...new Set(dataset.map(row => row[feat]))]
            })
            // Also add target values
            values[target] = [...new Set(dataset.map(row => row[target]))]
            setFeatureValues(values)
        }
    }, [dataset, features, target])

    const loadDefaultDataset = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await naiveBayesService.getDefaultDataset()
            setDataset(data.data)
            setFeatures(data.features)
            setTarget(data.target)
            setTestCase(data.default_test)

            // Initialize new row template
            const emptyRow = {}
            data.features.forEach(f => emptyRow[f] = '')
            emptyRow[data.target] = ''
            setNewRow(emptyRow)
        } catch (err) {
            console.error("Failed to load dataset:", err)
            setError(`Gagal memuat dataset: ${err.response?.data?.detail || err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleTestCaseChange = (feature, value) => {
        setTestCase(prev => ({
            ...prev,
            [feature]: value
        }))
    }

    const handleNewRowChange = (field, value) => {
        setNewRow(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleAddRow = () => {
        // Validate all fields are filled
        const allFields = [...features, target]
        const hasEmpty = allFields.some(f => !newRow[f] || newRow[f].trim() === '')

        if (hasEmpty) {
            setError('Semua field harus diisi!')
            return
        }

        if (editingIndex !== null) {
            // Update existing row
            const updated = [...dataset]
            updated[editingIndex] = { ...newRow }
            setDataset(updated)
            setEditingIndex(null)
        } else {
            // Add new row
            setDataset(prev => [...prev, { ...newRow }])
        }

        // Reset form
        const emptyRow = {}
        features.forEach(f => emptyRow[f] = '')
        emptyRow[target] = ''
        setNewRow(emptyRow)
        setShowAddForm(false)
        setError(null)
        setResults(null) // Clear results when data changes
    }

    const handleEditRow = (index) => {
        setNewRow({ ...dataset[index] })
        setEditingIndex(index)
        setShowAddForm(true)
    }

    const handleDeleteRow = (index) => {
        if (dataset.length <= 2) {
            setError('Minimal harus ada 2 data untuk training!')
            return
        }
        setDataset(prev => prev.filter((_, i) => i !== index))
        setResults(null) // Clear results when data changes
    }

    const handleCancelAdd = () => {
        const emptyRow = {}
        features.forEach(f => emptyRow[f] = '')
        emptyRow[target] = ''
        setNewRow(emptyRow)
        setShowAddForm(false)
        setEditingIndex(null)
    }

    const handleTrainAndPredict = async () => {
        if (!dataset || dataset.length < 2) {
            setError("Minimal harus ada 2 data untuk training")
            return
        }

        setLoading(true)
        setError(null)
        try {
            const data = await naiveBayesService.trainAndPredict(
                dataset,
                features,
                target,
                testCase
            )
            setResults(data)
        } catch (err) {
            console.error("Training failed:", err)
            setError(`Prediksi gagal: ${err.response?.data?.detail || err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setResults(null)
        setError(null)
        loadDefaultDataset()
    }

    // Get all possible values for a field (including any new values added)
    const getFieldOptions = (field) => {
        const existingValues = featureValues[field] || []
        const predefinedValues = {
            'Penghasilan': ['Tinggi', 'Sedang', 'Rendah'],
            'Pekerjaan': ['PNS', 'Swasta', 'Mahasiswa'],
            'Promo': ['Ada', 'Tidak'],
            'Beli': ['Ya', 'Tidak']
        }
        // Merge existing and predefined, remove duplicates
        const merged = [...new Set([...existingValues, ...(predefinedValues[field] || [])])]
        return merged.filter(v => v) // Remove empty values
    }

    return (
        <div className="space-y-8">
            <div className="glass-panel p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <BrainCircuit className="text-[#00ff88]" />
                        Klasifikasi Naive Bayes
                    </h2>
                    <button
                        onClick={() => setShowGeneral3D(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-sm transition-colors border border-blue-500/30"
                    >
                        <Box size={18} />
                        Visualisasi Konsep
                    </button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex justify-between items-center"
                    >
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="hover:text-red-300">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}

                {/* Dataset Explanation */}
                <div className="mb-6 glass-panel p-6 bg-blue-500/5 border-blue-400/20">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        📊 Tentang Dataset
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                        <p>
                            <strong className="text-[#00ff88]">Dataset: Prediksi Keputusan Pembelian</strong>
                        </p>
                        <p className="text-gray-400">
                            Model Naive Bayes akan memprediksi apakah seseorang akan membeli produk (Beli: Ya/Tidak)
                            berdasarkan faktor seperti penghasilan, pekerjaan, dan ketersediaan promo.
                        </p>

                        <div className="mt-4">
                            <p className="font-semibold text-white mb-2">Fitur yang Digunakan:</p>
                            <ul className="space-y-1 text-xs text-gray-400 ml-4">
                                <li>• <strong>Penghasilan</strong>: Tinggi, Sedang, Rendah</li>
                                <li>• <strong>Pekerjaan</strong>: PNS, Swasta, Mahasiswa</li>
                                <li>• <strong>Promo</strong>: Ada, Tidak</li>
                                <li>• <strong>Beli</strong>: Ya / Tidak - <em>target prediksi</em></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Dataset Preview & Test Case Input */}
                    <div className="space-y-6">
                        {/* Dataset Preview Table with Add/Edit/Delete */}
                        {dataset.length > 0 && (
                            <div className="glass-panel p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-semibold text-gray-300">
                                        Dataset Training ({dataset.length} sampel)
                                    </h3>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-[#00ff88]/20 hover:bg-[#00ff88]/30 text-[#00ff88] rounded-lg text-xs transition-colors border border-[#00ff88]/30"
                                    >
                                        <Plus size={14} />
                                        Tambah Data
                                    </button>
                                </div>

                                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-gray-900 z-10">
                                            <tr className="border-b border-white/10">
                                                <th className="px-2 py-2 text-left text-gray-400 font-medium w-8">#</th>
                                                {[...features, target].map(col => (
                                                    <th key={col} className="px-2 py-2 text-left text-gray-400 font-medium">
                                                        {col}
                                                    </th>
                                                ))}
                                                <th className="px-2 py-2 text-center text-gray-400 font-medium w-20">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataset.map((row, idx) => (
                                                <motion.tr
                                                    key={idx}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="border-b border-white/5 hover:bg-white/5 group"
                                                >
                                                    <td className="px-2 py-1.5 text-gray-500">{idx + 1}</td>
                                                    {[...features, target].map(col => (
                                                        <td key={col} className="px-2 py-1.5 text-gray-300">
                                                            <span className={col === target ? (row[col] === 'Ya' ? 'text-[#00ff88]' : 'text-red-400') : ''}>
                                                                {row[col]}
                                                            </span>
                                                        </td>
                                                    ))}
                                                    <td className="px-2 py-1.5">
                                                        <div className="flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditRow(idx)}
                                                                className="p-1 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRow(idx)}
                                                                className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Add/Edit Form */}
                                <AnimatePresence>
                                    {showAddForm && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-white/10 overflow-hidden"
                                        >
                                            <h4 className="text-sm font-semibold text-white mb-3">
                                                {editingIndex !== null ? '✏️ Edit Data' : '➕ Tambah Data Baru'}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[...features, target].map(field => (
                                                    <div key={field}>
                                                        <label className="text-xs text-gray-400 mb-1 block">{field}</label>
                                                        <div className="relative">
                                                            <select
                                                                value={newRow[field] || ''}
                                                                onChange={(e) => handleNewRowChange(field, e.target.value)}
                                                                className="w-full bg-gray-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer focus:border-[#00ff88] focus:outline-none transition-colors"
                                                            >
                                                                <option value="">Pilih {field}</option>
                                                                {getFieldOptions(field).map(val => (
                                                                    <option key={val} value={val}>{val}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={handleAddRow}
                                                    className="flex-1 py-2 bg-[#00ff88] text-black font-semibold rounded-lg hover:bg-[#00dd77] transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Check size={16} />
                                                    {editingIndex !== null ? 'Update' : 'Simpan'}
                                                </button>
                                                <button
                                                    onClick={handleCancelAdd}
                                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Test Case Input */}
                        {features.length > 0 && (
                            <div className="glass-panel p-4">
                                <h3 className="text-sm font-semibold text-gray-300 mb-4">
                                    🧪 Data Uji (Test Case)
                                </h3>
                                <div className="space-y-3">
                                    {features.map(feature => (
                                        <div key={feature} className="flex items-center gap-3">
                                            <label className="w-32 text-sm text-gray-400">{feature}:</label>
                                            <div className="relative flex-1">
                                                <select
                                                    value={testCase[feature] || ''}
                                                    onChange={(e) => handleTestCaseChange(feature, e.target.value)}
                                                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer focus:border-[#00ff88] focus:outline-none transition-colors"
                                                >
                                                    {getFieldOptions(feature).map(val => (
                                                        <option key={val} value={val}>{val}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleTrainAndPredict}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00dd77] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <RotateCcw size={18} />
                                                </motion.div>
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Play size={18} />
                                                Prediksi
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        disabled={loading}
                                        className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                        title="Reset ke dataset default"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Results */}
                    <div className="space-y-4">
                        {results ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {/* Prediction Result */}
                                <div className="glass-panel p-6 text-center bg-gradient-to-br from-[#00ff88]/10 to-transparent border-[#00ff88]/30">
                                    <div className="text-gray-400 text-sm mb-2">Hasil Prediksi</div>
                                    <div className="text-4xl font-bold text-[#00ff88] mb-2">
                                        {results.sklearn_calculation.prediction}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        Probabilitas: {(results.sklearn_calculation.probabilities[results.sklearn_calculation.prediction] * 100).toFixed(1)}%
                                    </div>
                                </div>

                                {/* Probability Comparison */}
                                <div className="glass-panel p-4">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Perbandingan Probabilitas</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(results.sklearn_calculation.probabilities).map(([cls, prob]) => (
                                            <div key={cls} className="text-center">
                                                <div className={`text-2xl font-bold ${cls === results.sklearn_calculation.prediction ? 'text-[#00ff88]' : 'text-gray-400'}`}>
                                                    {(prob * 100).toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-500">{cls}</div>
                                                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${prob * 100}%` }}
                                                        transition={{ duration: 0.5, delay: 0.2 }}
                                                        className={`h-full ${cls === results.sklearn_calculation.prediction ? 'bg-[#00ff88]' : 'bg-gray-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Manual vs Sklearn Comparison */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="glass-panel p-4">
                                        <div className="text-xs text-gray-500 mb-1">Manual Calculation</div>
                                        <div className={`text-lg font-bold ${results.manual_calculation.prediction === results.sklearn_calculation.prediction ? 'text-[#00ff88]' : 'text-yellow-400'}`}>
                                            {results.manual_calculation.prediction}
                                        </div>
                                    </div>
                                    <div className="glass-panel p-4">
                                        <div className="text-xs text-gray-500 mb-1">Sklearn Library</div>
                                        <div className="text-lg font-bold text-[#00ff88]">
                                            {results.sklearn_calculation.prediction}
                                        </div>
                                    </div>
                                </div>

                                {/* Prior Probabilities */}
                                <div className="glass-panel p-4">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Prior Probabilities</h3>
                                    <div className="flex gap-4 justify-center">
                                        {Object.entries(results.manual_calculation.prior).map(([cls, prob]) => (
                                            <div key={cls} className="text-center">
                                                <div className="text-lg font-bold text-blue-400">
                                                    {(prob * 100).toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-500">P({cls})</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dataset Info */}
                                <div className="glass-panel p-4">
                                    <div className="text-center">
                                        <div className="text-white font-bold text-lg">{results.num_samples}</div>
                                        <div className="text-gray-500 text-xs">Total Sampel Training</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShow3D(true)}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Box size={20} />
                                    Lihat Visualisasi 3D
                                </button>
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 border border-white/10 rounded-xl bg-white/5 min-h-[400px]">
                                <div className="text-center">
                                    <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>Pilih data uji dan klik "Prediksi"</p>
                                    <p className="text-xs mt-1 text-gray-600">Hasil prediksi akan muncul di sini</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <VisualizationModal
                isOpen={show3D}
                onClose={() => setShow3D(false)}
                title="Visualisasi Naive Bayes 3D"
            >
                {results && results.conditional_probabilities && <NaiveBayes3D conditionalProbs={results.conditional_probabilities} />}
            </VisualizationModal>

            <VisualizationModal
                isOpen={showGeneral3D}
                onClose={() => setShowGeneral3D(false)}
                title="Konsep Naive Bayes: Play Tennis?"
            >
                <NaiveBayesGeneral3D />
            </VisualizationModal>
        </div>
    )
}

export default NaiveBayes
