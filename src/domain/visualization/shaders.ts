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
  uniform float u_time;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  // Helper function for rotation
  mat2 rotate2d(float angle){
      return mat2(cos(angle), -sin(angle),
                  sin(angle), cos(angle));
  }

  // Helper function for smoothstep-based shapes
  // Creates a square shape, smoothstep controls the edge softness
  float shape(vec2 p, float size, float smoothness) {
      // abs(p) makes it symmetrical in all quadrants
      // subtracting 'size' moves the shape boundary inwards
      p = abs(p) - size; 
      // max(p.x, p.y) gives a square shape from distance field logic
      // smoothstep creates a smooth transition from 0 to 1 based on this distance
      return smoothstep(0.0, smoothness, max(p.x, p.y));
  }

  void main() {
      // Center UVs from (0,1) to (-1,1) and adjust for aspect ratio
      vec2 uv = (vUv - 0.5) * 2.0;
      float aspectRatio = u_resolution.x / u_resolution.y;
      uv.x *= aspectRatio;

      // Time-based rotation and scaling for dynamism
      float timeScaled = u_time * 0.1; // Slow down time a bit
      
      // Rotate UV space based on time and volume
      // More volume = faster rotation
      uv = rotate2d(timeScaled * (0.3 + u_volume * 0.7)) * uv; 
      
      // Base pattern: multiple rotating, scaling shapes
      float colorIntensity = 0.0;
      // Shapes scale with volume, ensuring they don't disappear at low volume
      float baseScale = 0.2 + u_volume * 0.3; 

      for (int i = 0; i < 4; i++) { // Loop for 4 shapes
          float i_float = float(i);
          vec2 shapeUv = uv;
          
          // Each shape has a slightly different rotation speed and offset
          shapeUv = rotate2d(timeScaled * 0.15 * (i_float + 1.0) + i_float * 0.5) * shapeUv;
          
          // Scale for each shape, with individual pulsating effect
          float scale = baseScale * (1.0 - 0.15 * i_float);
          scale *= (1.0 + sin(timeScaled * 2.0 + i_float * 1.5) * 0.15); // Pulsating size
          
          // Create a shape (inverted, so shape is bright)
          // u_volume increases the sharpness/size of the shape effect
          float s = 1.0 - shape(shapeUv * (1.5 + u_volume * 0.5), scale, 0.03);
          // Accumulate intensity, weighted by volume
          colorIntensity += s * (0.15 + u_volume * 0.35);
      }

      // Color mapping: create a vibrant, shifting color scheme
      // Using trigonometric functions with time and volume to make colors dynamic
      float r = sin(colorIntensity * 2.5 + timeScaled * 0.4 + u_volume * 0.5) * 0.5 + 0.5;
      float g = cos(colorIntensity * 2.0 - timeScaled * 0.6 + u_volume * 0.8) * 0.5 + 0.5;
      float b = sin(colorIntensity * 3.0 + timeScaled * 0.2 - u_volume * 0.3) * 0.5 + 0.5;

      // Mix with a background color, more intense effect with higher volume
      // The base color is a dark, slightly blue tone
      vec3 baseBgColor = vec3(0.05, 0.05, 0.15);
      // The dynamic color is mixed with the background
      // smoothstep ensures that when colorIntensity is low, background is more visible
      vec3 finalColor = mix(baseBgColor, vec3(r, g, b), smoothstep(0.0, 0.4, colorIntensity));
      
      // Further boost brightness based on overall volume, ensuring visibility
      finalColor *= (0.4 + u_volume * 0.6);

      gl_FragColor = vec4(finalColor, 1.0);
  }
`;
