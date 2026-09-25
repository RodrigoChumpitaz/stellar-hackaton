"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface AetherCrystalProps {
  isForging?: boolean;
  energyLevel?: number; // 0 to 100
  className?: string;
}

export function AetherCrystal({
  isForging = false,
  energyLevel = 0,
  className = "w-28 h-28 sm:w-36 sm:h-36",
}: AetherCrystalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // References for live props inside the animation loop
  const isForgingRef = useRef(isForging);
  const energyLevelRef = useRef(energyLevel);

  useEffect(() => {
    isForgingRef.current = isForging;
    energyLevelRef.current = energyLevel;
  }, [isForging, energyLevel]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 140;
    const height = container.clientHeight || 140;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL is not supported or failed to initialize", err);
      return;
    }

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00e5ff, 3, 10);
    cyanLight.position.set(2, 3, 2);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3, 10);
    purpleLight.position.set(-2, -2, 1);
    scene.add(purpleLight);

    // 3. Faceted Core Gemstone (Octahedron)
    const gemGeo = new THREE.OctahedronGeometry(1.15, 0);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0x00e5ff,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.15,
      transmission: 0.55,
      ior: 1.6,
      transparent: true,
      opacity: 0.95,
      flatShading: true,
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    scene.add(gemMesh);

    // 4. Outer Celestial Wireframe Cage
    const cageGeo = new THREE.IcosahedronGeometry(1.5, 0);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    scene.add(cageMesh);

    // 5. Orbiting Particle Ring
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const radius = 1.85;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleRing = new THREE.Points(particleGeo, particleMat);
    particleRing.rotation.x = Math.PI / 5;
    scene.add(particleRing);

    // 6. Animation Loop (Standard timestamp delta without deprecated THREE.Clock)
    let lastTime = performance.now();
    let elapsedTime = 0;

    const animate = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      elapsedTime += delta;

      const forging = isForgingRef.current;
      const energy = energyLevelRef.current;

      // Speed factor calculation based on long-press hold and forging
      const speedMultiplier = forging ? 4.5 : 1 + (energy / 100) * 3;

      // Rotate meshes
      gemMesh.rotation.y += delta * 0.8 * speedMultiplier;
      gemMesh.rotation.x += delta * 0.3 * speedMultiplier;

      cageMesh.rotation.y -= delta * 0.5 * speedMultiplier;
      cageMesh.rotation.z += delta * 0.2 * speedMultiplier;

      particleRing.rotation.z += delta * 0.6 * speedMultiplier;

      // Floating levitation
      const floatY = Math.sin(elapsedTime * 2.2) * 0.12;
      gemMesh.position.y = floatY;
      cageMesh.position.y = floatY;

      // Dynamic emissive glow intensity
      const targetEmissive = forging ? 1.8 : 0.5 + (energy / 100) * 1.2;
      gemMat.emissiveIntensity = targetEmissive;

      // Color flare when charging
      if (energy > 50 || forging) {
        gemMat.color.setHex(0x38bdf8);
        cyanLight.intensity = 4.5;
      } else {
        gemMat.color.setHex(0x00e5ff);
        cyanLight.intensity = 3.0;
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 7. Resize Observer for fluid responsiveness
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w && h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    window.addEventListener("resize", handleResize);

    // 8. Memory Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      gemGeo.dispose();
      gemMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
    />
  );
}

export default AetherCrystal;
