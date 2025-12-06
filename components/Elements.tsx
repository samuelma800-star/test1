import React, { useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from '../constants';

// Reusable Materials
const materials = {
  goldHighPolish: new THREE.MeshStandardMaterial({
    color: COLORS.GOLD_METALLIC,
    metalness: 1,
    roughness: 0.1,
  }),
  goldMatte: new THREE.MeshStandardMaterial({
    color: COLORS.GOLD_ANTIQUE,
    metalness: 0.8,
    roughness: 0.4,
  }),
  redVelvet: new THREE.MeshStandardMaterial({
    color: COLORS.RED_DEEP,
    roughness: 0.8,
    metalness: 0.2,
  }),
  redShiny: new THREE.MeshStandardMaterial({
    color: COLORS.RED_VIBRANT,
    roughness: 0.2,
    metalness: 0.6,
  }),
  whiteFabric: new THREE.MeshStandardMaterial({
    color: COLORS.WHITE_WARM,
    roughness: 0.9,
    metalness: 0.1,
  }),
  greenNeedle: new THREE.MeshStandardMaterial({
    color: COLORS.GREEN_DARK,
    roughness: 0.7,
    metalness: 0.1,
  })
};

// Procedural Gift Box
export const GiftBox = ({ color, secondaryColor }: { color: string, secondaryColor: string }) => {
  return (
    <group>
      {/* Box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            color={color} 
            metalness={0.3} 
            roughness={0.4} 
        />
      </mesh>
      {/* Ribbon Vertical */}
      <mesh position={[0, 0, 0]} scale={[1.05, 1.05, 0.2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={secondaryColor} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Ribbon Horizontal */}
      <mesh position={[0, 0, 0]} scale={[0.2, 1.05, 1.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={secondaryColor} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Bow Top */}
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI/2, 0, 0]}>
         <torusKnotGeometry args={[0.2, 0.05, 64, 8]} />
         <meshStandardMaterial color={secondaryColor} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// Procedural Stocking
export const Stocking = ({ color, secondaryColor }: { color: string, secondaryColor: string }) => {
  return (
    <group rotation={[0, 0, -Math.PI / 6]}>
       {/* Main Leg */}
       <mesh position={[0, 0.4, 0]}>
         <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
         <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
       </mesh>
       {/* Foot */}
       <mesh position={[0.25, -0.1, 0]} rotation={[0, 0, -Math.PI/2]}>
         <capsuleGeometry args={[0.21, 0.5, 4, 8]} />
         <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
       </mesh>
       {/* Cuff */}
       <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color={secondaryColor} roughness={1} />
       </mesh>
    </group>
  );
};

// Procedural Ornament
export const Ornament = ({ color }: { color: string }) => {
    return (
        <group>
            <mesh castShadow>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial 
                    color={color} 
                    metalness={1.0} 
                    roughness={0.15} 
                    envMapIntensity={2.0}
                />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
                <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.3} />
            </mesh>
        </group>
    )
}

// The Shining Star Topper - 5 Pointed Star
export const StarTopper = () => {
    const starShape = useMemo(() => {
        const shape = new THREE.Shape();
        const points = 5;
        const outerRadius = 1;
        const innerRadius = 0.4;
        
        for (let i = 0; i < points * 2; i++) {
             // Rotate -Math.PI/2 to point upwards
             const angle = (i * Math.PI) / points - Math.PI / 2;
             const radius = i % 2 === 0 ? outerRadius : innerRadius;
             const x = Math.cos(angle) * radius;
             const y = Math.sin(angle) * radius;
             if (i === 0) shape.moveTo(x, y);
             else shape.lineTo(x, y);
        }
        shape.closePath();
        return shape;
    }, []);

    const extrudeSettings = {
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 4
    };

    return (
        <group scale={[1.5, 1.5, 1.5]}>
            <mesh position={[0, 0, -0.2]}>
                <extrudeGeometry args={[starShape, extrudeSettings]} />
                <meshStandardMaterial 
                    color={COLORS.GOLD_METALLIC} 
                    emissive={COLORS.GOLD_METALLIC}
                    emissiveIntensity={2}
                    metalness={1}
                    roughness={0.1}
                    toneMapped={false}
                />
            </mesh>
             {/* Point Light for casting real light on tree */}
             <pointLight color={COLORS.GOLD_METALLIC} intensity={8} distance={25} decay={2} />
        </group>
    )
}