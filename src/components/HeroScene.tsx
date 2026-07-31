"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function readThemeColor(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

function RibbonKnot() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState("#3968a0");
  const [emissive, setEmissive] = useState("#152a45");

  useEffect(() => {
    const sync = () => {
      setColor(readThemeColor("--accent", "#3968a0"));
      setEmissive(readThemeColor("--stage", "#152a45"));
    };
    sync();

    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);

    return () => {
      window.removeEventListener("mousemove", onMove);
      mq.removeEventListener("change", sync);
    };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.16;
    if (meshRef.current) {
      const targetX = mouse.current.y * 0.35;
      const targetZ = mouse.current.x * 0.2;
      meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.z += (targetZ - meshRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.05, 0.32, 200, 24, 2, 3]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.25}
          emissive={emissive}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        frameloop={inView ? "always" : "never"}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 2, 4]} intensity={1.2} />
        <RibbonKnot />
      </Canvas>
    </div>
  );
}
