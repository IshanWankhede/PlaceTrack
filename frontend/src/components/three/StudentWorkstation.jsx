import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export default function StudentWorkstation() {
  const studentGroupRef = useRef();
  const handsRef = useRef();
  const screenLightRef = useRef();
  const steamRef = useRef();

  // Procedural texture for code editor on laptop screen
  const codeScreenTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // IDE Dark background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 512, 320);

    // Top window bar
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, 512, 36);

    // Window control dots
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(24, 18, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(44, 18, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(64, 18, 6, 0, Math.PI * 2);
    ctx.fill();

    // Editor tab
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(90, 8, 140, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('placementPrep.tsx', 105, 26);

    // Code lines syntax highlighting
    const codeColors = ['#818CF8', '#38BDF8', '#34D399', '#F472B6', '#FBBF24', '#A78BFA'];
    const lines = [
      { indent: 20, len: 120, col: 0 },
      { indent: 20, len: 180, col: 1 },
      { indent: 40, len: 160, col: 2 },
      { indent: 60, len: 220, col: 3 },
      { indent: 80, len: 190, col: 4 },
      { indent: 80, len: 140, col: 0 },
      { indent: 60, len: 110, col: 2 },
      { indent: 40, len: 80, col: 5 },
      { indent: 20, len: 90, col: 1 },
      { indent: 20, len: 150, col: 3 },
      { indent: 40, len: 210, col: 4 },
      { indent: 40, len: 170, col: 0 },
      { indent: 20, len: 40, col: 5 },
    ];

    lines.forEach((line, i) => {
      ctx.fillStyle = codeColors[line.col];
      ctx.beginPath();
      ctx.roundRect(line.indent, 55 + i * 19, line.len, 9, 4);
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Subtle breathing / posture sway
    if (studentGroupRef.current) {
      studentGroupRef.current.position.y = Math.sin(time * 1.8) * 0.04;
      studentGroupRef.current.rotation.x = Math.sin(time * 1.2) * 0.02;
    }

    // Typing hands animation
    if (handsRef.current) {
      handsRef.current.position.y = Math.sin(time * 9) * 0.015;
      handsRef.current.rotation.z = Math.cos(time * 7) * 0.02;
    }

    // Gentle laptop screen pulse
    if (screenLightRef.current) {
      screenLightRef.current.intensity = 1.2 + Math.sin(time * 4) * 0.2;
    }

    // Coffee steam drift
    if (steamRef.current) {
      steamRef.current.position.y = 0.5 + ((time * 0.4) % 0.4);
      steamRef.current.scale.setScalar(0.8 + ((time * 0.5) % 0.5));
    }
  });

  return (
    <group position={[0, -0.6, 0]} rotation={[0.08, -0.28, 0]}>
      {/* ---------------- 1. WORKSTATION DESK ---------------- */}
      {/* Desk Surface with rounded bevel */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 0.16, 2.6]} />
        <meshPhysicalMaterial
          color="#F8FAFC"
          roughness={0.2}
          metalness={0.05}
          clearcoat={0.6}
        />
      </mesh>

      {/* Desk Legs (Graphite minimalist tubes) */}
      <mesh position={[-1.9, -1.3, 1.0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 16]} />
        <meshStandardMaterial color="#0B0B0F" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[1.9, -1.3, 1.0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 16]} />
        <meshStandardMaterial color="#0B0B0F" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[-1.9, -1.3, -1.0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 16]} />
        <meshStandardMaterial color="#0B0B0F" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[1.9, -1.3, -1.0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 16]} />
        <meshStandardMaterial color="#0B0B0F" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Modern Desk Pad / Mat */}
      <mesh position={[-0.1, 0.09, 0.1]} receiveShadow>
        <boxGeometry args={[2.8, 0.02, 1.6]} />
        <meshStandardMaterial color="#1E1E28" roughness={0.7} />
      </mesh>

      {/* ---------------- 2. MODERN LAPTOP ---------------- */}
      <group position={[-0.1, 0.1, 0.1]}>
        {/* Laptop Base */}
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.04, 0.9]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Keyboard area recess */}
        <mesh position={[0, 0.045, -0.05]}>
          <boxGeometry args={[1.1, 0.01, 0.55]} />
          <meshStandardMaterial color="#0F172A" roughness={0.5} />
        </mesh>

        {/* Trackpad */}
        <mesh position={[0, 0.045, 0.28]}>
          <boxGeometry args={[0.42, 0.005, 0.24]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Laptop Screen (opened at ~110°) */}
        <group position={[0, 0.04, -0.44]} rotation={[-0.32, 0, 0]}>
          {/* Lid Backing */}
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[1.3, 0.84, 0.03]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Screen Display */}
          <mesh position={[0, 0.42, 0.018]}>
            <planeGeometry args={[1.22, 0.76]} />
            <meshBasicMaterial map={codeScreenTexture} />
          </mesh>
          {/* Screen Light emission */}
          <pointLight
            ref={screenLightRef}
            position={[0, 0.45, 0.3]}
            color="#818CF8"
            intensity={1.2}
            distance={2.5}
          />
        </group>
      </group>

      {/* ---------------- 3. STUDENT CHARACTER ---------------- */}
      <group ref={studentGroupRef} position={[-0.1, 0.4, 1.4]} rotation={[0, Math.PI, 0]}>
        {/* Torso / Cozy Violet Placement Hoodie */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <capsuleGeometry args={[0.42, 0.65, 16, 24]} />
          <meshStandardMaterial
            color="#6366F1"
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>

        {/* Hoodie Collar Ring */}
        <mesh position={[0, 0.88, 0.05]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.26, 0.08, 16, 32]} />
          <meshStandardMaterial color="#4F46E5" roughness={0.7} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <sphereGeometry args={[0.34, 32, 32]} />
          <meshPhysicalMaterial
            color="#FFDFBA"
            roughness={0.45}
            clearcoat={0.1}
          />
        </mesh>

        {/* Stylized Modern Hair Volume */}
        <mesh position={[0, 1.45, -0.05]} castShadow>
          <sphereGeometry args={[0.37, 24, 24]} />
          <meshStandardMaterial color="#1E1E24" roughness={0.7} />
        </mesh>
        <mesh position={[0.15, 1.5, 0.1]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1E1E24" roughness={0.7} />
        </mesh>

        {/* Stylish Wireframe Glasses */}
        <group position={[0, 1.28, 0.32]}>
          {/* Left Lens */}
          <mesh position={[-0.14, 0, 0]}>
            <torusGeometry args={[0.08, 0.015, 16, 24]} />
            <meshStandardMaterial color="#0B0B0F" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Right Lens */}
          <mesh position={[0.14, 0, 0]}>
            <torusGeometry args={[0.08, 0.015, 16, 24]} />
            <meshStandardMaterial color="#0B0B0F" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Bridge */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.015, 0.015]} />
            <meshStandardMaterial color="#0B0B0F" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Arms Reaching to Desk */}
        {/* Left Arm */}
        <mesh position={[-0.45, 0.38, 0.35]} rotation={[0.8, -0.2, 0.3]} castShadow>
          <capsuleGeometry args={[0.11, 0.55, 12, 16]} />
          <meshStandardMaterial color="#6366F1" roughness={0.65} />
        </mesh>
        {/* Right Arm */}
        <mesh position={[0.45, 0.38, 0.35]} rotation={[0.8, 0.2, -0.3]} castShadow>
          <capsuleGeometry args={[0.11, 0.55, 12, 16]} />
          <meshStandardMaterial color="#6366F1" roughness={0.65} />
        </mesh>

        {/* Hands actively positioned at keyboard */}
        <group ref={handsRef} position={[0, 0.1, 0.85]}>
          <mesh position={[-0.26, 0, 0]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#FFDFBA" roughness={0.4} />
          </mesh>
          <mesh position={[0.26, 0, 0]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#FFDFBA" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ---------------- 4. PLACEMENT PREPARATION BOOKS ---------------- */}
      <group position={[1.4, 0.1, -0.2]} rotation={[0, -0.25, 0]}>
        {/* Book 1 (Bottom - DSA & Algorithmic Patterns) */}
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.1, 0.95]} />
          <meshStandardMaterial color="#8B5CF6" roughness={0.4} />
        </mesh>
        {/* Book 1 Spine Accent */}
        <mesh position={[-0.34, 0.05, 0]}>
          <boxGeometry args={[0.04, 0.09, 0.92]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>

        {/* Book 2 (Middle - System Design & Scalability) */}
        <mesh position={[0.03, 0.14, 0.02]} rotation={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.66, 0.08, 0.9]} />
          <meshStandardMaterial color="#10B981" roughness={0.4} />
        </mesh>

        {/* Book 3 (Top - Tech Interview Cheat Sheet) */}
        <mesh position={[-0.02, 0.21, -0.01]} rotation={[0, -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.07, 0.82]} />
          <meshStandardMaterial color="#F5C451" roughness={0.4} />
        </mesh>
      </group>

      {/* ---------------- 5. STEAMING COFFEE MUG ---------------- */}
      <group position={[-1.4, 0.1, -0.3]}>
        {/* Ceramic Mug Body */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.16, 0.36, 24]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.15}
            clearcoat={0.9}
          />
        </mesh>
        {/* Coffee Fill */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} />
          <meshStandardMaterial color="#3E2723" roughness={0.2} />
        </mesh>
        {/* Mug Handle */}
        <mesh position={[-0.2, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.035, 12, 24]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
        {/* Rising Steam */}
        <mesh ref={steamRef} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.02, 8, 16]} />
          <meshBasicMaterial color="#E2E8F0" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* ---------------- 6. MINIMALIST DESK LAMP ---------------- */}
      <group position={[-1.7, 0.1, -0.8]}>
        {/* Lamp Base */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
          <meshStandardMaterial color="#0B0B0F" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Curved Pole */}
        <mesh position={[0.15, 0.55, 0.1]} rotation={[0, 0, -0.35]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 1.1, 16]} />
          <meshStandardMaterial color="#0B0B0F" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Lamp Shade Head */}
        <mesh position={[0.42, 1.05, 0.3]} rotation={[0.4, 0, -0.6]} castShadow>
          <coneGeometry args={[0.22, 0.35, 24]} />
          <meshStandardMaterial color="#F5C451" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Warm Focused Task Light */}
        <spotLight
          position={[0.42, 1.0, 0.3]}
          target-position={[-0.2, 0, 0]}
          color="#FEF3C7"
          intensity={2.0}
          angle={0.65}
          penumbra={0.5}
          distance={4}
        />
      </group>

      {/* ---------------- 7. FLOATING HOLOGRAPHIC BADGES ---------------- */}
      {/* Floating Offer Pill */}
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <group position={[1.6, 1.4, 0.2]} rotation={[0, -0.2, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.14, 0.6, 12, 16]} />
            <meshPhysicalMaterial
              color="#0B0B0F"
              roughness={0.2}
              clearcoat={1.0}
            />
          </mesh>
          <mesh position={[0, 0, 0.15]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
        </group>
      </Float>

      {/* Floating Code Glyph `</>` in translucent glass */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[-1.5, 1.6, 0.4]} rotation={[0.1, 0.3, 0]}>
          <mesh>
            <torusGeometry args={[0.22, 0.05, 16, 32]} />
            <meshPhysicalMaterial
              color="#A78BFA"
              transmission={0.85}
              roughness={0.1}
              ior={1.5}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      </Float>

      {/* Ground Contact Shadow */}
      <ContactShadows
        position={[0, -1.3, 0]}
        opacity={0.4}
        scale={6}
        blur={2.4}
        far={3.5}
      />
    </group>
  );
}
