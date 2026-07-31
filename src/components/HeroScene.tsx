"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

function readThemeColor(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

// Bold silhouette of the FManuel Art monogram (the interlocked A/M ribbon),
// stripped of the outer ring and the fine hand/eye linework so it reads
// cleanly once extruded into 3D.
const MONOGRAM_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg">
    <path d="M231.26,315.14l.04.07v-.02s-.02-.04-.04-.05ZM379.07,315.07l.2-.35-89.83-159.35s-.37.62-1.04,1.81v.02l-.02.04c-9.98,17.49-86.9,152.24-90.01,157.67.04.02.05.07.09.13l-85.5,159.41h38.11l64.84-128.81,33.56,58.78c.88,1.52,1.74,3.05,2.61,4.57l4.75,8.33c.95,1.66,1.88,3.31,2.81,4.93l2.98,5.21c.93,1.64,1.86,3.27,2.78,4.88,1.33,2.34,2.65,4.62,3.91,6.85l20.12,35.26,87.71-155.93h-32.71l-55.21,98.18-57.92-101.47v-.02s-.02-.04-.04-.05l-.05-.07c1.68-2.96,37.52-65.72,52.01-91.11l5.99-10.51,47.81,84.84h-47.59v16.78h9.39l47.59-.11,32.64.11Z" />
    <polygon points="289.44 155.36 289.21 213.46 337.03 298.3 379.26 314.73" />
    <polygon points="289.44 474.44 289.21 416.68 231.21 315.07 215.92 345.63" />
    <polygon points="112.96 474.44 229.94 317.62 151.07 474.44 112.96 474.44" />
    <polygon points="229.94 317.62 288.4 157.19 289.21 213.46 229.94 317.62" />
    <polygon points="446.62 474.44 420.17 474.44 366.91 361.98 385.33 330.13" />
    <polygon points="366.91 361.98 446.62 474.44 413.33 474.44" />
    <path d="M289.22,416.69c2.35-.26,87.93-98.18,87.93-98.18l-87.71,155.93-.22-57.75Z" />
  </svg>
`;

function buildLogoGeometry() {
  const loader = new SVGLoader();
  const { paths } = loader.parse(MONOGRAM_SVG);

  const geometries: THREE.BufferGeometry[] = [];
  paths.forEach((path) => {
    const shapes = path.toShapes();
    shapes.forEach((shape) => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 26,
        bevelEnabled: true,
        bevelThickness: 5,
        bevelSize: 3,
        bevelSegments: 2,
        curveSegments: 8,
      });
      geometries.push(geometry);
    });
  });

  const combined = new THREE.Box3();
  geometries.forEach((g) => {
    g.computeBoundingBox();
    combined.union(g.boundingBox!);
  });
  const center = combined.getCenter(new THREE.Vector3());
  const size = combined.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2.3 / maxDim;

  geometries.forEach((g) => g.translate(-center.x, -center.y, -center.z));

  return { geometries, scale };
}

function LogoMark() {
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState("#3968a0");
  const [emissive, setEmissive] = useState("#152a45");

  const { geometries, scale } = useMemo(() => buildLogoGeometry(), []);

  useEffect(() => {
    return () => geometries.forEach((g) => g.dispose());
  }, [geometries]);

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
    if (outerRef.current) outerRef.current.rotation.y += delta * 0.18;
    if (innerRef.current) {
      const targetX = mouse.current.y * 0.3;
      const targetZ = mouse.current.x * 0.18;
      innerRef.current.rotation.x += (targetX - innerRef.current.rotation.x) * 0.05;
      innerRef.current.rotation.z += (targetZ - innerRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <group ref={outerRef}>
      <group ref={innerRef} scale={[scale, -scale, scale]}>
        {geometries.map((geometry, i) => (
          <mesh key={i} geometry={geometry}>
            <meshStandardMaterial
              color={color}
              roughness={0.35}
              metalness={0.3}
              emissive={emissive}
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}
      </group>
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
        <directionalLight position={[-3, -1, 2]} intensity={0.4} />
        <LogoMark />
      </Canvas>
    </div>
  );
}
