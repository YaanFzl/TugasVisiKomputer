import React, { useState, lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Background from './components/Background'
import SplashScreen from './components/SplashScreen'
import { LayoutGrid, BrainCircuit, Network, TreeDeciduous } from 'lucide-react'

// Lazy load page components for code splitting
const Landing = lazy(() => import('./pages/Landing'))
const GLCM = lazy(() => import('./pages/GLCM'))
const KNN = lazy(() => import('./pages/KNN'))
const NaiveBayes = lazy(() => import('./pages/NaiveBayes'))
const DecisionTree = lazy(() => import('./pages/DecisionTree'))

// Loading component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 font-mono text-sm">Memuat modul...</p>
        </div>
    </div>
)

// Page transition variants
const pageTransition = {
    initial: {
        opacity: 0,
        x: -20,
        scale: 0.95
    },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.43, 0.13, 0.23, 0.96]
        }
    },
    exit: {
        opacity: 0,
        x: 20,
        scale: 0.95,
        transition: {
            duration: 0.3,
            ease: [0.43, 0.13, 0.23, 0.96]
        }
    }
}

function App() {
    const [showSplash, setShowSplash] = useState(true)
    const [activeModule, setActiveModule] = useState('home')
    const [mouse, setMouse] = useState({ x: 0, y: 0 })
    const [scroll, setScroll] = useState(0)
    const [transitionRotation, setTransitionRotation] = useState(0)

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMouse({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            })
        }

        const handleScroll = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0
            setScroll(scrollPercent)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Trigger 3D rotation on module change
    useEffect(() => {
        setTransitionRotation(prev => prev + 0.3)
    }, [activeModule])

    const handleSplashComplete = () => {
        setShowSplash(false)
    }

    // Show splash screen first
    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} />
    }

    return (
        <>
            <Background
                mouse={mouse}
                scroll={scroll}
                transitionRotation={transitionRotation}
                activeModule={activeModule}
            />

            <div className="relative z-10 container mx-auto p-8 min-h-screen flex flex-col">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12 flex justify-between items-end"
                >
                    <div className="cursor-pointer" onClick={() => setActiveModule('home')}>
                        <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tighter">
                            VISKOM<span className="text-[#00ff88]">.AI</span>
                        </h1>
                        <p className="text-gray-400 font-mono text-sm">Visi Komputer & Pembelajaran Mesin Lanjutan</p>
                    </div>

                    <nav className="flex gap-4">
                        <button
                            onClick={() => setActiveModule('glcm')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${activeModule === 'glcm'
                                ? 'bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]'
                                : 'border-white/10 hover:bg-white/5 text-white'
                                }`}
                        >
                            <LayoutGrid size={18} />
                            GLCM
                        </button>
                        <button
                            onClick={() => setActiveModule('knn')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${activeModule === 'knn'
                                ? 'bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]'
                                : 'border-white/10 hover:bg-white/5 text-white'
                                }`}
                        >
                            <BrainCircuit size={18} />
                            KNN
                        </button>
                        <button
                            onClick={() => setActiveModule('naive-bayes')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${activeModule === 'naive-bayes'
                                ? 'bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]'
                                : 'border-white/10 hover:bg-white/5 text-white'
                                }`}
                        >
                            <Network size={18} />
                            Naive Bayes
                        </button>
                        <button
                            onClick={() => setActiveModule('decision-tree')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${activeModule === 'decision-tree'
                                ? 'bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]'
                                : 'border-white/10 hover:bg-white/5 text-white'
                                }`}
                        >
                            <TreeDeciduous size={18} />
                            Decision Tree
                        </button>
                    </nav>
                </motion.header>

                <main className="flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeModule}
                            variants={pageTransition}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <Suspense fallback={<LoadingSpinner />}>
                                {activeModule === 'home' && <Landing onNavigate={setActiveModule} />}
                                {activeModule === 'glcm' && <GLCM />}
                                {activeModule === 'knn' && <KNN />}
                                {activeModule === 'naive-bayes' && <NaiveBayes />}
                                {activeModule === 'decision-tree' && <DecisionTree />}
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </>
    )
}

export default App
