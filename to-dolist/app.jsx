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
const SUGGESTED_CATEGORIES = [
  { name: 'Work',     accent: '#2563EB' },
  { name: 'Health',   accent: '#059669' },
  { name: 'Personal', accent: '#8B5CF6' },
  { name: 'Hobbies',  accent: '#D97706' }
];

const PRESET_COLORS = ['#8B5CF6', '#2563EB', '#059669', '#D97706', '#DC2626', '#0891B2', '#7C3AED', '#BE185D'];

const DEFAULT_CATEGORIES = SUGGESTED_CATEGORIES;

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
  Grid2D: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Question: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
  const animFrameRef = useRef(null);
  const cleanupRef = useRef(null);

  /* Procedural wood texture */
  const createWoodTexture = useCallback((baseColor, w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < h; i += 3) {
      const v = Math.sin(i * 0.05) * 8 + Math.random() * 4;
      ctx.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.04})`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath(); ctx.moveTo(0, i);
      for (let x = 0; x < w; x += 10) ctx.lineTo(x, i + Math.sin((x + v) * 0.02) * 2);
      ctx.stroke();
    }
    for (let k = 0; k < 1 + Math.floor(Math.random() * 2); k++) {
      const kx = Math.random() * w, ky = Math.random() * h, kr = 4 + Math.random() * 8;
      const g = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
      g.addColorStop(0, 'rgba(60,30,15,0.3)'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(kx - kr, ky - kr, kr * 2, kr * 2);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  /* Book spine texture */
  const createBookTexture = useCallback((color, title, w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2)
      if (Math.random() > 0.7) { ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; ctx.fillRect(x, y, 1, 1); }
    ctx.strokeStyle = 'rgba(218,165,32,0.6)'; ctx.lineWidth = 1.5;
    [[8, 20, w - 8], [10, 24, w - 10], [8, h - 30, w - 8], [10, h - 26, w - 10]].forEach(([x1, y1, x2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y1); ctx.stroke();
    });
    ctx.save(); ctx.translate(w / 2, h / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${Math.min(12, w - 6)}px Inter, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let dt = title;
    while (ctx.measureText(dt).width > h - 60 && dt.length > 3) dt = dt.slice(0, -2) + '\u2026';
    ctx.rotate(-Math.PI / 2); ctx.fillText(dt, 0, 0); ctx.restore();
    return new THREE.CanvasTexture(c);
  }, []);

  /* Ghost book texture */
  const createGhostBookTexture = useCallback((w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(6, 16); ctx.lineTo(w - 6, 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, h - 20); ctx.lineTo(w - 6, h - 20); ctx.stroke();
    return new THREE.CanvasTexture(c);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    /* Wait one frame so the container has layout dimensions */
    const initFrame = requestAnimationFrame(() => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      if (w < 10 || h < 10) return;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f0ff);
      scene.fog = new THREE.Fog(0xf5f0ff, 18, 35);

      // Camera
      const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
      const target = new THREE.Vector3(0, 1.5, 0);

      // Orbit state
      let theta = 0.65, phi = 1.05, radius = 14;
      const updateCameraPos = () => {
        camera.position.set(
          target.x + radius * Math.sin(phi) * Math.sin(theta),
          target.y + radius * Math.cos(phi),
          target.z + radius * Math.sin(phi) * Math.cos(theta)
        );
        camera.lookAt(target);
      };
      updateCameraPos();

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);

      /* ── Inline orbit controls via mouse events ── */
      let isDragging = false, prevX = 0, prevY = 0;
      const onPointerDown = (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
      const onPointerUp = () => { isDragging = false; };
      const onPointerMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevX, dy = e.clientY - prevY;
        theta -= dx * 0.005;
        phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.05, phi - dy * 0.005));
        prevX = e.clientX; prevY = e.clientY;
        updateCameraPos();
      };
      const onWheel = (e) => {
        e.preventDefault();
        radius = Math.max(5, Math.min(22, radius + e.deltaY * 0.01));
        updateCameraPos();
      };
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

      // Lighting
      scene.add(new THREE.AmbientLight(0xfff5ee, 0.5));
      const dirLight = new THREE.DirectionalLight(0xfff8f0, 1.2);
      dirLight.position.set(5, 8, 6); dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 30;
      dirLight.shadow.camera.left = -8; dirLight.shadow.camera.right = 8;
      dirLight.shadow.camera.top = 8; dirLight.shadow.camera.bottom = -4;
      dirLight.shadow.bias = -0.001;
      scene.add(dirLight);
      const fill = new THREE.DirectionalLight(0xe8d5f5, 0.3); fill.position.set(-4, 4, -2); scene.add(fill);
      const rim = new THREE.PointLight(0xffeedd, 0.4, 20); rim.position.set(-3, 5, 5); scene.add(rim);

      // Floor
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0xede5ff, roughness: 0.9 }));
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

      // Build bookshelf
      const woodMat = new THREE.MeshStandardMaterial({ map: createWoodTexture('#6B4423', 512, 512), roughness: 0.7, metalness: 0.05, color: 0x8B6544 });
      const woodMatDark = new THREE.MeshStandardMaterial({ map: createWoodTexture('#4A2C2A', 512, 512), roughness: 0.75, metalness: 0.03, color: 0x6B4423 });
      const shelfGroup = new THREE.Group();
      const bookMeshes = [];
      const cols = Math.min(categories.length, 2);
      const shelves = Math.ceil(categories.length / cols);
      const shelfW = 4.5, shelfH = 2.2, shelfD = 1.2, sideThick = 0.12, shelfThick = 0.1;

      categories.forEach((cat, catIdx) => {
        const col = catIdx % cols, row = Math.floor(catIdx / cols);
        const ox = (col - (cols - 1) / 2) * (shelfW + 0.3);
        const oy = (shelves - 1 - row) * shelfH;

        // Back panel
        const back = new THREE.Mesh(new THREE.BoxGeometry(shelfW, shelfH, 0.06), woodMatDark);
        back.position.set(ox, oy + shelfH / 2, -shelfD / 2); back.castShadow = back.receiveShadow = true;
        shelfGroup.add(back);

        // Bottom + top
        const plankGeo = new THREE.BoxGeometry(shelfW + sideThick * 2, shelfThick, shelfD + 0.1);
        const bot = new THREE.Mesh(plankGeo, woodMat); bot.position.set(ox, oy, 0); bot.castShadow = bot.receiveShadow = true; shelfGroup.add(bot);
        const top = new THREE.Mesh(plankGeo, woodMat); top.position.set(ox, oy + shelfH, 0); top.castShadow = top.receiveShadow = true; shelfGroup.add(top);

        // Sides
        const sideGeo = new THREE.BoxGeometry(sideThick, shelfH, shelfD);
        const left = new THREE.Mesh(sideGeo, woodMat); left.position.set(ox - shelfW / 2 - sideThick / 2, oy + shelfH / 2, 0); left.castShadow = left.receiveShadow = true; shelfGroup.add(left);
        const right = new THREE.Mesh(sideGeo, woodMat); right.position.set(ox + shelfW / 2 + sideThick / 2, oy + shelfH / 2, 0); right.castShadow = right.receiveShadow = true; shelfGroup.add(right);

        // Category label
        const lc = document.createElement('canvas'); lc.width = 256; lc.height = 32;
        const lx = lc.getContext('2d'); lx.fillStyle = 'rgba(232,213,183,0.8)';
        lx.font = 'bold 18px Inter, sans-serif'; lx.textAlign = 'left'; lx.textBaseline = 'middle';
        lx.fillText(cat.name, 8, 16);
        const lbl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.18), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc), transparent: true }));
        lbl.position.set(ox - shelfW / 2 + 1, oy + shelfH - 0.04, shelfD / 2 + 0.06);
        shelfGroup.add(lbl);

        // Seed RNG per-shelf so heights are stable across re-renders
        const seed = cat.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const seededRand = (i) => { const x = Math.sin(seed + i * 9301 + 49297) * 233280; return x - Math.floor(x); };

        // Real books
        const tasks = tasksByLabel[cat.name] || [];
        let bx = ox - shelfW / 2 + 0.25;
        const by = oy + shelfThick / 2;
        tasks.forEach((task, ti) => {
          const tw = TIMEFRAME_WIDTHS[task.timeframe] || TIMEFRAME_WIDTHS['medium'];
          const bw = tw * 0.012, bh = 1.4 + seededRand(ti) * 0.5, bd = 0.85 + seededRand(ti + 50) * 0.2;
          const geo = new THREE.BoxGeometry(bw, bh, bd);
          const spine = createBookTexture(cat.accent, task.name, 128, 512);
          const mats = [
            new THREE.MeshStandardMaterial({ color: cat.accent, roughness: 0.6 }),
            new THREE.MeshStandardMaterial({ color: cat.accent, roughness: 0.6 }),
            new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.9 }),
            new THREE.MeshStandardMaterial({ color: cat.accent, roughness: 0.6 }),
            new THREE.MeshStandardMaterial({ map: spine, roughness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: cat.accent, roughness: 0.6 })
          ];
          const mesh = new THREE.Mesh(geo, mats);
          mesh.position.set(bx + bw / 2, by + bh / 2, 0);
          mesh.rotation.z = (seededRand(ti + 100) - 0.5) * 0.06;
          mesh.castShadow = mesh.receiveShadow = true;
          mesh.userData = { task, type: 'book', baseY: by + bh / 2 };
          shelfGroup.add(mesh); bookMeshes.push(mesh);
          bx += bw + 0.04;
        });

        // Ghost books
        const ghostPresets = [{ w: 0.45, h: 1.5 },{ w: 0.6, h: 1.8 },{ w: 0.5, h: 1.3 },{ w: 0.7, h: 1.9 },{ w: 0.4, h: 1.1 },{ w: 0.55, h: 1.6 }];
        for (let g = 0; g < Math.max(2, 5 - tasks.length); g++) {
          const p = ghostPresets[g % ghostPresets.length];
          if (bx + p.w > ox + shelfW / 2 - 0.15) break;
          const gm = new THREE.Mesh(
            new THREE.BoxGeometry(p.w * 0.55, p.h, 0.8),
            new THREE.MeshStandardMaterial({ map: createGhostBookTexture(64, 256), transparent: true, opacity: 0.15, roughness: 0.9, color: 0xffffff })
          );
          gm.position.set(bx + p.w * 0.275, by + p.h / 2, 0);
          gm.rotation.z = (seededRand(g + 200) - 0.5) * 0.04;
          shelfGroup.add(gm);
          bx += p.w * 0.55 + 0.04;
        }
      });

      shelfGroup.position.set(0, 0.05, 0);
      scene.add(shelfGroup);

      // Raycaster for hover/click
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(-999, -999);
      let hoveredMesh = null;

      const onMouseMove = (e) => {
        const r = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      };
      const onClick = () => {
        if (hoveredMesh && hoveredMesh.userData.task && onBookClick) {
          onBookClick(hoveredMesh.userData.task);
        }
      };
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onClick);

      // Animation loop
      const animate = () => {
        animFrameRef.current = requestAnimationFrame(animate);

        // Hover detection
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(bookMeshes);
        const hitObj = hits.length > 0 ? hits[0].object : null;

        if (hoveredMesh && hoveredMesh !== hitObj) {
          hoveredMesh.position.y = hoveredMesh.userData.baseY;
          hoveredMesh.scale.set(1, 1, 1);
          renderer.domElement.style.cursor = 'default';
          hoveredMesh = null;
        }
        if (hitObj && hitObj !== hoveredMesh) {
          hoveredMesh = hitObj;
          hoveredMesh.position.y = hoveredMesh.userData.baseY + 0.15;
          hoveredMesh.scale.set(1.05, 1.05, 1.05);
          renderer.domElement.style.cursor = 'pointer';
        }

        renderer.render(scene, camera);
      };
      animate();

      // Resize
      const onResize = () => {
        const nw = container.clientWidth, nh = container.clientHeight;
        if (nw > 0 && nh > 0) { camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh); }
      };
      window.addEventListener('resize', onResize);

      cleanupRef.current = () => {
        cancelAnimationFrame(animFrameRef.current);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onClick);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('wheel', onWheel);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    });

    return () => {
      cancelAnimationFrame(initFrame);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [categories, tasksByLabel, onBookClick, createWoodTexture, createBookTexture, createGhostBookTexture]);

  return <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden" style={{ touchAction: 'none' }} />;
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

/* ── Task Detail Modal — styled as a book back cover ── */
const TaskDetailModal = ({ task, onClose, onComplete, onDelete, onEdit, categories }) => {
  const cat = (categories || []).find(c => c.name === task.label);
  const accent = cat ? cat.accent : '#8B5CF6';
  const formatDate = (ds) => ds ? new Date(ds).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'No due date';
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: task.name, label: task.label, description: task.description || '',
    dueDate: task.dueDate || '', timeframe: task.timeframe || 'medium'
  });
  const handleSave = (e) => { e.preventDefault(); if (formData.name.trim()) { onEdit(task.id, formData); onClose(); } };

  /* Darken accent for the book back cover */
  const darken = (hex, amount) => {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - amount), g = Math.max(0, ((n >> 8) & 0xff) - amount), b = Math.max(0, (n & 0xff) - amount);
    return `rgb(${r},${g},${b})`;
  };
  const bgDark = darken(accent, 40);
  const bgDarker = darken(accent, 70);

  /* Simple hash for the "ISBN" */
  const isbn = useMemo(() => {
    const h = (task.id || '').split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
    return `978-0-${Math.abs(h % 9000 + 1000)}-${Math.abs((h >> 8) % 9000 + 1000)}-${Math.abs(h % 10)}`;
  }, [task.id]);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="book-cover relative w-full max-w-xs shadow-2xl flex flex-col"
        style={{ background: `linear-gradient(170deg, ${accent} 0%, ${bgDark} 45%, ${bgDarker} 100%)` }}
        initial={{ scale: 0.9, y: 20, rotateY: 10 }}
        animate={{ scale: 1, y: 0, rotateY: 0 }}
        exit={{ scale: 0.9, y: 20, rotateY: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center z-10 text-white/80 hover:text-white transition-colors"><Icons.X /></button>

        {editing ? (
          <div className="p-5 bg-white flex-1 overflow-y-auto custom-scrollbar" style={{ borderRadius: '3px 6px 6px 3px' }}>
            <h2 className="text-base font-bold text-gray-800 mb-3">Edit Book</h2>
            <TaskForm formData={formData} setFormData={setFormData} categories={categories} onSubmit={handleSave} submitLabel="Save Changes" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 px-5 pl-7 py-5 relative z-1 overflow-y-auto custom-scrollbar">
            {/* Top gold rule */}
            <div className="h-px mb-4 flex-shrink-0" style={{ background: 'linear-gradient(to right, transparent, rgba(218,165,32,0.5), transparent)' }} />

            {/* Shelf badge */}
            <div className="inline-block self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {task.label}
            </div>

            {/* Title */}
            <h2 className="text-xl font-extrabold text-white mb-1 leading-tight flex-shrink-0" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{task.name}</h2>

            {/* Due date */}
            <div className="flex items-center gap-1.5 text-white/60 text-[11px] mb-4 flex-shrink-0">
              <Icons.Calendar /><span>{formatDate(task.dueDate)}</span>
              <span className="mx-1 text-white/30">&middot;</span>
              <span className="capitalize">{task.timeframe}</span>
            </div>

            {/* Gold rule */}
            <div className="h-px mb-3 flex-shrink-0" style={{ background: 'linear-gradient(to right, rgba(218,165,32,0.4), rgba(218,165,32,0.15), transparent)' }} />

            {/* Blurb / Description — fills middle of book */}
            <div className="book-blurb text-sm flex-1 min-h-0">
              {task.description ? (
                <div dangerouslySetInnerHTML={{ __html: marked.parse(task.description, { breaks: true }) }} />
              ) : (
                <p className="text-white/40 not-italic">No description yet. Click edit to add one.</p>
              )}
            </div>

            {/* Bottom gold rule */}
            <div className="h-px my-3 flex-shrink-0" style={{ background: 'linear-gradient(to right, transparent, rgba(218,165,32,0.4), transparent)' }} />

            {/* ISBN / barcode area */}
            <div className="flex items-end justify-between mb-4 flex-shrink-0">
              <div>
                <div className="text-white/30 text-[8px] uppercase tracking-widest mb-0.5">Artisan Library</div>
                <div className="font-mono text-white/40 text-[9px]">{isbn}</div>
              </div>
              {/* Mini barcode decoration */}
              <div className="flex items-end gap-px h-5 opacity-30">
                {[3,5,2,4,6,3,5,2,4,3,6,2,5,4,3,5,2,6,3,4].map((bh, i) => (
                  <div key={i} className="bg-white" style={{ width: i % 3 === 0 ? '2px' : '1px', height: `${bh * 3}px` }} />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-1.5 flex-shrink-0">
              <motion.button
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onComplete(task.id); onClose(); }}
              ><Icons.Check />Complete</motion.button>
              <motion.button
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditing(true)}
              ><Icons.Edit /></motion.button>
              <motion.button
                className="flex items-center justify-center px-3 py-2 rounded-md text-xs font-semibold transition-colors"
                style={{ background: 'rgba(255,70,70,0.15)', color: 'rgba(255,180,180,0.9)', border: '1px solid rgba(255,100,100,0.2)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onDelete(task.id); onClose(); }}
              ><Icons.Trash /></motion.button>
            </div>

            {/* Bottom gold rule */}
            <div className="h-px mt-4 flex-shrink-0" style={{ background: 'linear-gradient(to right, transparent, rgba(218,165,32,0.5), transparent)' }} />
          </div>
        )}
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

/* ── Why Page ── */
const WhyPage = () => (
  <div className="h-full overflow-auto custom-scrollbar">
    <div className="max-w-lg mx-auto py-8 px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">📖</div>
        <h2 className="text-2xl font-extrabold text-artisan-purple mb-1">Why RIMICO?</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest">The story behind the shelf</p>
      </div>

      {/* Content — styled like markdown on parchment */}
      <div className="bg-white/80 rounded-xl border border-purple-100 shadow-sm p-6 space-y-5">

        <div>
          <h3 className="text-sm font-bold text-artisan-purple mb-2 uppercase tracking-wider">The Problem</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            I hate scattered to-do lists. I used to have half-formed lists in Notepad, Google Keep, note-taking apps, pinned emails to myself, and many more. It wasn't sustainable, and I wanted a simple, on-device way to have my tasks that actually <em className="text-artisan-purple font-medium not-italic">worked for me</em>.
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        <div>
          <h3 className="text-sm font-bold text-artisan-purple mb-2 uppercase tracking-wider">The Idea</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            I love reading &mdash; truly &mdash; and I wanted to merge my love of books with profound efficiency. Hence, <strong className="text-artisan-purple">RIMICO</strong> was born.
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        <div>
          <h3 className="text-sm font-bold text-artisan-purple mb-2 uppercase tracking-wider">How It Works</h3>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-artisan-purple flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">1</div>
              <p className="text-sm text-gray-700 leading-relaxed">Tasks are formatted as <strong>books</strong> on a library shelf, with each shelf representing a category you define.</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-artisan-purple flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">2</div>
              <p className="text-sm text-gray-700 leading-relaxed">The <strong>timeframe</strong> determines the thickness of each book &mdash; quick tasks are slim, extended projects are thick volumes.</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-artisan-purple flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">3</div>
              <p className="text-sm text-gray-700 leading-relaxed">The <strong>due date</strong> determines position &mdash; the most urgent tasks sit closest to the left, just like the next book you'd reach for.</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        <div>
          <h3 className="text-sm font-bold text-artisan-purple mb-2 uppercase tracking-wider">Beyond a Simple Tool</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            It makes sense, for me, and feels cleaner than simple indents. Adding <code className="px-1.5 py-0.5 bg-purple-50 text-artisan-purple rounded text-xs font-mono">.md</code> formatting and an interactive 3D shelf view brought this project from a simple tool into part of my daily workflow.
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        <p className="text-sm text-gray-600 leading-relaxed italic text-center pt-1">
          I hope you enjoy <strong className="text-artisan-purple not-italic">RIMICO</strong> as much as I do.
        </p>
      </div>

      {/* Signature */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-400">&mdash; Ravjoth</p>
      </div>
    </div>
  </div>
);

/* ── Onboarding Wizard ── */
const OnboardingModal = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [shelfCount, setShelfCount] = useState(4);
  const [shelves, setShelves] = useState(
    SUGGESTED_CATEGORIES.map(c => ({ ...c }))
  );

  // Keep shelves array in sync with count
  const updateCount = (n) => {
    setShelfCount(n);
    setShelves(prev => {
      if (n > prev.length) {
        const extra = [];
        for (let i = prev.length; i < n; i++) {
          extra.push({ name: '', accent: PRESET_COLORS[i % PRESET_COLORS.length] });
        }
        return [...prev, ...extra];
      }
      return prev.slice(0, n);
    });
  };

  const updateShelf = (idx, field, value) => {
    setShelves(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const canFinish = shelves.every(s => s.name.trim().length > 0);

  const handleFinish = () => {
    const cleaned = shelves.map(s => ({ name: s.name.trim(), accent: s.accent }));
    onFinish(cleaned);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {step === 0 ? (
          /* Step 1: Welcome + shelf count */
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">📚</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Welcome to Artisan Todo</h2>
            <p className="text-sm text-gray-500 mb-6">Your tasks, organized as books on a shelf. Let's set up your library.</p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">How many shelves do you need?</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => updateCount(n)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${shelfCount === n ? 'bg-artisan-purple text-white shadow-lg shadow-purple-300/40 scale-110' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >{n}</button>
                ))}
              </div>
            </div>

            <motion.button
              onClick={() => setStep(1)}
              className="w-full px-4 py-3 bg-artisan-purple text-white rounded-xl text-sm font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >Next: Name Your Shelves</motion.button>
          </div>
        ) : (
          /* Step 2: Name and color each shelf */
          <div className="p-6">
            <h2 className="text-lg font-extrabold text-gray-800 mb-1">Name your shelves</h2>
            <p className="text-xs text-gray-500 mb-4">Give each shelf a name and pick a colour.</p>

            <div className="space-y-2 mb-5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {shelves.map((shelf, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                  <input
                    type="color"
                    value={shelf.accent}
                    onChange={(e) => updateShelf(i, 'accent', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={shelf.name}
                    onChange={(e) => updateShelf(i, 'name', e.target.value)}
                    placeholder={SUGGESTED_CATEGORIES[i] ? SUGGESTED_CATEGORIES[i].name : `Shelf ${i + 1}`}
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-artisan-purple"
                  />
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: shelf.accent }} />
                </div>
              ))}
            </div>

            {/* Quick-fill from suggestions */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Quick fill:</span>
              <button
                onClick={() => setShelves(prev => prev.map((s, i) => ({ ...s, name: s.name || (SUGGESTED_CATEGORIES[i] ? SUGGESTED_CATEGORIES[i].name : s.name), accent: SUGGESTED_CATEGORIES[i] ? SUGGESTED_CATEGORIES[i].accent : s.accent })))}
                className="text-xs text-artisan-purple hover:text-artisan-purpleDark font-medium"
              >Use suggestions</button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Back</button>
              <motion.button
                onClick={handleFinish}
                disabled={!canFinish}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${canFinish ? 'bg-artisan-purple text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                whileHover={canFinish ? { scale: 1.02 } : {}}
                whileTap={canFinish ? { scale: 0.98 } : {}}
              >Create My Library</motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ── Main App ── */
const App = () => {
  const [tasks, setTasks] = useLocalStorage('artisan-todo-tasks', []);
  const [categories, setCategories] = useLocalStorage('artisan-todo-categories', DEFAULT_CATEGORIES);
  const [onboarded, setOnboarded] = useLocalStorage('artisan-todo-onboarded', false);
  const [activeView, setActiveView] = useState('library');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [flickeringId, setFlickeringId] = useState(null);
  const [view3D, setView3D] = useState(false);

  const handleOnboardingFinish = useCallback((newCats) => {
    setCategories(newCats);
    setOnboarded(true);
  }, [setCategories, setOnboarded]);

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
          <div className="flex items-center gap-1.5">
            <AttributionLink />
            <button onClick={() => setActiveView('why')} className={`attribution-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${activeView === 'why' ? 'bg-artisan-purple text-white border-artisan-purple' : 'bg-white/90 text-gray-600'}`}>
              <Icons.Question />Why?
            </button>
          </div>
          <div className="flex items-center gap-3">
            <a href="../" className="rimico-home-btn px-3.5 py-1.5 rounded-lg font-extrabold text-lg text-artisan-purple">
              RIMICO
            </a>
            <span className="text-artisan-purple/30 font-light text-lg select-none">/</span>
            <span onClick={goToLibrary} className="title-link font-bold text-lg text-artisan-purple cursor-pointer">
              The Artisan To-Do List for Readers
            </span>
          </div>
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
          ) : activeView === 'why' ? (
            <motion.div key="why" className="h-full bg-white/50 rounded-xl overflow-hidden border border-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WhyPage />
            </motion.div>
          ) : (
            <motion.div key="archive" className="h-full bg-white/50 rounded-xl overflow-hidden border border-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ArchiveView tasks={archivedTasks} onRestore={handleRestore} onDelete={handleDelete} categories={categories} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {!onboarded && <OnboardingModal onFinish={handleOnboardingFinish} />}
        {showAddModal && <AddTaskModal onClose={() => setShowAddModal(false)} onAdd={handleAddTask} categories={categories} />}
        {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onComplete={handleComplete} onDelete={handleDelete} onEdit={handleEditTask} categories={categories} />}
        {showCategoryManager && <CategoryManagerModal onClose={() => setShowCategoryManager(false)} categories={categories} onSave={setCategories} />}
      </AnimatePresence>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
