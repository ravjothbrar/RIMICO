const { useState, useEffect, useRef, useCallback, useMemo } = React;
const { motion, AnimatePresence } = Motion;

/* ── Hooks ── */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });
  const setValue = (value) => {
    try {
      const v = value instanceof Function ? value(storedValue) : value;
      setStoredValue(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {}
  };
  return [storedValue, setValue];
};

/* ── Constants ── */
const DEFAULT_CATEGORIES = [
  { name: 'Personal', accent: '#8B5CF6' },
  { name: 'School',   accent: '#1E40AF' },
  { name: 'Beri',     accent: '#047857' },
  { name: 'AI',       accent: '#0891B2' }
];

const TIMEFRAME_WIDTHS = { quick: 45, short: 60, medium: 75, long: 95, extended: 115 };

/* ── Icons ── */
const Icons = {
  Plus:     () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Archive:  () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  Book:     () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Check:    () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X:        () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Calendar: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Trash:    () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Restore:  () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>,
  Edit:     () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  User:     () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Settings: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Cube3D: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="3.27 6.96 12 12.01 20.73 6.96" /><line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  Grid2D: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
};

/* ── Small components ── */

const MarkdownContent = ({ content }) => {
  if (!content) return <span className="text-gray-400 italic text-sm">No description provided.</span>;
  const html = marked.parse(content, { breaks: true });
  return <div className="markdown-content text-gray-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: html }} />;
};

const MarkdownEditor = ({ value, onChange, rows, placeholder }) => {
  const textareaRef = useRef(null);

  const wrapSelection = useCallback((wrapper) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.substring(start, end);

    if (selected.length > 0) {
      const before = text.substring(0, start);
      const after = text.substring(end);
      const wl = wrapper.length;
      if (before.endsWith(wrapper) && after.startsWith(wrapper)) {
        const newText = before.slice(0, -wl) + selected + after.slice(wl);
        onChange(newText);
        setTimeout(() => { ta.selectionStart = start - wl; ta.selectionEnd = end - wl; }, 0);
      } else {
        const newText = before + wrapper + selected + wrapper + after;
        onChange(newText);
        setTimeout(() => { ta.selectionStart = start + wl; ta.selectionEnd = end + wl; }, 0);
      }
    } else {
      const newText = text.substring(0, start) + wrapper + wrapper + text.substring(end);
      onChange(newText);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + wrapper.length; }, 0);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); wrapSelection('**'); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); wrapSelection('*'); }
  }, [wrapSelection]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows || 2}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 resize-none"
        placeholder={placeholder || "**bold** (Ctrl+B), *italic* (Ctrl+I)"}
      />
      <div className="flex gap-1 mt-1">
        <button type="button" onClick={() => wrapSelection('**')} className="px-2 py-0.5 text-xs font-bold text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="Bold (Ctrl+B)">B</button>
        <button type="button" onClick={() => wrapSelection('*')} className="px-2 py-0.5 text-xs italic text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="Italic (Ctrl+I)">I</button>
      </div>
    </div>
  );
};

const AttributionLink = () => (
  <a href="https://ravjothbrar.com" target="_blank" rel="noopener noreferrer" className="attribution-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-gray-600 text-xs font-medium">
    <Icons.User />Created by Ravjoth
  </a>
);

/* ── Background blobs (pure CSS, rendered once) ── */
const AnimatedBlobs = React.memo(() => (
  <div className="blob-container">
    <div className="blob blob-1" />
    <div className="blob blob-2" />
    <div className="blob blob-3" />
    <div className="blob blob-4" />
    <div className="blob blob-5" />
    <div className="blob blob-6" />
    <div className="blob blob-7" />
  </div>
));

/* ── Header mini-blobs (pure CSS, rendered once) ── */
const HeaderMiniBlobs = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="header-blob header-blob-1" />
    <div className="header-blob header-blob-2" />
    <div className="header-blob header-blob-3" />
    <div className="header-blob header-blob-4" />
    <div className="header-blob header-blob-5" />
  </div>
));

/* ── Book Spine ── */
const BookSpine = ({ task, onClick, onComplete, isFlickering, shelfColors }) => {
  const colors = shelfColors || { accent: '#8B5CF6' };
  const width = TIMEFRAME_WIDTHS[task.timeframe] || TIMEFRAME_WIDTHS['medium'];

  return (
    <motion.div
      className="book-spine relative cursor-pointer mx-0.5 flex-shrink-0 self-stretch"
      style={{ width: `${width}px` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      whileHover={{ y: -12, scale: 1.05, rotateY: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
    >
      <div
        className={`book-spine-inner h-full ${isFlickering ? 'page-flicker' : ''} relative overflow-hidden`}
        style={{ background: `linear-gradient(to bottom, ${colors.accent}CC, ${colors.accent}, ${colors.accent}DD)` }}
      >
        {/* Gold embossed lines */}
        <div className="absolute top-3 left-1 right-1 h-px bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent" />
        <div className="absolute top-4 left-2 right-2 h-px bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent" />
        <div className="absolute bottom-8 left-1 right-1 h-px bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent" />
        <div className="absolute bottom-9 left-2 right-2 h-px bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent" />

        {/* Title on spine */}
        <div
          className="vertical-text absolute inset-0 flex items-center justify-center px-1 py-10"
          style={{ color: 'rgba(255,255,255,0.95)' }}
        >
          <span className="font-bold text-xs tracking-wider leading-tight" style={{
            overflow: 'hidden',
            maxHeight: '100%',
            whiteSpace: 'nowrap'
          }}>{task.name}</span>
        </div>

        {/* Complete button */}
        <motion.button
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Icons.Check />
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ── Placeholder Ghost Books ── */
const PlaceholderBooks = ({ count }) => {
  const ghostBooks = useMemo(() => {
    const presets = [
      { w: 38, h: '75%' }, { w: 52, h: '88%' }, { w: 44, h: '68%' },
      { w: 60, h: '92%' }, { w: 35, h: '60%' }, { w: 48, h: '82%' },
      { w: 55, h: '70%' }, { w: 42, h: '95%' }, { w: 50, h: '65%' },
      { w: 46, h: '78%' }, { w: 58, h: '85%' }, { w: 40, h: '72%' }
    ];
    return Array.from({ length: count }, (_, i) => presets[i % presets.length]);
  }, [count]);

  return ghostBooks.map((book, i) => (
    <div
      key={`ghost-${i}`}
      className="ghost-book mx-0.5 self-end"
      style={{ width: `${book.w}px`, height: book.h }}
    >
      {/* Bottom decorative line */}
      <div className="absolute bottom-6 left-3 right-3 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' }} />
    </div>
  ));
};

/* ── Shelf Quadrant ── */
const ShelfQuadrant = ({ label, tasks, onBookClick, onComplete, flickeringId, shelfColors }) => {
  const colors = shelfColors || { accent: '#8B5CF6' };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-1 px-2 pt-1">
        <div className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: colors.accent }} />
        <h3 className="text-sm font-bold" style={{ color: '#E8D5B7' }}>{label}</h3>
        <span className="text-xs" style={{ color: 'rgba(232,213,183,0.6)' }}>{tasks.length}</span>
      </div>
      <div className="flex-1 relative">
        <div className="custom-scrollbar overflow-x-auto h-full">
          <div className="flex items-stretch h-[calc(100%-20px)] px-2 pt-2">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <BookSpine key={task.id} task={task} onClick={() => onBookClick(task)} onComplete={onComplete} isFlickering={flickeringId === task.id} shelfColors={colors} />
              ))}
            </AnimatePresence>
            <PlaceholderBooks count={Math.max(2, 6 - tasks.length)} />
          </div>
        </div>
        <div className="shelf absolute bottom-0 left-1 right-1 h-5 rounded-b-sm" />
      </div>
    </div>
  );
};

/* ── 3D Bookshelf View ── */
const Bookshelf3D = ({ categories, tasksByLabel, onBookClick }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameRef = useRef(null);
  const bookMeshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const hoveredRef = useRef(null);

  /* Create a procedural wood texture */
  const createWoodTexture = useCallback((baseColor, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // Wood grain lines
    for (let i = 0; i < height; i += 3) {
      const variation = Math.sin(i * 0.05) * 8 + Math.random() * 4;
      const alpha = 0.03 + Math.random() * 0.04;
      ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath();
      ctx.moveTo(0, i);
      for (let x = 0; x < width; x += 10) {
        ctx.lineTo(x, i + Math.sin((x + variation) * 0.02) * 2);
      }
      ctx.stroke();
    }

    // Knots
    const knotCount = Math.floor(Math.random() * 2) + 1;
    for (let k = 0; k < knotCount; k++) {
      const kx = Math.random() * width;
      const ky = Math.random() * height;
      const kr = 4 + Math.random() * 8;
      const grad = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
      grad.addColorStop(0, 'rgba(60,30,15,0.3)');
      grad.addColorStop(0.6, 'rgba(60,30,15,0.1)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(kx - kr, ky - kr, kr * 2, kr * 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  /* Create a book cover texture */
  const createBookTexture = useCallback((color, title, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Subtle fabric texture
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        if (Math.random() > 0.7) {
          ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Gold decorative lines
    ctx.strokeStyle = 'rgba(218,165,32,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 20);
    ctx.lineTo(width - 8, 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 24);
    ctx.lineTo(width - 10, 24);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, height - 30);
    ctx.lineTo(width - 8, height - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, height - 26);
    ctx.lineTo(width - 10, height - 26);
    ctx.stroke();

    // Title text (rotated for spine)
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${Math.min(12, width - 6)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Truncate title
    let displayTitle = title;
    while (ctx.measureText(displayTitle).width > height - 60 && displayTitle.length > 3) {
      displayTitle = displayTitle.slice(0, -2) + '…';
    }
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(displayTitle, 0, 0);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }, []);

  /* Create ghost book texture */
  const createGhostBookTexture = useCallback((width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, 0, width, height);

    // Faint outline
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Faint decorative lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(6, 16);
    ctx.lineTo(width - 6, 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, height - 20);
    ctx.lineTo(width - 6, height - 20);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f0ff);
    scene.fog = new THREE.Fog(0xf5f0ff, 18, 35);
    sceneRef.current = scene;

    // Camera — isometric-style perspective
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(8, 6, 10);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5;
    controls.maxDistance = 22;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 1.5, 0);
    controls.update();
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ee, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8f0, 1.2);
    dirLight.position.set(5, 8, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.camera.left = -8;
    dirLight.shadow.camera.right = 8;
    dirLight.shadow.camera.top = 8;
    dirLight.shadow.camera.bottom = -4;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xe8d5f5, 0.3);
    fillLight.position.set(-4, 4, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffeedd, 0.4, 20);
    rimLight.position.set(-3, 5, 5);
    scene.add(rimLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xede5ff, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Build bookshelf
    const woodTex = createWoodTexture('#6B4423', 512, 512);
    const woodTexDark = createWoodTexture('#4A2C2A', 512, 512);

    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex, roughness: 0.7, metalness: 0.05, color: 0x8B6544
    });
    const woodMatDark = new THREE.MeshStandardMaterial({
      map: woodTexDark, roughness: 0.75, metalness: 0.03, color: 0x6B4423
    });

    const shelfGroup = new THREE.Group();

    const catCount = categories.length;
    const cols = Math.min(catCount, 2);
    const shelves = Math.ceil(catCount / cols);

    const shelfW = 4.5;
    const shelfH = 2.2;
    const shelfD = 1.2;
    const sideThick = 0.12;
    const shelfThick = 0.1;
    const totalW = cols * shelfW + (cols - 1) * 0.3;
    const totalH = shelves * shelfH;

    // Build shelf structure per category
    categories.forEach((cat, catIdx) => {
      const col = catIdx % cols;
      const row = Math.floor(catIdx / cols);
      const offsetX = (col - (cols - 1) / 2) * (shelfW + 0.3);
      const offsetY = (shelves - 1 - row) * shelfH;

      // Back panel
      const backGeo = new THREE.BoxGeometry(shelfW, shelfH, 0.06);
      const backMesh = new THREE.Mesh(backGeo, woodMatDark);
      backMesh.position.set(offsetX, offsetY + shelfH / 2, -shelfD / 2);
      backMesh.castShadow = true;
      backMesh.receiveShadow = true;
      shelfGroup.add(backMesh);

      // Bottom shelf
      const bottomGeo = new THREE.BoxGeometry(shelfW + sideThick * 2, shelfThick, shelfD + 0.1);
      const bottomMesh = new THREE.Mesh(bottomGeo, woodMat);
      bottomMesh.position.set(offsetX, offsetY, 0);
      bottomMesh.castShadow = true;
      bottomMesh.receiveShadow = true;
      shelfGroup.add(bottomMesh);

      // Top shelf
      const topMesh = new THREE.Mesh(bottomGeo, woodMat);
      topMesh.position.set(offsetX, offsetY + shelfH, 0);
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      shelfGroup.add(topMesh);

      // Left side
      const sideGeo = new THREE.BoxGeometry(sideThick, shelfH, shelfD);
      const leftMesh = new THREE.Mesh(sideGeo, woodMat);
      leftMesh.position.set(offsetX - shelfW / 2 - sideThick / 2, offsetY + shelfH / 2, 0);
      leftMesh.castShadow = true;
      leftMesh.receiveShadow = true;
      shelfGroup.add(leftMesh);

      // Right side
      const rightMesh = new THREE.Mesh(sideGeo, woodMat);
      rightMesh.position.set(offsetX + shelfW / 2 + sideThick / 2, offsetY + shelfH / 2, 0);
      rightMesh.castShadow = true;
      rightMesh.receiveShadow = true;
      shelfGroup.add(rightMesh);

      // Category label on shelf edge
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 32;
      const lctx = labelCanvas.getContext('2d');
      lctx.fillStyle = 'rgba(232,213,183,0.8)';
      lctx.font = 'bold 18px Inter, sans-serif';
      lctx.textAlign = 'left';
      lctx.textBaseline = 'middle';
      lctx.fillText(cat.name, 8, 16);
      const labelTex = new THREE.CanvasTexture(labelCanvas);
      const labelGeo = new THREE.PlaneGeometry(1.5, 0.18);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.set(offsetX - shelfW / 2 + 1, offsetY + shelfH - 0.04, shelfD / 2 + 0.06);
      shelfGroup.add(labelMesh);

      // Add real books
      const tasks = tasksByLabel[cat.name] || [];
      let bookX = offsetX - shelfW / 2 + 0.25;
      const bookBaseY = offsetY + shelfThick / 2;

      tasks.forEach((task) => {
        const tw = TIMEFRAME_WIDTHS[task.timeframe] || TIMEFRAME_WIDTHS['medium'];
        const bookWidth = tw * 0.012;
        const bookHeight = 1.4 + Math.random() * 0.5;
        const bookDepth = 0.85 + Math.random() * 0.2;

        const bookGeo = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
        const spineTex = createBookTexture(cat.accent, task.name, 128, 512);

        const bookMaterials = [
          new THREE.MeshStandardMaterial({ color: cat.accent, roughness: 0.6 }), // right
          new THREE.MeshStandardMaterial({ color: cat.accent, roughness: 0.6 }), // left
          new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.9 }),   // top (pages)
          new THREE.MeshStandardMaterial({ color: cat.accent, roughness: 0.6 }), // bottom
          new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.5 }),      // front (spine)
          new THREE.MeshStandardMaterial({ color: cat.accent, roughness: 0.6 })  // back
        ];

        const bookMesh = new THREE.Mesh(bookGeo, bookMaterials);
        const tilt = (Math.random() - 0.5) * 0.06;
        bookMesh.position.set(bookX + bookWidth / 2, bookBaseY + bookHeight / 2, 0);
        bookMesh.rotation.z = tilt;
        bookMesh.castShadow = true;
        bookMesh.receiveShadow = true;
        bookMesh.userData = { task, type: 'book' };
        shelfGroup.add(bookMesh);
        bookMeshesRef.current.push(bookMesh);

        bookX += bookWidth + 0.04;
      });

      // Ghost placeholder books to fill remaining space
      const ghostCount = Math.max(2, 5 - tasks.length);
      const ghostPresets = [
        { w: 0.45, h: 1.5 }, { w: 0.6, h: 1.8 }, { w: 0.5, h: 1.3 },
        { w: 0.7, h: 1.9 }, { w: 0.4, h: 1.1 }, { w: 0.55, h: 1.6 }
      ];

      for (let g = 0; g < ghostCount; g++) {
        const preset = ghostPresets[g % ghostPresets.length];
        if (bookX + preset.w > offsetX + shelfW / 2 - 0.15) break;

        const ghostGeo = new THREE.BoxGeometry(preset.w * 0.55, preset.h, 0.8);
        const ghostTex = createGhostBookTexture(64, 256);
        const ghostMat = new THREE.MeshStandardMaterial({
          map: ghostTex,
          transparent: true,
          opacity: 0.15,
          roughness: 0.9,
          color: 0xffffff
        });
        const ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
        ghostMesh.position.set(bookX + preset.w * 0.275, bookBaseY + preset.h / 2, 0);
        ghostMesh.rotation.z = (Math.random() - 0.5) * 0.04;
        shelfGroup.add(ghostMesh);
        bookX += preset.w * 0.55 + 0.04;
      }
    });

    // Center the shelf
    shelfGroup.position.set(0, 0.05, 0);
    scene.add(shelfGroup);

    // Mouse interaction
    const handleMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (e) => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(bookMeshesRef.current);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData.task && onBookClick) {
          onBookClick(hit.userData.task);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();

      // Hover detection
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(bookMeshesRef.current);

      if (hoveredRef.current && hoveredRef.current !== (intersects[0]?.object || null)) {
        // Reset previous hovered
        hoveredRef.current.position.y -= 0.15;
        hoveredRef.current.scale.set(1, 1, 1);
        renderer.domElement.style.cursor = 'default';
        hoveredRef.current = null;
      }

      if (intersects.length > 0 && intersects[0].object !== hoveredRef.current) {
        hoveredRef.current = intersects[0].object;
        hoveredRef.current.position.y += 0.15;
        hoveredRef.current.scale.set(1.05, 1.05, 1.05);
        renderer.domElement.style.cursor = 'pointer';
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      bookMeshesRef.current = [];
      hoveredRef.current = null;
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [categories, tasksByLabel, onBookClick, createWoodTexture, createBookTexture, createGhostBookTexture]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ touchAction: 'none' }}
    />
  );
};

/* ── Shared Task Form (used by both Add and Edit) ── */
const TaskForm = ({ formData, setFormData, categories, onSubmit, submitLabel }) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400" placeholder="Task name" />
    </div>
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf</label>
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button key={cat.name} type="button" onClick={() => setFormData({ ...formData, label: cat.name })} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.label === cat.name ? 'ring-2 ring-artisan-purple bg-purple-50 text-artisan-purple' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: cat.accent }} />{cat.name}
          </button>
        ))}
      </div>
    </div>
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="font-normal text-gray-400">(markdown)</span></label>
      <MarkdownEditor value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} rows={2} />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
        <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Timeframe</label>
        <select value={formData.timeframe} onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
          <option value="quick">Quick</option><option value="short">Short</option><option value="medium">Medium</option><option value="long">Long</option><option value="extended">Extended</option>
        </select>
      </div>
    </div>
    <motion.button type="submit" className="w-full px-4 py-2.5 bg-artisan-purple text-white rounded-lg text-sm font-semibold hover:bg-artisan-purpleDark" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{submitLabel}</motion.button>
  </form>
);

/* ── Task Detail Modal (view + edit + complete + delete) ── */
const TaskDetailModal = ({ task, onClose, onComplete, onDelete, onEdit, categories }) => {
  const cat = (categories || []).find(c => c.name === task.label);
  const shelfColor = cat || { accent: '#8B5CF6' };
  const formatDate = (ds) => ds ? new Date(ds).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'No due date';
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: task.name,
    label: task.label,
    description: task.description || '',
    dueDate: task.dueDate || '',
    timeframe: task.timeframe || 'medium'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onEdit(task.id, formData);
      onClose();
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white relative w-full max-w-lg rounded-xl overflow-hidden shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center z-10"><Icons.X /></button>
        <div className="p-6">
          {editing ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Edit Book</h2>
              </div>
              <TaskForm formData={formData} setFormData={setFormData} categories={categories} onSubmit={handleSave} submitLabel="Save Changes" />
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-1.5 h-16 rounded-full" style={{ backgroundColor: shelfColor.accent }} />
                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${shelfColor.accent}15`, color: shelfColor.accent }}>{task.label}</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">{task.name}</h2>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1"><Icons.Calendar /><span>{formatDate(task.dueDate)}</span></div>
                </div>
              </div>
              <div className="border-t border-gray-200 my-4" />
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Description</h4>
                <MarkdownContent content={task.description} />
              </div>
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Timeframe</h4>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 capitalize">{task.timeframe}</span>
              </div>
              <div className="flex gap-2">
                <motion.button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-artisan-purple text-white rounded-lg text-sm font-semibold hover:bg-artisan-purpleDark" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { onComplete(task.id); onClose(); }}><Icons.Check />Complete</motion.button>
                <motion.button className="flex items-center justify-center gap-1 px-4 py-2.5 bg-purple-50 text-artisan-purple rounded-lg text-sm font-semibold hover:bg-purple-100" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setEditing(true)}><Icons.Edit />Edit</motion.button>
                <motion.button className="flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { onDelete(task.id); onClose(); }}><Icons.Trash /></motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Add Task Modal ── */
const AddTaskModal = ({ onClose, onAdd, categories }) => {
  const [formData, setFormData] = useState({ name: '', label: categories[0]?.name || '', description: '', dueDate: '', timeframe: 'medium' });
  const handleSubmit = (e) => { e.preventDefault(); if (formData.name.trim()) { onAdd({ ...formData, id: Date.now().toString(), completed: false, createdAt: new Date().toISOString() }); onClose(); } };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Add Book</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"><Icons.X /></button>
          </div>
          <TaskForm formData={formData} setFormData={setFormData} categories={categories} onSubmit={handleSubmit} submitLabel="Add to Library" />
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Category Manager Modal ── */
const CategoryManagerModal = ({ onClose, categories, onSave }) => {
  const [cats, setCats] = useState(categories.map(c => ({ ...c })));
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#8B5CF6');

  const addCategory = () => {
    const trimmed = newName.trim();
    if (trimmed && !cats.find(c => c.name === trimmed)) {
      setCats([...cats, { name: trimmed, accent: newColor }]);
      setNewName('');
      setNewColor('#8B5CF6');
    }
  };

  const removeCategory = (name) => {
    if (cats.length <= 1) return;
    setCats(cats.filter(c => c.name !== name));
  };

  const updateColor = (name, color) => {
    setCats(cats.map(c => c.name === name ? { ...c, accent: color } : c));
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Manage Shelves</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"><Icons.X /></button>
          </div>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {cats.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <input type="color" value={cat.accent} onChange={(e) => updateColor(cat.name, e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
                <span className="flex-1 text-sm font-medium text-gray-700">{cat.name}</span>
                <button onClick={() => removeCategory(cat.name)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" disabled={cats.length <= 1}>
                  <Icons.Trash />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border-0 p-0 flex-shrink-0" />
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400" placeholder="New category name" />
            <button onClick={addCategory} className="px-3 py-2 bg-artisan-purple text-white rounded-lg text-sm font-semibold hover:bg-artisan-purpleDark flex-shrink-0">Add</button>
          </div>
          <motion.button onClick={() => { onSave(cats); onClose(); }} className="w-full px-4 py-2.5 bg-artisan-purple text-white rounded-lg text-sm font-semibold hover:bg-artisan-purpleDark" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Save Changes</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Archive View ── */
const ArchiveView = ({ tasks, onRestore, onDelete, categories }) => {
  const formatDate = (ds) => new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const getCatColor = (label) => {
    const cat = categories.find(c => c.name === label);
    return cat ? cat.accent : '#8B5CF6';
  };
  return (
    <div className="h-full overflow-auto p-4">
      <h2 className="text-lg font-bold text-artisan-purple mb-3">Archived</h2>
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No archived books</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white/90 rounded-lg p-3 flex items-center gap-3 shadow-sm">
              <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: getCatColor(task.label) }} />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-800 truncate">{task.name}</h4>
                <p className="text-xs text-gray-500">{formatDate(task.completedAt)}</p>
              </div>
              <button onClick={() => onRestore(task.id)} className="p-1.5 rounded bg-purple-50 text-artisan-purple hover:bg-purple-100"><Icons.Restore /></button>
              <button onClick={() => onDelete(task.id)} className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100"><Icons.Trash /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main App ── */
const App = () => {
  const [tasks, setTasks] = useLocalStorage('artisan-todo-tasks', []);
  const [categories, setCategories] = useLocalStorage('artisan-todo-categories', DEFAULT_CATEGORIES);
  const [activeView, setActiveView] = useState('library');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [flickeringId, setFlickeringId] = useState(null);
  const [view3D, setView3D] = useState(false);

  const activeTasks = tasks.filter(t => !t.completed);
  const archivedTasks = tasks.filter(t => t.completed);

  const sortByDueDate = useCallback((list) => [...list].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  }), []);

  const tasksByLabel = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.name] = sortByDueDate(activeTasks.filter(t => t.label === cat.name));
      return acc;
    }, {});
  }, [categories, activeTasks, sortByDueDate]);

  const handleComplete = useCallback((taskId) => {
    setFlickeringId(taskId);
    setTimeout(() => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t));
      setFlickeringId(null);
    }, 500);
  }, [setTasks]);

  const handleRestore = useCallback((taskId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: false, completedAt: null } : t)), [setTasks]);
  const handleDelete = useCallback((taskId) => setTasks(prev => prev.filter(t => t.id !== taskId)), [setTasks]);
  const handleAddTask = useCallback((newTask) => setTasks(prev => [...prev, newTask]), [setTasks]);
  const handleEditTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, [setTasks]);
  const goToLibrary = useCallback(() => setActiveView('library'), []);

  // Grid layout based on category count
  const catCount = categories.length;
  const cols = catCount === 1 ? 1 : 2;
  const rows = Math.ceil(catCount / cols);
  const needsScroll = rows > 2;

  const gridStyle = useMemo(() => needsScroll
    ? { display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.75rem', gridAutoRows: 'minmax(200px, 1fr)' }
    : { display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: '0.75rem', height: '100%' },
  [cols, rows, needsScroll]);

  return (
    <div className="liquid-bg h-screen flex flex-col">
      <AnimatedBlobs />

      <header className="purple-banner relative z-10 px-4 py-3">
        <HeaderMiniBlobs />
        <div className="flex items-center justify-between relative z-10">
          <AttributionLink />
          <h1 onClick={goToLibrary} className="title-link text-2xl font-extrabold text-artisan-purple">
            Artisan Todo
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setView3D(v => !v)} className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${view3D ? 'bg-artisan-purple text-white' : 'bg-white/90 text-gray-500 hover:text-artisan-purple'}`} title={view3D ? 'Switch to 2D' : 'Switch to 3D'}>
              {view3D ? <Icons.Grid2D /> : <Icons.Cube3D />}
            </button>
            <button onClick={() => setShowCategoryManager(true)} className="w-8 h-8 rounded-full bg-white/90 text-gray-500 hover:text-artisan-purple flex items-center justify-center shadow-sm transition-colors" title="Manage Shelves">
              <Icons.Settings />
            </button>
            <div className="bg-white/90 rounded-full p-0.5 flex shadow-sm">
              <button onClick={() => setActiveView('library')} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${activeView === 'library' ? 'bg-artisan-purple text-white' : 'text-gray-500 hover:text-gray-700'}`}><Icons.Book />Library</button>
              <button onClick={() => setActiveView('archive')} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${activeView === 'archive' ? 'bg-artisan-purple text-white' : 'text-gray-500 hover:text-gray-700'}`}><Icons.Archive />{archivedTasks.length}</button>
            </div>
            <motion.button onClick={() => setShowAddModal(true)} className="w-9 h-9 rounded-full bg-artisan-purple text-white flex items-center justify-center shadow-lg shadow-purple-300/50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Icons.Plus /></motion.button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 pb-2 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'library' ? (
            view3D ? (
              <motion.div key="library-3d" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Bookshelf3D categories={categories} tasksByLabel={tasksByLabel} onBookClick={setSelectedTask} />
              </motion.div>
            ) : (
              <motion.div key="library" className={needsScroll ? 'h-full overflow-y-auto custom-scrollbar' : 'h-full'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={gridStyle}>
                  {categories.map((cat) => (
                    <div key={cat.name} className="shelf-quadrant rounded-xl p-2 overflow-hidden" style={needsScroll ? { minHeight: '200px' } : {}}>
                      <ShelfQuadrant label={cat.name} tasks={tasksByLabel[cat.name] || []} onBookClick={setSelectedTask} onComplete={handleComplete} flickeringId={flickeringId} shelfColors={cat} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          ) : (
            <motion.div key="archive" className="h-full bg-white/50 rounded-xl overflow-hidden border border-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ArchiveView tasks={archivedTasks} onRestore={handleRestore} onDelete={handleDelete} categories={categories} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showAddModal && <AddTaskModal onClose={() => setShowAddModal(false)} onAdd={handleAddTask} categories={categories} />}
        {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onComplete={handleComplete} onDelete={handleDelete} onEdit={handleEditTask} categories={categories} />}
        {showCategoryManager && <CategoryManagerModal onClose={() => setShowCategoryManager(false)} categories={categories} onSave={setCategories} />}
      </AnimatePresence>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
