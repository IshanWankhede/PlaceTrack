import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function StripedSphere({
  position = [0, 0, 0],
  scale = 1,
  rotationSpeed = 0.4,
}) {
  const meshRef = useRef();

  // Procedural canvas texture for gold and pearl-white diagonal stripes
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base pearl
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 512, 512);

    // Warm metallic gold stripes
    ctx.fillStyle = '#F5C451';
    const stripeWidth = 32;
    const count = 16;
    for (let i = -count; i < count * 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * stripeWidth * 2, 0);
      ctx.lineTo(i * stripeWidth * 2 + 512, 512);
      ctx.lineTo(i * stripeWidth * 2 + 512 + stripeWidth, 512);
      ctx.lineTo(i * stripeWidth * 2 + stripeWidth, 0);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.25}
        metalness={0.4}
      />
    </mesh>
  );
}
