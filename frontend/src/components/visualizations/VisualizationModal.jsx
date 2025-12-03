import React from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VisualizationModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0f172a] w-full max-w-6xl h-[80vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {title}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-black">
                        {children}
                    </div>

                    {/* Footer/Controls Hint */}
                    <div className="px-6 py-3 border-t border-white/10 bg-white/5 text-xs text-gray-400 flex justify-between items-center">
                        <div className="flex gap-4">
                            <span>🖱️ Kiri: Putar</span>
                            <span>🖱️ Kanan: Geser</span>
                            <span>🖱️ Scroll: Zoom</span>
                        </div>
                        <div>
                            Tekan ESC untuk menutup
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VisualizationModal;
