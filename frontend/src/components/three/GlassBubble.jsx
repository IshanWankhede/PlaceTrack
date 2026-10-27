import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function GlassBubble({
  position = [0, 0, 0],
  scale = 1,
  color = '#FFFFFF',
  floatSpeed = 1.2,
  floatAmplitude = 0.2,
}) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y =
      position[1] + Math.sin(time * floatSpeed + position[0]) * floatAmplitude;
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
    meshRef.current.rotation.y = Math.cos(time * 0.4) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 36, 36]} />
      <meshPhysicalMaterial
        color={color}
        transmission={0.92}
        opacity={1}
        transparent={true}
        roughness={0.05}
        ior={1.45}
        thickness={1.2}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        attenuationColor="#A78BFA"
        attenuationDistance={2.5}
      />
    </mesh>
  );
}
