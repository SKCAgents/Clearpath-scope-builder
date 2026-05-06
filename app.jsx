// ── Auth shell & project management ─────────────────────────────────────────

function Loading() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.slate }}>
      <div style={{ fontFamily: "'Figtree', sans-serif", color: C.gold, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Loading…</div>
    </div>
  );
}

function SignIn() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.slate, gap: 48 }}>
      <img src="assets/ClearPath-Wordmark-Limestone.png" alt="ClearPath" style={{ height: 36 }} />
      <button
        onClick={cpSignInGoogle}
        style={{ fontFamily: "'Figtree', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, background: C.offwhite, color: C.slate, border: 'none', padding: '14px 32px', cursor: 'pointer' }}
      >
        Sign in with Google
      </button>
    </div>
  );
}

function NotAllowed({ email }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.slate, gap: 12 }}>
      <img src="assets/ClearPath-Wordmark-Limestone.png" alt="ClearPath" style={{ height: 36, marginBottom: 20 }} />
      <div style={{ fontFamily: "'Figtree', sans-serif", color: C.gold, fontSize: 13 }}>Access pending for <strong>{email}</strong></div>
      <div style={{ fontFamily: "'Figtree', sans-serif", color: 'rgba(195,189,177,0.6)', fontSize: 12 }}>Contact david@stewartknowles.com to request access.</div>
      <button
        onClick={cpSignOut}
        style={{ marginTop: 24, fontFamily: "'Figtree', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', color: C.gold, border: '1px solid rgba(195,189,177,0.35)', padding: '8px 18px', cursor: 'pointer' }}
      >
        Sign Out
      </button>
    </div>
  );
}

// ── Project list ─────────────────────────────────────────────────────────────

function ProjectRow({ project: p, onOpen, onDeleted }) {
  const [confirming, setConfirming] = React.useState(false);

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirming) { setConfirming(true); return; }
    await cpDeleteProject(p.id);
    onDeleted();
  }

  const updatedLabel = new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      onClick={() => onOpen(p.id)}
      style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 2fr 120px 80px', background: 'white', padding: '13px 20px', cursor: 'pointer', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}
      onMouseEnter={e => e.currentTarget.style.background = C.bgLight}
      onMouseLeave={e => e.currentTarget.style.background = 'white'}
    >
      <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: 13, color: C.slate, fontWeight: 500 }}>{p.name || '(Untitled)'}</div>
      <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: 12, color: C.goldDark }}>{p.client_name || '—'}</div>
      <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: 12, color: C.goldDark }}>{p.address || '—'}</div>
      <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: 11, color: C.gold, textTransform: 'capitalize' }}>{updatedLabel}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={handleDelete}
          onBlur={() => setConfirming(false)}
          style={{ fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: confirming ? C.magnolia : 'none', color: confirming ? C.offwhite : C.gold, border: `1px solid ${confirming ? C.magnolia : C.border}`, padding: '4px 8px', cursor: 'pointer' }}
        >
          {confirming ? 'Confirm' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

function NewProjectModal({ onClose, onCreate }) {
  const [fields, setFields] = React.useState({ name: '', client_name: '', address: '', project_type: '' });
  const [saving, setSaving] = React.useState(false);

  function set(key) { return e => setFields(f => ({ ...f, [key]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.name.trim()) return;
    setSaving(true);
    const { data, error } = await cpCreateProject(fields);
    if (error) { setSaving(false); alert('Error: ' + error.message); return; }
    onCreate(data.id);
  }

  const inputStyle = { width: '100%', fontFamily: "'Figtree', sans-serif", fontSize: 13, border: `1px solid ${C.border}`, padding: '9px 12px', color: C.slate, outline: 'none', background: 'white' };
  const labelStyle = { fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.goldDark, marginBottom: 6, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(63,78,90,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'white', padding: 36, width: 480, maxWidth: '90vw' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.slate, marginBottom: 28 }}>New Project</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Project Name *</label>
            <input required value={fields.name} onChange={set('name')} style={inputStyle} autoFocus />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Client Name</label>
            <input value={fields.client_name} onChange={set('client_name')} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Address</label>
            <input value={fields.address} onChange={set('address')} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Project Type</label>
            <select value={fields.project_type} onChange={set('project_type')} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">— Select —</option>
              <option value="addition">Addition</option>
              <option value="kitchen">Kitchen</option>
              <option value="bath">Bath</option>
              <option value="whole_home">Whole Home</option>
              <option value="custom_build">Custom Build</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ fontFamily: "'Figtree', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', color: C.goldDark, border: `1px solid ${C.border}`, padding: '9px 18px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ fontFamily: "'Figtree', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', background: C.slate, color: C.offwhite, border: 'none', padding: '9px 20px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectList({ onOpen }) {
  const [projects, setProjects] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState('updated_at');
  const [showNew, setShowNew] = React.useState(false);

  function load() { cpListProjects().then(({ data }) => setProjects(data)); }
  React.useEffect(load, []);

  const filtered = (projects || [])
    .filter(p => !search || [p.name, p.client_name, p.address, p.project_type]
      .some(f => f?.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sort === 'updated_at') return new Date(b.updated_at) - new Date(a.updated_at);
      return (a[sort] || '').localeCompare(b[sort] || '');
    });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bgLight }}>
      {/* Top bar */}
      <div style={{ background: C.slate, height: 52, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0 }}>
        <img src={(document.getElementById('__logo_icon') || {}).src || 'assets/ClearPath-Icon-Limestone.png'} alt="ClearPath" style={{ height: 32 }} />
        <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.gold }}>Scope Builder</div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowNew(true)} style={{ fontFamily: "'Figtree', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, background: C.offwhite, color: C.slate, border: 'none', padding: '7px 16px', cursor: 'pointer' }}>
          + New Project
        </button>
        <button onClick={cpSignOut} style={{ fontFamily: "'Figtree', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 400, background: 'none', color: 'rgba(239,236,232,0.5)', border: '1px solid rgba(239,236,232,0.2)', padding: '6px 12px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      {/* Search + sort */}
      <div style={{ padding: '14px 24px', background: 'white', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 12 }}>
        <input
          placeholder="Search by name, client, address…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 13, border: `1px solid ${C.border}`, padding: '8px 12px', color: C.slate, outline: 'none' }}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ fontFamily: "'Figtree', sans-serif", fontSize: 12, border: `1px solid ${C.border}`, padding: '8px 12px', color: C.slate, background: 'white', cursor: 'pointer' }}
        >
          <option value="updated_at">Last Updated</option>
          <option value="name">Project Name</option>
          <option value="client_name">Client</option>
          <option value="address">Address</option>
        </select>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {projects === null ? (
          <div style={{ textAlign: 'center', color: C.goldDark, padding: 64, fontFamily: "'Figtree', sans-serif", fontSize: 13 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.slate, marginBottom: 12 }}>
              {search ? 'No matching projects.' : 'No projects yet.'}
            </div>
            {!search && (
              <button onClick={() => setShowNew(true)} style={{ fontFamily: "'Figtree', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', background: C.slate, color: C.offwhite, border: 'none', padding: '10px 20px', cursor: 'pointer' }}>
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 2fr 120px 80px', padding: '8px 20px', borderBottom: `1px solid ${C.border}`, background: C.bgLight }}>
              {['Project Name', 'Client', 'Address', 'Updated', ''].map(h => (
                <div key={h} style={{ fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.goldDark, fontWeight: 500 }}>{h}</div>
              ))}
            </div>
            {filtered.map(p => <ProjectRow key={p.id} project={p} onOpen={onOpen} onDeleted={load} />)}
          </div>
        )}
      </div>

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreate={(id) => { setShowNew(false); onOpen(id); }} />}
    </div>
  );
}

// ── Project editor wrapper ────────────────────────────────────────────────────

function ProjectEditor({ projectId, onBack }) {
  const [project, setProject] = React.useState(null);
  const [library, setLibrary] = React.useState(null);
  const [saveStatus, setSaveStatus] = React.useState('saved');
  const debounceRef = React.useRef(null);
  const pendingRef = React.useRef(null);

  React.useEffect(() => {
    Promise.all([cpGetProject(projectId), cpListLibrary()]).then(([{ data: proj }, lib]) => {
      setProject(proj);
      setLibrary(lib);
    });
  }, [projectId]);

  React.useEffect(() => {
    function flush() {
      if (pendingRef.current) cpUpdateProject(projectId, pendingRef.current);
    }
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
    return () => window.removeEventListener('beforeunload', flush);
  }, [projectId]);

  function handleChange(state) {
    const fields = {
      data: state,
      name: state.info?.projectName || project.name,
      client_name: state.info?.clientName || null,
      address: state.info?.address || null,
    };
    pendingRef.current = fields;
    setSaveStatus('pending');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      const { error } = await cpUpdateProject(projectId, fields);
      pendingRef.current = null;
      setSaveStatus(error ? 'error' : 'saved');
    }, 1500);
  }

  if (!project || !library) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bgLight }}>
        <div style={{ fontFamily: "'Figtree', sans-serif", color: C.goldDark, fontSize: 13 }}>Loading project…</div>
      </div>
    );
  }

  return React.createElement(App, {
    initialState: project.data,
    onChange: handleChange,
    libraryData: library,
    saveStatus,
    onBack,
  });
}

// ── Migration modal ───────────────────────────────────────────────────────────

function MigrationModal({ onDone, onOpen }) {
  const [importing, setImporting] = React.useState(false);

  async function handleImport() {
    setImporting(true);
    try {
      const raw = localStorage.getItem('cp_scope_builder');
      const state = JSON.parse(raw);
      const name = state.info?.projectName || state.info?.clientName || 'Imported Scope';
      const { data, error } = await cpCreateProject({
        name,
        client_name: state.info?.clientName || null,
        address: state.info?.address || null,
        project_type: null,
        data: state,
      });
      if (error) throw error;
      localStorage.setItem('cp_scope_builder_imported_' + Date.now(), raw);
      localStorage.removeItem('cp_scope_builder');
      onOpen(data.id);
    } catch (e) {
      alert('Import failed: ' + e.message);
      setImporting(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(63,78,90,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: 'white', padding: 36, width: 440, maxWidth: '90vw' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.slate, marginBottom: 12 }}>Import existing scope?</div>
        <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: 13, color: C.goldDark, lineHeight: 1.65, marginBottom: 28 }}>
          We found an unsaved scope on this device. Import it as a project so it's backed up to your account?
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onDone} style={{ fontFamily: "'Figtree', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', color: C.goldDark, border: `1px solid ${C.border}`, padding: '9px 18px', cursor: 'pointer' }}>Skip</button>
          <button onClick={handleImport} disabled={importing} style={{ fontFamily: "'Figtree', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', background: C.slate, color: C.offwhite, border: 'none', padding: '9px 20px', cursor: 'pointer', opacity: importing ? 0.6 : 1 }}>
            {importing ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

function Root() {
  const [authState, setAuthState] = React.useState('loading');
  const [session, setSession] = React.useState(null);
  const [showMigration, setShowMigration] = React.useState(false);
  const [view, setView] = React.useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { name: p.get('view') || 'projects', id: p.get('id') };
  });

  React.useEffect(() => {
    let cleanupFn = null;

    function init() {
      if (typeof window.cpOnAuthChange !== 'function') {
        setTimeout(init, 100);
        return;
      }
      const { data: { subscription } } = cpOnAuthChange(async (event, s) => {
        setSession(s);
        if (!s) { setAuthState('signed_out'); return; }
        // Token refresh — session is still valid, no need to re-check allow-list
        if (event === 'TOKEN_REFRESHED') return;
        setAuthState('checking');
        try {
          const ok = await cpIsAllowed(s.user.email);
          if (!ok) { setAuthState('not_allowed'); return; }
          setAuthState('ready');
          const local = localStorage.getItem('cp_scope_builder');
          if (local) {
            const count = await cpProjectCount();
            if (count === 0) setShowMigration(true);
          }
        } catch (e) {
          console.error('Auth check failed:', e);
          setAuthState('signed_out');
        }
      });
      cleanupFn = () => subscription.unsubscribe();
    }

    init();
    return () => { if (cleanupFn) cleanupFn(); };
  }, []);

  function navigate(name, id) {
    const url = new URL(window.location.href);
    url.searchParams.set('view', name);
    if (id) url.searchParams.set('id', id);
    else url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    setView({ name, id });
  }

  if (authState === 'loading' || authState === 'checking') return <Loading />;
  if (authState === 'signed_out') return <SignIn />;
  if (authState === 'not_allowed') return <NotAllowed email={session?.user?.email} />;

  return (
    <>
      {showMigration && (
        <MigrationModal
          onDone={() => setShowMigration(false)}
          onOpen={(id) => { setShowMigration(false); navigate('editor', id); }}
        />
      )}
      {view.name === 'editor' && view.id
        ? <ProjectEditor projectId={view.id} onBack={() => navigate('projects')} />
        : <ProjectList onOpen={(id) => navigate('editor', id)} />
      }
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
