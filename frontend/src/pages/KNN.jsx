import React, { useState } from 'react'
import { knnService } from '../services/api'
import { motion } from 'framer-motion'
import { Upload, BrainCircuit, Box } from 'lucide-react'
import KNNGeneral3D from '../components/visualizations/KNNGeneral3D'
import VisualizationModal from '../components/visualizations/VisualizationModal'

const KNN = () => {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [encodedData, setEncodedData] = useState(null)
    const [kValue, setKValue] = useState(3)
    const [testSize, setTestSize] = useState(20)
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [show3D, setShow3D] = useState(false)

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setLoading(true)
            setError(null)
            setPreview(null)
            setResults(null)
            console.log('Uploading file:', selectedFile.name)
            try {
                const data = await knnService.uploadDataset(selectedFile)
                console.log('Upload response:', data)
                setPreview(data.preview)
                setEncodedData(data.data_json)
                setError(null)
            } catch (error) {
                console.error("Upload failed:", error)
                setError(`Gagal upload: ${error.response?.data?.detail || error.message}`)
                setPreview(null)
                setEncodedData(null)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleTrain = async () => {
        if (!encodedData) return
        setLoading(true)
        try {
            const data = await knnService.train(kValue, testSize, encodedData)
            setResults(data)
        } catch (error) {
            console.error("Training failed:", error)
            setError(`Pelatihan gagal: ${error.response?.data?.detail || error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="glass-panel p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <BrainCircuit className="text-[#00ff88]" />
                        Klasifikasi KNN
                    </h2>
                    <button
                        onClick={() => setShow3D(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-sm transition-colors border border-blue-500/30"
                    >
                        <Box size={18} />
                        Visualisasi Konsep KNN
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Dataset Explanation */}
                <div className="mb-6 glass-panel p-6 bg-blue-500/5 border-blue-400/20">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        📊 Tentang Dataset
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                        <p>
                            <strong className="text-[#00ff88]">Dataset: Prediksi Persetujuan Kredit</strong>
                        </p>
                        <p className="text-gray-400">
                            Model KNN akan memprediksi apakah pengajuan kredit akan disetujui (Y) atau ditolak (N)
                            berdasarkan informasi pemohon seperti pendapatan, riwayat kredit, dan properti.
                        </p>

                        <div className="mt-4">
                            <p className="font-semibold text-white mb-2">Format Kolom yang Diperlukan:</p>
                            <ul className="space-y-1 text-xs text-gray-400 ml-4">
                                <li>• <strong>Loan_ID</strong>: ID unik pemohon (opsional)</li>
                                <li>• <strong>Gender</strong>: Male/Female</li>
                                <li>• <strong>Married</strong>: Yes/No</li>
                                <li>• <strong>Dependents</strong>: 0, 1, 2, 3+</li>
                                <li>• <strong>Education</strong>: Graduate/Not Graduate</li>
                                <li>• <strong>Self_Employed</strong>: Yes/No</li>
                                <li>• <strong>ApplicantIncome</strong>: Pendapatan pemohon</li>
                                <li>• <strong>CoapplicantIncome</strong>: Pendapatan pasangan</li>
                                <li>• <strong>LoanAmount</strong>: Jumlah pinjaman (dalam ribuan)</li>
                                <li>• <strong>Loan_Amount_Term</strong>: Jangka waktu (hari)</li>
                                <li>• <strong>Credit_History</strong>: 1 (baik) / 0 (buruk)</li>
                                <li>• <strong>Property_Area</strong>: Urban/Semiurban/Rural</li>
                                <li>• <strong>Loan_Status</strong>: Y (disetujui) / N (ditolak) - <em>target</em></li>
                            </ul>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <button
                                onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = '/knn_template.csv'
                                    link.download = 'knn_loan_template.csv'
                                    link.click()
                                }}
                                className="px-4 py-2 bg-[#00ff88] text-black font-semibold rounded-lg hover:bg-[#00dd77] transition-colors inline-flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Template Dataset
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                                Template sudah berisi 20 contoh data. Anda bisa menambah, mengedit, atau mengganti dengan data Anda sendiri!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#00ff88] transition-colors relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-gray-400">
                                <Upload className="w-12 h-12 mx-auto mb-2" />
                                <p>{file ? file.name : "Upload Dataset CSV"}</p>
                                {loading && !preview && <p className="text-sm mt-2">Memuat...</p>}
                            </div>
                        </div>

                        {preview && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Nilai K: {kValue}</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={kValue}
                                        onChange={(e) => setKValue(parseInt(e.target.value))}
                                        className="w-full accent-[#00ff88]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Ukuran Test: {testSize}%</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="50"
                                        value={testSize}
                                        onChange={(e) => setTestSize(parseInt(e.target.value))}
                                        className="w-full accent-[#00ff88]"
                                    />
                                </div>
                                <button
                                    onClick={handleTrain}
                                    disabled={loading}
                                    className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Melatih...' : 'Latih Model'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {results ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {/* Main Accuracy Card */}
                                <div className="glass-panel p-6 text-center bg-gradient-to-br from-[#00ff88]/10 to-transparent border-[#00ff88]/30">
                                    <div className="text-5xl font-bold text-[#00ff88] mb-2">
                                        {(results.accuracy * 100).toFixed(2)}%
                                    </div>
                                    <div className="text-gray-400 text-sm">Akurasi Model</div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="glass-panel p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-400">
                                            {(results.precision * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Presisi</div>
                                    </div>
                                    <div className="glass-panel p-4 text-center">
                                        <div className="text-2xl font-bold text-purple-400">
                                            {(results.recall * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Recall</div>
                                    </div>
                                    <div className="glass-panel p-4 text-center">
                                        <div className="text-2xl font-bold text-pink-400">
                                            {(results.f1_score * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Skor F1</div>
                                    </div>
                                </div>

                                {/* Dataset Info */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="glass-panel p-4">
                                        <div className="text-white font-bold text-lg">{results.train_size}</div>
                                        <div className="text-gray-500 text-xs">Sampel Training</div>
                                    </div>
                                    <div className="glass-panel p-4">
                                        <div className="text-white font-bold text-lg">{results.test_size}</div>
                                        <div className="text-gray-500 text-xs">Sampel Test</div>
                                    </div>
                                </div>



                                {/* Confusion Matrix */}
                                {results.confusion_matrix && (
                                    <div className="glass-panel p-4">
                                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Matriks Konfusi</h3>
                                        <div className="grid grid-cols-2 gap-2 max-w-[200px] mx-auto">
                                            {results.confusion_matrix.map((row, i) =>
                                                row.map((val, j) => (
                                                    <div
                                                        key={`${i}-${j}`}
                                                        className="aspect-square flex items-center justify-center rounded-lg font-bold text-sm"
                                                        style={{
                                                            background: i === j
                                                                ? 'rgba(0, 255, 136, 0.2)'
                                                                : 'rgba(236, 72, 153, 0.2)',
                                                            border: i === j
                                                                ? '1px solid rgba(0, 255, 136, 0.4)'
                                                                : '1px solid rgba(236, 72, 153, 0.4)',
                                                            color: i === j ? '#00ff88' : '#ec4899'
                                                        }}
                                                    >
                                                        {val}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 text-center">
                                            <span className="text-[#00ff88]">■</span> Benar
                                            <span className="ml-3 text-pink-400">■</span> Salah
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 border border-white/10 rounded-xl bg-white/5 min-h-[400px]">
                                <p>Hasil pelatihan akan muncul di sini</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <VisualizationModal
                isOpen={show3D}
                onClose={() => setShow3D(false)}
                title="Konsep K-Nearest Neighbors (KNN)"
            >
                <KNNGeneral3D />
            </VisualizationModal>
        </div >
    )
}

export default KNN

