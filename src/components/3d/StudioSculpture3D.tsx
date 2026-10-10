import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const StudioSculpture3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    // 1. Scene setup with transparent/warm light background
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0, 6.2);

    // 3. WebGL Renderer with ACES ToneMapping for rich PBR
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting setup for Light Theme
    const ambientLight = new THREE.AmbientLight(0xfffdfa, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf5f3ee, 1.1);
    fillLight.position.set(-5, -2, 3);
    scene.add(fillLight);

    const limeBounceLight = new THREE.PointLight(0xc2e600, 2.2, 12);
    limeBounceLight.position.set(0, -3.5, 2);
    scene.add(limeBounceLight);

    // 5. 3D Interlocking Sculptural Forms
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Ring A: Matte White Porcelain
    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0xfdfdfd,
      roughness: 0.32,
      metalness: 0.05,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
      reflectivity: 0.5,
    });

    // Ring B: Glossy Lime
    const limeMat = new THREE.MeshPhysicalMaterial({
      color: 0xc2e600,
      roughness: 0.18,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: 0x223000,
      emissiveIntensity: 0.15,
    });

    const torusGeo1 = new THREE.TorusGeometry(1.4, 0.34, 48, 120);
    const ring1 = new THREE.Mesh(torusGeo1, porcelainMat);
    ring1.rotation.x = Math.PI / 3.2;
    ring1.castShadow = true;
    mainGroup.add(ring1);

    const torusGeo2 = new THREE.TorusGeometry(1.3, 0.3, 48, 120);
    const ring2 = new THREE.Mesh(torusGeo2, limeMat);
    ring2.rotation.y = Math.PI / 2.3;
    ring2.rotation.z = Math.PI / 3.8;
    ring2.castShadow = true;
    mainGroup.add(ring2);

    // Subtle Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.ShadowMaterial({
      opacity: 0.08,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Interactive Cursor Parallax
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 7. Render Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.04;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.04;

      // Scroll factor
      const scrollY = window.scrollY;
      const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const scrollProgress = scrollY / maxScroll;

      // Gentle sculptural rotations
      mainGroup.rotation.y = elapsedTime * 0.22 + currentMouse.x * 0.35 + scrollProgress * 1.5;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.25) * 0.15 + currentMouse.y * 0.25;
      mainGroup.rotation.z = Math.cos(elapsedTime * 0.18) * 0.1;

      ring1.rotation.z = elapsedTime * 0.08;
      ring2.rotation.y = elapsedTime * 0.12 + scrollProgress * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      torusGeo1.dispose();
      torusGeo2.dispose();
      shadowGeo.dispose();
      porcelainMat.dispose();
      limeMat.dispose();
      shadowMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[560px] flex items-center justify-center relative select-none"
      aria-hidden="true"
    >
      {!webglSupported && (
        <div className="w-64 h-64 rounded-full border border-hairline bg-surface shadow-studio flex items-center justify-center">
          <div className="w-36 h-36 rounded-full border-4 border-lime flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-ink">FOT</span>
          </div>
        </div>
      )}
    </div>
  );
};
