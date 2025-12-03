import React, { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Box } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react'

// "Play Tennis" Dataset Statistics (Simplified)
const PRIORS = { Yes: 9 / 14, No: 5 / 14 }

const LIKELIHOODS = {
    Outlook: {
        Sunny: { Yes: 2 / 9, No: 3 / 5 },
        Overcast: { Yes: 4 / 9, No: 0 / 5 },
        Rainy: { Yes: 3 / 9, No: 2 / 5 }
    },
    Temperature: {
        Hot: { Yes: 2 / 9, No: 2 / 5 },
        Mild: { Yes: 4 / 9, No: 2 / 5 },
        Cool: { Yes: 3 / 9, No: 1 / 5 }
    },
    Humidity: {
        High: { Yes: 3 / 9, No: 4 / 5 },
        Normal: { Yes: 6 / 9, No: 1 / 5 }
    },
    Wind: {
        Weak: { Yes: 6 / 9, No: 2 / 5 },
        Strong: { Yes: 3 / 9, No: 3 / 5 }
    }
}

const Bar3D = ({ position, height, color, label, value }) => {
    return (
        <group position={position}>
            <Box args={[1, height, 1]} position={[0, height / 2, 0]}>
                <meshStandardMaterial color={color} transparent opacity={0.8} />
            </Box>
            <Text
                position={[0, height + 0.5, 0]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="bottom"
            >
                {`${(value * 100).toFixed(1)}%`}
            </Text>
            <Text
                position={[0, -0.5, 0]}
                fontSize={0.3}
                color="#9ca3af"
                anchorX="center"
                anchorY="top"
            >
                {label}
            </Text>
        </group>
    )
}

const NaiveBayesGeneral3D = () => {
    const [conditions, setConditions] = useState({
        Outlook: 'Sunny',
        Temperature: 'Cool',
        Humidity: 'Normal',
        Wind: 'Weak'
    })
    const [showCalculation, setShowCalculation] = useState(true)

    const probabilities = useMemo(() => {
        let probYes = PRIORS.Yes
        let probNo = PRIORS.No
        const details = { Yes: [], No: [] }

        // Calculate P(X|Yes) * P(Yes) and P(X|No) * P(No)
        Object.keys(conditions).forEach(feature => {
            const value = conditions[feature]
            const pYes = LIKELIHOODS[feature][value].Yes
            const pNo = LIKELIHOODS[feature][value].No

            probYes *= pYes
            probNo *= pNo

            details.Yes.push({ feature, value, prob: pYes })
            details.No.push({ feature, value, prob: pNo })
        })

        // Normalize
        const total = probYes + probNo
        return {
            Yes: probYes / total,
            No: probNo / total,
            rawYes: probYes,
            rawNo: probNo,
            details
        }
    }, [conditions])

    const prediction = probabilities.Yes > probabilities.No ? 'YES' : 'NO'

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden">
            {/* Top Bar: Controls & Result */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
                {/* Controls (Left) */}
                <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl pointer-events-auto w-72 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        🎾 Play Tennis?
                    </h3>

                    {Object.keys(LIKELIHOODS).map(feature => (
                        <div key={feature} className="mb-4 last:mb-0">
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                {feature}
                            </label>
                            <div className="grid grid-cols-3 gap-1">
                                {Object.keys(LIKELIHOODS[feature]).map(option => (
                                    <button
                                        key={option}
                                        onClick={() => setConditions(prev => ({ ...prev, [feature]: option }))}
                                        className={`
                                            px-2 py-1.5 rounded text-xs font-medium transition-all
                                            ${conditions[feature] === option
                                                ? 'bg-[#00ff88] text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                            }
                                        `}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Result (Right) */}
                <div className="bg-black/80 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-xl text-center pointer-events-auto">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Prediction</h4>
                    <div className={`text-4xl font-black mb-2 ${prediction === 'YES' ? 'text-[#00ff88]' : 'text-red-500'
                        }`}>
                        {prediction}
                    </div>
                </div>
            </div>

            {/* Calculation Panel (Bottom) */}
            <div className="absolute bottom-4 left-4 right-4 z-50 pointer-events-auto">
                <div className="bg-black/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                    <button
                        onClick={() => setShowCalculation(!showCalculation)}
                        className="w-full p-3 flex items-center justify-between text-white hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Calculator size={18} className="text-[#00ff88]" />
                            <span className="font-bold text-sm">Perhitungan Probabilitas (Naive Bayes)</span>
                        </div>
                        {showCalculation ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>

                    <AnimatePresence>
                        {showCalculation && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-white/10"
                            >
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                                    {/* YES Calculation */}
                                    <div>
                                        <div className="text-[#00ff88] font-bold mb-2">P(Yes | X) ∝ P(Yes) × Π P(Xi | Yes)</div>
                                        <div className="space-y-1 text-gray-400">
                                            <div className="flex justify-between">
                                                <span>P(Yes)</span>
                                                <span className="text-white">{PRIORS.Yes.toFixed(2)}</span>
                                            </div>
                                            {probabilities.details.Yes.map((d, i) => (
                                                <div key={i} className="flex justify-between pl-2 border-l border-[#00ff88]/30">
                                                    <span>P({d.value}|Yes)</span>
                                                    <span className="text-white">{d.prob.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-white/20 pt-1 mt-1 flex justify-between font-bold text-white">
                                                <span>Score Yes</span>
                                                <span>{probabilities.rawYes.toFixed(4)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* NO Calculation */}
                                    <div>
                                        <div className="text-red-500 font-bold mb-2">P(No | X) ∝ P(No) × Π P(Xi | No)</div>
                                        <div className="space-y-1 text-gray-400">
                                            <div className="flex justify-between">
                                                <span>P(No)</span>
                                                <span className="text-white">{PRIORS.No.toFixed(2)}</span>
                                            </div>
                                            {probabilities.details.No.map((d, i) => (
                                                <div key={i} className="flex justify-between pl-2 border-l border-red-500/30">
                                                    <span>P({d.value}|No)</span>
                                                    <span className="text-white">{d.prob.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-white/20 pt-1 mt-1 flex justify-between font-bold text-white">
                                                <span>Score No</span>
                                                <span>{probabilities.rawNo.toFixed(4)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-2 text-center text-[10px] text-gray-500">
                                    * Score dinormalisasi untuk mendapatkan persentase probabilitas akhir
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 3D Scene */}
            <div className="flex-1 relative bg-[#0f172a]">
                <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />

                    <group position={[0, -0.5, 0]}>
                        {/* Yes Bar */}
                        <Bar3D
                            position={[-1.5, 0, 0]}
                            height={probabilities.Yes * 5}
                            color="#00ff88"
                            label="YES"
                            value={probabilities.Yes}
                        />

                        {/* No Bar */}
                        <Bar3D
                            position={[1.5, 0, 0]}
                            height={probabilities.No * 5}
                            color="#ef4444"
                            label="NO"
                            value={probabilities.No}
                        />

                        {/* Base Plane */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                            <planeGeometry args={[8, 4]} />
                            <meshStandardMaterial color="#1e293b" transparent opacity={0.5} />
                        </mesh>
                        <gridHelper args={[8, 8, 0x334155, 0x1e293b]} position={[0, 0.01, 0]} />
                    </group>
                </Canvas>
            </div>
        </div>
    )
}

export default NaiveBayesGeneral3D
