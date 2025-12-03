import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const Bar = ({ position, height, color, label, prob, feature, cls, onHover }) => {
    return (
        <group position={position}>
            <mesh
                position={[0, height / 2, 0]}
                onPointerOver={(e) => { e.stopPropagation(); onHover({ feature, cls, value: label, prob }); }}
                onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
            >
                <boxGeometry args={[0.5, height, 0.5]} />
                <meshStandardMaterial color={color} roughness={0.2} metalness={0.6} />
            </mesh>

            {/* Value Label at bottom */}
            <Text
                position={[0, -0.2, 0.4]}
                rotation={[-Math.PI / 4, 0, 0]}
                fontSize={0.25}
                color="#94a3b8"
                anchorX="center"
                anchorY="top"
            >
                {label}
            </Text>
        </group>
    );
};

const NaiveBayes3D = ({ conditionalProbs }) => {
    const [hoverInfo, setHoverInfo] = useState(null);

    if (!conditionalProbs || Object.keys(conditionalProbs).length === 0) return (
        <div className="flex items-center justify-center h-full text-white/50">
            No Probability data available
        </div>
    );

    const data = useMemo(() => {
        const items = [];
        const features = Object.keys(conditionalProbs);
        if (features.length === 0) return { items: [], features: [], classes: [] };

        const firstFeature = features[0];
        const classes = Object.keys(conditionalProbs[firstFeature] || {});

        // Layout:
        // Group by Feature -> Value
        // Z axis separates Classes

        let xOffset = 0;
        const featureLabels = [];

        features.forEach((feature, fIdx) => {
            const firstClass = classes[0];
            const values = Object.keys(conditionalProbs[feature][firstClass] || {});

            const startX = xOffset;

            values.forEach((val, vIdx) => {
                classes.forEach((cls, cIdx) => {
                    const prob = conditionalProbs[feature][cls][val] || 0;

                    items.push({
                        position: [xOffset + vIdx * 1.2, 0, cIdx * 1.5], // Tighter spacing
                        height: Math.max(0.1, prob * 6),
                        prob: prob,
                        feature: feature,
                        value: val,
                        cls: cls,
                        color: new THREE.Color().setHSL(cIdx / classes.length, 0.8, 0.5)
                    });
                });
            });

            // Feature Label centered under its values
            featureLabels.push({
                text: feature,
                position: [startX + (values.length * 1.2) / 2 - 0.6, 0, classes.length * 1.5 + 1]
            });

            xOffset += values.length * 1.2 + 2; // Gap between features
        });

        return { items, features, classes, featureLabels, totalWidth: xOffset };
    }, [conditionalProbs]);

    return (
        <div className="relative w-full h-full">
            {/* Overlay Info */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h4 className="text-[#00ff88] font-bold mb-2">Conditional Probabilities</h4>
                    <div className="space-y-2">
                        {data.classes.map((cls, i) => (
                            <div key={cls} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: new THREE.Color().setHSL(i / data.classes.length, 0.8, 0.5).getStyle() }}></div>
                                <span className="text-xs text-gray-300">{cls}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {hoverInfo && (
                <div
                    className="absolute z-20 pointer-events-none bg-slate-800/90 text-white px-3 py-2 rounded-lg border border-white/20 shadow-xl backdrop-blur-sm text-xs"
                    style={{
                        left: '50%',
                        top: '10%',
                        transform: 'translate(-50%, 0)'
                    }}
                >
                    <div className="font-bold text-[#00ff88] mb-1">{hoverInfo.feature} = {hoverInfo.value}</div>
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Class:</span>
                        <span>{hoverInfo.cls}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Probability:</span>
                        <span className="font-mono">{(hoverInfo.prob * 100).toFixed(2)}%</span>
                    </div>
                </div>
            )}

            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[data.totalWidth / 2, 8, 15]} fov={45} />
                <color attach="background" args={['#050b14']} />

                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, 5, -10]} intensity={0.5} />

                <OrbitControls target={[data.totalWidth / 2, 0, 0]} autoRotate autoRotateSpeed={0.2} />

                <group position={[0, -1, 0]}>
                    <gridHelper args={[data.totalWidth * 2, 40, 0x334155, 0x1e293b]} position={[data.totalWidth / 2, 0.01, 0]} />

                    {data.items.map((item, i) => (
                        <Bar
                            key={i}
                            {...item}
                            onHover={setHoverInfo}
                        />
                    ))}

                    {/* Feature Labels */}
                    {data.featureLabels.map((label, i) => (
                        <Text
                            key={i}
                            position={label.position}
                            rotation={[-Math.PI / 2, 0, 0]}
                            fontSize={0.8}
                            color="white"
                            anchorX="center"
                            anchorY="top"
                        >
                            {label.text}
                        </Text>
                    ))}
                </group>
            </Canvas>
        </div>
    );
};

export default NaiveBayes3D;
