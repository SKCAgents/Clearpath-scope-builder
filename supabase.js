// ClearPath — Supabase client & helpers
(function () {
  const SUPABASE_URL = 'https://ircpwesvzhipusfzytfn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY3B3ZXN2emhpcHVzZnp5dGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDI1NzQsImV4cCI6MjA5MzU3ODU3NH0.kQl0RVZBHQM4zzcBhGTI0-SRfU26QbSk-zpufcG0Ifg';

  const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ── Auth ──────────────────────────────────────────────────────────────────
  window.cpSignInGoogle = function () {
    return _sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
  };

  window.cpSignOut = function () { return _sb.auth.signOut(); };

  window.cpOnAuthChange = function (cb) { return _sb.auth.onAuthStateChange(cb); };

  window.cpGetSession = async function () {
    const { data } = await _sb.auth.getSession();
    return data.session;
  };

  // ── Allow-list ────────────────────────────────────────────────────────────
  window.cpIsAllowed = async function (email) {
    const { data } = await _sb
      .from('allowed_users')
      .select('email')
      .ilike('email', email)
      .maybeSingle();
    return !!data;
  };

  // ── Projects ──────────────────────────────────────────────────────────────
  window.cpListProjects = async function () {
    const { data, error } = await _sb
      .from('projects')
      .select('id,name,client_name,address,project_type,updated_at,created_at')
      .order('updated_at', { ascending: false });
    return { data: data || [], error };
  };

  window.cpGetProject = async function (id) {
    const { data, error } = await _sb.from('projects').select('*').eq('id', id).single();
    return { data, error };
  };

  window.cpCreateProject = async function ({ name, client_name, address, project_type, data: initialData }) {
    const { data: { user } } = await _sb.auth.getUser();
    const { data, error } = await _sb
      .from('projects')
      .insert({ name, client_name, address, project_type, data: initialData || {}, created_by: user.id, updated_by: user.id })
      .select()
      .single();
    return { data, error };
  };

  window.cpUpdateProject = async function (id, fields) {
    const { data: { user } } = await _sb.auth.getUser();
    const { error } = await _sb
      .from('projects')
      .update({ ...fields, updated_by: user.id })
      .eq('id', id);
    return { error };
  };

  window.cpDeleteProject = async function (id) {
    const { error } = await _sb.from('projects').delete().eq('id', id);
    return { error };
  };

  window.cpProjectCount = async function () {
    const { count } = await _sb.from('projects').select('id', { count: 'exact', head: true });
    return count || 0;
  };

  // ── Library ───────────────────────────────────────────────────────────────
  window.cpListLibrary = async function () {
    const [{ data: sections }, { data: exclusions }] = await Promise.all([
      _sb.from('library_sections').select('*').order('sort_order'),
      _sb.from('library_exclusions').select('*').order('sort_order'),
    ]);
    return { sections: sections || [], exclusions: exclusions || [] };
  };
})();
