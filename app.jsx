/**
 * app.jsx — Authentication shell, project management, and top-level routing
 *
 * This file is the entry point for the logged-in experience. It handles:
 *   1. Reading the user's session from the browser on page load
 *   2. Verifying the user is on the approved access list (in the background)
 *   3. Routing between the project list and the project editor
 *   4. Auto-saving project changes to the database as the user works
 *
 * It relies on:
 *   - window.cp* functions from supabase.js (database + auth helpers)
 *   - The App component from index.html (the actual scope builder UI)
 *   - UI components from ScopeComponents.jsx (C color palette, etc.)
 *
 * Loaded and transpiled by Babel directly in the browser — no build step.
 */


// ─────────────────────────────────────────────────────────────────────────────
// FULL-SCREEN STATE SCREENS
// These are simple screens shown during auth transitions.
// ─────────────────────────────────────────────────────────────────────────────

// Shown for a fraction of a second while we read the session from localStorage.
// In practice the user should barely see this.
function Loading() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.slate }}>
      <div style={{ fontFamily: "'Figtree', sans-serif", color: C.gold, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Loading…
      </div>
    </div>
  );
}

// Shown when no active session exists — the user needs to sign in.
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

// Shown when a user has a valid Google account but their email is not on the
// approved list. They can sign out and try a different account.
function NotAllowed({ email }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.slate, gap: 12 }}>
      <img src="assets/ClearPath-Wordmark-Limestone.png" alt="ClearPath" style={{ height: 36, marginBottom: 20 }} />
      <div style={{ fontFamily: "'Figtree', sans-serif", color: C.gold, fontSize: 13 }}>
        Access pending for <strong>{email}</strong>
      </div>
      <div style={{ fontFamily: "'Figtree', sans-serif", color: 'rgba(195,189,177,0.6)', fontSize: 12 }}>
        Contact david@stewartknowles.com to request access.
      </div>
      <button
        onClick={cpSignOut}
        style={{ marginTop: 24, fontFamily: "'Figtree', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', color: C.gold, border: '1px solid rgba(195,189,177,0.35)', padding: '8px 18px', cursor: 'pointer' }}
      >
        Sign Out
      </button>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// PROJECT LIST
// The main dashboard — shows all saved projects with search and sort controls.
// ─────────────────────────────────────────────────────────────────────────────

// A single row in the project list table.
// Clicking the row opens the project. Deleting requires two clicks to confirm,
// preventing accidental deletions.
function ProjectRow({ project: p, onOpen, onDeleted }) {
  // 'confirming' tracks whether the user has clicked Delete once already.
  // The second click triggers the actual deletion.
  const [confirming, setConfirming] = React.useState(false);

  async function handleDelete(e) {
    // Stop the row's onClick from firing (which would open the project)
    e.stopPropagation();
    if (!confirming) {
      // First click — switch to confirmation mode
      setConfirming(true);
      return;
    }
    // Second click — confirmed, delete it
    await cpDeleteProject(p.id);
    onDeleted();
  }

  // Format the date as "May 7, 2026" for display
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
      {/* Stop click propagation here so clicking the delete button doesn't open the project */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={handleDelete}
          onBlur={() => setConfirming(false)} // Cancel confirmation if focus leaves the button
          style={{ fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: confirming ? C.magnolia : 'none', color: confirming ? C.offwhite : C.gold, border: `1px solid ${confirming ? C.magnolia : C.border}`, padding: '4px 8px', cursor: 'pointer' }}
        >
          {confirming ? 'Confirm' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// Modal dialog for creating a new project.
// Only the project name is required. After creation, opens the editor immediately.
function NewProjectModal({ onClose, onCreate }) {
  const [fields, setFields] = React.useState({ name: '', client_name: '', address: '', project_type: '' });
  const [saving, setSaving] = React.useState(false);

  // Helper that returns an onChange handler for a given field name
  function set(key) {
    return e => setFields(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.name.trim()) return;
    setSaving(true);
    const { data, error } = await cpCreateProject(fields);
    if (error) { setSaving(false); alert('Error: ' + error.message); return; }
    // Pass the new project's ID up so the parent can navigate to the editor
    onCreate(data.id);
  }

  const inputStyle = { width: '100%', fontFamily: "'Figtree', sans-serif", fontSize: 13, border: `1px solid ${C.border}`, padding: '9px 12px', color: C.slate, outline: 'none', background: 'white' };
  const labelStyle = { fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.goldDark, marginBottom: 6, display: 'block' };

  return (
    // Full-screen overlay
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

// The main project dashboard. Shows all projects with search and sort.
// Projects load from the database on mount. Search filters client-side
// since the total number of projects is expected to be small.
function ProjectList({ onOpen }) {
  // null = still loading; [] = loaded but empty; [...] = loaded with projects
  const [projects, setProjects] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState('updated_at');
  const [showNew, setShowNew] = React.useState(false);

  // Fetch all projects from the database. Called on mount and after any deletion.
  function load() {
    cpListProjects().then(({ data }) => setProjects(data));
  }
  React.useEffect(load, []);

  // Apply search filter and sort in one pass. No network calls — all client-side.
  const filtered = (projects || [])
    .filter(p => !search || [p.name, p.client_name, p.address, p.project_type]
      .some(f => f?.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sort === 'updated_at') return new Date(b.updated_at) - new Date(a.updated_at);
      return (a[sort] || '').localeCompare(b[sort] || '');
    });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bgLight }}>

      {/* ── Top navigation bar ── */}
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

      {/* ── Search and sort controls ── */}
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

      {/* ── Project list (or empty/loading states) ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {projects === null ? (
          // Still waiting on the database response
          <div style={{ textAlign: 'center', color: C.goldDark, padding: 64, fontFamily: "'Figtree', sans-serif", fontSize: 13 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          // Either no projects exist at all, or the search returned nothing
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
            {/* Column header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 2fr 120px 80px', padding: '8px 20px', borderBottom: `1px solid ${C.border}`, background: C.bgLight }}>
              {['Project Name', 'Client', 'Address', 'Updated', ''].map(h => (
                <div key={h} style={{ fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.goldDark, fontWeight: 500 }}>{h}</div>
              ))}
            </div>
            {/* One row per project */}
            {filtered.map(p => <ProjectRow key={p.id} project={p} onOpen={onOpen} onDeleted={load} />)}
          </div>
        )}
      </div>

      {/* New project modal — rendered on top of everything when active */}
      {showNew && (
        <NewProjectModal
          onClose={() => setShowNew(false)}
          onCreate={(id) => { setShowNew(false); onOpen(id); }}
        />
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// PROJECT EDITOR
// Loads a single project from the database and renders the scope builder UI.
// Handles auto-saving as the user makes changes.
// ─────────────────────────────────────────────────────────────────────────────

// Wraps the scope builder (the App component from index.html) with database
// connectivity. Responsible for loading data and auto-saving changes.
function ProjectEditor({ projectId, onBack }) {
  // project = the full project record from the database (null while loading)
  const [project, setProject] = React.useState(null);
  // library = the master scope line library from the database (null while loading)
  const [library, setLibrary] = React.useState(null);
  // saveStatus drives the "Saved / Saving… / Unsaved" indicator in the top bar
  const [saveStatus, setSaveStatus] = React.useState('saved');

  // debounceRef holds the timer ID for the delayed save. We clear and reset it
  // on every change so that rapid edits only trigger one save when the user pauses.
  const debounceRef = React.useRef(null);
  // pendingRef holds the most recent unsaved state. If the user closes the tab
  // before the debounce fires, we use this to do an immediate final save.
  const pendingRef = React.useRef(null);

  // Load the project data and scope library in parallel when this component mounts.
  // We wait for both before rendering the editor so neither can show stale data.
  React.useEffect(() => {
    Promise.all([
      cpGetProject(projectId),
      cpListLibrary(),
    ]).then(([{ data: proj }, lib]) => {
      setProject(proj);
      setLibrary(lib);
    });
  }, [projectId]);

  // Register a "flush on exit" handler so unsaved changes aren't lost if the
  // user closes the tab or navigates away mid-debounce.
  React.useEffect(() => {
    function flush() {
      if (pendingRef.current) {
        cpUpdateProject(projectId, pendingRef.current);
      }
    }
    // 'beforeunload' fires when the tab/window is about to close
    window.addEventListener('beforeunload', flush);
    // 'visibilitychange' fires when the tab is hidden (e.g. switching tabs on mobile)
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
    return () => window.removeEventListener('beforeunload', flush);
  }, [projectId]);

  // Called by the App component every time the user changes anything.
  // We don't save on every keystroke — we wait 1.5 seconds after the last change.
  function handleChange(state) {
    // Build the database payload from the current state
    const fields = {
      data: state,                                         // Full scope state (JSON)
      name: state.info?.projectName || project.name,      // Keep the list view in sync
      client_name: state.info?.clientName || null,
      address: state.info?.address || null,
    };
    pendingRef.current = fields;   // Store in case the tab closes before the timer fires
    setSaveStatus('pending');
    clearTimeout(debounceRef.current);
    // After 1.5 seconds of inactivity, write to the database
    debounceRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      const { error } = await cpUpdateProject(projectId, fields);
      pendingRef.current = null;
      setSaveStatus(error ? 'error' : 'saved');
    }, 1500);
  }

  // While the project data is being fetched, show a simple loading state.
  // This is expected to be brief (one database round-trip).
  if (!project || !library) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bgLight }}>
        <div style={{ fontFamily: "'Figtree', sans-serif", color: C.goldDark, fontSize: 13 }}>Loading project…</div>
      </div>
    );
  }

  // Render the full scope builder UI (App is defined in index.html).
  // We pass the saved state as initialState and wire up onChange for auto-save.
  return React.createElement(App, {
    initialState: project.data,
    onChange: handleChange,
    libraryData: library,
    saveStatus,
    onBack,
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// MIGRATION MODAL
// One-time helper for users who have scope data saved in localStorage from
// a previous version of the app (before database storage was added).
// ─────────────────────────────────────────────────────────────────────────────

function MigrationModal({ onDone, onOpen }) {
  const [importing, setImporting] = React.useState(false);

  // Read the legacy localStorage data, create a real database project from it,
  // then clean up the localStorage entry so this modal never appears again.
  async function handleImport() {
    setImporting(true);
    try {
      const raw = localStorage.getItem('cp_scope_builder');
      const state = JSON.parse(raw);
      const name = state.info?.projectName || state.info?.clientName || 'Imported Scope';
      const { data, error } = await cpCreateProject({
        name,
        client_name: state.info?.clientName || null,
        address:     state.info?.address    || null,
        project_type: null,
        data: state,
      });
      if (error) throw error;
      // Keep a backup copy in localStorage just in case, then remove the original
      localStorage.setItem('cp_scope_builder_imported_' + Date.now(), raw);
      localStorage.removeItem('cp_scope_builder');
      // Open the newly created project immediately
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


// ─────────────────────────────────────────────────────────────────────────────
// ROOT — TOP-LEVEL AUTH AND ROUTING
//
// This is the component React renders first. It owns two concerns:
//
//   AUTH: Manages the authentication lifecycle. The flow is:
//     1. Read the session from localStorage (no network — returns in milliseconds)
//     2. If a session exists, show the app immediately. The session JWT is
//        cryptographically signed by Supabase — we don't need a database call
//        before trusting it and showing the UI.
//     3. Run the allow-list check in the background. If the user isn't on the
//        list, redirect them to the "not allowed" screen. This takes 1-2 seconds
//        but the user doesn't see a loading screen while waiting.
//     4. Subscribe to auth events for future sign-ins and sign-outs.
//
//   ROUTING: The current view is stored in the URL (?view=projects or
//     ?view=editor&id=<uuid>). This means the browser back button works and
//     URLs can be bookmarked or shared.
// ─────────────────────────────────────────────────────────────────────────────

function Root() {
  // authState drives what the user sees:
  //   'loading'    → brief initial state while we read localStorage
  //   'checking'   → only on fresh sign-in, while we verify the allow-list
  //   'ready'      → authenticated and allowed — show the app
  //   'signed_out' → no session — show the sign-in screen
  //   'not_allowed'→ valid Google account but email not on the approved list
  const [authState, setAuthState] = React.useState('loading');
  const [session, setSession]     = React.useState(null);
  const [showMigration, setShowMigration] = React.useState(false);

  // Read the current view from the URL on first render.
  // This allows the page to restore the correct view after a reload.
  const [view, setView] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return { name: params.get('view') || 'projects', id: params.get('id') };
  });

  // ── Auth bootstrap ──
  // Runs once when the app first loads. Reads the session, shows the app
  // immediately if authenticated, then does background verification.
  React.useEffect(() => {
    // Track the Supabase subscription so we can clean it up on unmount
    let subscription = null;

    async function bootstrap() {
      // Step 1: Wait for supabase.js to finish loading.
      // supabase.js is a JavaScript module (type="module") which loads
      // asynchronously. We poll until its exported functions are available.
      while (typeof window.cpGetSession !== 'function') {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Step 2: Read the session from the browser's localStorage.
      // Supabase stores the user's session (a JWT token) in localStorage after
      // sign-in. Reading it requires no network request — it's instant.
      // If the access token is expired but the refresh token is still valid,
      // Supabase will silently exchange it for a new one in the background.
      const session = await cpGetSession();

      if (!session) {
        // No session in storage — user has never signed in, or signed out explicitly.
        setAuthState('signed_out');
      } else {
        // We have a valid, verified session. Show the app right away.
        // The JWT is signed by Supabase's servers — we can trust it without
        // making an additional database call.
        setSession(session);
        setAuthState('ready');

        // Step 3: Verify the allow-list in the background.
        // This is a secondary access control layer (only specific emails can use
        // the app). We run it after showing the UI — the delay is invisible.
        // If verification fails, we switch to the "not allowed" screen.
        cpIsAllowed(session.user.email)
          .then(ok => { if (!ok) setAuthState('not_allowed'); })
          .catch(err => {
            // If the check errors out (network issue, etc.), fail safely by
            // signing the user out rather than leaving them in a broken state.
            console.error('Allow-list check failed:', err);
            setAuthState('signed_out');
          });

        // Step 4: Check for legacy localStorage data from the old app version.
        // If we find any and the user has no projects yet, offer to import it.
        const legacyData = localStorage.getItem('cp_scope_builder');
        if (legacyData) {
          cpProjectCount().then(count => {
            if (count === 0) setShowMigration(true);
          });
        }
      }

      // Step 5: Subscribe to future auth events.
      // We only care about SIGNED_IN (user just logged in) and SIGNED_OUT
      // (user clicked sign out). We intentionally ignore TOKEN_REFRESHED —
      // a token refresh means the session is still valid, so no action needed.
      const { data } = cpOnAuthChange(async (event, s) => {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setAuthState('signed_out');
          return;
        }
        if (event === 'SIGNED_IN') {
          // Fresh sign-in — must verify allow-list before granting access.
          // Unlike returning users (handled above), this is a real user action
          // so showing a brief "checking" state is acceptable here.
          setSession(s);
          setAuthState('checking');
          try {
            const ok = await cpIsAllowed(s.user.email);
            setAuthState(ok ? 'ready' : 'not_allowed');
          } catch (err) {
            console.error('Allow-list check failed on sign-in:', err);
            setAuthState('signed_out');
          }
        }
        // All other events (TOKEN_REFRESHED, USER_UPDATED, etc.) are ignored.
        // The session remains valid — no UI change needed.
      });

      subscription = data.subscription;
    }

    bootstrap();

    // Cleanup: when this component unmounts, stop listening for auth events.
    // Without this, the listener would persist and potentially cause memory leaks.
    return () => { if (subscription) subscription.unsubscribe(); };
  }, []);

  // ── URL-based navigation ──
  // Updates both the browser's URL bar and the React state in one step.
  // Using pushState keeps the back button working without a full page reload.
  function navigate(name, id) {
    const url = new URL(window.location.href);
    url.searchParams.set('view', name);
    if (id) url.searchParams.set('id', id);
    else url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    setView({ name, id });
  }

  // ── Render based on auth state ──
  if (authState === 'loading' || authState === 'checking') return <Loading />;
  if (authState === 'signed_out')  return <SignIn />;
  if (authState === 'not_allowed') return <NotAllowed email={session?.user?.email} />;

  // Auth is confirmed — render the app
  return (
    <>
      {/* Migration modal sits on top of everything if legacy data is found */}
      {showMigration && (
        <MigrationModal
          onDone={() => setShowMigration(false)}
          onOpen={(id) => { setShowMigration(false); navigate('editor', id); }}
        />
      )}
      {/* Route to editor or project list based on URL */}
      {view.name === 'editor' && view.id
        ? <ProjectEditor projectId={view.id} onBack={() => navigate('projects')} />
        : <ProjectList onOpen={(id) => navigate('editor', id)} />
      }
    </>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// Mount the Root component into the #root div in index.html.
// Everything above this line is a definition — this line is what starts the app.
// ─────────────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
