import React from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, BrainCircuit, ArrowRight, Cpu, Zap, TreeDeciduous, Network } from 'lucide-react'

const Landing = ({ onNavigate }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-[80vh] flex flex-col justify-center">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-16"
            >
                {/* Hero Section */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                        Sistem Online v2.0
                    </motion.div>

                    <motion.h1 variants={item} className="text-7xl font-bold tracking-tighter leading-tight">
                        Visi <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                            Komputer
                        </span>
                    </motion.h1>

                    <motion.p variants={item} className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Buka kekuatan analisis tekstur dan pemodelan prediktif.
                        Proses gambar dan dataset dengan algoritma GLCM dan KNN canggih kami.
                    </motion.p>
                </div>


                {/* Feature Cards */}
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    <div
                        onClick={() => onNavigate('glcm')}
                        className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00ff88]/50 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/0 to-[#00ff88]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <LayoutGrid className="text-[#00ff88]" size={24} />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    Analisis GLCM
                                    <ArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#00ff88]" size={20} />
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Ekstraksi fitur tekstur dari gambar menggunakan Gray-Level Co-occurrence Matrices.
                                </p>
                            </div>

                            <div className="pt-4 flex gap-2 flex-wrap">
                                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-gray-400">Tekstur</span>
                                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-gray-400">Fitur</span>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => onNavigate('knn')}
                        className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00ff88]/50 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/0 to-[#00ff88]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <BrainCircuit className="text-[#00ff88]" size={24} />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    Klasifikasi KNN
                                    <ArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#00ff88]" size={20} />
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Latih dan evaluasi model K-Nearest Neighbors pada dataset Anda.
                                </p>
                            </div>

                            <div className="pt-4 flex gap-2 flex-wrap">
                                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-gray-400">ML</span>
                                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-gray-400">Klasifikasi</span>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => onNavigate('naive-bayes')}
                        className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00ff88]/50 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/0 to-[#00ff88]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Network className="text-[#00ff88]" size={24} />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    Naive Bayes
                                    <ArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#00ff88]" size={20} />
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Klasifikasi probabilistik menggunakan Teorema Bayes.
                                </p>
                            </div>

                            <div className="pt-4 flex gap-2 flex-wrap">
                                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-gray-400">Probabilistic</span>
                                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-gray-400">Bayesian</span>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => onNavigate('decision-tree')}
                        className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00ff88]/50 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/0 to-[#00ff88]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <TreeDeciduous className="text-[#00ff88]" size={24} />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    Decision Tree
                                    <ArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#00ff88]" size={20} />
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Model prediksi pohon keputusan dengan algoritma ID3.
                                </p>
                            </div>

                            <div className="pt-4 flex gap-2 flex-wrap">
                                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-gray-400">Tree</span>
                                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-gray-400">ID3</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats/Footer */}
                <motion.div variants={item} className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-12 border-t border-white/10">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">Kecepatan Tinggi</div>
                        <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                            <Zap size={14} /> Pemrosesan Real-time
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">Presisi</div>
                        <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                            <Cpu size={14} /> Algoritma Canggih
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">Aman</div>
                        <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                            <LayoutGrid size={14} /> Eksekusi Lokal
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default Landing
