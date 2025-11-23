import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SplashScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0)
    const [showText, setShowText] = useState(false)

    useEffect(() => {
        // Progress animation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(() => onComplete(), 500)
                    return 100
                }
                return prev + 2
            })
        }, 30)

        // Show text after delay
        setTimeout(() => setShowText(true), 300)

        return () => clearInterval(interval)
    }, [onComplete])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a1a] to-black overflow-hidden"
            >
                {/* Animated Background Particles */}
                <div className="absolute inset-0">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-[#00ff88] rounded-full"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                                opacity: 0
                            }}
                            animate={{
                                y: [null, Math.random() * window.innerHeight],
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0]
                            }}
                            transition={{
                                duration: 2 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>

                {/* Grid Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        opacity: 0.1
                    }} />
                </div>

                {/* Main Content */}
                <div className="relative z-10 text-center space-y-8">
                    {/* Logo with Glow */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.2
                        }}
                        className="relative"
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 blur-3xl bg-[#00ff88] opacity-50 scale-150" />

                        {/* Logo */}
                        <div className="relative">
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(0,255,136,0.5)',
                                        '0 0 60px rgba(0,255,136,0.8)',
                                        '0 0 20px rgba(0,255,136,0.5)',
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-32 h-32 mx-auto bg-gradient-to-br from-[#00ff88] to-[#00cc70] rounded-3xl flex items-center justify-center transform rotate-12"
                            >
                                <span className="text-6xl font-black text-black">V</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Text Animation */}
                    <AnimatePresence>
                        {showText && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="space-y-3"
                            >
                                <motion.h1
                                    className="text-6xl font-black"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00ff88] to-white">
                                        VISKOM
                                    </span>
                                    <span className="text-[#00ff88]">.VK</span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-gray-400 font-mono text-sm tracking-wider"
                                >
                                    Visi Komputer & Machine Learning
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Progress Bar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="w-80 mx-auto space-y-2"
                    >
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#00ff88] via-[#00cc70] to-[#00ff88] rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        <motion.div
                            className="text-[#00ff88] font-mono text-sm"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            {progress}%
                        </motion.div>
                    </motion.div>

                    {/* Loading Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-gray-500 font-mono text-xs tracking-widest"
                    >
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            INITIALIZING SYSTEM
                        </motion.span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            ...
                        </motion.span>
                    </motion.div>
                </div>

                {/* Corner Accents */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[#00ff88]/30"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[#00ff88]/30"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[#00ff88]/30"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[#00ff88]/30"
                />

                {/* Scanning Line Effect */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ y: -100 }}
                    animate={{ y: '100vh' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-full h-32 bg-gradient-to-b from-transparent via-[#00ff88]/10 to-transparent" />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default SplashScreen
