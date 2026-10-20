import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Sculpture() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const updateTheme = () => {
      const isLight = document.documentElement.classList.contains("light");
      renderer.setClearColor(new THREE.Color(isLight ? "rgb(248,248,248)" : "rgb(13,14,16)"));
    };
    updateTheme();
    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 10;
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: "rgb(112,114,118)",
      metalness: 0.85,
      roughness: 0.28,
    });
    const geometry = new THREE.TorusGeometry(0.76, 0.032, 8, 64);
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const rib = new THREE.Mesh(geometry, material);
      rib.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, 0);
      rib.rotation.x = Math.PI / 2;
      rib.rotation.y = angle;
      group.add(rib);
    }
    scene.add(group);
    scene.add(new THREE.AmbientLight("rgb(190,190,192)", 0.6));
    const key = new THREE.DirectionalLight("rgb(248,248,248)", 5);
    key.position.set(2, 4, 4);
    scene.add(key);
    const fill = new THREE.PointLight("rgb(216,216,220)", 45);
    fill.position.set(-4, -1, 3);
    scene.add(fill);
    const starsGeometry = new THREE.BufferGeometry();
    const coordinates = new Float32Array(420);
    for (let i = 0; i < coordinates.length; i++) coordinates[i] = (Math.random() - 0.5) * 20;
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(coordinates, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: "rgb(145,147,152)",
      size: 0.014,
      transparent: true,
      opacity: 0.3,
    });
    scene.add(new THREE.Points(starsGeometry, starsMaterial));
    const resize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let time = 0;
    const animate = () => {
      time += reduced ? 0 : 0.002;
      const progress = window.scrollY / Math.max(window.innerHeight, 1);
      group.rotation.set(
        0.5 + Math.sin(time) * 0.12 + progress * 0.26,
        0.32 + progress * 0.5,
        time * 0.15,
      );
      group.position.x = Math.sin(progress * 1.7) * (window.innerWidth < 600 ? 0.4 : 1.8);
      group.position.y = -0.6 + Math.sin(progress) * 0.3;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={ref} className="scene-canvas" aria-hidden="true" />;
}
