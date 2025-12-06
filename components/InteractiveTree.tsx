import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ItemType, AppState, TreeElement } from '../types';
import { generateTreeData } from './TreeGenerator';
import { GiftBox, Stocking, Ornament, StarTopper } from './Elements';
import { CONFIG, TRANSITION_SPEED, COLORS } from '../constants';

interface InteractiveTreeProps {
  appState: AppState;
}

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({ appState }) => {
  // 1. Generate Static Data Once
  const allElements = useMemo(() => generateTreeData(), []);

  // Separate elements by type for optimized rendering
  const needles = useMemo(() => allElements.filter(e => e.type === ItemType.NEEDLE), [allElements]);
  const particles = useMemo(() => allElements.filter(e => e.type === ItemType.PARTICLE), [allElements]);
  const others = useMemo(() => allElements.filter(e => e.type !== ItemType.NEEDLE && e.type !== ItemType.PARTICLE), [allElements]);

  // 2. InstancedMesh Refs
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleMeshRef = useRef<THREE.InstancedMesh>(null);
  
  // 3. Animation State
  const progress = useRef(0); // 0 = Scattered, 1 = Tree
  
  // Reuse Vector3/Quaternion to avoid GC
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const posStart = useMemo(() => new THREE.Vector3(), []);
  const posEnd = useMemo(() => new THREE.Vector3(), []);
  const qStart = useMemo(() => new THREE.Quaternion(), []);
  const qEnd = useMemo(() => new THREE.Quaternion(), []);

  useLayoutEffect(() => {
    // Set initial InstancedMesh colors for needles
    if (meshRef.current) {
      needles.forEach((needle, i) => {
        meshRef.current!.setColorAt(i, new THREE.Color(needle.color));
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
    // Set colors for particles
    if (particleMeshRef.current) {
        particles.forEach((p, i) => {
            particleMeshRef.current!.setColorAt(i, new THREE.Color(p.color));
        });
        particleMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [needles, particles]);

  useFrame((state, delta) => {
    // 1. Handle Transition Logic
    const target = appState === AppState.TREE_SHAPE ? 1 : 0;
    
    // Smooth damp towards target
    if (Math.abs(progress.current - target) > 0.001) {
        // Use a simple lerp for the progress variable itself
        const speed = delta * TRANSITION_SPEED;
        progress.current = THREE.MathUtils.lerp(progress.current, target, speed);
    }

    const t = progress.current;
    
    // Ease function for bouncy/smooth effect (Spring-like: Elastic Out or Back Out)
    // Using a simpler cubic ease out for elegance
    const easedT = 1 - Math.pow(1 - t, 3); 

    // 2. Update Needles (InstancedMesh)
    if (meshRef.current) {
      needles.forEach((needle, i) => {
        // Lerp Position
        posStart.copy(needle.scatterTransform.position);
        posEnd.copy(needle.treeTransform.position);
        dummy.position.lerpVectors(posStart, posEnd, easedT);

        // Lerp Rotation (Slerp)
        qStart.setFromEuler(needle.scatterTransform.rotation);
        qEnd.setFromEuler(needle.treeTransform.rotation);
        dummy.quaternion.slerpQuaternions(qStart, qEnd, easedT);
        
        // Add a gentle floating wave when in SCATTERED mode
        if (t < 0.5) {
            dummy.position.y += Math.sin(state.clock.elapsedTime + i) * 0.05 * (1-t);
            dummy.rotation.z += Math.cos(state.clock.elapsedTime * 0.5 + i) * 0.02 * (1-t);
        }

        // Scale
        dummy.scale.setScalar(needle.size);

        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Update Particles/Ribbon (InstancedMesh)
    if (particleMeshRef.current) {
        particles.forEach((p, i) => {
            posStart.copy(p.scatterTransform.position);
            posEnd.copy(p.treeTransform.position);
            dummy.position.lerpVectors(posStart, posEnd, easedT);

            // No rotation needed for sphere particles really, but consistency is good
            dummy.rotation.set(0,0,0);
            
            // Special Effect: Twinkle / Pulse for Ribbon
            const twinkle = Math.sin(state.clock.elapsedTime * 3 + i) * 0.3 + 1;
            dummy.scale.setScalar(p.size * twinkle);

            dummy.updateMatrix();
            particleMeshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        particleMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. NEEDLES (High Performance InstancedMesh) */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, needles.length]}
        castShadow
        receiveShadow
      >
        {/* Adjusted: Thinner (0.04) and Longer (0.7) for better realism */}
        <coneGeometry args={[0.04, 0.7, 3]} />
        <meshStandardMaterial 
            roughness={0.3} 
            metalness={0.6}
            envMapIntensity={2.5}
            emissive={COLORS.GREEN_DARK}
            emissiveIntensity={0.4}
        />
      </instancedMesh>

      {/* 2. RIBBON PARTICLES (Glowing Dots) */}
      <instancedMesh
        ref={particleMeshRef}
        args={[undefined, undefined, particles.length]}
      >
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial 
            color={COLORS.GOLD_METALLIC}
            emissive={COLORS.GOLD_METALLIC}
            emissiveIntensity={3} 
            toneMapped={false}
        />
      </instancedMesh>

      {/* 3. ORNAMENTS & GIFTS (Individual Components for flexibility) */}
      {others.map((item) => (
        <AnimatedElement 
            key={item.id} 
            item={item} 
            progressRef={progress} 
        />
      ))}

      {/* 4. STAR TOPPER (Only visible when tree forms, or floats to top) */}
      <AnimatedStar progressRef={progress} />
      
    </group>
  );
};

// Helper component for individual moving items
const AnimatedElement: React.FC<{ item: TreeElement, progressRef: React.MutableRefObject<number> }> = ({ item, progressRef }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startPos = useMemo(() => item.scatterTransform.position, [item]);
    const endPos = useMemo(() => item.treeTransform.position, [item]);
    const startRot = useMemo(() => new THREE.Quaternion().setFromEuler(item.scatterTransform.rotation), [item]);
    const endRot = useMemo(() => new THREE.Quaternion().setFromEuler(item.treeTransform.rotation), [item]);
    
    // Reused vectors
    const vec = useMemo(() => new THREE.Vector3(), []);
    const quat = useMemo(() => new THREE.Quaternion(), []);

    useFrame((state) => {
        if (!groupRef.current) return;
        
        const t = progressRef.current;
        const easedT = 1 - Math.pow(1 - t, 3); // Cubic Ease Out

        // Position
        groupRef.current.position.lerpVectors(startPos, endPos, easedT);
        
        // Rotation
        groupRef.current.quaternion.slerpQuaternions(startRot, endRot, easedT);

        // Add Floating animation when scattered
        if (t < 0.8) {
             groupRef.current.position.y += Math.sin(state.clock.elapsedTime + item.scatterTransform.position.x) * 0.02 * (1-t);
             groupRef.current.rotation.y += 0.01 * (1-t);
        }
    });

    return (
        <group ref={groupRef} scale={[item.size, item.size, item.size]}>
            {item.type === ItemType.GIFT && <GiftBox color={item.color} secondaryColor={item.secondaryColor!} />}
            {item.type === ItemType.STOCKING && <Stocking color={item.color} secondaryColor={item.secondaryColor!} />}
            {item.type === ItemType.ORNAMENT && <Ornament color={item.color} />}
        </group>
    )
}

const AnimatedStar = ({ progressRef }: { progressRef: React.MutableRefObject<number> }) => {
    const ref = useRef<THREE.Group>(null);
    const treeTop = new THREE.Vector3(0, CONFIG.TREE_HEIGHT / 2 + 0.5, 0);
    const scatterTop = new THREE.Vector3(0, 20, 0); // High up in sky

    useFrame((state) => {
        if(!ref.current) return;
        const t = progressRef.current;
        const easedT = 1 - Math.pow(1 - t, 3);

        ref.current.position.lerpVectors(scatterTop, treeTop, easedT);
        
        // Spin the star
        ref.current.rotation.y += 0.01;
        
        // Pulse scale
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        ref.current.scale.setScalar(scale * t); // Scale down to 0 when scattered (optional, here we scale t to hide it or keep it)
        // Let's keep it visible but far away
        ref.current.visible = t > 0.01;
    });

    return (
        <group ref={ref}>
            <StarTopper />
        </group>
    )
}