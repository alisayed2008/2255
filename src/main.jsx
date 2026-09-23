import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Environment, Html, OrbitControls, PerspectiveCamera, Sparkles, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import './styles.css';

const BASE = 'https://raw.githubusercontent.com/alisayed2008/2255/main/';
const asset = (path) => BASE + path.split('/').map(encodeURIComponent).join('/');
const images = {
  portrait: asset('صورتي.jpg'),
  logo: asset('شعاري.svg'),
  reference: asset('WhatsApp Image 2026-09-02 at 12.07.12 PM.jpeg'),
  logo3d: asset('logo_3d.stl'),
};

const logoWorks = [
  'New Project (11).png', 'New Project (19).png', 'New Project (20).png',
  'New Project (21).png', 'New Project (23).png', 'New Project (25).png',
  'New Project (26).png', 'New Project (26) (2).png',
].map((name) => asset(name));
const graphicWorks = [
  'New Project (27).png', 'Untitled-1.png', 'gallery3.png',
  'project-2-HdPF4yJZ.png', 'project-3.jpg', 'project-4.jpg',
].map((name) => asset('تصاميم/' + name));
const threeDWorks = [
  'Screenshot 2026-09-18 060521.png',
  'Screenshot 2026-09-18 060533.png',
  'Screenshot 2026-09-18 060605.png',
  'Screenshot 2026-09-18 060646.png',
].map((name) => asset('ثري دي/' + name));
const modelWorks = [1, 2, 3, 4, 5, 6, 7].map((number) => asset(`ثري دي/${number === 1 ? '1-compressed (1)' : number}-compressed.glb`));

function LogoMesh({ intro, progress }) {
  const geometry = useLoader(STLLoader, images.logo3d);
  const ref = useRef();
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.08;
    ref.current.rotation.x = progress * 0.2;
    ref.current.scale.setScalar(intro ? 1 + progress * 1.8 : 0.62 + progress * 0.1);
  });
  return (
    <mesh ref={ref} geometry={geometry} position={[0, 0, intro ? -1.4 + progress * 2 : -1.8]}>
      <meshStandardMaterial color="#c8ccd0" metalness={0.92} roughness={0.2} emissive="#15181b" emissiveIntensity={0.35} />
    </mesh>
  );
}

function FloatingArtifact({ url, index, progress }) {
  const texture = useTexture(url);
  const ref = useRef();
  const seed = index * 1.73;
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(progress * 2 + seed) * 0.12;
    ref.current.rotation.y = progress * (index % 2 ? -0.16 : 0.2) + seed;
    ref.current.position.y = (index % 3 - 1) * 0.6 + Math.sin(progress * 3 + seed) * 0.18;
  });
  return (
    <mesh ref={ref} position={[(index % 2 ? 2.25 : -2.25) + Math.sin(seed) * 0.35, (index % 3 - 1) * 0.6, -2.2 - index * 0.45]} rotation={[0, 0, (index % 2 ? -1 : 1) * 0.08]}>
      <planeGeometry args={[1.25, 0.9]} />
      <meshBasicMaterial map={texture} transparent opacity={0.72} side={THREE.DoubleSide} />
    </mesh>
  );
}

function GLBModel({ url, index, side = 1, scale = 1 }) {
  const { scene } = useGLTF(url);
  const object = useMemo(() => scene.clone(true), [scene]);
  const ref = useRef();
  const size = useMemo(() => {
    const box = new THREE.Box3().setFromObject(object);
    const dimensions = box.getSize(new THREE.Vector3());
    const longest = Math.max(dimensions.x, dimensions.y, dimensions.z) || 1;
    return 1.35 / longest;
  }, [object]);

  useEffect(() => {
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [object]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    // Rotate each product around its own centre, without making it orbit the page.
    ref.current.rotation.y += delta * (0.42 + (index % 3) * 0.08);
    ref.current.rotation.x = Math.sin(performance.now() * 0.00045 + index) * 0.035;
  });

  const x = side < 0 ? -2.45 - (index % 2) * 0.12 : 2.45 + (index % 2) * 0.12;
  const y = -1.35 + (index % 4) * 0.9;
  return <primitive ref={ref} object={object} position={[x, y, -1.8 - (index % 3) * 0.35]} scale={size * scale} />;
}

function Scene({ progress, intro }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.z = 6 - progress * 2.25;
    camera.position.x = Math.sin(progress * 2.4) * 0.55;
    camera.position.y = progress * 0.16;
    camera.lookAt(0, 0, -1);
  });
  return <>
    <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={42} />
    <ambientLight intensity={0.55} />
    <directionalLight position={[3, 4, 5]} intensity={2.3} color="#f5f0e8" />
    <pointLight position={[-4, -2, 1]} color="#6e7cff" intensity={10} distance={8} />
    <Suspense fallback={null}>
      <LogoMesh intro={intro} progress={progress} />
      {logoWorks.slice(0, 5).map((url, i) => <FloatingArtifact key={url} url={url} index={i} progress={progress} />)}
      {graphicWorks.slice(0, 3).map((url, i) => <FloatingArtifact key={url} url={url} index={i + 5} progress={progress} />)}
      {modelWorks.map((url, i) => <GLBModel key={url} url={url} index={i} side={i % 2 ? 1 : -1} />)}
    </Suspense>
    <Sparkles count={progress > 0.62 ? 80 : 28} scale={[10, 6, 8]} size={1.2} speed={0.18} color="#b7b9c5" />
    <Environment preset="city" environmentIntensity={0.25} />
  </>;
}

function ImageMosaic({ items, className = '' }) {
  return <div className={'mosaic ' + className}>{items.map((src, i) => <img key={src} src={src} alt={`Shaheen Ali Sayed portfolio work ${i + 1}`} style={{ '--i': i }} />)}</div>;
}

function ModelsSlide() {
  return <div className="models-slide">
    <div className="models-slide-copy"><span className="eyebrow">GLB / PRODUCT STUDIES</span><p>Compressed 3D models from the ثري دي collection.</p></div>
    <ImageMosaic items={threeDWorks} className="three-d-mosaic" />
  </div>;
}

function App() {
  const [scroll, setScroll] = useState(0);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const onScroll = () => setScroll(Math.min(1, window.scrollY / Math.max(1, document.body.scrollHeight - innerHeight)));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const progress = entered ? scroll : 0;
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return <div className="site">
    <div className="webgl"><Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}><Scene progress={progress} intro={!entered} /></Canvas></div>
    {!entered && <div className="intro" onClick={() => setEntered(true)}><div className="intro-logo"><img src={images.logo} alt="Shaheen Ali Sayed logo" /></div><div className="draw-line" /><p>CLICK TO ENTER</p></div>}
    <header><button className="wordmark" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}>SAS<span>®</span></button><nav>{[['identity', '01'], ['print', '02'], ['models', '03'], ['contact', '04']].map(([id, number]) => <button key={id} onClick={() => go(id)}>{number} / {id}</button>)}</nav></header>
    <main>
      <section className="hero"><div className="eyebrow">01 — independent designer / cairo</div><h1>SHAHEEN<br /><em>ALI SAYED</em></h1><div className="hero-meta"><span>Graphic designer<br />& visual storyteller</span><span>Scroll to explore<br />the practice ↓</span></div></section>
      <section className="manifesto"><p className="eyebrow">A practice in motion</p><h2>Ideas become <i>objects.</i><br />Objects become <i>stories.</i></h2><p className="body-copy">I build identities, images and physical forms for people who want their work to be remembered.</p></section>
      <section id="identity" className="work-section"><div className="section-head"><span className="eyebrow">02 — identity systems</span><h2>Marks with<br /><i>memory.</i></h2><p>Logo design, type and visual systems with a human pulse.</p></div><ImageMosaic items={logoWorks} /></section>
      <section className="work-section graphic"><div className="section-head"><span className="eyebrow">03 — graphic design</span><h2>Make it<br /><i>loud.</i></h2></div><ImageMosaic items={graphicWorks} /></section>
      <section id="print" className="print-section"><div className="section-head"><span className="eyebrow">04 — print / packaging</span><h2>From flat<br />to <i>form.</i></h2><p>Packaging and objects designed to live beyond the screen.</p></div><img className="reference-image" src={images.reference} alt="Print and packaging reference" /></section>
      <section id="models" className="models-section"><div className="section-head"><span className="eyebrow">05 — three dimensional practice</span><h2>See the<br /><i>depth.</i></h2><p>GLB models appear on the page edges and rotate around their own centres. The images below are the slide previews.</p></div><ModelsSlide /></section>
      <section className="reviews"><span className="eyebrow">06 — outside perspective</span><h2>Good work<br />travels.</h2><a href="https://www.mostaql.com/" target="_blank" rel="noreferrer">More work / Mostaql ↗</a></section>
      <section id="contact" className="contact"><span className="eyebrow">07 — start a conversation</span><h2>Have a good<br /><i>idea?</i></h2><a className="email" href="mailto:shaheen.ali.sayed@gmail.com">shaheen.ali.sayed@gmail.com ↗</a></section>
    </main><footer><span>© 2026 SHAHEEN ALI SAYED</span><span>DESIGN / MOTION / FORM</span></footer>
  </div>;
}

modelWorks.forEach((url) => useGLTF.preload(url));
createRoot(document.getElementById('root')).render(<App />);
