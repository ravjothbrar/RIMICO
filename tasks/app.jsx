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
const DEFAULT_LISTS   = [{ id: DEFAULT_LIST_ID, name: 'Tasks' }];

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
  list, items, showDelete,
  onRename, onDelete, onAddItem,
  onTextChange, onKeyDown, onToggleComplete, setRef,
}) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(list.name);
  const nameInputRef = useRef(null);

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
    <section className="list-section">
      <div className="list-header group">
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
            title="Click to rename"
          >
            {list.name}
          </h2>
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
    lists.forEach((l, i) => { m[l.id] = GRAPH_COLORS[i % GRAPH_COLORS.length]; });
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

/* ── Main App ── */
const App = () => {
  const [lists, setLists] = useLocalStorage('rimico-tasks-lists', DEFAULT_LISTS);
  const [items, setItems] = useLocalStorage('rimico-tasks-items', []);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [graphView, setGraphView] = useState(false);

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
    setLists(prev => [...prev, { id: newListId, name: 'New list' }]);
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
        {graphView ? (
          <GraphView lists={lists} items={items} />
        ) : (
          <>
            {/* Scrollable lists area */}
            <main className="main custom-scrollbar">
              {lists.map(list => (
                <ListSection
                  key={list.id}
                  list={list}
                  items={itemsByList[list.id] || []}
                  showDelete={lists.length > 1}
                  onRename={handleRenameList}
                  onDelete={handleDeleteList}
                  onAddItem={handleAddItem}
                  onTextChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  onToggleComplete={handleToggleComplete}
                  setRef={setRef}
                />
              ))}

              <button className="new-list-btn" onClick={handleAddList}>
                <PlusIcon />
                New list
              </button>
            </main>

            {/* Collapsible completed sidebar */}
            <CompletedSidebar
              open={completedOpen}
              items={completedItems}
              onRestore={handleRestore}
              onClear={handleClear}
            />
          </>
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
