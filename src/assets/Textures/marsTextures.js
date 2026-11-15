
import * as THREE from "three";

// Create a canvas texture
function makeTexture(canvas, colorTexture = true) {
  const texture = new THREE.CanvasTexture(canvas);

  if (colorTexture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;

  return texture;
}

// Generate detailed Mars soil
function createSoilTextures() {
  const size = 1024;

  const colorCanvas = document.createElement("canvas");
  const bumpCanvas = document.createElement("canvas");

  colorCanvas.width = size;
  colorCanvas.height = size;
  bumpCanvas.width = size;
  bumpCanvas.height = size;

  const colorCtx = colorCanvas.getContext("2d");
  const bumpCtx = bumpCanvas.getContext("2d");

  const colorData = colorCtx.createImageData(size, size);
  const bumpData = bumpCtx.createImageData(size, size);

  for (let i = 0; i < size * size; i++) {
    const noise = Math.random() * 34 - 17;

    colorData.data[i * 4] = 166 + noise;
    colorData.data[i * 4 + 1] = 78 + noise * 0.7;
    colorData.data[i * 4 + 2] = 51 + noise * 0.5;
    colorData.data[i * 4 + 3] = 255;

    const height = 110 + noise * 3;

    bumpData.data[i * 4] = height;
    bumpData.data[i * 4 + 1] = height;
    bumpData.data[i * 4 + 2] = height;
    bumpData.data[i * 4 + 3] = 255;
  }

  colorCtx.putImageData(colorData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);

  // Small soil particles and mineral details
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 3 + 0.5;

    colorCtx.globalAlpha = Math.random() * 0.35;
    colorCtx.fillStyle =
      Math.random() > 0.5 ? "#e18a60" : "#542b22";

    colorCtx.beginPath();
    colorCtx.arc(x, y, radius, 0, Math.PI * 2);
    colorCtx.fill();
  }

  colorCtx.globalAlpha = 1;

  // Separate detailed color and bump maps
  const soilTexture = makeTexture(colorCanvas);
  const bumpTexture = makeTexture(bumpCanvas, false);

  soilTexture.repeat.set(6, 6);
  bumpTexture.repeat.set(6, 6);

  return { soilTexture, bumpTexture };
}

// Create metallic habitat surface
function createHabitatTexture() {
  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#c9c5bb";
  ctx.fillRect(0, 0, 512, 512);

  // Metallic panel sections
  for (let y = 0; y < 512; y += 128) {
    for (let x = 0; x < 512; x += 128) {
      ctx.fillStyle =
        (x + y) % 256 === 0 ? "#d8d3c8" : "#bdb8ae";

      ctx.fillRect(x + 3, y + 3, 122, 122);

      ctx.strokeStyle = "#8e8a82";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 3, y + 3, 122, 122);

      // Small panel bolts
      ctx.fillStyle = "#77736c";

      for (const bx of [12, 116]) {
        for (const by of [12, 116]) {
          ctx.beginPath();
          ctx.arc(x + bx, y + by, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Fine metallic lines
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 512; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
  }

  return makeTexture(canvas);
}

// Create detailed solar cells
function createSolarTexture() {
  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#071b35";
  ctx.fillRect(0, 0, 512, 512);

  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, "#24618e");
  gradient.addColorStop(0.5, "#103b68");
  gradient.addColorStop(1, "#071d3c");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Solar cell grid
  for (let x = 0; x < 512; x += 64) {
    for (let y = 0; y < 512; y += 64) {
      ctx.strokeStyle = "rgba(130,195,235,0.65)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 3, y + 3, 58, 58);

      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;

      for (let line = 12; line < 60; line += 12) {
        ctx.beginPath();
        ctx.moveTo(x + line, y + 5);
        ctx.lineTo(x + line, y + 59);
        ctx.stroke();
      }
    }
  }

  return makeTexture(canvas);
}

// Main texture collection
export function createMarsTextures() {
  const soil = createSoilTextures();

  return {
    ground: new THREE.MeshStandardMaterial({
      map: soil.soilTexture,
      bumpMap: soil.bumpTexture,
      bumpScale: 0.18,
      roughness: 1
    }),

    habitat: new THREE.MeshStandardMaterial({
      map: createHabitatTexture(),
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.42
    }),

    solar: new THREE.MeshStandardMaterial({
      map: createSolarTexture(),
      color: 0xffffff,
      metalness: 0.55,
      roughness: 0.28
    })
  };
}
