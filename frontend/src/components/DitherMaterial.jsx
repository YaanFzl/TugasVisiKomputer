import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

const DitherMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color('#1e3a8a'), // Deep blue
    uColorEnd: new THREE.Color('#0ea5e9'),   // Bright sky blue
    uResolution: new THREE.Vector2()
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    varying vec2 vUv;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 st = vUv;
      
      // Animated noise
      float noise = random(st + uTime * 0.1);
      
      // Gradient with animation
      float gradientMix = st.y + sin(st.x * 3.0 + uTime * 0.5) * 0.2;
      vec3 color = mix(uColorStart, uColorEnd, gradientMix + noise * 0.1);
      
      // Dither effect
      float dither = random(st * 100.0);
      color += (dither - 0.5) * 0.05;

      gl_FragColor = vec4(color, 1.0);
    }
  `
)

extend({ DitherMaterial })

export { DitherMaterial }
