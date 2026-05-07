/**
 * supabase.js — Database client and all server communication helpers
 *
 * This file creates the connection to Supabase (our database + auth provider)
 * and exposes every database operation the app needs as a simple function on
 * the global window object (window.cp*). Using the window object lets the other
 * files (app.jsx, index.html) call these functions without needing a module
 * bundler — the app runs directly in the browser with no build step.
 *
 * Loaded as a JavaScript module (type="module") so the import statement works.
 * ES modules are guaranteed to finish loading before the browser processes the
 * other <script> tags, so app.jsx can safely call these functions on startup.
 *
 * Database tables used:
 *   allowed_users    — email allow-list (controls who can access the app)
 *   projects         — saved scope documents
 *   library_sections — custom scope lines added to the master library by users
 *   library_exclusions — custom exclusion lines added to the master library
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Supabase connection ───────────────────────────────────────────────────────
// These credentials are safe to expose in the browser. The anon key only allows
// operations that are explicitly permitted by Supabase's Row Level Security (RLS)
// policies — it cannot be used to bypass those policies.
const SUPABASE_URL      = 'https://ircpwesvzhipusfzytfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY3B3ZXN2emhpcHVzZnp5dGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDI1NzQsImV4cCI6MjA5MzU3ODU3NH0.kQl0RVZBHQM4zzcBhGTI0-SRfU26QbSk-zpufcG0Ifg';

// Create the Supabase client. The underscore prefix (_sb) signals that this
// instance is internal to this file — all external code uses the window.cp* wrappers.
const _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ── Authentication ────────────────────────────────────────────────────────────

// Starts the Google sign-in flow. Redirects the user to Google's login page,
// then brings them back to the current URL after they authenticate.
window.cpSignInGoogle = function () {
  return _sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
};

// Signs the current user out and clears their session from the browser.
window.cpSignOut = function () {
  return _sb.auth.signOut();
};

// Registers a callback function that will be called whenever the auth state
// changes (sign-in, sign-out, token refresh, etc.). Returns an object with
// a subscription that can be unsubscribed to stop listening.
window.cpOnAuthChange = function (callback) {
  return _sb.auth.onAuthStateChange(callback);
};

// Returns the current session from localStorage. This is instant — no network
// request is needed unless the access token is expired and needs to be refreshed.
// Returns null if no session exists (user is signed out).
window.cpGetSession = async function () {
  const { data } = await _sb.auth.getSession();
  return data.session;
};


// ── Access control ────────────────────────────────────────────────────────────

// Checks whether a given email address is on the approved access list.
// Returns true if the user is allowed, false if not.
// This is a secondary access control layer on top of Google auth — even users
// with valid Google accounts are blocked unless their email is in this table.
window.cpIsAllowed = async function (email) {
  const { data } = await _sb
    .from('allowed_users')
    .select('email')
    .ilike('email', email)    // Case-insensitive match so capitalization doesn't matter
    .maybeSingle();           // Returns null instead of an error if no row is found
  return !!data;              // true if a row was found, false if not
};


// ── Projects ──────────────────────────────────────────────────────────────────

// Returns all projects for the currently signed-in user, sorted by most recently
// updated first. Only returns the columns needed for the project list view —
// the full scope data (which can be large) is fetched separately when opening a project.
window.cpListProjects = async function () {
  const { data, error } = await _sb
    .from('projects')
    .select('id, name, client_name, address, project_type, updated_at, created_at')
    .order('updated_at', { ascending: false });
  return { data: data || [], error };
};

// Returns the full record for a single project, including all scope data.
// Used when opening a project in the editor.
window.cpGetProject = async function (id) {
  const { data, error } = await _sb
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

// Creates a new project in the database and returns the created record.
// Records who created it (created_by) for audit purposes.
window.cpCreateProject = async function ({ name, client_name, address, project_type, data: initialData }) {
  const { data: { user } } = await _sb.auth.getUser();
  const { data, error } = await _sb
    .from('projects')
    .insert({
      name,
      client_name,
      address,
      project_type,
      data:       initialData || {},   // The full scope state (sections, info, etc.)
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();
  return { data, error };
};

// Saves changes to an existing project. Called by the auto-save system in
// ProjectEditor after the user pauses typing for 1.5 seconds.
// The 'fields' object can contain any subset of project columns to update.
window.cpUpdateProject = async function (id, fields) {
  const { data: { user } } = await _sb.auth.getUser();
  const { error } = await _sb
    .from('projects')
    .update({ ...fields, updated_by: user.id })
    .eq('id', id);
  return { error };
};

// Permanently deletes a project. This cannot be undone.
window.cpDeleteProject = async function (id) {
  const { error } = await _sb.from('projects').delete().eq('id', id);
  return { error };
};

// Returns the total number of projects for the current user.
// Used to decide whether to show the "import from localStorage" migration prompt.
window.cpProjectCount = async function () {
  const { count } = await _sb
    .from('projects')
    .select('id', { count: 'exact', head: true });  // head:true means don't fetch rows, just the count
  return count || 0;
};


// ── Scope library ─────────────────────────────────────────────────────────────

// Returns the customized scope library from the database.
// This includes any scope lines or exclusions that users have added to the
// master library via the "+ lib" button in the editor.
// These are merged with the hardcoded SCOPE_LIBRARY in index.html so all
// new projects start with both the defaults and any user additions.
window.cpListLibrary = async function () {
  const [{ data: sections }, { data: exclusions }] = await Promise.all([
    _sb.from('library_sections').select('*').order('sort_order'),
    _sb.from('library_exclusions').select('*').order('sort_order'),
  ]);
  return { sections: sections || [], exclusions: exclusions || [] };
};

// Adds a custom scope line to the master library so it appears in all future
// projects by default. If the section already exists in the library, the line
// is appended to it. If the section doesn't exist yet, a new one is created.
// Returns { alreadyExists: true } if the exact text is already in the library.
window.cpAddToLibrary = async function (sectionId, sectionTitle, itemText) {
  // Check if this section already has a library entry
  const { data: existing } = await _sb
    .from('library_sections')
    .select('*')
    .eq('id', sectionId)
    .maybeSingle();

  if (existing) {
    // Section exists — check for duplicate text before appending
    if (existing.items.includes(itemText)) {
      return { error: null, alreadyExists: true };
    }
    const { error } = await _sb
      .from('library_sections')
      .update({ items: [...existing.items, itemText] })
      .eq('id', sectionId);
    return { error };
  } else {
    // Section doesn't exist in the library yet — create it
    // sort_order: 999 places it at the end of the library list
    const { error } = await _sb
      .from('library_sections')
      .insert({ id: sectionId, title: sectionTitle, sort_order: 999, items: [itemText] });
    return { error };
  }
};
