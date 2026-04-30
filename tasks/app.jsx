const { useState, useEffect, useRef, useCallback, useMemo } = React;

/* ── LocalStorage hook (stable setValue via functional updater) ── */
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

const DEFAULT_LIST_ID = 'default';
const DEFAULT_LISTS   = [{ id: DEFAULT_LIST_ID, name: 'Tasks' }];

/* ── Icons ── */
const CheckIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const UndoIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </svg>
);
const UserIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
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
    <div className="bullet-row" style={{ paddingLeft: `${depth * 28 + 6}px` }}>
      {/* Vertical indent guides */}
      {depth > 0 && Array.from({ length: depth }).map((_, i) => (
        <div key={i} className="indent-guide" style={{ left: `${i * 28 + 19}px` }} />
      ))}

      {/* Checkbox */}
      <button className="checkbox" onClick={handleCheck} type="button" aria-label="Complete task">
        <span className="checkbox-pip" />
      </button>

      {/* Editable text */}
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
          textDecorationColor: 'rgba(45,212,191,0.55)',
        }}
      />
    </div>
  );
});

/* ── Completed sidebar ── */
const CompletedSidebar = React.memo(function CompletedSidebar({ items, onRestore, onClear }) {
  return (
    <aside className="completed-sidebar">
      <div className="completed-header">
        <span className="completed-title">
          Done{items.length > 0 ? ` · ${items.length}` : ''}
        </span>
        {items.length > 0 && (
          <button className="clear-btn" onClick={onClear} title="Clear all completed">
            Clear
          </button>
        )}
      </div>

      <div className="completed-list custom-scrollbar">
        {items.length === 0 ? (
          <p className="empty-msg">Nothing yet</p>
        ) : (
          [...items].reverse().map(item => (
            <div key={item.id} className="completed-item">
              <div className="completed-check">
                <CheckIcon />
              </div>
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
    </aside>
  );
});

/* ── Main App ── */
const App = () => {
  const [lists, setLists] = useLocalStorage('rimico-tasks-lists', DEFAULT_LISTS);
  const [items, setItems] = useLocalStorage('rimico-tasks-items', []);

  const [activeListId, setActiveListId] = useState(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem('rimico-tasks-lists') || '[]');
      return stored[0]?.id || DEFAULT_LIST_ID;
    } catch (e) { return DEFAULT_LIST_ID; }
  });

  const [renamingId,   setRenamingId]   = useState(null);
  const [renameValue,  setRenameValue]  = useState('');
  const renameInputRef = useRef(null);

  /* Stable refs to avoid stale closures in event handlers */
  const refsMap         = useRef({});
  const itemsRef        = useRef(items);
  const activeListIdRef = useRef(activeListId);
  useEffect(() => { itemsRef.current        = items;        }, [items]);
  useEffect(() => { activeListIdRef.current = activeListId; }, [activeListId]);

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

  /* Derived data */
  const activeItems = useMemo(
    () => items.filter(i => i.listId === activeListId && !i.completed),
    [items, activeListId]
  );
  const completedItems = useMemo(
    () => items.filter(i => i.completed),
    [items]
  );

  /* Ensure at least one blank item exists in active list */
  useEffect(() => {
    setItems(prev => {
      const has = prev.some(i => i.listId === activeListId && !i.completed);
      if (has) return prev;
      return [...prev, {
        id: genId(), text: '', bold: false, underline: false,
        depth: 0, listId: activeListId, completed: false, completedAt: null,
      }];
    });
  }, [activeListId, setItems]);

  /* Auto-focus rename input when it appears */
  useEffect(() => {
    if (renamingId && renameInputRef.current) renameInputRef.current.select();
  }, [renamingId]);

  /* ── Handlers ── */
  const handleTextChange = useCallback((id, text) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, text } : i));
  }, [setItems]);

  const handleKeyDown = useCallback((e, itemId) => {
    const allItems = itemsRef.current;
    const listId   = activeListIdRef.current;
    const actives  = allItems.filter(i => i.listId === listId && !i.completed);
    const idx      = actives.findIndex(i => i.id === itemId);
    if (idx === -1) return;
    const item = actives[idx];

    if (e.key === 'Enter') {
      e.preventDefault();
      const newItem = {
        id: genId(), text: '', bold: false, underline: false,
        depth: item.depth, listId, completed: false, completedAt: null,
      };
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
      e.preventDefault();
      focusItem(actives[idx - 1].id);
      return;
    }

    if (e.key === 'ArrowDown' && idx < actives.length - 1) {
      e.preventDefault();
      focusItem(actives[idx + 1].id);
      return;
    }
  }, [setItems, focusItem]);

  const handleToggleComplete = useCallback((itemId) => {
    const actives = itemsRef.current.filter(
      i => i.listId === activeListIdRef.current && !i.completed
    );
    const idx = actives.findIndex(i => i.id === itemId);
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

  const handleAddItem = useCallback(() => {
    const listId = activeListIdRef.current;
    const newItem = {
      id: genId(), text: '', bold: false, underline: false,
      depth: 0, listId, completed: false, completedAt: null,
    };
    setItems(prev => [...prev, newItem]);
    focusItem(newItem.id);
  }, [setItems, focusItem]);

  /* List management */
  const handleAddList = useCallback(() => {
    const newList = { id: genId(), name: 'New list' };
    setLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
    setRenamingId(newList.id);
    setRenameValue('New list');
  }, [setLists]);

  const handleSelectList = useCallback((id) => setActiveListId(id), []);

  const handleDoubleClickTab = useCallback((id, name) => {
    setRenamingId(id);
    setRenameValue(name);
  }, []);

  const handleRenameSubmit = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && renamingId)
      setLists(prev => prev.map(l => l.id === renamingId ? { ...l, name: trimmed } : l));
    setRenamingId(null);
  }, [renamingId, renameValue, setLists]);

  const handleDeleteList = useCallback((e, id) => {
    e.stopPropagation();
    setLists(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(l => l.id !== id);
      if (activeListIdRef.current === id) setActiveListId(next[0].id);
      return next;
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

        {/* Main panel */}
        <main className="main">

          {/* List tabs */}
          <div className="tabs-bar">
            {lists.map(list => (
              <div key={list.id} className="tab-wrapper">
                {renamingId === list.id ? (
                  <input
                    ref={renameInputRef}
                    className="tab-rename-input"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  handleRenameSubmit();
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    style={{ width: `${Math.max(64, renameValue.length * 7.5 + 24)}px` }}
                  />
                ) : (
                  <button
                    className={`tab${activeListId === list.id ? ' tab-active' : ''}`}
                    onClick={() => handleSelectList(list.id)}
                    onDoubleClick={() => handleDoubleClickTab(list.id, list.name)}
                  >
                    {list.name}
                    {activeListId === list.id && lists.length > 1 && (
                      <span
                        className="tab-delete"
                        onClick={e => handleDeleteList(e, list.id)}
                        title="Delete list"
                      >
                        <TrashIcon />
                      </span>
                    )}
                  </button>
                )}
              </div>
            ))}
            <button className="tab-add" onClick={handleAddList} title="New list">
              <PlusIcon />
            </button>
          </div>

          {/* Items */}
          <div className="items-area custom-scrollbar">
            {activeItems.map(item => (
              <BulletItem
                key={item.id}
                itemId={item.id}
                text={item.text}
                bold={item.bold}
                underline={item.underline}
                depth={item.depth}
                onTextChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onToggleComplete={handleToggleComplete}
                setRef={setRef}
              />
            ))}

            <button className="add-row" onClick={handleAddItem}>
              <PlusIcon />
              <span>Add item</span>
            </button>
          </div>

          {/* Keyboard hint bar */}
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
            <span>Double-click tab to rename</span>
          </div>
        </main>

        {/* Completed sidebar */}
        <CompletedSidebar
          items={completedItems}
          onRestore={handleRestore}
          onClear={handleClear}
        />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
