import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ScallopBlob({
  position = [0, 0, 0],
  scale = 1,
  color = '#818cf8', // periwinkle
  trackMouse = true,
}) {
  const groupRef = useRef();
  const eyesRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Gentle floating breathing animation
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.15;
    groupRef.current.rotation.z = Math.sin(time * 0.8) * 0.05;
    groupRef.current.rotation.x = Math.cos(time * 0.9) * 0.05;

    // Eye tracking mouse
    if (trackMouse && eyesRef.current) {
      const mouseX = state.pointer.x * 0.6;
      const mouseY = state.pointer.y * 0.6;
      eyesRef.current.position.x = THREE.MathUtils.damp(eyesRef.current.position.x, mouseX * 0.15, 6, delta);
      eyesRef.current.position.y = THREE.MathUtils.damp(eyesRef.current.position.y, mouseY * 0.15, 6, delta);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Central main periwinkle pill-blob */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.2, 48, 48]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.18}
          metalness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Scallop flower petals around the body */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = Math.cos(rad) * 1.0;
        const y = Math.sin(rad) * 1.0;
        return (
          <mesh key={i} position={[x, y, -0.05]} castShadow receiveShadow>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.2}
              metalness={0.05}
              clearcoat={1.0}
              clearcoatRoughness={0.12}
            />
          </mesh>
        );
      })}

      {/* Two cute dark cartoon eyes */}
      <group ref={eyesRef} position={[0, 0.1, 1.15]}>
        {/* Left eye socket & eyeball */}
        <mesh ref={leftEyeRef} position={[-0.32, 0, 0]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#0B0B0F" roughness={0.1} metalness={0.8} />
          {/* Eye highlight glint */}
          <mesh position={[-0.04, 0.04, 0.09]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </mesh>

        {/* Right eye socket & eyeball */}
        <mesh ref={rightEyeRef} position={[0.32, 0, 0]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#0B0B0F" roughness={0.1} metalness={0.8} />
          {/* Eye highlight glint */}
          <mesh position={[-0.04, 0.04, 0.09]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </mesh>
      </group>
    </group>
  );
}
