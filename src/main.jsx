import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Environment, Float, Html, OrbitControls, PerspectiveCamera, Sparkles, useTexture } from '@react-three/drei';
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
const logoWorks = ['New Project (11).png','New Project (19).png','New Project (20).png','New Project (21).png','New Project (23).png','New Project (24).png','New Project (25).png','New Project (26).png'].map((x) => asset('شعارات/' + x));
const graphicWorks = ['New Project (27).png','Untitled-1.png','gallery3.png','project-2-HdPF4yJZ.png','project-3.jpg','project-4.jpg'].map((x) => asset('تصاميم/' + x));
const threeDWorks = ['Screenshot 2026-09-18 060521.png','Screenshot 2026-09-18 060533.png','Screenshot 2026-09-18 060605.png','Screenshot 2026-09-18 060646.png'].map((x) => asset('ثري دي/' + x));

function LogoMesh({ intro, progress }) {
  const geometry = useLoader(STLLoader, images.logo3d);
  const ref = useRef();
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.08;
    ref.current.rotation.x = progress * 0.2;
    ref.current.scale.setScalar(intro ? 1 + progress * 1.8 : 0.62 + progress * 0.1);
  });
  return <mesh ref={ref} geometry={geometry} position={[0, 0, intro ? -1.4 + progress * 2 : -1.8]}><meshStandardMaterial color="#c8ccd0" metalness={0.92} roughness={0.2} emissive="#15181b" emissiveIntensity={0.2} /></mesh>;
}
function FloatingArtifact({ url, index, progress }) {
  const texture = useTexture(url); const ref = useRef();
  const seed = index * 1.73;
  useFrame(() => { if (!ref.current) return; ref.current.rotation.z = Math.sin(progress * 2 + seed) * 0.12; ref.current.rotation.y = (progress * (index % 2 ? -0.16 : 0.2)) + seed; ref.current.position.y = Math.sin(progress * 3 + seed) * 0.12; });
  return <mesh ref={ref} position={[(index % 2 ? 2.25 : -2.25) + Math.sin(seed) * .35, (index % 3 - 1) * .6, -2.2 - index * .45]} rotation={[0, 0, (index % 2 ? -1 : 1) * .08]}><planeGeometry args={[1.3 + (index % 3) * .22, 1.05 + (index % 2) * .3]} /><meshBasicMaterial map={texture} transparent opacity={Math.min(0.92, Math.max(0, (progress - .12 - index * .015) * 3))} /></mesh>;
}
function Scene({ progress, intro }) {
  const { camera } = useThree();
  useFrame(() => { camera.position.z = 6 - progress * 2.25; camera.position.x = Math.sin(progress * 2.4) * .55; camera.position.y = progress * .16; camera.lookAt(0, 0, -1); });
  return <>
    <PerspectiveCamera makeDefault position={[0,0,6]} fov={42} />
    <ambientLight intensity={0.55} /><directionalLight position={[3,4,5]} intensity={2.3} color="#f5f0e8" /><pointLight position={[-4,-2,1]} color="#6e7cff" intensity={10} distance={8} />
    <Suspense fallback={null}><LogoMesh intro={intro} progress={progress} />
      {logoWorks.slice(0, 5).map((url, i) => <FloatingArtifact key={url} url={url} index={i} progress={progress} />)}
      {graphicWorks.slice(0, 3).map((url, i) => <FloatingArtifact key={url} url={url} index={i + 5} progress={progress} />)}
    </Suspense>
    <Sparkles count={progress > .62 ? 80 : 28} scale={[10,6,8]} size={1.2} speed={.18} color="#b7b9c5" />
    <Environment preset="city" environmentIntensity={0.25} />
  </>;
}
function ImageMosaic({ items, className = '' }) { return <div className={'mosaic ' + className}>{items.map((src, i) => <img key={src} src={src} alt="Shaheen Ali Sayed portfolio work" style={{ '--i': i }} loading="lazy" />)}</div>; }
function Dieline() { return <div className="dieline" aria-label="Packaging dieline diagram"><span className="measure top">120 mm</span><span className="measure side">80 mm</span><div className="cut cut-a"/><div className="cut cut-b"/><div className="fold fold-a"/><div className="fold fold-b"/></div>; }
function App() {
  const [scroll, setScroll] = useState(0); const [entered, setEntered] = useState(false);
  useEffect(() => { const onScroll = () => setScroll(Math.min(1, window.scrollY / (document.body.scrollHeight - innerHeight))); window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); return () => window.removeEventListener('scroll', onScroll); }, []);
  const progress = entered ? scroll : 0;
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return <div className="site">
    <div className="webgl"><Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}><Scene progress={progress} intro={!entered} /></Canvas></div>
    {!entered && <div className="intro" onClick={() => setEntered(true)}><div className="intro-logo"><img src={images.logo} alt="Shaheen Ali Sayed logo" /></div><div className="draw-line"/><p>CLICK TO ENTER <span>↗</span></p><small>an interactive portfolio by Shaheen Ali Sayed</small></div>}
    <header><button className="wordmark" onClick={() => scrollTo({top:0, behavior:'smooth'})}>SAS<span>®</span></button><nav>{[['identity','01'],['print','02'],['models','03'],['contact','04']].map(([id,n]) => <button key={id} onClick={() => go(id)}>{n} / {id}</button>)}</nav><div className="progress"><i style={{ transform: `scaleX(${scroll})` }}/></div></header>
    <main>
      <section className="hero"><div className="eyebrow">01 — independent designer / cairo</div><h1>SHAHEEN<br/><em>ALI SAYED</em></h1><div className="hero-meta"><span>Graphic designer<br/>& visual storyteller</span><span>Scroll to explore<br/><b>↓</b></span></div><img className="portrait" src={images.portrait} alt="Portrait of Shaheen Ali Sayed" /></section>
      <section className="manifesto"><p className="eyebrow">A practice in motion</p><h2>Ideas become <i>objects.</i><br/>Objects become <i>stories.</i></h2><p className="body-copy">I build identities, printed matter and digital worlds where every detail has a reason to move. Brand systems, packaging, visual language and 3D forms — shaped into one clear point of view.</p><div className="stats"><span><b>06+</b> disciplines</span><span><b>∞</b> curiosity</span><span><b>3D</b> dimension</span></div></section>
      <section id="identity" className="work-section"><div className="section-head"><span className="eyebrow">02 — identity systems</span><h2>Marks with<br/><i>memory.</i></h2><p>Logo design, typography and visual systems built to live beyond the first glance.</p></div><ImageMosaic items={logoWorks} /></section>
      <section className="work-section graphic"><div className="section-head"><span className="eyebrow">03 — graphic design</span><h2>Make it<br/><i>loud.</i></h2></div><ImageMosaic items={graphicWorks} className="offset" /></section>
      <section id="print" className="print-section"><div className="section-head"><span className="eyebrow">04 — print / packaging</span><h2>From flat<br/>to <i>form.</i></h2><p>R.psd — a packaging study, deconstructed as a living dieline.</p></div><div className="process"><div className="package-face"><span>R</span><small>PACKAGING STUDY / 2026</small></div><Dieline/><div className="process-notes"><span>01 / layout</span><span>02 / dieline</span><span>03 / die-cut</span><span>04 / object</span></div></div></section>
      <section id="models" className="models-section"><div className="section-head"><span className="eyebrow">05 — three dimensional practice</span><h2>See the<br/><i>depth.</i></h2><p>Scroll controls the camera, not a loop. A reference image dissolves into a real 3D object, then makes room for a wider world.</p></div><div className="transform"><div className="reference"><img src={images.reference} alt="Reference image for 3D transformation"/><span>REFERENCE / 01</span></div><div className="arrow">→</div><div className="model-proxy"><div className="stamp"><div>SHAHEEN<br/>STUDIO</div></div><span>HANDHELD STAMP / 3D</span></div></div><ImageMosaic items={threeDWorks} className="three-mosaic" /></section>
      <section className="reviews"><span className="eyebrow">06 — outside perspective</span><h2>Good work<br/>travels.</h2><a href="https://www.mostaql.com/" target="_blank" rel="noreferrer" className="review-object"><span>“The details feel considered, and the result feels unmistakably personal.”</span><b>CLIENT NOTE ↗</b></a></section>
      <section id="contact" className="contact"><span className="eyebrow">07 — start a conversation</span><h2>Have a good<br/><i>idea?</i></h2><a className="email" href="mailto:shaheen.ali.sayed@gmail.com">shaheen.ali.sayed<br/><i>@gmail.com</i> ↗</a><div className="links"><a href="https://github.com/alisayed2008/2255" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.mostaql.com/" target="_blank" rel="noreferrer">Mostaql ↗</a></div><img src={images.logo} className="end-logo" alt="SAS logo" /></section>
    </main><footer><span>© 2026 SHAHEEN ALI SAYED</span><span>DESIGN / MOTION / FORM</span></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
