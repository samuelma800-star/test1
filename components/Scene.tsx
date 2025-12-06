import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { InteractiveTree } from './InteractiveTree';
import { AppState } from '../types';
import { COLORS } from '../constants';

interface SceneProps {
  appState: AppState;
}

export const Scene: React.FC<SceneProps> = ({ appState }) => {
  return (
    <Canvas
      dpr={[1, 2]} // Handle high DPI screens
      shadows
      gl={{ antialias: false, toneMappingExposure: 1.1 }} // Disable default AA for PostProcessing chain
    >
      <PerspectiveCamera makeDefault position={[0, 2, 30]} fov={45} />
      
      {/* 1. Cinematic Lighting - High Contrast */}
      {/* Lower ambient to make shadows richer */}
      <ambientLight intensity={0.2} color="#4a0000" /> 
      
      {/* Main Key Light - Warm Gold - Increased Intensity for drama */}
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.35} 
        penumbra={1} 
        intensity={6} 
        castShadow 
        color={COLORS.GOLD_CHAMPAGNE}
        shadow-bias={-0.0001}
      />
      
      {/* Fill Light - Red - Subtle fill from opposite side */}
      <pointLight position={[-15, 5, -10]} intensity={3} color={COLORS.RED_VIBRANT} />
      
      {/* Rim/Back Light - Very strong to outline the silhouette against dark bg */}
      <spotLight position={[0, 10, -20]} intensity={10} color={COLORS.GOLD_METALLIC} lookAt={new THREE.Vector3(0,0,0)} />

      {/* 2. Environment & Background */}
      {/* Deep Red Background as requested */}
      <color attach="background" args={['#2a0202']} />
      
      {/* Fog to blend tree into deep red distance - slightly pushed back */}
      <fog attach="fog" args={['#2a0202', 20, 65]} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={500} scale={35} size={3} speed={0.4} opacity={0.5} color={COLORS.GOLD_METALLIC} />
      
      {/* HDRI Environment for reflections on gold */}
      <Environment preset="city" /> 

      {/* 3. Main Content */}
      <InteractiveTree appState={appState} />

      {/* 5. Post Processing for "Cinematic Look" */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={1} // Only bright things glow
            mipmapBlur 
            intensity={1.5} // Stronger bloom for magical feel
            radius={0.6}
        />
        {/* Chromatic Aberration adds subtle lens imperfection/dispersion */}
        <ChromaticAberration 
            offset={[new THREE.Vector2(0.002, 0.002)]}
            radialModulation={false}
            modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      {/* 6. Controls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={45}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};