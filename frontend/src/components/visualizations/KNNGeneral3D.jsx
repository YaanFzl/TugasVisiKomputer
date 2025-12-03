import React, { useState, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Sphere } from '@react-three/drei'
import * as THREE from 'three'

// Generate synthetic data for two clusters
const generateData = () => {
    const data = []
    // Cluster 1 (Red) - centered at [-3, 1, -2] (Lifted up and spread out)
    for (let i = 0; i < 20; i++) {
        data.push({
            position: [
                -3 + (Math.random() - 0.5) * 6, // Wider spread (6)
                1 + (Math.random() - 0.5) * 4,  // Moderate vertical spread
                -2 + (Math.random() - 0.5) * 6
            ],
            class: 0,
            color: '#ef4444' // Red
        })
    }
    // Cluster 2 (Blue) - centered at [3, 1, 2]
    for (let i = 0; i < 20; i++) {
        data.push({
            position: [
                3 + (Math.random() - 0.5) * 6,
                1 + (Math.random() - 0.5) * 4,
                2 + (Math.random() - 0.5) * 6
            ],
            class: 1,
            color: '#3b82f6' // Blue
        })
    }
    return data
}

const DataPoint = ({ position, color, isNeighbor }) => {
    return (
        <mesh position={position}>
            <sphereGeometry args={[isNeighbor ? 0.25 : 0.15, 32, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={isNeighbor ? color : '#000000'}
                emissiveIntensity={isNeighbor ? 0.5 : 0}
            />
        </mesh>
    )
}

const TestPoint = ({ position, onDrag }) => {
    // Simple visual representation of the test point
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
        </group>
    )
}

const ConnectionLine = ({ start, end, color }) => {
    return (
        <Line
            points={[start, end]}
            color={color}
            lineWidth={2}
            transparent
            opacity={0.6}
        />
    )
}

const Scene = ({ k, testPos, data, setNeighbors }) => {
    // Calculate distances and find neighbors
    useMemo(() => {
        const distances = data.map((point, index) => {
            const dist = Math.sqrt(
                Math.pow(point.position[0] - testPos[0], 2) +
                Math.pow(point.position[1] - testPos[1], 2) +
                Math.pow(point.position[2] - testPos[2], 2)
            )
            return { ...point, distance: dist, originalIndex: index }
        })

        distances.sort((a, b) => a.distance - b.distance)
        const nearest = distances.slice(0, k)
        setNeighbors(nearest)
    }, [k, testPos, data, setNeighbors])

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <gridHelper args={[10, 10, 0x444444, 0x222222]} />
            <axesHelper args={[5]} />

            {/* Data Points */}
            {data.map((point, i) => (
                <DataPoint
                    key={i}
                    position={point.position}
                    color={point.color}
                    isNeighbor={false} // We'll handle highlighting via lines/overlay for clarity or pass a prop if needed
                />
            ))}

            {/* Test Point */}
            <TestPoint position={testPos} />
        </>
    )
}

const KNNGeneral3D = () => {
    const [k, setK] = useState(3)
    const [testPos, setTestPos] = useState([0, 0, 0])
    const [neighbors, setNeighbors] = useState([])
    const data = useMemo(() => generateData(), [])

    // Calculate voting result
    const votes = useMemo(() => {
        const counts = { 0: 0, 1: 0 }
        neighbors.forEach(n => counts[n.class]++)
        return counts
    }, [neighbors])

    const prediction = votes[0] > votes[1] ? 0 : (votes[1] > votes[0] ? 1 : -1)

    return (
        <div className="w-full h-full flex flex-col">
            {/* Controls & Info */}
            <div className="absolute top-4 left-4 z-50 space-y-4 w-64">
                {/* K Control */}
                <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Jumlah Tetangga (K): <span className="text-[#00ff88] font-bold">{k}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="15"
                        value={k}
                        onChange={(e) => setK(parseInt(e.target.value))}
                        className="w-full accent-[#00ff88]"
                    />
                </div>

                {/* Test Point Control */}
                <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Posisi Test Point</h4>
                    {['X', 'Y', 'Z'].map((axis, i) => (
                        <div key={axis} className="mb-2 last:mb-0">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{axis}</span>
                                <span>{testPos[i].toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="-4"
                                max="4"
                                step="0.1"
                                value={testPos[i]}
                                onChange={(e) => {
                                    const newPos = [...testPos]
                                    newPos[i] = parseFloat(e.target.value)
                                    setTestPos(newPos)
                                }}
                                className="w-full accent-blue-500"
                            />
                        </div>
                    ))}
                </div>

            </div>

            {/* Voting Result - Moved to Top Right */}
            <div className="absolute top-4 right-4 z-50 w-64 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Hasil Voting</h4>
                <div className="flex gap-2 mb-3">
                    <div className="flex-1 bg-red-500/20 border border-red-500/50 rounded p-2 text-center">
                        <div className="text-xs text-red-300">Merah</div>
                        <div className="text-xl font-bold text-red-400">{votes[0]}</div>
                    </div>
                    <div className="flex-1 bg-blue-500/20 border border-blue-500/50 rounded p-2 text-center">
                        <div className="text-xs text-blue-300">Biru</div>
                        <div className="text-xl font-bold text-blue-400">{votes[1]}</div>
                    </div>
                </div>
                <div className="text-center pt-2 border-t border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Prediksi Kelas:</div>
                    <div className={`text-lg font-bold ${prediction === 0 ? 'text-red-400' : prediction === 1 ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                        {prediction === 0 ? 'MERAH' : prediction === 1 ? 'BIRU' : 'SERI'}
                    </div>
                </div>
            </div>

            {/* 3D Scene */}
            <div className="flex-1 relative rounded-xl overflow-hidden bg-[#0f172a]">
                <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
                    <Scene k={k} testPos={testPos} data={data} setNeighbors={setNeighbors} />
                    <OrbitControls />

                    {/* Render lines to neighbors */}
                    {neighbors.map((n, i) => (
                        <ConnectionLine
                            key={i}
                            start={testPos}
                            end={n.position}
                            color={n.color}
                        />
                    ))}

                    {/* Highlight neighbors */}
                    {neighbors.map((n, i) => (
                        <mesh key={`highlight-${i}`} position={n.position}>
                            <sphereGeometry args={[0.25, 16, 16]} />
                            <meshBasicMaterial color={n.color} wireframe />
                        </mesh>
                    ))}
                </Canvas>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-300">Kelas 0 (Merah)</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-gray-300">Kelas 1 (Biru)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white border border-gray-500"></div>
                        <span className="text-gray-300">Test Point</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KNNGeneral3D
