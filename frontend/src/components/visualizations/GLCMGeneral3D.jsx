import React, { useState, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Box, Html } from '@react-three/drei'

// Colors for gray levels 0-3
const GRAY_LEVELS = ['#1a1a1a', '#666666', '#b3b3b3', '#ffffff']

const PixelCube = ({ position, value, onClick, isHighlighted }) => {
    return (
        <group position={position} onClick={onClick}>
            <Box args={[0.9, 0.9, 0.9]}>
                <meshStandardMaterial
                    color={GRAY_LEVELS[value]}
                    emissive={isHighlighted ? '#00ff88' : '#000000'}
                    emissiveIntensity={isHighlighted ? 0.5 : 0}
                />
            </Box>
            {/* Use Html component which is more stable than Text */}
            <Html
                position={[0, 0, 0.5]}
                center
                distanceFactor={8}
                style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            >
                <div
                    style={{
                        color: value < 2 ? 'white' : 'black',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textShadow: value < 2 ? '0 0 3px black' : '0 0 3px white',
                    }}
                >
                    {value}
                </div>
            </Html>
        </group>
    )
}

// Fallback component for loading
const LoadingFallback = () => (
    <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#333" wireframe />
    </mesh>
)

const GLCMGeneral3D = () => {
    // 4x4 Grid State (0-3 values)
    const [grid, setGrid] = useState([
        [0, 1, 2, 3],
        [0, 1, 2, 3],
        [0, 1, 2, 3],
        [0, 1, 2, 3]
    ])
    const [direction, setDirection] = useState(0) // 0, 45, 90, 135
    const [hoveredMatrixCell, setHoveredMatrixCell] = useState(null) // [row, col]

    // Toggle pixel value
    const handlePixelClick = (r, c) => {
        const newGrid = [...grid]
        newGrid[r] = [...newGrid[r]]
        newGrid[r][c] = (newGrid[r][c] + 1) % 4
        setGrid(newGrid)
    }

    // Calculate GLCM Matrix
    const glcmMatrix = useMemo(() => {
        const matrix = Array(4).fill(0).map(() => Array(4).fill(0))
        const pairs = []

        const dirIndex = Math.floor(direction / 45)
        const dr = [0, -1, -1, -1][dirIndex]
        const dc = [1, 1, 0, -1][dirIndex]

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const nr = r + dr
                const nc = c + dc

                if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
                    const v1 = grid[r][c]
                    const v2 = grid[nr][nc]
                    matrix[v1][v2]++
                    pairs.push({ r1: r, c1: c, r2: nr, c2: nc, v1, v2 })
                }
            }
        }
        return { matrix, pairs }
    }, [grid, direction])

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden">
            {/* Top Bar: Controls & Matrix */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
                {/* Controls (Left) */}
                <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 pointer-events-auto w-64">
                    <h3 className="text-sm font-bold text-white mb-3">Arah Hubungan (Angle)</h3>
                    <div className="flex gap-2 mb-4">
                        {[0, 45, 90, 135].map(deg => (
                            <button
                                key={deg}
                                onClick={() => setDirection(deg)}
                                className={`flex-1 py-2 rounded text-xs font-bold transition-all ${direction === deg
                                    ? 'bg-[#00ff88] text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                {deg}°
                            </button>
                        ))}
                    </div>

                    <div className="text-xs text-gray-400 border-t border-white/10 pt-3">
                        <p className="mb-2">
                            <strong className="text-white">Cara Kerja:</strong>
                        </p>
                        <p className="mb-1">1. Klik kotak di grid 3D untuk ubah nilai (0-3).</p>
                        <p>2. Sistem mencari pasangan piksel tetangga sesuai arah.</p>
                    </div>
                </div>

                {/* Matrix Display (Right) */}
                <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 pointer-events-auto w-72">
                    <h3 className="text-sm font-bold text-white mb-3 flex justify-between">
                        <span>GLCM Matrix</span>
                        <span className="text-[#00ff88] text-xs font-normal">Hover angka!</span>
                    </h3>
                    <div className="grid grid-cols-5 gap-1 text-center text-xs">
                        {/* Header Row */}
                        <div className="text-gray-500 font-mono flex items-center justify-center text-[10px]">Ref\N</div>
                        {[0, 1, 2, 3].map(i => (
                            <div key={`h${i}`} className="text-gray-400 font-mono font-bold bg-white/5 rounded py-1 border border-transparent">{i}</div>
                        ))}

                        {/* Matrix Rows */}
                        {[0, 1, 2, 3].map(row => (
                            <React.Fragment key={`row${row}`}>
                                <div className="text-gray-400 font-mono font-bold bg-white/5 rounded py-1 flex items-center justify-center border border-transparent">{row}</div>
                                {[0, 1, 2, 3].map(col => (
                                    <div
                                        key={`${row}-${col}`}
                                        onMouseEnter={() => setHoveredMatrixCell([row, col])}
                                        onMouseLeave={() => setHoveredMatrixCell(null)}
                                        className={`
                                            py-2 rounded cursor-pointer font-bold transition-all border
                                            ${hoveredMatrixCell && hoveredMatrixCell[0] === row && hoveredMatrixCell[1] === col
                                                ? 'bg-[#00ff88] text-black border-[#00ff88] scale-110 z-10 shadow-[0_0_10px_rgba(0,255,136,0.5)]'
                                                : glcmMatrix.matrix[row][col] > 0
                                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                                    : 'bg-transparent text-gray-600 border-transparent'
                                            }
                                        `}
                                    >
                                        {glcmMatrix.matrix[row][col]}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>

                    {hoveredMatrixCell && (
                        <div className="mt-3 text-[10px] text-gray-300 bg-white/5 p-2 rounded border border-white/10">
                            Menghitung pasangan: <strong className="text-[#00ff88]">Ref={hoveredMatrixCell[0]}</strong> dan <strong className="text-[#00ff88]">Neighbor={hoveredMatrixCell[1]}</strong>
                        </div>
                    )}
                </div>
            </div>

            {/* 3D Scene */}
            <div className="flex-1 relative bg-[#0f172a]">
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                    <Suspense fallback={<LoadingFallback />}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        <OrbitControls enableRotate={true} enableZoom={true} />

                        <group position={[-1.5, -1.5, 0]}>
                            {/* Pixel Grid */}
                            {grid.map((row, r) =>
                                row.map((val, c) => {
                                    let isHighlighted = false
                                    if (hoveredMatrixCell) {
                                        const [targetV1, targetV2] = hoveredMatrixCell
                                        isHighlighted = glcmMatrix.pairs.some(p =>
                                            p.v1 === targetV1 && p.v2 === targetV2 &&
                                            ((p.r1 === r && p.c1 === c) || (p.r2 === r && p.c2 === c))
                                        )
                                    }

                                    return (
                                        <PixelCube
                                            key={`${r}-${c}`}
                                            position={[c, 3 - r, 0]}
                                            value={val}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePixelClick(r, c)
                                            }}
                                            isHighlighted={isHighlighted}
                                        />
                                    )
                                })
                            )}

                            {/* Connection Lines */}
                            {hoveredMatrixCell && glcmMatrix.pairs
                                .filter(p => p.v1 === hoveredMatrixCell[0] && p.v2 === hoveredMatrixCell[1])
                                .map((p, i) => (
                                    <Line
                                        key={i}
                                        points={[
                                            [p.c1, 3 - p.r1, 0.5],
                                            [p.c2, 3 - p.r2, 0.5]
                                        ]}
                                        color="#00ff88"
                                        lineWidth={3}
                                        transparent
                                        opacity={0.8}
                                    />
                                ))
                            }
                        </group>
                    </Suspense>
                </Canvas>
            </div>
        </div>
    )
}

export default GLCMGeneral3D
