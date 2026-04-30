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

/* ── Main App ── */
const App = () => {
  const [lists, setLists] = useLocalStorage('rimico-tasks-lists', DEFAULT_LISTS);
  const [items, setItems] = useLocalStorage('rimico-tasks-items', []);
  const [completedOpen, setCompletedOpen] = useState(false);

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
      </div>

      {/* ── Hint bar ── */}
      <div className="hints">
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
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
