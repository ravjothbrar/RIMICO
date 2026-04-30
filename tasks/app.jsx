const { useState, useEffect, useRef, useCallback, useMemo } = React;

/* ── LocalStorage hook ── */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch (e) { return initialValue; }
  });
  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      const v = typeof value === 'function' ? value(prev) : value;
      try { window.localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
      return v;
    });
  }, [key]);
  return [storedValue, setValue];
};

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const makeBlankItem = (listId) => ({
  id: genId(), text: '', bold: false, underline: false,
  depth: 0, listId, completed: false, completedAt: null,
});

const DEFAULT_LIST_ID = 'default';
const DEFAULT_LISTS   = [{ id: DEFAULT_LIST_ID, name: 'Tasks', color: GRAPH_COLORS[0] }];
const getListColor = (list, idx) => list.color || GRAPH_COLORS[idx % GRAPH_COLORS.length];

/* ── Icons ── */
const CheckIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const UndoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </svg>
);
const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const DragHandleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" />
  </svg>
);
const TimerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ExpandIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const CollapseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
    <line x1="10" y1="14" x2="3" y2="21" /><line x1="21" y1="3" x2="14" y2="10" />
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const GraphIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5"  cy="12" r="2" /><circle cx="19" cy="5"  r="2" />
    <circle cx="19" cy="19" r="2" /><circle cx="12" cy="12" r="2" />
    <line x1="7" y1="12" x2="10" y2="12" />
    <line x1="14" y1="12" x2="17.3" y2="6.7" />
    <line x1="14" y1="12" x2="17.3" y2="17.3" />
  </svg>
);

/* ── Graph constants & utilities ── */
const GRAPH_COLORS = [
  '#a78bfa','#34d399','#60a5fa','#f472b6',
  '#fb923c','#2dd4bf','#a3e635','#e879f9',
  '#f59e0b','#818cf8',
];
const STOPWORDS = new Set([
  'a','an','the','and','or','but','to','do','is','it','in','of',
  'for','at','by','with','on','i','my','be','as','this','that',
  'from','are','was','have','had','has','not','if','then','when',
  'we','you','get','got','can','will','just','up','out','so','its',
]);
const tokenize = t => t.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
const jaccardSim = (a, b) => {
  const sa = new Set(tokenize(a)), sb = new Set(tokenize(b));
  if (!sa.size || !sb.size) return 0;
  const inter = [...sa].filter(w => sb.has(w)).length;
  return inter / new Set([...sa, ...sb]).size;
};
const hexToRgb = h => {
  const n = parseInt(h.slice(1), 16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
};

/* ── BulletItem ── */
const BulletItem = React.memo(function BulletItem({
  itemId, text, bold, underline, depth,
  onTextChange, onKeyDown, onToggleComplete, setRef,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) setRef(itemId, inputRef.current);
    return () => setRef(itemId, null);
  }, [itemId, setRef]);

  const handleChange  = useCallback((e) => onTextChange(itemId, e.target.value), [itemId, onTextChange]);
  const handleKeyDown = useCallback((e) => onKeyDown(e, itemId),                 [itemId, onKeyDown]);
  const handleCheck   = useCallback(() => onToggleComplete(itemId),               [itemId, onToggleComplete]);

  return (
    <div className="bullet-row" style={{ paddingLeft: `${depth * 32 + 8}px` }}>
      {depth > 0 && Array.from({ length: depth }).map((_, i) => (
        <div key={i} className="indent-guide" style={{ left: `${i * 32 + 22}px` }} />
      ))}

      <button className="checkbox" onClick={handleCheck} type="button" aria-label="Complete task">
        <span className="checkbox-inner" />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="task-input"
        placeholder="·"
        autoComplete="off"
        spellCheck={false}
        style={{
          fontWeight: bold ? 700 : 400,
          textDecoration: underline ? 'underline' : 'none',
          textDecorationColor: 'rgba(167,139,250,0.55)',
        }}
      />
    </div>
  );
});

/* ── ListSection ── */
const ListSection = React.memo(function ListSection({
  list, items, showDelete, color, isDragOver,
  onRename, onDelete, onAddItem, onSetColor,
  onTextChange, onKeyDown, onToggleComplete, setRef,
  onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(list.name);
  const nameInputRef  = useRef(null);
  const colorInputRef = useRef(null);

  useEffect(() => { setNameVal(list.name); }, [list.name]);
  useEffect(() => {
    if (editing && nameInputRef.current) nameInputRef.current.select();
  }, [editing]);

  const submitRename = useCallback(() => {
    const t = nameVal.trim();
    if (t) onRename(list.id, t);
    else   setNameVal(list.name);
    setEditing(false);
  }, [nameVal, list.id, list.name, onRename]);

  return (
    <section
      className="list-section"
      style={{ '--lc': color }}
      draggable
      data-drag-over={isDragOver ? 'true' : 'false'}
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(list.id); }}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragOver(list.id); }}
      onDrop={e => { e.preventDefault(); onDrop(list.id); }}
      onDragEnd={onDragEnd}
    >
      <div className="list-header group">
        {/* Drag handle */}
        <span className="drag-handle"><DragHandleIcon /></span>

        {editing ? (
          <input
            ref={nameInputRef}
            className="list-name-input"
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={submitRename}
            onKeyDown={e => {
              if (e.key === 'Enter')  submitRename();
              if (e.key === 'Escape') { setNameVal(list.name); setEditing(false); }
            }}
          />
        ) : (
          <h2
            className="list-name"
            onClick={() => setEditing(true)}
            style={{ color }}
            title="Click to rename"
          >
            {list.name}
          </h2>
        )}

        {/* Color swatch */}
        {!editing && (
          <>
            <button
              className="list-color-btn"
              style={{ background: color }}
              onClick={() => colorInputRef.current && colorInputRef.current.click()}
              title="Change section colour"
            />
            <input
              ref={colorInputRef}
              type="color"
              value={color}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
              onChange={e => onSetColor(list.id, e.target.value)}
            />
          </>
        )}

        {showDelete && !editing && (
          <button
            className="list-delete-btn"
            onClick={() => onDelete(list.id)}
            title="Delete list"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className="list-items">
        {items.map(item => (
          <BulletItem
            key={item.id}
            itemId={item.id}
            text={item.text}
            bold={item.bold}
            underline={item.underline}
            depth={item.depth}
            onTextChange={onTextChange}
            onKeyDown={onKeyDown}
            onToggleComplete={onToggleComplete}
            setRef={setRef}
          />
        ))}
      </div>

      <button className="add-item-btn" onClick={() => onAddItem(list.id)}>
        <PlusIcon />
        <span>Add item</span>
      </button>
    </section>
  );
});

/* ── Completed sidebar ── */
const CompletedSidebar = React.memo(function CompletedSidebar({ open, items, onRestore, onClear }) {
  return (
    <aside className={`completed-sidebar${open ? ' open' : ''}`}>
      <div className="completed-inner">
        <div className="completed-header">
          <span className="completed-title">
            Completed{items.length > 0 ? ` · ${items.length}` : ''}
          </span>
          {items.length > 0 && (
            <button className="clear-btn" onClick={onClear}>Clear all</button>
          )}
        </div>

        <div className="completed-list custom-scrollbar">
          {items.length === 0 ? (
            <p className="empty-msg">Nothing here yet</p>
          ) : (
            [...items].reverse().map(item => (
              <div key={item.id} className="completed-item">
                <div className="completed-check"><CheckIcon /></div>
                <span
                  className="completed-text"
                  style={{ fontWeight: item.bold ? 700 : 400 }}
                  title={item.text || ''}
                >
                  {item.text || <em>empty</em>}
                </span>
                <button
                  className="restore-btn"
                  onClick={() => onRestore(item.id)}
                  title="Restore"
                >
                  <UndoIcon />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
});

/* ── GraphView (canvas + D3 force) ── */
const GraphView = ({ lists, items }) => {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const itemMapRef   = useRef({});
  useEffect(() => {
    itemMapRef.current = Object.fromEntries(items.map(i => [i.id, i]));
  }, [items]);

  const colorMap = useMemo(() => {
    const m = {};
    lists.forEach((l, i) => { m[l.id] = getListColor(l, i); });
    return m;
  }, [lists]);

  useEffect(() => {
    if (typeof d3 === 'undefined') return;
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const W = container.clientWidth, H = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const active = items.filter(i => !i.completed && i.text.trim());

    // Empty state
    if (!active.length) {
      ctx.fillStyle = '#07070d';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '16px Inter,sans-serif';
      ctx.fillStyle = 'rgba(167,139,250,0.3)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Add tasks to see the graph', W/2, H/2);
      return;
    }

    // List cluster centres
    const cx = W/2, cy = H/2;
    const cr = Math.min(W, H) * (lists.length === 1 ? 0 : 0.27);
    const listCenters = {};
    lists.forEach((l, i) => {
      const a = (i / lists.length) * Math.PI * 2 - Math.PI / 2;
      listCenters[l.id] = { x: cx + Math.cos(a)*cr, y: cy + Math.sin(a)*cr };
    });

    // Nodes
    const simNodes = active.map(item => {
      const c = listCenters[item.listId] || { x: cx, y: cy };
      return { id: item.id, listId: item.listId,
        color: colorMap[item.listId] || '#a78bfa',
        x: c.x + (Math.random()-.5)*70, y: c.y + (Math.random()-.5)*70, vx:0, vy:0 };
    });
    const nodeMap = Object.fromEntries(simNodes.map(n => [n.id, n]));

    // Edges
    const linkData = [];
    lists.forEach(list => {
      const ln = simNodes.filter(n => n.listId === list.id);
      for (let i = 0; i < ln.length - 1; i++)
        linkData.push({ source: ln[i].id, target: ln[i+1].id, type: 'chain', strength: 0.35 });
    });
    for (let i = 0; i < active.length; i++) {
      for (let j = i+1; j < active.length; j++) {
        if (active[i].listId === active[j].listId) continue;
        const sim = jaccardSim(active[i].text, active[j].text);
        if (sim > 0.08) linkData.push({
          source: active[i].id, target: active[j].id,
          type: 'sim', strength: sim * 0.55,
          cd: Math.random() > .5 ? 1 : -1,
        });
      }
    }

    // Transform & hover state
    const tr = { x:0, y:0, k:1 };
    let hov = null, drag = false, ds = null;

    // D3 simulation
    const sim = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink(linkData.map(e=>({...e})))
        .id(d => d.id).strength(d => d.strength)
        .distance(d => d.type === 'sim' ? 155 : 68))
      .force('charge', d3.forceManyBody().strength(-190))
      .force('collide', d3.forceCollide(22))
      .force('cluster', alpha => {
        simNodes.forEach(n => {
          const c = listCenters[n.listId]; if (!c) return;
          n.vx -= (n.x - c.x) * 0.045 * alpha;
          n.vy -= (n.y - c.y) * 0.045 * alpha;
        });
      })
      .velocityDecay(0.35).alphaDecay(0.028)
      .on('tick', render);

    function rr(c,x,y,w,h,r) {
      c.beginPath(); c.moveTo(x+r,y); c.lineTo(x+w-r,y);
      c.arcTo(x+w,y,x+w,y+r,r); c.lineTo(x+w,y+h-r);
      c.arcTo(x+w,y+h,x+w-r,y+h,r); c.lineTo(x+r,y+h);
      c.arcTo(x,y+h,x,y+h-r,r); c.lineTo(x,y+r);
      c.arcTo(x,y,x+r,y,r); c.closePath();
    }

    function render() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#07070d'; ctx.fillRect(0,0,W,H);

      // Dot grid
      const gs = 28*tr.k;
      const ox = ((tr.x%gs)+gs)%gs, oy = ((tr.y%gs)+gs)%gs;
      ctx.fillStyle = 'rgba(167,139,250,0.045)';
      for (let gx=ox; gx<W; gx+=gs)
        for (let gy=oy; gy<H; gy+=gs) {
          ctx.beginPath(); ctx.arc(gx,gy,1.1,0,Math.PI*2); ctx.fill();
        }

      ctx.save(); ctx.translate(tr.x,tr.y); ctx.scale(tr.k,tr.k);

      // Halos
      Object.entries(listCenters).forEach(([lid,c]) => {
        const rgb = hexToRgb(colorMap[lid]||'#a78bfa');
        const g = ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,115);
        g.addColorStop(0,`rgba(${rgb},.11)`); g.addColorStop(.6,`rgba(${rgb},.04)`); g.addColorStop(1,`rgba(${rgb},0)`);
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(c.x,c.y,115,0,Math.PI*2); ctx.fill();
      });

      // Edges
      linkData.forEach(e => {
        const s = typeof e.source==='object'?e.source:nodeMap[e.source];
        const t = typeof e.target==='object'?e.target:nodeMap[e.target];
        if (!s||!t||isNaN(s.x)||isNaN(t.x)) return;
        ctx.beginPath();
        if (e.type==='sim') {
          const dx=t.x-s.x, dy=t.y-s.y, len=Math.sqrt(dx*dx+dy*dy)||1, p=28*(e.cd||1);
          ctx.moveTo(s.x,s.y);
          ctx.quadraticCurveTo((s.x+t.x)/2-(dy/len)*p,(s.y+t.y)/2+(dx/len)*p,t.x,t.y);
          const sg=ctx.createLinearGradient(s.x,s.y,t.x,t.y);
          sg.addColorStop(0,`rgba(${hexToRgb(s.color)},${e.strength*.8})`);
          sg.addColorStop(1,`rgba(${hexToRgb(t.color)},${e.strength*.8})`);
          ctx.strokeStyle=sg; ctx.lineWidth=1+e.strength*1.5;
        } else {
          ctx.moveTo(s.x,s.y); ctx.lineTo(t.x,t.y);
          ctx.strokeStyle=`rgba(${hexToRgb(s.color)},.15)`; ctx.lineWidth=.85;
        }
        ctx.stroke();
      });

      // Nodes
      simNodes.forEach(n => {
        if (isNaN(n.x)||isNaN(n.y)) return;
        const isH = hov===n.id, r = isH?9:7, rgb=hexToRgb(n.color);
        const gl=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*4);
        gl.addColorStop(0,`rgba(${rgb},.28)`); gl.addColorStop(1,`rgba(${rgb},0)`);
        ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(n.x,n.y,r*4,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=isH?20:12; ctx.shadowColor=n.color;
        ctx.fillStyle=n.color; ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,255,.42)';
        ctx.beginPath(); ctx.arc(n.x-r*.28,n.y-r*.3,r*.3,0,Math.PI*2); ctx.fill();
        if (isH) {
          const item = itemMapRef.current[n.id];
          const lbl = item ? (item.text.length>38?item.text.slice(0,38)+'…':item.text) : '';
          if (lbl) {
            ctx.font='13px Inter,sans-serif';
            const tw=ctx.measureText(lbl).width, pd=9, bh=24, br=6;
            const bx=n.x-tw/2-pd, by=n.y-r-bh-8;
            ctx.fillStyle='rgba(10,7,22,.92)'; rr(ctx,bx,by,tw+pd*2,bh,br); ctx.fill();
            ctx.strokeStyle=`rgba(${rgb},.45)`; ctx.lineWidth=1; rr(ctx,bx,by,tw+pd*2,bh,br); ctx.stroke();
            ctx.fillStyle=n.color; ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText(lbl,n.x,by+bh/2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
          }
        }
      });
      ctx.restore();
    }

    // Interactions
    const getW = (cx,cy) => { const rc=canvas.getBoundingClientRect();
      return { x:(cx-rc.left-tr.x)/tr.k, y:(cy-rc.top-tr.y)/tr.k }; };
    const hit = (wx,wy) => { for (const n of simNodes) { if (isNaN(n.x)) continue;
      const dx=wx-n.x,dy=wy-n.y; if (dx*dx+dy*dy<144) return n.id; } return null; };

    const onMM = e => {
      const rc=canvas.getBoundingClientRect(), mx=e.clientX-rc.left, my=e.clientY-rc.top;
      if (drag) { tr.x+=mx-ds.x; tr.y+=my-ds.y; ds={x:mx,y:my}; render(); return; }
      const {x:wx,y:wy}=getW(e.clientX,e.clientY), h=hit(wx,wy);
      if (h!==hov) { hov=h; canvas.style.cursor=h?'pointer':'grab'; render(); }
    };
    const onMD = e => { if (e.button) return;
      const rc=canvas.getBoundingClientRect(); drag=true;
      ds={x:e.clientX-rc.left,y:e.clientY-rc.top}; canvas.style.cursor='grabbing'; };
    const onMU = () => { drag=false; canvas.style.cursor=hov?'pointer':'grab'; };
    const onWH = e => {
      e.preventDefault(); const rc=canvas.getBoundingClientRect();
      const mx=e.clientX-rc.left, my=e.clientY-rc.top;
      const f=e.deltaY>0?.88:1.13, nk=Math.max(.15,Math.min(6,tr.k*f));
      tr.x=mx-(mx-tr.x)*(nk/tr.k); tr.y=my-(my-tr.y)*(nk/tr.k); tr.k=nk; render();
    };
    canvas.addEventListener('mousemove',onMM); canvas.addEventListener('mousedown',onMD);
    canvas.addEventListener('mouseup',onMU);   canvas.addEventListener('mouseleave',onMU);
    canvas.addEventListener('wheel',onWH,{passive:false});
    canvas.style.cursor='grab'; render();

    return () => {
      sim.stop();
      canvas.removeEventListener('mousemove',onMM); canvas.removeEventListener('mousedown',onMD);
      canvas.removeEventListener('mouseup',onMU);   canvas.removeEventListener('mouseleave',onMU);
      canvas.removeEventListener('wheel',onWH);
    };
  }, []); // snapshot on mount — re-open graph to refresh

  return (
    <div ref={containerRef} className="graph-container">
      <canvas ref={canvasRef} />
      <div className="graph-legend">
        {lists.map((l,i) => (
          <div key={l.id} className="graph-legend-item">
            <span className="graph-legend-dot" style={{ background: GRAPH_COLORS[i % GRAPH_COLORS.length] }} />
            <span>{l.name}</span>
          </div>
        ))}
      </div>
      <div className="graph-hint">Scroll to zoom · Drag to pan · Hover nodes to see task</div>
    </div>
  );
};

/* ── Study Timer ── */
const suggestBreak = m => m <= 15 ? 3 : m <= 30 ? 5 : m <= 60 ? 10 : m <= 90 ? 15 : 20;

const StudyTimer = ({ expanded, onToggleExpand, onClose }) => {
  const [inputVal, setInputVal]   = useState('25');
  const [totalSecs, setTotalSecs] = useState(25 * 60);
  const [secsLeft, setSecsLeft]   = useState(25 * 60);
  const [running, setRunning]     = useState(false);
  const [phase, setPhase]         = useState('idle'); // idle|work|breakSuggest|break|done
  const [workMins, setWorkMins]   = useState(25);
  const phaseRef = useRef('idle');

  const syncPhase = p => { phaseRef.current = p; setPhase(p); };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecsLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setTimeout(() => {
            setRunning(false);
            if (phaseRef.current === 'work')  syncPhase('breakSuggest');
            else if (phaseRef.current === 'break') syncPhase('done');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const applyTime = () => {
    const m = Math.max(1, Math.min(180, parseInt(inputVal, 10) || 25));
    const s = m * 60;
    setInputVal(String(m));
    setTotalSecs(s); setSecsLeft(s); setWorkMins(m);
    setRunning(false); syncPhase('idle');
  };

  const handleStart     = () => { syncPhase('work'); setRunning(true); };
  const handlePause     = () => setRunning(false);
  const handleReset     = () => { setRunning(false); setSecsLeft(totalSecs); syncPhase('idle'); };
  const handleTakeBreak = () => {
    const bs = suggestBreak(workMins) * 60;
    setTotalSecs(bs); setSecsLeft(bs); syncPhase('break'); setRunning(true);
  };
  const handleSkipBreak = () => { setSecsLeft(workMins * 60); setTotalSecs(workMins * 60); syncPhase('idle'); setRunning(false); };
  const handleNewSession = handleSkipBreak;

  const mm  = String(Math.floor(secsLeft / 60)).padStart(2, '0');
  const ss  = String(secsLeft % 60).padStart(2, '0');
  const R   = 76, circ = +(2 * Math.PI * R).toFixed(2);
  const pct = totalSecs > 0 ? (totalSecs - secsLeft) / totalSecs : 0;
  const off = +(circ * (1 - pct)).toFixed(2);
  const isBreak = phase === 'break';
  const ringColor = isBreak ? '#34d399' : '#a78bfa';

  const phaseLabel =
    phase === 'work'  ? 'Focus' : phase === 'break' ? 'Break' :
    phase === 'done'  ? 'Done!' : 'Ready';

  return (
    <div className={`timer-panel${expanded ? ' expanded' : ''}`}>
      <div className="timer-close-row">
        <span className="timer-phase-label">{phaseLabel}</span>
        <div style={{ display:'flex', gap:'3px' }}>
          <button className="timer-icon-btn" onClick={onToggleExpand} title={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
          <button className="timer-icon-btn" onClick={onClose} title="Close timer"><XIcon /></button>
        </div>
      </div>

      <div className="timer-inner">
        {/* Ring */}
        <div className="timer-ring-wrap">
          <svg className="timer-ring-svg" width="190" height="190" viewBox="0 0 190 190">
            <circle className="timer-ring-bg"   cx="95" cy="95" r={R} strokeWidth="6" />
            <circle className="timer-ring-fill" cx="95" cy="95" r={R} strokeWidth="6"
              stroke={ringColor}
              strokeDasharray={`${circ}`}
              strokeDashoffset={`${off}`}
            />
          </svg>
          <span className="timer-display">{mm}:{ss}</span>
        </div>

        {/* Break suggestion */}
        {phase === 'breakSuggest' && (
          <div className="timer-break-box">
            <div className="timer-break-title">Session complete!</div>
            <div className="timer-break-sub">
              You focused for {workMins} min.<br />
              Take a {suggestBreak(workMins)}-minute break?
            </div>
            <div className="timer-controls">
              <button className="timer-ctrl-btn primary" onClick={handleTakeBreak}>
                Break · {suggestBreak(workMins)}min
              </button>
              <button className="timer-ctrl-btn secondary" onClick={handleSkipBreak}>Skip</button>
            </div>
          </div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div className="timer-break-box">
            <div className="timer-break-title">Break over!</div>
            <div className="timer-break-sub">Ready for the next session?</div>
            <div className="timer-controls">
              <button className="timer-ctrl-btn primary" onClick={handleNewSession}>New session</button>
            </div>
          </div>
        )}

        {/* Work / idle / break controls */}
        {(phase === 'idle' || phase === 'work' || phase === 'break') && (
          <>
            {phase !== 'break' && (
              <div className="timer-input-row">
                <input
                  type="number" min="1" max="180"
                  className="timer-mins-input"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onBlur={applyTime}
                  onKeyDown={e => e.key === 'Enter' && applyTime()}
                  disabled={running}
                />
                <span className="timer-mins-label">min</span>
                {!running && phase === 'idle' && (
                  <button className="timer-set-btn" onClick={applyTime}>Set</button>
                )}
              </div>
            )}
            <div className="timer-controls">
              {!running
                ? <button className="timer-ctrl-btn primary" onClick={handleStart} disabled={secsLeft === 0}>
                    {phase === 'idle' ? 'Start' : 'Resume'}
                  </button>
                : <button className="timer-ctrl-btn primary" onClick={handlePause}>Pause</button>
              }
              <button className="timer-ctrl-btn secondary" onClick={handleReset}>Reset</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Main App ── */
const App = () => {
  const [lists, setLists] = useLocalStorage('rimico-tasks-lists', DEFAULT_LISTS);
  const [items, setItems] = useLocalStorage('rimico-tasks-items', []);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [graphView, setGraphView] = useState(false);
  const [timerOpen, setTimerOpen]         = useState(false);
  const [timerExpanded, setTimerExpanded] = useState(false);
  const [dragId, setDragId]               = useState(null);
  const [dragOverId, setDragOverId]       = useState(null);

  const refsMap  = useRef({});
  const itemsRef = useRef(items);
  const listsRef = useRef(lists);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { listsRef.current = lists; }, [lists]);

  const setRef = useCallback((id, el) => {
    if (el) refsMap.current[id] = el;
    else    delete refsMap.current[id];
  }, []);

  const focusItem = useCallback((id) => {
    setTimeout(() => {
      const el = refsMap.current[id];
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }, 0);
  }, []);

  /* On mount: ensure every existing list has at least one blank item */
  useEffect(() => {
    setItems(prev => {
      const updated = [...prev];
      let changed = false;
      listsRef.current.forEach(list => {
        if (!updated.some(i => i.listId === list.id && !i.completed)) {
          updated.push(makeBlankItem(list.id));
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [setItems]); // stable dep — runs once

  /* Derived */
  const completedItems = useMemo(() => items.filter(i => i.completed), [items]);

  const itemsByList = useMemo(() => {
    const map = {};
    lists.forEach(l => { map[l.id] = []; });
    items.forEach(item => {
      if (!item.completed && map[item.listId]) map[item.listId].push(item);
    });
    return map;
  }, [lists, items]);

  /* ── Handlers ── */
  const handleTextChange = useCallback((id, text) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, text } : i));
  }, [setItems]);

  const handleKeyDown = useCallback((e, itemId) => {
    const allItems = itemsRef.current;
    const item     = allItems.find(i => i.id === itemId);
    if (!item) return;
    const { listId } = item;
    const actives  = allItems.filter(i => i.listId === listId && !i.completed);
    const idx      = actives.findIndex(i => i.id === itemId);
    if (idx === -1) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const newItem = { ...makeBlankItem(listId), depth: item.depth };
      setItems(prev => {
        const gi   = prev.findIndex(i => i.id === itemId);
        const next = [...prev];
        next.splice(gi + 1, 0, newItem);
        return next;
      });
      focusItem(newItem.id);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (item.depth > 0)
          setItems(prev => prev.map(i => i.id === itemId ? { ...i, depth: i.depth - 1 } : i));
      } else {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, depth: i.depth + 1 } : i));
      }
      focusItem(itemId);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, bold: !i.bold } : i));
      focusItem(itemId);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, underline: !i.underline } : i));
      focusItem(itemId);
      return;
    }

    if (e.key === 'Backspace' && item.text === '') {
      e.preventDefault();
      if (actives.length <= 1) return;
      setItems(prev => prev.filter(i => i.id !== itemId));
      const target = idx > 0 ? actives[idx - 1] : actives[1];
      if (target) focusItem(target.id);
      return;
    }

    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault(); focusItem(actives[idx - 1].id); return;
    }
    if (e.key === 'ArrowDown' && idx < actives.length - 1) {
      e.preventDefault(); focusItem(actives[idx + 1].id); return;
    }
  }, [setItems, focusItem]);

  const handleToggleComplete = useCallback((itemId) => {
    const item = itemsRef.current.find(i => i.id === itemId);
    if (!item) return;
    const actives = itemsRef.current.filter(i => i.listId === item.listId && !i.completed);
    const idx     = actives.findIndex(i => i.id === itemId);
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, completed: true, completedAt: new Date().toISOString() } : i
    ));
    if (actives.length > 1) {
      const next = actives[idx < actives.length - 1 ? idx + 1 : idx - 1];
      if (next) focusItem(next.id);
    }
  }, [setItems, focusItem]);

  const handleRestore = useCallback((id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, completed: false, completedAt: null } : i));
  }, [setItems]);

  const handleClear = useCallback(() => {
    setItems(prev => prev.filter(i => !i.completed));
  }, [setItems]);

  const handleAddItem = useCallback((listId) => {
    const newItem = makeBlankItem(listId);
    setItems(prev => [...prev, newItem]);
    focusItem(newItem.id);
  }, [setItems, focusItem]);

  const handleAddList = useCallback(() => {
    const newListId = genId();
    const newItem   = makeBlankItem(newListId);
    setLists(prev => {
      const color = GRAPH_COLORS[prev.length % GRAPH_COLORS.length];
      return [...prev, { id: newListId, name: 'New list', color }];
    });
    setItems(prev => [...prev, newItem]);
  }, [setLists, setItems]);

  const handleRenameList = useCallback((id, name) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, name } : l));
  }, [setLists]);

  const handleDeleteList = useCallback((id) => {
    setLists(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(l => l.id !== id);
    });
    setItems(prev => prev.filter(i => i.listId !== id));
  }, [setLists, setItems]);

  const handleSetListColor = useCallback((id, color) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, color } : l));
  }, [setLists]);

  const handleDragStart = useCallback((id) => setDragId(id), []);
  const handleDragOver  = useCallback((id) => setDragOverId(id), []);
  const dragIdRef = useRef(null);
  useEffect(() => { dragIdRef.current = dragId; }, [dragId]);

  const handleDrop = useCallback((targetId) => {
    const srcId = dragIdRef.current;
    if (srcId && srcId !== targetId) {
      setLists(prev => {
        const from = prev.findIndex(l => l.id === srcId);
        const to   = prev.findIndex(l => l.id === targetId);
        if (from === -1 || to === -1) return prev;
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
    }
    setDragId(null);
    setDragOverId(null);
  }, [setLists]);
  const handleDragEnd = useCallback(() => { setDragId(null); setDragOverId(null); }, []);

  return (
    <div className="root">

      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <a href="../" className="rimico-link">RIMICO</a>
          <span className="header-sep">/</span>
          <span className="header-title">Tasks</span>
        </div>
        <div className="header-right">
          <button
            className={`timer-toggle${timerOpen ? ' timer-toggle-active' : ''}`}
            onClick={() => { setTimerOpen(v => !v); if (timerOpen) setTimerExpanded(false); }}
            title="Study timer"
          >
            <TimerIcon />
            Timer
          </button>
          <button
            className={`graph-toggle${graphView ? ' graph-toggle-active' : ''}`}
            onClick={() => setGraphView(v => !v)}
            title="Toggle graph view"
          >
            <GraphIcon />
            Graph
          </button>
          <button
            className={`done-toggle${completedOpen ? ' done-toggle-active' : ''}`}
            onClick={() => setCompletedOpen(v => !v)}
          >
            <CheckIcon />
            Done{completedItems.length > 0 ? ` · ${completedItems.length}` : ''}
          </button>
          <a
            href="https://ravjothbrar.com"
            target="_blank"
            rel="noopener noreferrer"
            className="attr-link"
          >
            <UserIcon />
            Ravjoth
          </a>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="body">
        {timerOpen && (
          <StudyTimer
            expanded={timerExpanded}
            onToggleExpand={() => setTimerExpanded(v => !v)}
            onClose={() => { setTimerOpen(false); setTimerExpanded(false); }}
          />
        )}

        {(!timerOpen || !timerExpanded) && (
          graphView ? (
            <GraphView lists={lists} items={items} />
          ) : (
            <div className="task-area">
              <main className="main custom-scrollbar">
                {lists.map((list, idx) => (
                  <ListSection
                    key={list.id}
                    list={list}
                    items={itemsByList[list.id] || []}
                    showDelete={lists.length > 1}
                    color={getListColor(list, idx)}
                    isDragOver={dragOverId === list.id}
                    onRename={handleRenameList}
                    onDelete={handleDeleteList}
                    onAddItem={handleAddItem}
                    onSetColor={handleSetListColor}
                    onTextChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    onToggleComplete={handleToggleComplete}
                    setRef={setRef}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                  />
                ))}

                <button className="new-list-btn" onClick={handleAddList}>
                  <PlusIcon />
                  New list
                </button>
              </main>

              <CompletedSidebar
                open={completedOpen}
                items={completedItems}
                onRestore={handleRestore}
                onClear={handleClear}
              />
            </div>
          )
        )}
      </div>

      {/* ── Hint bar ── */}
      {!graphView && <div className="hints">
        <span>Enter new bullet</span>
        <span className="hint-sep">·</span>
        <span>Tab indent</span>
        <span className="hint-sep">·</span>
        <span>Shift+Tab outdent</span>
        <span className="hint-sep">·</span>
        <span>Ctrl+B bold</span>
        <span className="hint-sep">·</span>
        <span>Ctrl+U underline</span>
        <span className="hint-sep">·</span>
        <span>Click list name to rename</span>
      </div>}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
