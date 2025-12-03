import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

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

            {/* Label always visible for decision nodes */}
            {!isLeaf && (
                <Text
                    position={[0, 1.2, 0]}
                    fontSize={0.5}
                    color="white"
                    anchorX="center"
                    anchorY="bottom"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                >
                    {label}
                </Text>
            )}

            {/* Value for leaves */}
            {isLeaf && (
                <Text
                    position={[0, -1, 0]}
                    fontSize={0.4}
                    color="#4ade80"
                    anchorX="center"
                    anchorY="top"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                >
                    {value}
                </Text>
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
                <Text
                    position={[0, 0, 0.1]}
                    fontSize={0.3}
                    color="#94a3b8"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            </group>
        </group>
    );
};

const Tree3D = ({ nodes, edges }) => {
    const [hoverInfo, setHoverInfo] = useState(null);

    if (!nodes || !edges) return (
        <div className="flex items-center justify-center h-full text-white/50">
            No Tree data available
        </div>
    );

    // Calculate positions with a better layout algorithm
    const positions = useMemo(() => {
        const pos = {};
        const nodesByDepth = {};

        // Group by depth
        nodes.forEach(node => {
            const depth = node.depth || 0;
            if (!nodesByDepth[depth]) nodesByDepth[depth] = [];
            nodesByDepth[depth].push(node);
        });

        // Assign positions
        // We want a cone/pyramid shape
        Object.keys(nodesByDepth).forEach(depthStr => {
            const depth = parseInt(depthStr);
            const levelNodes = nodesByDepth[depth];
            const count = levelNodes.length;

            // Calculate radius for this level (wider at bottom)
            const radius = depth * 3;
            const angleStep = (Math.PI * 1.5) / Math.max(count, 1); // Spread over 270 degrees

            levelNodes.forEach((node, index) => {
                // Root at 0,0,0
                if (depth === 0) {
                    pos[node.id] = [0, 4, 0];
                    return;
                }

                // Others distributed in a semi-circle/fan
                // Center the fan
                const angle = (index - (count - 1) / 2) * angleStep;

                // Convert polar to cartesian (x, z)
                // Y is inverted depth
                const x = Math.sin(angle) * (depth * 4); // Spread width
                const y = 4 - (depth * 3); // Vertical spacing
                const z = Math.cos(angle) * (depth * 2); // Depth spread

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
            </Canvas>
        </div>
    );
};

export default Tree3D;
