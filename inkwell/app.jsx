const { useState, useEffect, useRef, useCallback, useMemo } = React;

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
const FONTS = [
  { name: 'Aptos', family: "'Aptos', 'Segoe UI', 'Helvetica Neue', sans-serif" },
  { name: 'Calibri', family: "'Calibri', 'Gill Sans', sans-serif" },
  { name: 'Times New Roman', family: "'Times New Roman', Georgia, serif" },
  { name: 'Georgia', family: "Georgia, 'Times New Roman', serif" },
  { name: 'Arial', family: "Arial, Helvetica, sans-serif" },
];

/* ── Icons ── */
const Icons = {
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Bold: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
    </svg>
  ),
  Italic: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
    </svg>
  ),
  Underline: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
    </svg>
  ),
  BulletList: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12" />
    </svg>
  ),
  NumberedList: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  User: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Pen: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Question: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Quote: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </svg>
  ),
};

/* ── Utility: strip HTML to plain text ── */
const stripHtml = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/* ── Utility: HTML to Markdown for export ── */
const htmlToMarkdown = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const convert = (node) => {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return '';

    const tag = node.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map(convert).join('');

    switch (tag) {
      case 'b': case 'strong': return `**${children.trim()}**`;
      case 'i': case 'em': return `*${children.trim()}*`;
      case 'u': return children;
      case 'h1': return `# ${children.trim()}\n\n`;
      case 'h2': return `## ${children.trim()}\n\n`;
      case 'h3': return `### ${children.trim()}\n\n`;
      case 'p': return children.trim() ? `${children}\n\n` : '\n';
      case 'div': return children.trim() ? `${children}\n` : '\n';
      case 'br': return '\n';
      case 'ul': return `${children}\n`;
      case 'ol': return `${children}\n`;
      case 'li': {
        const parent = node.parentElement ? node.parentElement.tagName.toLowerCase() : '';
        if (parent === 'ol') {
          const idx = Array.from(node.parentElement.children).indexOf(node) + 1;
          return `${idx}. ${children.trim()}\n`;
        }
        return `- ${children.trim()}\n`;
      }
      case 'blockquote': return `> ${children.trim()}\n\n`;
      case 'body': return children;
      case 'html': return children;
      default: return children;
    }
  };

  return convert(doc.body).replace(/\n{3,}/g, '\n\n').trim();
};

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

/* ── Toast notification ── */
const Toast = ({ message, onDone }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 1800);
    const t2 = setTimeout(onDone, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className={`px-4 py-2.5 rounded-xl bg-artisan-purpleDark text-white text-sm font-medium shadow-lg shadow-purple-500/20 ${exiting ? 'toast-exit' : 'toast-enter'}`}>
        {message}
      </div>
    </div>
  );
};

/* ── Delete confirmation modal ── */
const DeleteModal = ({ noteName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onCancel}>
    <div className="bg-white rounded-2xl w-full max-w-xs shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-base font-bold text-gray-800 mb-2">Delete note?</h3>
      <p className="text-sm text-gray-500 mb-5">
        <strong className="text-gray-700">{noteName || 'Untitled'}</strong> will be permanently deleted.
      </p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

/* ── Sidebar note item ── */
const NoteItem = React.memo(({ note, isActive, onSelect, onDelete, onExport, onCopy }) => {
  const plainText = useMemo(() => stripHtml(note.content), [note.content]);
  const preview = plainText.slice(0, 50);
  const date = new Date(note.updatedAt || note.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={() => onSelect(note.id)}
      className={`note-item group cursor-pointer rounded-xl px-3 py-2.5 mb-1 ${
        isActive
          ? 'bg-white/80 border border-purple-200/80 shadow-sm'
          : 'hover:bg-white/40 border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-artisan-purpleDark' : 'text-gray-700'}`}>
            {note.title || 'Untitled'}
          </h4>
          <p className="text-xs text-gray-400 truncate mt-0.5">{preview || 'Empty note'}</p>
          <p className="text-[10px] text-gray-300 mt-1">{dateStr}</p>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
          <button onClick={(e) => { e.stopPropagation(); onCopy(note); }} className="p-1 rounded text-gray-400 hover:text-artisan-purple hover:bg-purple-50 transition-colors" title="Copy to clipboard">
            <Icons.Copy />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onExport(note); }} className="p-1 rounded text-gray-400 hover:text-artisan-purple hover:bg-purple-50 transition-colors" title="Export as .md">
            <Icons.Download />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
            <Icons.Trash />
          </button>
        </div>
      </div>
    </div>
  );
});

/* ── Sidebar ── */
const Sidebar = React.memo(({ notes, activeId, onSelect, onNew, onDelete, onExport, onCopy }) => (
  <div className="h-full flex flex-col bg-white/30 backdrop-blur-xl border-r border-purple-100/50">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-extrabold text-artisan-purpleDark tracking-tight">Notes</h2>
        <span className="text-xs text-gray-400 bg-purple-50 px-2 py-0.5 rounded-full">{notes.length}</span>
      </div>
      <button
        onClick={onNew}
        className="w-full px-3 py-2 bg-artisan-purple text-white rounded-lg text-sm font-semibold hover:bg-artisan-purpleDark transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-purple-300/30"
      >
        <Icons.Plus /> New Note
      </button>
    </div>

    {/* Notes list */}
    <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
      {notes.length === 0 ? (
        <div className="text-center py-10 px-4">
          <div className="text-3xl mb-2 opacity-40">✒️</div>
          <p className="text-xs text-gray-400">No notes yet</p>
          <p className="text-[10px] text-gray-300 mt-1">Click "New Note" to start writing</p>
        </div>
      ) : (
        notes.map(note => (
          <NoteItem
            key={note.id}
            note={note}
            isActive={note.id === activeId}
            onSelect={onSelect}
            onDelete={onDelete}
            onExport={onExport}
            onCopy={onCopy}
          />
        ))
      )}
    </div>
  </div>
));

/* ── Toolbar ── */
const Toolbar = React.memo(({ editorElRef, font, onFontChange }) => {
  const execCmd = useCallback((cmd, value) => {
    const el = editorElRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(cmd, false, value || null);
  }, [editorElRef]);

  const toggleBlockquote = useCallback(() => {
    const el = editorElRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let node = sel.anchorNode;
    while (node && node !== el) {
      if (node.nodeType === 1 && node.tagName === 'BLOCKQUOTE') {
        document.execCommand('formatBlock', false, '<p>');
        return;
      }
      node = node.parentNode;
    }
    document.execCommand('formatBlock', false, '<blockquote>');
  }, [editorElRef]);

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-white/50 backdrop-blur-sm border-b border-purple-100/40 flex-shrink-0">
      <button onClick={() => execCmd('bold')} className="toolbar-btn" title="Bold (Ctrl+B)"><Icons.Bold /></button>
      <button onClick={() => execCmd('italic')} className="toolbar-btn" title="Italic (Ctrl+I)"><Icons.Italic /></button>
      <button onClick={() => execCmd('underline')} className="toolbar-btn" title="Underline (Ctrl+U)"><Icons.Underline /></button>

      <div className="w-px h-5 bg-purple-200/40 mx-0.5" />

      <button onClick={() => execCmd('formatBlock', '<h1>')} className="toolbar-btn text-xs font-extrabold" title="Heading 1">H1</button>
      <button onClick={() => execCmd('formatBlock', '<h2>')} className="toolbar-btn text-xs font-bold" title="Heading 2">H2</button>
      <button onClick={() => execCmd('formatBlock', '<p>')} className="toolbar-btn text-xs" title="Paragraph">P</button>

      <div className="w-px h-5 bg-purple-200/40 mx-0.5" />

      <button onClick={() => execCmd('insertUnorderedList')} className="toolbar-btn" title="Bullet List"><Icons.BulletList /></button>
      <button onClick={() => execCmd('insertOrderedList')} className="toolbar-btn" title="Numbered List"><Icons.NumberedList /></button>
      <button onClick={toggleBlockquote} className="toolbar-btn" title="Quote"><Icons.Quote /></button>

      <div className="w-px h-5 bg-purple-200/40 mx-0.5" />

      <select
        value={font}
        onChange={(e) => onFontChange(e.target.value)}
        className="font-selector px-2.5 py-1.5 rounded-lg bg-white/70 border border-purple-200/40 text-xs text-gray-600 cursor-pointer"
      >
        {FONTS.map(f => (
          <option key={f.name} value={f.name} style={{ fontFamily: f.family }}>{f.name}</option>
        ))}
      </select>
    </div>
  );
});

/* ── Status bar ── */
const StatusBar = React.memo(({ content }) => {
  const { words, chars } = useMemo(() => {
    const text = stripHtml(content);
    const c = text.length;
    const w = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { words: w, chars: c };
  }, [content]);

  return (
    <div className="px-4 py-2 bg-white/40 backdrop-blur-sm border-t border-purple-100/40 flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
      <span>{words} word{words !== 1 ? 's' : ''}</span>
      <span className="text-purple-200">|</span>
      <span>{chars} character{chars !== 1 ? 's' : ''}</span>
    </div>
  );
});

/* ── Empty state (no note selected) ── */
const EmptyState = ({ onNew }) => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-artisan-purple/15 to-artisan-purpleDark/10 flex items-center justify-center mx-auto mb-4">
        <Icons.Pen />
      </div>
      <h3 className="text-lg font-bold text-gray-600 mb-1">Start writing</h3>
      <p className="text-sm text-gray-400 mb-5">Select a note or create a new one</p>
      <button
        onClick={onNew}
        className="px-5 py-2.5 bg-artisan-purple text-white rounded-lg text-sm font-semibold hover:bg-artisan-purpleDark transition-colors shadow-sm shadow-purple-300/30 inline-flex items-center gap-1.5"
      >
        <Icons.Plus /> New Note
      </button>
    </div>
  </div>
);

/* ── Why Page ── */
const WhyPage = () => (
  <div className="h-full overflow-auto custom-scrollbar">
    <div className="max-w-lg mx-auto py-8 px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-artisan-purple/20 to-artisan-purpleDark/10 flex items-center justify-center mx-auto mb-3">
          <Icons.Pen />
        </div>
        <h2 className="text-2xl font-extrabold text-artisan-purple mb-1">Why Inkwell?</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest">The story behind the pen</p>
      </div>

      {/* Content */}
      <div className="bg-white/80 rounded-xl border border-purple-100 shadow-sm p-6 space-y-5">

        <div>
          <h3 className="text-sm font-bold text-artisan-purple mb-2 uppercase tracking-wider">The Problem</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            I used to draft things everywhere &mdash; half-finished thoughts in Notepad, bullet points in Google Keep, scribbles on random sheets of paper, WhatsApp messages to myself, and even scheduled emails as reminders of ideas I didn't want to lose. It was scattered, messy, and I could never tell whether something was meant to become a blog post, a LinkedIn article, a poem, or just a passing thought.
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        <div>
          <h3 className="text-sm font-bold text-artisan-purple mb-2 uppercase tracking-wider">The Idea</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            I wanted a single, unified place to write &mdash; something easy, intuitive, and aesthetically appealing. Not a full-blown document editor, not a note-taking app buried in features. Just a clean surface where I could sit down, draft something, and know it would be there when I came back. <strong className="text-artisan-purple">Inkwell</strong> was born from that need.
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        <div>
          <h3 className="text-sm font-bold text-artisan-purple mb-2 uppercase tracking-wider">How It Works</h3>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-artisan-purple flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">1</div>
              <p className="text-sm text-gray-700 leading-relaxed">Your notes live in the <strong>sidebar</strong>, titled and sorted by when you last touched them &mdash; always one click away.</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-artisan-purple flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">2</div>
              <p className="text-sm text-gray-700 leading-relaxed">Everything <strong>auto-saves</strong> to your browser &mdash; no buttons, no cloud, no friction. Just write and it's there.</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-artisan-purple flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">3</div>
              <p className="text-sm text-gray-700 leading-relaxed">Full <strong>rich text formatting</strong> &mdash; bold, italics, headings, bullet points, blockquotes &mdash; with your choice of font, so every draft feels right.</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        <div>
          <h3 className="text-sm font-bold text-artisan-purple mb-2 uppercase tracking-wider">Beyond a Simple Tool</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Whether it's a blog post, a LinkedIn article, a poem, or just a thought I need to get out of my head &mdash; Inkwell is where it starts. Export to <code className="px-1.5 py-0.5 bg-purple-50 text-artisan-purple rounded text-xs font-mono">.md</code>, copy to clipboard, or simply leave it here for later. No noise, no distractions &mdash; just you and the words.
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        <p className="text-sm text-gray-600 leading-relaxed italic text-center pt-1">
          I hope <strong className="text-artisan-purple not-italic">Inkwell</strong> gives you the same peace of mind it gives me.
        </p>
      </div>

      {/* Signature */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-400">&mdash; Ravjoth</p>
      </div>
    </div>
  </div>
);

/* ── Main App ── */
const App = () => {
  const [notes, setNotes] = useLocalStorage('inkwell-notes', []);
  const [activeNoteId, setActiveNoteId] = useLocalStorage('inkwell-active-note', null);
  const [font, setFont] = useLocalStorage('inkwell-font', 'Aptos');
  const [toastMsg, setToastMsg] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeView, setActiveView] = useState('editor');

  const editorElRef = useRef(null);
  const titleInputRef = useRef(null);
  const prevNoteIdRef = useRef(null);
  const saveTimerRef = useRef(null);

  /* ── Derived state ── */
  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId) || null, [notes, activeNoteId]);

  const sortedNotes = useMemo(() =>
    [...notes].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)),
    [notes]
  );

  const fontFamily = useMemo(() => {
    const f = FONTS.find(fo => fo.name === font);
    return f ? f.family : FONTS[0].family;
  }, [font]);

  /* ── Toast helper ── */
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
  }, []);

  /* ── Sync contenteditable when switching notes ── */
  useEffect(() => {
    if (activeNote && editorElRef.current && prevNoteIdRef.current !== activeNote.id) {
      editorElRef.current.innerHTML = activeNote.content || '';
      prevNoteIdRef.current = activeNote.id;
      // Focus title if it's a brand new empty note
      if (!activeNote.title && !activeNote.content && titleInputRef.current) {
        setTimeout(() => titleInputRef.current?.focus(), 50);
      }
    }
    if (!activeNote) {
      prevNoteIdRef.current = null;
      if (editorElRef.current) editorElRef.current.innerHTML = '';
    }
  }, [activeNote]);

  /* ── Note CRUD ── */
  const createNote = useCallback(() => {
    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  }, [setNotes, setActiveNoteId]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
    setDeleteTarget(null);
    showToast('Note deleted');
  }, [deleteTarget, setNotes, activeNoteId, notes, setActiveNoteId, showToast]);

  /* ── Debounced content save ── */
  const saveContent = useCallback((content) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setNotes(prev => prev.map(n =>
        n.id === activeNoteId
          ? { ...n, content, updatedAt: new Date().toISOString() }
          : n
      ));
    }, 300);
  }, [setNotes, activeNoteId]);

  const handleEditorInput = useCallback(() => {
    if (editorElRef.current) {
      saveContent(editorElRef.current.innerHTML);
    }
  }, [saveContent]);

  const updateTitle = useCallback((title) => {
    setNotes(prev => prev.map(n =>
      n.id === activeNoteId
        ? { ...n, title, updatedAt: new Date().toISOString() }
        : n
    ));
  }, [setNotes, activeNoteId]);

  /* ── Export ── */
  const exportNote = useCallback((note) => {
    const md = htmlToMarkdown(note.content);
    const title = note.title || 'Untitled';
    const fullMd = `# ${title}\n\n${md}`;
    const blob = new Blob([fullMd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_') || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as .md');
  }, [showToast]);

  /* ── Copy ── */
  const copyNote = useCallback((note) => {
    const text = stripHtml(note.content);
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    }).catch(() => {
      showToast('Failed to copy');
    });
  }, [showToast]);

  /* ── Editor placeholder visibility ── */
  const [editorEmpty, setEditorEmpty] = useState(true);
  const checkEmpty = useCallback(() => {
    if (editorElRef.current) {
      const text = editorElRef.current.textContent || '';
      setEditorEmpty(text.trim().length === 0);
    }
  }, []);

  useEffect(() => {
    checkEmpty();
  }, [activeNote, checkEmpty]);

  const onEditorInput = useCallback(() => {
    handleEditorInput();
    checkEmpty();
  }, [handleEditorInput, checkEmpty]);

  return (
    <div className="liquid-bg h-screen flex flex-col">
      <AnimatedBlobs />

      {/* ── Header ── */}
      <header className="purple-banner relative z-10 px-4 py-3 flex-shrink-0">
        <HeaderMiniBlobs />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <a href="https://ravjothbrar.com" target="_blank" rel="noopener noreferrer" className="attribution-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-gray-600 text-xs font-medium">
              <Icons.User /> Created by Ravjoth
            </a>
            <button onClick={() => setActiveView(v => v === 'why' ? 'editor' : 'why')} className={`attribution-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${activeView === 'why' ? 'bg-artisan-purple text-white border-artisan-purple' : 'bg-white/90 text-gray-600'}`}>
              <Icons.Question />Why?
            </button>
          </div>
          <div className="flex items-center gap-3">
            <a href="../" className="rimico-home-btn px-3.5 py-1.5 rounded-lg font-extrabold text-lg text-artisan-purple">
              RIMICO
            </a>
            <span className="text-artisan-purple/30 font-light text-lg select-none">/</span>
            <span onClick={() => setActiveView('editor')} className="font-bold text-lg text-artisan-purple cursor-pointer hover:text-artisan-purpleDark transition-colors">Inkwell</span>
          </div>
          <div className="w-[160px]" />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1 flex overflow-hidden">
        {activeView === 'why' ? (
          <div className="flex-1 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl m-2 overflow-hidden">
            <WhyPage />
          </div>
        ) : (
          <>
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <Sidebar
                notes={sortedNotes}
                activeId={activeNoteId}
                onSelect={setActiveNoteId}
                onNew={createNote}
                onDelete={setDeleteTarget}
                onExport={exportNote}
                onCopy={copyNote}
              />
            </div>

            {/* Editor area */}
            <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm min-w-0">
              {activeNote ? (
                <>
                  <Toolbar editorElRef={editorElRef} font={font} onFontChange={setFont} />

                  {/* Title */}
                  <div className="px-6 pt-5 pb-1 flex-shrink-0">
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => updateTitle(e.target.value)}
                      placeholder="Untitled"
                      className="title-input w-full text-2xl font-extrabold text-gray-800"
                      style={{ fontFamily }}
                    />
                    <div className="h-px bg-gradient-to-r from-purple-200/60 via-purple-200/30 to-transparent mt-3" />
                  </div>

                  {/* Editable content */}
                  <div className="flex-1 relative min-h-0">
                    {editorEmpty && (
                      <div className="absolute top-3 left-6 text-gray-300 text-base pointer-events-none select-none" style={{ fontFamily }}>
                        Start writing...
                      </div>
                    )}
                    <div
                      ref={editorElRef}
                      contentEditable
                      suppressContentEditableWarning
                      className="editor-content h-full px-6 py-3 overflow-y-auto text-gray-700 leading-relaxed custom-scrollbar"
                      style={{ fontFamily, fontSize: '15px' }}
                      onInput={onEditorInput}
                    />
                  </div>

                  <StatusBar content={activeNote.content} />
                </>
              ) : (
                <EmptyState onNew={createNote} />
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Toast ── */}
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <DeleteModal
          noteName={(notes.find(n => n.id === deleteTarget) || {}).title}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
