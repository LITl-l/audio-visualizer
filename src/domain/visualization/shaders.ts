// src/domain/visualization/shaders.ts
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform float u_volume;
  uniform vec2 u_resolution; // For more advanced effects later
  varying vec2 vUv;

  void main() {
    float intensity = u_volume * 0.8 + 0.2; // Ensure it's visible even at low volume
    // Make it a bit more interesting: pulsing blue based on volume
    gl_FragColor = vec4(vUv.x * intensity * 0.5, vUv.y * intensity * 0.7, intensity, 1.0);
  }
`;
