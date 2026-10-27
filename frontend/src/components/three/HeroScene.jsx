import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import StudentWorkstation from './StudentWorkstation.jsx';

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

function HeroSceneRig() {
  const rigRef = useRef();

  useFrame((state, delta) => {
    if (!rigRef.current) return;
    // Subtle responsive mouse parallax
    const targetX = (state.pointer.x * Math.PI) / 16;
    const targetY = (state.pointer.y * Math.PI) / 20;
    rigRef.current.rotation.y = THREE.MathUtils.damp(rigRef.current.rotation.y, targetX, 3, delta);
    rigRef.current.rotation.x = THREE.MathUtils.damp(rigRef.current.rotation.x, -targetY, 3, delta);
  });

  return (
    <group ref={rigRef}>
      <StudentWorkstation />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="w-full h-full select-none">
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0.8, 1.4, 5.2], fov: 42 }}
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true,
          }}
        >
          <ambientLight intensity={0.9} />
          {/* Warm key light */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          {/* Soft violet fill light */}
          <directionalLight
            position={[-5, -2, -2]}
            intensity={0.7}
            color="#C084FC"
          />
          {/* Studio hemisphere fill */}
          <hemisphereLight
            skyColor="#FFFFFF"
            groundColor="#F1F5F9"
            intensity={0.95}
          />

          <Suspense fallback={null}>
            <HeroSceneRig />
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
