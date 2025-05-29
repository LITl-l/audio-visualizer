'use client';

import React, { useRef, useEffect, useMemo } from 'react'; // Added useMemo
import { Canvas, useFrame } from '@react-three/fiber'; // Added useFrame
import { ShaderMaterial, DoubleSide, Vector2 } from 'three';
import { vertexShader, fragmentShader } from '@/domain/visualization/shaders';

interface ShaderCanvasProps {
  volume: number; // Expected range 0.0 to 1.0
}

export default function ShaderCanvas({ volume }: ShaderCanvasProps) {
  const materialRef = useRef<ShaderMaterial>(null);

  // Uniforms definition
  const uniforms = useMemo(() => ({
    u_volume: { value: 0.0 },
    u_resolution: { value: new Vector2(typeof window !== 'undefined' ? window.innerWidth : 0, typeof window !== 'undefined' ? window.innerHeight : 0) },
    u_time: { value: 0.0 } // Added u_time
  }), []); // Empty dependency array ensures uniforms object is created once

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_volume.value = volume;
    }
  }, [volume]);
  
  // Update resolution uniform on resize for potential future use
  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
      }
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial set
        return () => window.removeEventListener('resize', handleResize);
    }
  }, [uniforms]); // Added uniforms to dependency array

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms.u_time) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gray-900"> {/* Keep bg for base */}
      <Canvas>
        <mesh>
          <planeGeometry args={[20, 20]} /> {/* A large plane */}
          <shaderMaterial
            ref={materialRef}
            args={[{ // args should be an array containing the material properties object
              uniforms,
              vertexShader,
              fragmentShader,
              side: DoubleSide, // Render both sides of the plane
            }]}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
