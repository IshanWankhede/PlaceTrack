import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import ScallopBlob from './ScallopBlob.jsx';
import StripedSphere from './StripedSphere.jsx';
import GlassBubble from './GlassBubble.jsx';

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

function AuthShapes() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetX = (state.pointer.x * Math.PI) / 8;
    const targetY = (state.pointer.y * Math.PI) / 10;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetX, 3.5, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -targetY, 3.5, delta);
  });

  return (
    <group ref={groupRef}>
      {/* Hero scallop character with reactive eyes */}
      <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.6}>
        <ScallopBlob position={[0, -0.2, 0]} scale={1.1} color="#818CF8" trackMouse={true} />
      </Float>

      {/* Gold striped sphere */}
      <Float speed={2.2} rotationIntensity={0.4} floatIntensity={0.7}>
        <StripedSphere position={[1.8, 1.4, -0.6]} scale={0.75} rotationSpeed={0.6} />
      </Float>

      {/* Glossy Yellow Blob */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[-1.6, 1.3, -0.5]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshPhysicalMaterial
            color="#F5C451"
            roughness={0.12}
            clearcoat={1.0}
            reflectivity={0.9}
          />
        </mesh>
      </Float>

      {/* Deep Periwinkle Octahedron */}
      <Float speed={1.7} rotationIntensity={0.6} floatIntensity={0.5}>
        <mesh position={[1.5, -1.5, -0.4]} rotation={[0.5, 0.4, 0]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshPhysicalMaterial
            color="#4F46E5"
            roughness={0.2}
            metalness={0.2}
            clearcoat={1.0}
          />
        </mesh>
      </Float>

      {/* Glass Refraction Spheres */}
      <GlassBubble position={[-1.5, -1.4, 0.2]} scale={0.55} floatSpeed={1.4} />
      <GlassBubble position={[0.2, 2.0, -0.8]} scale={0.45} floatSpeed={1.1} />
    </group>
  );
}

export default function AuthScene() {
  return (
    <div className="w-full h-full relative select-none">
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true,
          }}
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[5, 6, 4]} intensity={1.6} />
          <directionalLight position={[-4, -3, -2]} intensity={0.6} color="#A78BFA" />
          <hemisphereLight skyColor="#FFFFFF" groundColor="#EDE9FE" intensity={0.95} />

          <Suspense fallback={null}>
            <AuthShapes />
            <Environment resolution={256} frames={1}>
              <group rotation={[-Math.PI / 3, 0, 1]}>
                <Lightformer form="circle" intensity={3} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
                <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
                <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
                <Lightformer form="ring" color="#A78BFA" intensity={1.5} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[4, 4, 4]} scale={3} />
              </group>
            </Environment>
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
