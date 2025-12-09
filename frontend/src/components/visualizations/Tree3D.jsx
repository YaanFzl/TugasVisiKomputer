import React, { useMemo, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Html, PerspectiveCamera } from '@react-three/drei';

const Node = ({ position, label, type, value, onHover }) => {
    const color = type === 'decision' ? '#3b82f6' : (type === 'leaf' ? '#10b981' : '#f59e0b');
    const isLeaf = type === 'leaf';

    return (
        <group position={position}>
            <mesh
                onPointerOver={(e) => { e.stopPropagation(); onHover({ label, value, type }); }}
                onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
            >
                <sphereGeometry args={[isLeaf ? 0.6 : 0.8, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>

            {/* Label for decision nodes using Html */}
            {!isLeaf && (
                <Html
                    position={[0, 1.2, 0]}
                    center
                    distanceFactor={10}
                    style={{ pointerEvents: 'none' }}
                >
                    <div style={{
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        textShadow: '0 0 5px black, 0 0 10px black'
                    }}>
                        {label}
                    </div>
                </Html>
            )}

            {/* Value for leaves using Html */}
            {isLeaf && (
                <Html
                    position={[0, -1, 0]}
                    center
                    distanceFactor={10}
                    style={{ pointerEvents: 'none' }}
                >
                    <div style={{
                        color: '#4ade80',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        textShadow: '0 0 5px black'
                    }}>
                        {value}
                    </div>
                </Html>
            )}
        </group>
    );
};

const Edge = ({ start, end, label }) => {
    const mid = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
    ];

    return (
        <group>
            <Line points={[start, end]} color="#64748b" lineWidth={2} transparent opacity={0.6} />
            <group position={mid}>
                <mesh>
                    <boxGeometry args={[1.5, 0.5, 0.1]} />
                    <meshBasicMaterial color="#1e293b" transparent opacity={0.8} />
                </mesh>
                <Html
                    position={[0, 0, 0.1]}
                    center
                    distanceFactor={10}
                    style={{ pointerEvents: 'none' }}
                >
                    <div style={{
                        color: '#94a3b8',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        textShadow: '0 0 3px black'
                    }}>
                        {label}
                    </div>
                </Html>
            </group>
        </group>
    );
};

// Loading fallback
const LoadingFallback = () => (
    <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#333" wireframe />
    </mesh>
);

const Tree3D = ({ nodes, edges }) => {
    const [hoverInfo, setHoverInfo] = useState(null);

    if (!nodes || !edges) return (
        <div className="flex items-center justify-center h-full text-white/50">
            No Tree data available
        </div>
    );

    const positions = useMemo(() => {
        const pos = {};
        const nodesByDepth = {};

        nodes.forEach(node => {
            const depth = node.depth || 0;
            if (!nodesByDepth[depth]) nodesByDepth[depth] = [];
            nodesByDepth[depth].push(node);
        });

        Object.keys(nodesByDepth).forEach(depthStr => {
            const depth = parseInt(depthStr);
            const levelNodes = nodesByDepth[depth];
            const count = levelNodes.length;

            const radius = depth * 3;
            const angleStep = (Math.PI * 1.5) / Math.max(count, 1);

            levelNodes.forEach((node, index) => {
                if (depth === 0) {
                    pos[node.id] = [0, 4, 0];
                    return;
                }

                const angle = (index - (count - 1) / 2) * angleStep;
                const x = Math.sin(angle) * (depth * 4);
                const y = 4 - (depth * 3);
                const z = Math.cos(angle) * (depth * 2);

                pos[node.id] = [x, y, z];
            });
        });

        return pos;
    }, [nodes]);

    return (
        <div className="relative w-full h-full">
            {/* Overlay Info */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h4 className="text-[#00ff88] font-bold mb-1">Decision Tree 3D</h4>
                    <div className="flex gap-4 text-xs mt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-gray-300">Decision</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-gray-300">Leaf (Result)</span>
                        </div>
                    </div>
                </div>
            </div>

            <Canvas shadows dpr={[1, 2]}>
                <Suspense fallback={<LoadingFallback />}>
                    <PerspectiveCamera makeDefault position={[0, 2, 20]} fov={50} />
                    <color attach="background" args={['#050b14']} />

                    <ambientLight intensity={0.6} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, 5, 10]} intensity={0.5} />

                    <OrbitControls autoRotate autoRotateSpeed={0.5} />

                    {nodes.map(node => (
                        <Node
                            key={node.id}
                            position={positions[node.id]}
                            label={node.label}
                            type={node.type}
                            value={node.value}
                            onHover={setHoverInfo}
                        />
                    ))}

                    {edges.map((edge, i) => (
                        <Edge
                            key={i}
                            start={positions[edge.from]}
                            end={positions[edge.to]}
                            label={edge.label}
                        />
                    ))}
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Tree3D;
