import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG, COLORS } from '../constants';
import { ItemType, TreeElement, PositionData } from '../types';

// Helper to get random point in sphere
const randomInSphere = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Helper to get random point in cone (Tree shape)
// y goes from -height/2 to height/2 approximately
const randomInCone = (height: number, baseRadius: number): { pos: THREE.Vector3, rot: THREE.Euler } => {
  const h = height;
  // Normalized height (0 at top, 1 at bottom) - slightly randomized distribution
  // We want more density at bottom
  const yNorm = Math.pow(Math.random(), 0.8); 
  const y = (1 - yNorm) * h - (h / 2); // Center vertically
  
  const rAtHeight = baseRadius * yNorm;
  const theta = Math.random() * 2 * Math.PI;
  const r = rAtHeight * Math.sqrt(Math.random()); // Even disk distribution

  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);

  // Calculate rotation to face outward/upward slightly
  const position = new THREE.Vector3(x, y, z);
  const lookAtPos = new THREE.Vector3(x * 2, y, z * 2); // Look outward
  const dummy = new THREE.Object3D();
  dummy.position.copy(position);
  dummy.lookAt(lookAtPos);
  
  // Randomize rotation slightly for natural look
  dummy.rotateX((Math.random() - 0.5) * 0.5);
  dummy.rotateZ((Math.random() - 0.5) * 0.5);

  return { pos: position, rot: dummy.rotation };
};

export const generateTreeData = (): TreeElement[] => {
  const elements: TreeElement[] = [];

  // 1. Generate Needles
  for (let i = 0; i < CONFIG.NEEDLE_COUNT; i++) {
    const scatterPos = randomInSphere(CONFIG.SCATTER_RADIUS);
    const { pos: treePos, rot: treeRot } = randomInCone(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS_BASE);

    // Random scatter rotation
    const scatterRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    // Colors: Mix of Gold and Deep Green
    const isGold = Math.random() > 0.85;
    const color = isGold 
      ? (Math.random() > 0.5 ? COLORS.GOLD_METALLIC : COLORS.GOLD_ANTIQUE) 
      : COLORS.GREEN_DARK;

    elements.push({
      id: uuidv4(),
      type: ItemType.NEEDLE,
      color,
      size: Math.random() * 0.5 + 0.5,
      scatterTransform: {
        position: scatterPos,
        rotation: scatterRot,
        scale: new THREE.Vector3(1, 1, 1)
      },
      treeTransform: {
        position: treePos,
        rotation: treeRot,
        scale: new THREE.Vector3(1, 1, 1)
      }
    });
  }

  // 2. Generate Ribbon Particles (Golden Dots)
  // Two ribbons, offset by PI
  for (let i = 0; i < CONFIG.RIBBON_PARTICLE_COUNT; i++) {
    const isRibbonTwo = i % 2 === 0;
    const progress = i / CONFIG.RIBBON_PARTICLE_COUNT; // 0 to 1 overall
    // We want each ribbon to cover the full height, so we modulate progress
    // But since we alternate, `i` goes 0..MAX.
    // Let's create a local normalized progress per ribbon
    const localProgress = (i / CONFIG.RIBBON_PARTICLE_COUNT); 
    
    // Height: Bottom to Top
    const h = CONFIG.TREE_HEIGHT;
    const y = (localProgress * h) - (h / 2);
    
    // Radius at this height (Cone shape)
    // At bottom (y = -h/2), radius = base. At top, radius = 0.
    // Inverse interpolation
    const radiusFactor = 1 - localProgress; 
    const rBase = CONFIG.TREE_RADIUS_BASE + 0.5; // Slightly outside the tree
    const r = rBase * radiusFactor;
    
    // Angle: Spiral
    // Add turns
    const thetaBase = localProgress * Math.PI * 2 * CONFIG.RIBBON_TURNS;
    const thetaOffset = isRibbonTwo ? Math.PI : 0;
    const theta = thetaBase + thetaOffset;
    
    // Add some random spread to make it look like a "trail of dust" rather than a single line
    const spreadR = (Math.random() - 0.5) * CONFIG.RIBBON_WIDTH;
    const spreadY = (Math.random() - 0.5) * CONFIG.RIBBON_WIDTH;
    
    const x = (r + spreadR) * Math.cos(theta);
    const z = (r + spreadR) * Math.sin(theta);
    
    const treePos = new THREE.Vector3(x, y + spreadY, z);
    const scatterPos = randomInSphere(CONFIG.SCATTER_RADIUS * 1.2); // Scatter slightly wider
    
    elements.push({
      id: uuidv4(),
      type: ItemType.PARTICLE,
      color: COLORS.GOLD_METALLIC,
      size: Math.random() * 0.15 + 0.05, // Small dots
      scatterTransform: {
        position: scatterPos,
        rotation: new THREE.Euler(0,0,0),
        scale: new THREE.Vector3(1, 1, 1)
      },
      treeTransform: {
        position: treePos,
        rotation: new THREE.Euler(0,0,0),
        scale: new THREE.Vector3(1, 1, 1)
      }
    });
  }

  // 3. Generate Gifts
  for (let i = 0; i < CONFIG.GIFT_COUNT; i++) {
    const scatterPos = randomInSphere(CONFIG.SCATTER_RADIUS);
    // Gifts sit mostly at the bottom or floating slightly
    const yNorm = 0.8 + (Math.random() * 0.2); // Bottom 20%
    const h = CONFIG.TREE_HEIGHT;
    const rBase = CONFIG.TREE_RADIUS_BASE;
    
    // Some gifts on tree, some on floor
    const isOnTree = Math.random() > 0.3;
    let tPos: THREE.Vector3;
    
    if (isOnTree) {
        const r = rBase * yNorm * Math.sqrt(Math.random()); 
        const theta = Math.random() * 2 * Math.PI;
        const y = (1 - yNorm) * h - (h / 2);
        tPos = new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
    } else {
        // Floor around tree base
        const r = (Math.random() * 3) + rBase;
        const theta = Math.random() * 2 * Math.PI;
        tPos = new THREE.Vector3(r * Math.cos(theta), -h/2 - 0.5, r * Math.sin(theta));
    }

    elements.push({
      id: uuidv4(),
      type: ItemType.GIFT,
      color: Math.random() > 0.5 ? COLORS.RED_DEEP : COLORS.RED_VIBRANT,
      secondaryColor: COLORS.GOLD_METALLIC, // Ribbon
      size: Math.random() * 0.8 + 0.8,
      scatterTransform: {
        position: scatterPos,
        rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI),
        scale: new THREE.Vector3(1, 1, 1)
      },
      treeTransform: {
        position: tPos,
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
        scale: new THREE.Vector3(1, 1, 1)
      }
    });
  }
  
  // 4. Generate Stockings & Ornaments
  const ornamentsToCreate = CONFIG.STOCKING_COUNT + CONFIG.ORNAMENT_COUNT;
  for(let i=0; i<ornamentsToCreate; i++) {
      const isStocking = i < CONFIG.STOCKING_COUNT;
      const scatterPos = randomInSphere(CONFIG.SCATTER_RADIUS);
      
      // Place on Surface of tree
      const h = CONFIG.TREE_HEIGHT;
      const yNorm = Math.random() * 0.8 + 0.1; // Avoid very top and very bottom
      const y = (1 - yNorm) * h - (h / 2);
      const r = (CONFIG.TREE_RADIUS_BASE * yNorm) * 0.9; // Slightly inside radius
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      
      const pos = new THREE.Vector3(x,y,z);
      // Face outward
      const lookAt = new THREE.Vector3(x*2, y, z*2);
      const dummy = new THREE.Object3D();
      dummy.position.copy(pos);
      dummy.lookAt(lookAt);

      // Determine colors
      let primaryColor, secondaryColor;
      if (isStocking) {
          primaryColor = COLORS.RED_BRIGHT;
          secondaryColor = COLORS.WHITE_WARM;
      } else {
          // Ornament: Mix Gold and Metallic Red
          primaryColor = Math.random() > 0.5 ? COLORS.GOLD_METALLIC : COLORS.RED_METAL;
          secondaryColor = COLORS.WHITE_WARM;
      }

      elements.push({
          id: uuidv4(),
          type: isStocking ? ItemType.STOCKING : ItemType.ORNAMENT,
          color: primaryColor,
          secondaryColor: secondaryColor,
          size: isStocking ? 1 : 0.6,
          scatterTransform: {
            position: scatterPos,
            rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
            scale: new THREE.Vector3(1, 1, 1)
          },
          treeTransform: {
            position: pos,
            rotation: dummy.rotation,
            scale: new THREE.Vector3(1, 1, 1)
          }
      });
  }

  return elements;
};