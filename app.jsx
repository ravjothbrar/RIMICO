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

/* ── Icons (static, never re-render) ── */
const Icons = {
  Plus:     () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Archive:  () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  Book:     () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Check:    () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X:        () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Calendar: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Trash:    () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Restore:  () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>,
  User:     () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Settings: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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

        {/* Title on spine — the key fix: proper vertical layout */}
        <div
          className="vertical-text absolute inset-0 flex items-center justify-center px-1 py-10"
          style={{ color: 'rgba(255,255,255,0.95)' }}
        >
          <span className="font-bold text-xs tracking-wider leading-tight" style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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

/* ── Shelf Quadrant ── */
const ShelfQuadrant = ({ label, tasks, onBookClick, onComplete, flickeringId, shelfColors }) => {
  const colors = shelfColors || { accent: '#8B5CF6' };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-1 px-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />
        <h3 className="text-sm font-bold text-artisan-purple">{label}</h3>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>
      <div className="flex-1 relative">
        <div className="custom-scrollbar overflow-x-auto h-full">
          <div className="flex items-stretch h-[calc(100%-20px)] px-2 pt-2">
            <AnimatePresence mode="popLayout">
              {tasks.length === 0 ? (
                <div className="text-xs text-gray-400 italic px-2 self-center">Empty shelf...</div>
              ) : (
                tasks.map((task) => (
                  <BookSpine key={task.id} task={task} onClick={() => onBookClick(task)} onComplete={onComplete} isFlickering={flickeringId === task.id} shelfColors={colors} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="shelf absolute bottom-0 left-1 right-1 h-5 rounded-b-sm" />
      </div>
    </div>
  );
};

/* ── Page Spread Modal (task detail) ── */
const PageSpreadModal = ({ task, onClose, onComplete, onDelete, categories }) => {
  const cat = (categories || []).find(c => c.name === task.label);
  const shelfColor = cat || { accent: '#8B5CF6' };
  const formatDate = (ds) => ds ? new Date(ds).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'No due date';

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="page-spread relative w-full max-w-lg rounded-xl overflow-hidden" initial={{ scale: 0.9, rotateY: -45 }} animate={{ scale: 1, rotateY: 0 }} exit={{ scale: 0.9, rotateY: 45 }} transition={{ type: "spring", stiffness: 250, damping: 25 }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center z-10"><Icons.X /></button>
        <div className="p-6">
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
            <motion.button className="flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { onDelete(task.id); onClose(); }}><Icons.Trash /></motion.button>
          </div>
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
          <form onSubmit={handleSubmit} className="space-y-3">
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
            <motion.button type="submit" className="w-full px-4 py-2.5 bg-artisan-purple text-white rounded-lg text-sm font-semibold hover:bg-artisan-purpleDark" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Add to Library</motion.button>
          </form>
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
            <motion.div key="library" className={needsScroll ? 'h-full overflow-y-auto custom-scrollbar' : 'h-full'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={gridStyle}>
                {categories.map((cat) => (
                  <div key={cat.name} className="bg-white/50 rounded-xl p-2 overflow-hidden border border-white/60" style={needsScroll ? { minHeight: '200px' } : {}}>
                    <ShelfQuadrant label={cat.name} tasks={tasksByLabel[cat.name] || []} onBookClick={setSelectedTask} onComplete={handleComplete} flickeringId={flickeringId} shelfColors={cat} />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="archive" className="h-full bg-white/50 rounded-xl overflow-hidden border border-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ArchiveView tasks={archivedTasks} onRestore={handleRestore} onDelete={handleDelete} categories={categories} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showAddModal && <AddTaskModal onClose={() => setShowAddModal(false)} onAdd={handleAddTask} categories={categories} />}
        {selectedTask && <PageSpreadModal task={selectedTask} onClose={() => setSelectedTask(null)} onComplete={handleComplete} onDelete={handleDelete} categories={categories} />}
        {showCategoryManager && <CategoryManagerModal onClose={() => setShowCategoryManager(false)} categories={categories} onSave={setCategories} />}
      </AnimatePresence>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
