import React, { useMemo, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Info, X } from 'lucide-react';

// --- Helper Functions ---

const calculateBarData = (i, j, val, maxVal, feature, binSize, binCount) => {
  const dist = Math.abs(i - j) / binCount;
  let heightFactor = val / maxVal;
  let color;

  switch (feature) {
    case 'contrast':
      const weightCont = Math.pow(Math.abs(i - j), 2);
      heightFactor = (val * weightCont) / (maxVal * Math.pow(binCount / 2, 2));
      color = new THREE.Color().setHSL(0.6 - Math.min(dist * 1.5, 0.6), 1, 0.5);
      break;

    case 'dissimilarity':
      const weightDiss = Math.abs(i - j);
      heightFactor = (val * weightDiss) / (maxVal * (binCount / 2));
      color = new THREE.Color().setHSL(0.6 - Math.min(dist * 1.2, 0.6), 1, 0.5);
      break;

    case 'homogeneity':
      const weightHom = 1 / (1 + Math.pow(i - j, 2));
      heightFactor = (val * weightHom) / maxVal;
      color = new THREE.Color().setHSL(Math.min(dist * 2, 0.6), 1, 0.5);
      break;

    case 'energy':
    case 'ASM':
      heightFactor = (val * val) / (maxVal * maxVal);
      color = new THREE.Color().setHSL(0.6 - (val / maxVal) * 0.6, 1, 0.5);
      break;

    case 'correlation':
      heightFactor = val / maxVal;
      color = new THREE.Color().setHSL(0.6 - (val / maxVal) * 0.6, 1, 0.5);
      break;

    default:
      heightFactor = val / maxVal;
      color = new THREE.Color().setHSL(0.6 - (val / maxVal) * 0.6, 1, 0.5);
      break;
  }

  const height = Math.max(0.1, Math.min(heightFactor * 20, 20));
  return { height, color };
};

// --- Sub-Components ---

const GLCMBar = ({ position, val, maxVal, i, j, onHover, binSize, feature, binCount }) => {
  const { height, color } = useMemo(() =>
    calculateBarData(i, j, val, maxVal, feature, binSize, binCount),
    [i, j, val, maxVal, feature, binSize, binCount]
  );

  return (
    <group position={position}>
      <mesh
        position={[0, height / 2, 0]}
        onPointerOver={(e) => { e.stopPropagation(); onHover({ i, j, val, binSize, feature }); }}
        onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} />
      </mesh>
    </group>
  );
};

// Use Html instead of Text for axis labels
const AxisLabel = ({ position, text, color = "#94a3b8" }) => (
  <group position={position}>
    <Html center distanceFactor={15} style={{ pointerEvents: 'none' }}>
      <div style={{
        color: color,
        fontSize: '12px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        textShadow: '0 0 3px black'
      }}>
        {text}
      </div>
    </Html>
  </group>
);

const TutorialOverlay = ({ onClose }) => (
  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-[#0f172a] border border-blue-500/30 p-6 rounded-2xl max-w-lg shadow-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
      <h3 className="text-xl font-bold text-[#00ff88] mb-4 flex items-center gap-2"><Info size={24} /> Konsep Dasar GLCM</h3>
      <div className="space-y-4 text-sm text-gray-300">
        <div className="flex items-center justify-center gap-4 bg-white/5 p-4 rounded-xl mb-4">
          <div className="flex flex-col items-center"><div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center font-bold text-white mb-1">Ref</div><span className="text-xs text-blue-300">Piksel Awal</span></div>
          <div className="h-0.5 w-8 bg-gray-500 relative"><div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">Jarak d</div></div>
          <div className="flex flex-col items-center"><div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center font-bold text-white mb-1">Ngh</div><span className="text-xs text-green-300">Tetangga</span></div>
        </div>
        <p><strong>1. Reference (Ref) - <span className="text-blue-400">Sumbu Biru</span>:</strong> Piksel yang sedang kita amati.</p>
        <p><strong>2. Neighbor (Tetangga) - <span className="text-green-400">Sumbu Hijau</span>:</strong> Piksel di sebelahnya.</p>
        <p className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20"><strong>Tips:</strong> Grafik sekarang akan <strong>berubah bentuk</strong> saat Anda memilih fitur (Contrast, Homogeneity, dll) untuk menunjukkan bagaimana fitur tersebut dihitung.</p>
      </div>
      <button onClick={onClose} className="w-full mt-6 py-2 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00dd77] transition-colors">Saya Mengerti</button>
    </div>
  </div>
);

const LegendOverlay = ({ angle, distance, feature, featureValue }) => {
  const getLegendContent = () => {
    switch (feature) {
      case 'contrast': return { title: 'Contrast', desc: 'Tinggi bar = Kontribusi ke Contrast. Semakin jauh dari diagonal, semakin tinggi.', items: [['#ef4444', 'Kontribusi Tinggi (Beda Warna Besar)'], ['#3b82f6', 'Kontribusi Rendah']] };
      case 'dissimilarity': return { title: 'Dissimilarity', desc: 'Tinggi bar = Kontribusi ke Dissimilarity (Linear).', items: [['#ef4444', 'Kontribusi Tinggi'], ['#3b82f6', 'Kontribusi Rendah']] };
      case 'homogeneity': return { title: 'Homogeneity', desc: 'Tinggi bar = Kontribusi ke Homogeneity. Semakin dekat diagonal, semakin tinggi.', items: [['#ef4444', 'Kontribusi Tinggi (Warna Sama)'], ['#3b82f6', 'Kontribusi Rendah']] };
      case 'energy': return { title: 'Energy', desc: 'Tinggi bar = Probabilitas Kuadrat. Menyorot pola yang sangat dominan.', items: [['#ef4444', 'Sangat Dominan'], ['#3b82f6', 'Kurang Dominan']] };
      case 'ASM': return { title: 'ASM', desc: 'Angular Second Moment (Energy Kuadrat).', items: [['#ef4444', 'Sangat Dominan'], ['#3b82f6', 'Kurang Dominan']] };
      default: return { title: 'Distribusi Normal', desc: 'Tinggi bar = Frekuensi kemunculan pasangan piksel.', items: [['#ef4444', 'Sering Muncul'], ['#3b82f6', 'Jarang Muncul']] };
    }
  };

  const content = getLegendContent();

  return (
    <div className="absolute top-4 left-4 z-10 pointer-events-none">
      <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
        <h4 className="text-[#00ff88] font-bold mb-1">{content.title}</h4>
        <div className="text-xs text-gray-300 mb-2">
          Sudut: <span className="text-white font-bold">{angle}°</span> | Jarak: <span className="text-white font-bold">{distance} px</span>
        </div>
        {featureValue !== null && <div className="text-sm font-bold text-yellow-400 mb-2">Nilai: {featureValue.toFixed(5)}</div>}
        <p className="text-[10px] text-gray-400 mb-2 max-w-[200px]">{content.desc}</p>
        <div className="text-xs text-gray-300 space-y-1">
          {content.items.map(([color, text], i) => (
            <div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div><span>{text}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading fallback
const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#333" wireframe />
  </mesh>
);

// --- Main Component ---

const GLCM3D = ({ matrix, angle, distance, features }) => {
  const [hoverInfo, setHoverInfo] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeFeature, setActiveFeature] = useState('default');

  if (!matrix || matrix.length === 0) return <div className="flex items-center justify-center h-full text-white/50">No GLCM data available</div>;

  const BIN_COUNT = 32;
  const originalSize = matrix.length;
  const binSize = Math.ceil(originalSize / BIN_COUNT);

  const { binnedBars, maxBinVal } = useMemo(() => {
    const bars = [];
    let max = 0;
    for (let bi = 0; bi < BIN_COUNT; bi++) {
      for (let bj = 0; bj < BIN_COUNT; bj++) {
        let sum = 0;
        for (let i = 0; i < binSize; i++) {
          for (let j = 0; j < binSize; j++) {
            const r = bi * binSize + i;
            const c = bj * binSize + j;
            if (r < originalSize && c < originalSize) sum += matrix[r][c];
          }
        }
        if (sum > 0.0001) {
          if (sum > max) max = sum;
          bars.push({ i: bi, j: bj, val: sum, position: [bi - BIN_COUNT / 2, 0, bj - BIN_COUNT / 2] });
        }
      }
    }
    return { binnedBars: bars, maxBinVal: max || 1 };
  }, [matrix, originalSize, binSize]);

  const angleIndex = { 0: 0, 45: 1, 90: 2, 135: 3 }[angle] || 0;
  const currentFeatureValue = features && activeFeature !== 'default' && features[activeFeature] ? features[activeFeature][angleIndex] : null;

  return (
    <div className="relative w-full h-full">
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}

      <div className="absolute top-4 right-4 z-10">
        <button onClick={() => setShowTutorial(true)} className="p-2 bg-white/10 hover:bg-white/20 text-blue-300 rounded-full transition-colors backdrop-blur-sm">
          <Info size={20} />
        </button>
      </div>

      <LegendOverlay angle={angle} distance={distance} feature={activeFeature} featureValue={currentFeatureValue} />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/10 flex gap-1 overflow-x-auto max-w-[90vw]">
        {['default', 'contrast', 'dissimilarity', 'homogeneity', 'energy', 'correlation', 'ASM'].map(f => (
          <button key={f} onClick={() => setActiveFeature(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${activeFeature === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
            {f === 'default' ? 'Normal' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {hoverInfo && (
        <div className="absolute z-20 pointer-events-none bg-slate-900/95 text-white px-4 py-3 rounded-xl border border-white/20 shadow-2xl backdrop-blur-md text-sm max-w-xs" style={{ left: '50%', top: '10%', transform: 'translate(-50%, 0)' }}>
          <div className="font-bold text-[#00ff88] mb-2 border-b border-white/10 pb-1">Detail Pasangan Piksel</div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-blue-300">Ref (Awal):</span><span className="font-mono">Intensitas {hoverInfo.i * binSize}-{Math.min((hoverInfo.i + 1) * binSize - 1, 255)}</span></div>
            <div className="flex justify-between"><span className="text-green-300">Neighbor (Tetangga):</span><span className="font-mono">Intensitas {hoverInfo.j * binSize}-{Math.min((hoverInfo.j + 1) * binSize - 1, 255)}</span></div>
            <div className="mt-2 text-gray-300 text-xs italic bg-white/5 p-2 rounded">
              "Frekuensi: <strong>{(hoverInfo.val * 100).toFixed(2)}%</strong>"
            </div>
          </div>
        </div>
      )}

      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={<LoadingFallback />}>
          <PerspectiveCamera makeDefault position={[BIN_COUNT, BIN_COUNT * 0.8, BIN_COUNT]} fov={45} />
          <color attach="background" args={['#050b14']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[BIN_COUNT, BIN_COUNT, BIN_COUNT]} intensity={1.5} castShadow />
          <pointLight position={[-BIN_COUNT, BIN_COUNT, -BIN_COUNT]} intensity={0.5} />
          <OrbitControls autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2 - 0.1} />

          <group position={[0, -1, 0]}>
            <gridHelper args={[BIN_COUNT, BIN_COUNT, 0x333333, 0x111111]} position={[0, 0.01, 0]} />

            {/* Axes */}
            <mesh position={[BIN_COUNT / 2 + 2, 0.1, 0]}><boxGeometry args={[BIN_COUNT + 4, 0.2, 0.5]} /><meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} /></mesh>
            <AxisLabel position={[BIN_COUNT / 2 + 6, 0, 2]} text="Piksel Awal (Ref)" color="#60a5fa" />

            <mesh position={[0, 0.1, BIN_COUNT / 2 + 2]} rotation={[0, -Math.PI / 2, 0]}><boxGeometry args={[BIN_COUNT + 4, 0.2, 0.5]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} /></mesh>
            <AxisLabel position={[2, 0, BIN_COUNT / 2 + 6]} text="Tetangga (Neighbor)" color="#4ade80" />

            {binnedBars.map((bar) => (
              <GLCMBar
                key={`${bar.i}-${bar.j}`}
                {...bar}
                maxVal={maxBinVal}
                binSize={binSize}
                binCount={BIN_COUNT}
                onHover={setHoverInfo}
                feature={activeFeature}
              />
            ))}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GLCM3D;
