
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMarsTextures } from "../assets/textures/marsTextures.js";

export function createMarsColony() {
  const container = document.getElementById("colony-canvas");

  if (!container) {
    console.error("Colony container not found!");
    return;
  }

  // Scene
  const scene = new THREE.Scene();
  const textures = createMarsTextures();

  scene.background = new THREE.Color(0x160d0b);
  scene.fog = new THREE.Fog(0x160d0b, 25, 65);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.1,
    100
  );

  camera.position.set(12, 10, 16);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.minDistance = 7;
  controls.maxDistance = 30;

  // Lighting
  scene.add(new THREE.HemisphereLight(0xffc49a, 0x35130d, 2));

  const sunlight = new THREE.DirectionalLight(0xffd2a3, 3);
  sunlight.position.set(8, 14, 8);
  sunlight.castShadow = true;
  scene.add(sunlight);

  const groundGeometry = new THREE.PlaneGeometry(100, 100, 180, 180);

const positions = groundGeometry.attributes.position;

for (let i = 0; i < positions.count; i++) {
  const x = positions.getX(i);
  const y = positions.getY(i);

  const height =
    Math.sin(x * 0.13) * 0.35 +
    Math.cos(y * 0.17) * 0.3 +
    Math.sin((x + y) * 0.08) * 0.2;

  positions.setZ(i, height);
}

groundGeometry.computeVertexNormals();

const ground = new THREE.Mesh(
  groundGeometry,
  textures.ground
);

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.15;
ground.receiveShadow = true;
  ground.receiveShadow = true;
  scene.add(ground);

  // Helper to create objects
  function addObject(geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  // Habitat with realistic material
  const habitatMaterial = textures.habitat;

  addObject(
    new THREE.CylinderGeometry(2.2, 2.2, 1.8, 32),
    habitatMaterial,
    0,
    0.9,
    0
  );

  addObject(
    new THREE.SphereGeometry(
      2.2, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2
    ),
    habitatMaterial,
    0,
    1.8,
    0
  );

  // Habitat windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x55b9d5,
    emissive: 0x123b50,
    metalness: 0.3,
    roughness: 0.2
  });

  addObject(
    new THREE.BoxGeometry(0.9, 0.55, 0.12),
    windowMaterial,
    0,
    1.1,
    2.16
  );

  // Solar panels with blue texture
  const panelMaterial = textures.solar;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999,
    metalness: 0.7
  });

  for (let i = 0; i < 3; i++) {
    const x = -6 + i * 5;

    addObject(
      new THREE.BoxGeometry(3.2, 0.12, 2),
      frameMaterial,
      x,
      1.2,
      -5
    );

    addObject(
      new THREE.BoxGeometry(3, 0.08, 1.8),
      panelMaterial,
      x,
      1.3,
      -5
    );

    addObject(
      new THREE.CylinderGeometry(0.12, 0.12, 1.1, 12),
      frameMaterial,
      x,
      0.55,
      -5
    );
  }

  // Communication tower
  addObject(
    new THREE.CylinderGeometry(0.08, 0.15, 4, 8),
    frameMaterial,
    5,
    2,
    3
  );

  addObject(
    new THREE.SphereGeometry(0.45, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xe5e0d3,
      metalness: 0.5
    }),
    5,
    4.2,
    3
  );

  // Rover
  const roverMaterial = new THREE.MeshStandardMaterial({
    color: 0xd58b43,
    metalness: 0.3
  });

  addObject(
    new THREE.BoxGeometry(1.6, 0.65, 1.2),
    roverMaterial,
    4,
    0.75,
    -3
  );

  // Rover wheels
  for (const x of [3.4, 4.6]) {
    for (const z of [-3.65, -2.35]) {
      const wheel = addObject(
        new THREE.CylinderGeometry(0.32, 0.32, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x222222 }),
        x,
        0.4,
        z
      );

      wheel.rotation.z = Math.PI / 2;
    }
  }

  // Mars rocks
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x693222,
    roughness: 1
  });

  for (let i = 0; i < 25; i++) {
    const x = (Math.random() - 0.5) * 35;
    const z = (Math.random() - 0.5) * 35;

    if (Math.abs(x) < 4 && Math.abs(z) < 4) continue;

    const rock = addObject(
      new THREE.DodecahedronGeometry(
        0.3 + Math.random() * 0.5, 0
      ),
      rockMaterial,
      x,
      0.25,
      z
    );

    rock.rotation.set(
      Math.random(),
      Math.random(),
      Math.random()
    );
  }

  // Animation
  let animationId;

  function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // Responsive size
  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  resizeObserver.observe(container);

  // Cleanup
  return () => {
    cancelAnimationFrame(animationId);
    resizeObserver.disconnect();
    controls.dispose();

    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();

      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => material.dispose());
      }
    });

    textures.ground.map?.dispose();
    textures.ground.bumpMap?.dispose();
    renderer.dispose();
  };
}
