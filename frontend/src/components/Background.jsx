import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ======================
// LANDING PAGE - Particles & Waves
// ======================
const LandingParticles = ({ mouse, scroll, transitionRotation }) => {
  const particlesRef = useRef()
  const count = 300

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      const targetRotationY = state.clock.elapsedTime * 0.05 + scroll * Math.PI * 4 + transitionRotation
      particlesRef.current.rotation.y = THREE.MathUtils.lerp(
        particlesRef.current.rotation.y,
        targetRotationY,
        0.1
      )
      particlesRef.current.rotation.x = mouse.y * 0.2
      particlesRef.current.position.x = mouse.x * 2
      particlesRef.current.position.z = -scroll * 5
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#6366f1"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// ======================
// GLCM - Scattered Texture Pixels
// ======================
const GLCMPixels = ({ mouse, transitionRotation }) => {
  const groupRef = useRef()
  const pixelRefs = useRef([])
  const pixelCount = 150

  const pixels = useMemo(() => {
    return Array.from({ length: pixelCount }, () => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8
      ],
      size: Math.random() * 0.15 + 0.05,
      phase: Math.random() * Math.PI * 2
    }))
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      const targetRotationY = state.clock.elapsedTime * 0.05 + transitionRotation * 0.3
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationY,
        0.1
      )
      groupRef.current.rotation.x = mouse.y * 0.15
      groupRef.current.position.x = mouse.x * 1
    }

    // Animate individual pixels
    pixelRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const pixel = pixels[i]
        const wave = Math.sin(state.clock.elapsedTime * 0.5 + pixel.phase) * 0.5
        mesh.position.y = pixel.position[1] + wave

        // Pulse opacity
        const opacity = 0.3 + Math.sin(state.clock.elapsedTime + pixel.phase) * 0.3
        mesh.material.opacity = opacity
      }
    })
  })

  return (
    <group ref={groupRef}>
      {pixels.map((pixel, i) => (
        <mesh
          key={i}
          ref={(el) => (pixelRefs.current[i] = el)}
          position={pixel.position}
        >
          <boxGeometry args={[pixel.size, pixel.size, pixel.size]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

// ======================
// KNN - Network Nodes
// ======================
const KNNNetwork = ({ mouse, transitionRotation }) => {
  const groupRef = useRef()
  const nodeCount = 20

  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }, () => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5
      ],
      color: ['#00ff88', '#00ccff', '#ff00ff'][Math.floor(Math.random() * 3)]
    }))
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      const targetRotationY = state.clock.elapsedTime * 0.08 + transitionRotation * 0.4
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationY,
        0.1
      )
      groupRef.current.rotation.x = mouse.y * 0.2
      groupRef.current.position.x = mouse.x * 1.2
    }
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <group key={i}>
          {/* Node sphere */}
          <mesh position={node.position}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Connections */}
          {i > 0 && i % 3 === 0 && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    ...node.position,
                    ...nodes[i - 1].position
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={node.color} opacity={0.3} transparent />
            </line>
          )}
        </group>
      ))}
    </group>
  )
}

// ======================
// NAIVE BAYES - Floating Probability Spheres
// ======================
const NaiveBayesSpheres = ({ mouse, transitionRotation }) => {
  const groupRef = useRef()
  const sphereRefs = useRef([])
  const sphereCount = 40

  const spheres = useMemo(() => {
    return Array.from({ length: sphereCount }, () => {
      const radius = 3 + Math.random() * 5
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 8

      return {
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius - 3
        ],
        size: Math.random() * 0.2 + 0.1,
        color: ['#8b5cf6', '#ec4899', '#00ffff', '#00ff88'][Math.floor(Math.random() * 4)],
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      }
    })
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      const targetRotationY = state.clock.elapsedTime * 0.06 + transitionRotation * 0.25
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationY,
        0.1
      )
      groupRef.current.rotation.x = mouse.y * 0.1
      groupRef.current.position.x = mouse.x * 0.8
    }

    // Animate spheres in orbital paths
    sphereRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const sphere = spheres[i]
        const time = state.clock.elapsedTime * sphere.speed + sphere.phase

        // Orbital movement
        const radius = 3 + Math.sin(time * 0.3) * 2
        const angle = time
        mesh.position.x = Math.cos(angle) * radius
        mesh.position.z = Math.sin(angle) * radius - 3
        mesh.position.y = sphere.position[1] + Math.sin(time * 0.7) * 1.5

        // Scale pulsing
        const scale = 1 + Math.sin(time * 2) * 0.3
        mesh.scale.setScalar(scale)

        // Opacity pulsing
        mesh.material.opacity = 0.4 + Math.sin(time * 1.5) * 0.3
      }
    })
  })

  return (
    <group ref={groupRef}>
      {spheres.map((sphere, i) => (
        <mesh
          key={i}
          ref={(el) => (sphereRefs.current[i] = el)}
          position={sphere.position}
        >
          <sphereGeometry args={[sphere.size, 16, 16]} />
          <meshStandardMaterial
            color={sphere.color}
            emissive={sphere.color}
            emissiveIntensity={0.6}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

// ======================
// SHARED COMPONENTS
// ======================
const WaveGrid = ({ mouse, scroll, transitionRotation }) => {
  const meshRef = useRef()
  const materialRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = -6 + Math.sin(state.clock.elapsedTime * 0.3) * 1 - scroll * 8
      meshRef.current.position.y = -2 + Math.sin(state.clock.elapsedTime * 0.2) * 0.3 - scroll * 3

      const targetRotationY = mouse.x * 0.1 + transitionRotation * 0.2
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotationY,
        0.1
      )
      meshRef.current.rotation.x = -Math.PI / 2.5 - scroll * Math.PI * 0.3
    }

    if (materialRef.current) {
      materialRef.current.opacity = 0.15 + Math.sin(state.clock.elapsedTime) * 0.05 + scroll * 0.15
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, -6]}>
      <planeGeometry args={[20, 20, 30, 30]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#4f46e5"
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  )
}

const CameraController = ({ mouse, scroll, transitionRotation }) => {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.5, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.5, 0.05)

    const targetZ = 5 - scroll * 6 + Math.sin(transitionRotation * 10) * 0.5
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1)
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ======================
// MAIN SCENE
// ======================
const Scene = ({ mouse, scroll, transitionRotation, activeModule }) => {
  return (
    <>
      <CameraController mouse={mouse} scroll={scroll} transitionRotation={transitionRotation} />

      {/* Module-specific backgrounds */}
      {activeModule === 'home' && (
        <>
          <LandingParticles mouse={mouse} scroll={scroll} transitionRotation={transitionRotation} />
          <WaveGrid mouse={mouse} scroll={scroll} transitionRotation={transitionRotation} />
        </>
      )}

      {activeModule === 'glcm' && (
        <GLCMPixels mouse={mouse} transitionRotation={transitionRotation} />
      )}

      {activeModule === 'knn' && (
        <KNNNetwork mouse={mouse} transitionRotation={transitionRotation} />
      )}

      {activeModule === 'naive-bayes' && (
        <NaiveBayesSpheres mouse={mouse} transitionRotation={transitionRotation} />
      )}

      {/* Lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#00ffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ec4899" />
    </>
  )
}

const Background = ({ mouse, scroll = 0, transitionRotation = 0, activeModule = 'home' }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, #1a0f2e 0%, #0a0612 100%)'
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Scene
          mouse={mouse}
          scroll={scroll}
          transitionRotation={transitionRotation}
          activeModule={activeModule}
        />
      </Canvas>
    </div>
  )
}

export default Background
