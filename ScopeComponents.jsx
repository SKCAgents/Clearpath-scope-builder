/**
 * ScopeComponents.jsx — Shared UI building blocks for the scope editor
 *
 * Contains all the reusable components that make up the scope builder interface:
 *   - LineItem       — a single scope line with a checkbox, edit, and delete
 *   - SectionAccordion — a collapsible group of scope lines
 *   - ExclusionsPanel  — the standard exclusions section at the bottom
 *   - ProjectInfo      — the left sidebar form for project details
 *   - AllowancesPanel  — editable allowance line items
 *   - AddOnsPanel      — optional add-on items shown below the estimate
 *
 * Also defines the color palette (C) and button style helper (btnSmall)
 * used throughout the entire app.
 *
 * These components are exported to window so that index.html can use them
 * without a module bundler.
 */


// ── Color palette ─────────────────────────────────────────────────────────────
// Single source of truth for all colors in the app. Every component references
// these instead of hardcoding hex values, so the visual identity stays consistent.
const C = {
  slate:    '#3F4E5A',   // Primary dark color — nav bars, headings, buttons
  offwhite: '#EFECE8',   // Background and text on dark surfaces
  magnolia: '#83443D',   // Accent color — included items, active states
  gold:     '#C3BDB1',   // Secondary text on dark backgrounds
  goldDark: '#a8a09a',   // Secondary text on light backgrounds
  border:   '#dedad5',   // Dividers and input borders
  bgLight:  '#F5F2EF',   // Page background, alternating row color
};


// ── Icon helper ───────────────────────────────────────────────────────────────
// Renders an SVG icon from a path definition. Using SVG paths instead of an
// icon library keeps the bundle small and avoids an extra network request.
const Icon = ({ d, size = 16, color = 'currentColor', stroke = 1.5 }) =>
  React.createElement('svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d })
  );

// A chevron icon that points up (when open=true) or down (when open=false).
// Used as the expand/collapse indicator on every accordion section.
const ChevronDown = ({ open }) =>
  React.createElement(Icon, {
    d: open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6',
    size: 14,
    color: C.goldDark,
  });


// ── Shared button style helper ────────────────────────────────────────────────
// Returns a style object for a small inline button. Accepts background and text
// color so it can be used across different contexts without duplication.
function btnSmall(bg, color) {
  return {
    background: bg,
    color,
    border: 'none',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: "'Figtree', sans-serif",
    fontWeight: 500,
  };
}


// ── LineItem ──────────────────────────────────────────────────────────────────
// A single scope line within a section. Supports:
//   - Toggling included/excluded via a checkbox
//   - Inline editing (click the text to edit, Enter or Save to confirm)
//   - Deleting the line
//   - "Add to library" button for custom lines (promotes a one-off line to the
//     master library so it shows up in all future projects)
//   - "Save to Library" button in edit mode — saves the edit locally AND
//     updates the master library version of this line for all future projects
//
// Props:
//   text            — the scope line text (the current local value)
//   libraryText     — the original text as it exists in the library (null for
//                     items that aren't from the library yet, e.g. user custom)
//   included        — whether this line is currently checked/included
//   isCustom        — true if the user added this line themselves (vs. from the library)
//   onToggle        — called when the checkbox is clicked
//   onEdit(text)    — called with the new text when the user finishes editing
//   onDelete        — called when the user clicks the remove button
//   onAddToLibrary  — called with the text when the user clicks "+ lib"
//                     (null if the feature is unavailable for this item)
//   onSaveToLibrary — called with the new text when the user clicks "Save to
//                     Library" in edit mode. Updates project AND library.
//                     Null if not allowed (e.g. exclusions).
function LineItem({ text, libraryText, included, onToggle, onEdit, onDelete, isCustom, onAddToLibrary, onSaveToLibrary }) {
  const [editing, setEditing] = React.useState(false);  // Whether the edit textarea is showing
  const [val, setVal]         = React.useState(text);    // Live value while the user is typing
  const inputRef = React.useRef();

  // Commit the edit — trim whitespace, fall back to the original text if empty
  function saveEdit() {
    onEdit(val.trim() || text);
    setEditing(false);
  }

  // Save the edit locally AND push it to the master library, where it replaces
  // the library's version of this line (or is added if not yet in the library).
  function saveEditAndLibrary() {
    const next = val.trim() || text;
    onEdit(next);
    setEditing(false);
    if (onSaveToLibrary) onSaveToLibrary(next);
  }

  const liStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '6px 0',
    borderBottom: `1px solid ${C.border}`,
    opacity: included ? 1 : 0.4,          // Unchecked lines fade out to de-emphasize them
    transition: 'opacity 0.15s',
  };

  return React.createElement('div', { style: liStyles },

    // ── Checkbox ──
    // A custom-styled button that acts as a checkbox. We use a button instead of
    // <input type="checkbox"> for precise visual control.
    React.createElement('button', {
      onClick: onToggle,
      style: {
        width: 16, height: 16, marginTop: 2, flexShrink: 0,
        border: `1.5px solid ${included ? C.magnolia : C.goldDark}`,
        background: included ? C.magnolia : 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      },
    },
      // Show a checkmark SVG inside the box only when the item is included
      included && React.createElement('svg', { width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none' },
        React.createElement('polyline', { points: '1.5,5 4,7.5 8.5,2', stroke: 'white', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' })
      )
    ),

    // ── Text area — shows either the edit form or the plain text ──
    editing
      ? // Edit mode: a textarea with Save and Cancel buttons
        React.createElement('div', { style: { flex: 1, display: 'flex', gap: 6 } },
          React.createElement('textarea', {
            ref: inputRef,
            value: val,
            onChange: e => setVal(e.target.value),
            onKeyDown: e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); }  // Enter saves
              if (e.key === 'Escape') { setEditing(false); setVal(text); }                // Escape cancels
            },
            style: {
              flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 12,
              border: `1px solid ${C.magnolia}`, padding: '4px 6px',
              resize: 'vertical', minHeight: 56, color: C.slate, outline: 'none',
            },
            autoFocus: true,
          }),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
            React.createElement('button', { onClick: saveEdit, style: btnSmall(C.magnolia, 'white') }, 'Save'),
            onSaveToLibrary && React.createElement('button', {
              onClick: saveEditAndLibrary,
              title: 'Save edit and update the master library so this line shows up edited in all future projects',
              style: { ...btnSmall(C.slate, 'white'), whiteSpace: 'nowrap' }
            }, '+ Library'),
            React.createElement('button', { onClick: () => { setEditing(false); setVal(text); }, style: btnSmall('#ccc', C.slate) }, 'Cancel')
          )
        )
      : // Display mode: clicking the text enters edit mode
        React.createElement('span', {
          style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 12, lineHeight: 1.6, color: C.slate, cursor: 'pointer' },
          onClick: () => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 50); },
        }, text),

    // ── Action buttons (only shown when not in edit mode) ──
    !editing && React.createElement('div', { style: { display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' } },
      // "+ lib" button — only visible on lines the user added themselves.
      // Clicking it saves this line to the master library so it appears in
      // all future projects automatically.
      isCustom && onAddToLibrary && React.createElement('button', {
        onClick: () => onAddToLibrary(text),
        title: 'Add to master library',
        style: { background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', padding: '1px 5px', color: C.goldDark, fontSize: 9, letterSpacing: '0.08em', whiteSpace: 'nowrap' },
      }, '+ lib'),
      // Edit button
      React.createElement('button', {
        onClick: () => setEditing(true),
        title: 'Edit',
        style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: C.goldDark, fontSize: 11 },
      }, '✏️'),
      // Remove button
      React.createElement('button', {
        onClick: onDelete,
        title: 'Remove',
        style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: C.goldDark, fontSize: 11 },
      }, '✕')
    )
  );
}


// ── SectionAccordion ──────────────────────────────────────────────────────────
// A collapsible section containing a list of scope lines. Each section
// (e.g. "Framing", "Plumbing") is rendered as one accordion.
//
// Features:
//   - Click the header to expand/collapse
//   - "All / None" toggle to check or uncheck every line at once
//   - Up/down arrows to reorder sections within the list
//   - Drag handle for drag-to-reorder
//   - "Add custom line" input at the bottom of the expanded body
//   - A colored left border that turns accent-colored when any lines are included
//
// Props:
//   section          — the section data object { id, title, items: [...] }
//   onUpdateItems    — called with (sectionId, newItems) when items change
//   onToggleAll      — called with sectionId to toggle all items at once
//   onMoveUp/Down    — called to shift this section up or down in the list
//   onDelete         — called to remove this section entirely
//   isFirst/isLast   — disables the up/down arrows at the list boundaries
//   dragHandleProps  — event handlers passed to the drag handle element
//   onAddToLibrary         — passed through to each LineItem for the "+ lib" feature
//   onSaveToLibrary        — passed through to each LineItem for "Save to Library" edits
//   onSaveSectionToLibrary — called with (sectionId, sectionTitle, items[]) when
//                            the user clicks "Save Section to Library". Only
//                            shown on custom sections (id starting with 'custom_').
function SectionAccordion({ section, onUpdateItems, onToggleAll, onMoveUp, onMoveDown, onDelete, isFirst, isLast, dragHandleProps, onAddToLibrary, onSaveToLibrary, onSaveSectionToLibrary }) {
  const [open, setOpen]       = React.useState(section.defaultOpen || false);
  const [newLine, setNewLine] = React.useState('');  // The text in the "add custom line" input

  // Count how many items are currently included — shown in the header as "3/12"
  const includedCount = section.items.filter(i => i.included).length;

  // Replace one item's data (by index) while leaving the others unchanged
  function updateItem(idx, patch) {
    const items = section.items.map((it, i) => i === idx ? { ...it, ...patch } : it);
    onUpdateItems(section.id, items);
  }

  // Remove one item from the list
  function deleteItem(idx) {
    const items = section.items.filter((_, i) => i !== idx);
    onUpdateItems(section.id, items);
  }

  // Add a new custom scope line to the bottom of this section
  function addItem() {
    if (!newLine.trim()) return;
    const items = [
      ...section.items,
      { id: Date.now(), text: newLine.trim(), included: true, custom: true },
    ];
    onUpdateItems(section.id, items);
    setNewLine('');
  }

  return React.createElement('div', { style: { marginBottom: 2 } },

    // ── Section header ──
    React.createElement('div', {
      style: {
        display: 'flex', alignItems: 'center',
        background: open ? C.bgLight : 'white',
        // Left border turns accent-colored when at least one item is included
        borderLeft: `3px solid ${includedCount > 0 ? C.magnolia : C.border}`,
        transition: 'background 0.15s',
      },
    },
      // Drag handle — the ⠿ grip icon. Uses dragHandleProps from the parent
      // which includes the drag event handlers for reordering sections.
      React.createElement('div', {
        ...dragHandleProps,
        style: { padding: '10px 8px', cursor: 'grab', color: C.goldDark, fontSize: 14, userSelect: 'none', flexShrink: 0 },
        title: 'Drag to reorder',
      }, '⠿'),

      // Clickable area that expands or collapses the section body
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '10px 10px 10px 2px', cursor: 'pointer' },
        onClick: () => setOpen(o => !o),
      },
        React.createElement(ChevronDown, { open }),
        // Section title
        React.createElement('span', {
          style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.slate },
        }, section.title),
        // "3/12" counter — turns accent-colored when any items are included
        React.createElement('span', {
          style: { fontFamily: "'Figtree', sans-serif", fontSize: 11, color: includedCount > 0 ? C.magnolia : C.goldDark, fontWeight: includedCount > 0 ? 500 : 300 },
        }, `${includedCount}/${section.items.length}`),
      ),

      // ── Header controls (All/None, move up/down, delete) ──
      React.createElement('div', { style: { display: 'flex', gap: 0, flexShrink: 0, paddingRight: 6 } },
        // Toggle all — label switches between "All" and "None" based on current state
        React.createElement('button', {
          onClick: e => { e.stopPropagation(); onToggleAll(section.id); },
          title: 'Toggle all',
          style: { ...btnSmall(C.border, C.slate), fontSize: 10, marginRight: 4 },
        }, includedCount === section.items.length ? 'None' : 'All'),
        // Move up — disabled and grayed out when this is already the first section
        React.createElement('button', {
          onClick: onMoveUp, disabled: isFirst, title: 'Move up',
          style: { background: 'none', border: 'none', cursor: isFirst ? 'default' : 'pointer', color: isFirst ? C.border : C.goldDark, fontSize: 14, padding: '0 3px' },
        }, '↑'),
        // Move down — disabled and grayed out when this is already the last section
        React.createElement('button', {
          onClick: onMoveDown, disabled: isLast, title: 'Move down',
          style: { background: 'none', border: 'none', cursor: isLast ? 'default' : 'pointer', color: isLast ? C.border : C.goldDark, fontSize: 14, padding: '0 3px' },
        }, '↓'),
        // Delete section — confirms before removing
        React.createElement('button', {
          onClick: () => { if (window.confirm(`Remove section "${section.title}"?`)) onDelete(); },
          title: 'Delete section',
          style: { background: 'none', border: 'none', cursor: 'pointer', color: C.goldDark, fontSize: 13, padding: '0 3px', opacity: 0.5 },
        }, '✕'),
      )
    ),

    // ── Section body (only rendered when the section is expanded) ──
    open && React.createElement('div', {
      style: { padding: '4px 14px 12px 14px', background: C.bgLight, borderLeft: `3px solid ${C.magnolia}` },
    },
      // Render one LineItem per scope line in this section
      section.items.map((item, idx) =>
        React.createElement(LineItem, {
          key:        item.id,
          text:       item.text,
          libraryText: item.libraryText,
          included:   item.included,
          isCustom:   item.custom,
          onToggle: () => updateItem(idx, { included: !item.included }),
          onEdit:   text => updateItem(idx, { text }),
          onDelete: () => deleteItem(idx),
          // Pass the section ID and title along so the library save has the right context
          onAddToLibrary: onAddToLibrary
            ? text => onAddToLibrary(section.id, section.title, text)
            : null,
          onSaveToLibrary: onSaveToLibrary
            ? newText => onSaveToLibrary(section.id, section.title, item.libraryText, newText)
            : null,
        })
      ),
      // "Add custom scope line" input at the bottom of the expanded body
      React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 10 } },
        React.createElement('input', {
          placeholder: 'Add custom scope line…',
          value: newLine,
          onChange: e => setNewLine(e.target.value),
          onKeyDown: e => e.key === 'Enter' && addItem(),
          style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 12, padding: '6px 10px', border: `1px solid ${C.border}`, background: 'white', color: C.slate, outline: 'none' },
        }),
        React.createElement('button', { onClick: addItem, style: btnSmall(C.slate, 'white') }, '+ Add')
      ),

      // "Save Section to Library" — pushes a user-created custom section
      // (title + all items) into the master library so it shows up in all
      // future projects. Only shown on sections the user added in this
      // project (id starts with 'custom_') and only when there's at least
      // one line to save.
      section.id.startsWith('custom_') && onSaveSectionToLibrary && section.items.length > 0 &&
        React.createElement('div', { style: { marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.border}` } },
          React.createElement('button', {
            onClick: () => {
              const lines = section.items.length;
              if (!window.confirm(`Save section "${section.title}" with ${lines} line${lines === 1 ? '' : 's'} to the master library? It will appear in all future projects.`)) return;
              onSaveSectionToLibrary(section.id, section.title, section.items.map(i => i.text));
            },
            title: 'Add this section to the master library',
            style: { ...btnSmall(C.magnolia, 'white'), width: '100%', padding: '6px 8px', letterSpacing: '0.05em' }
          }, '↑ Save Section to Library')
        )
    )
  );
}


// ── ExclusionsPanel ───────────────────────────────────────────────────────────
// A special accordion section for "Standard Exclusions" — items that are
// explicitly called out as NOT included in the scope. Styled differently
// from scope sections (uses a warm pink background) to visually distinguish
// exclusions from inclusions.
function ExclusionsPanel({ exclusions, onUpdate }) {
  const [open, setOpen]       = React.useState(false);
  const [newLine, setNewLine] = React.useState('');

  // Toggle one exclusion's included state
  function toggle(idx) {
    onUpdate(exclusions.map((e, i) => i === idx ? { ...e, included: !e.included } : e));
  }

  // Remove one exclusion
  function del(idx) {
    onUpdate(exclusions.filter((_, i) => i !== idx));
  }

  // Add a new exclusion line
  function add() {
    if (!newLine.trim()) return;
    onUpdate([...exclusions, { id: Date.now(), text: newLine.trim(), included: true }]);
    setNewLine('');
  }

  const count = exclusions.filter(e => e.included).length;  // How many are currently checked

  return React.createElement('div', { style: { marginBottom: 2 } },
    // Header
    React.createElement('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: open ? '#FFF5F4' : 'white',
        cursor: 'pointer',
        borderLeft: `3px solid ${count > 0 ? C.magnolia : C.border}`,
      },
      onClick: () => setOpen(o => !o),
    },
      React.createElement(ChevronDown, { open }),
      React.createElement('span', {
        style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.magnolia },
      }, 'Standard Exclusions'),
      React.createElement('span', {
        style: { fontFamily: "'Figtree', sans-serif", fontSize: 11, color: C.magnolia },
      }, `${count} included`)
    ),
    // Body
    open && React.createElement('div', {
      style: { padding: '4px 14px 12px 14px', background: '#FFF5F4', borderLeft: `3px solid ${C.magnolia}` },
    },
      exclusions.map((item, idx) =>
        React.createElement(LineItem, {
          key: item.id, text: item.text, included: item.included,
          onToggle: () => toggle(idx),
          onEdit:   t => onUpdate(exclusions.map((e, i) => i === idx ? { ...e, text: t } : e)),
          onDelete: () => del(idx),
        })
      ),
      React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 10 } },
        React.createElement('input', {
          placeholder: 'Add exclusion line…', value: newLine,
          onChange: e => setNewLine(e.target.value),
          onKeyDown: e => e.key === 'Enter' && add(),
          style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 12, padding: '6px 10px', border: `1px solid ${C.border}`, background: 'white', color: C.slate, outline: 'none' },
        }),
        React.createElement('button', { onClick: add, style: btnSmall(C.magnolia, 'white') }, '+ Add')
      )
    )
  );
}


// ── ProjectInfo ───────────────────────────────────────────────────────────────
// The left sidebar form where the user fills in project details — name, client,
// address, dates, description, estimate, and deposit info. All fields feed into
// the printed scope document via the ScopeDocument component.
function ProjectInfo({ info, onChange }) {
  // Returns a rendered text input field with a label above it
  const field = (label, key, placeholder, type = 'text') =>
    React.createElement('div', { style: { marginBottom: 14 } },
      React.createElement('label', {
        style: { display: 'block', fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.goldDark, marginBottom: 4, fontWeight: 500 },
      }, label),
      React.createElement('input', {
        type, value: info[key] || '', placeholder,
        onChange: e => onChange({ ...info, [key]: e.target.value }),
        style: { width: '100%', fontFamily: "'Figtree', sans-serif", fontSize: 12, color: C.slate, border: 'none', borderBottom: `1px solid ${C.border}`, padding: '5px 0', background: 'transparent', outline: 'none' },
      })
    );

  // Returns a rendered multi-line textarea with a label above it
  const textarea = (label, key, placeholder, rows = 4) =>
    React.createElement('div', { style: { marginBottom: 14 } },
      React.createElement('label', {
        style: { display: 'block', fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.goldDark, marginBottom: 4, fontWeight: 500 },
      }, label),
      React.createElement('textarea', {
        value: info[key] || '', placeholder, rows,
        onChange: e => onChange({ ...info, [key]: e.target.value }),
        style: { width: '100%', fontFamily: "'Figtree', sans-serif", fontSize: 12, color: C.slate, border: `1px solid ${C.border}`, padding: '8px 10px', background: 'white', outline: 'none', resize: 'vertical', lineHeight: 1.5 },
      })
    );

  // Returns a small uppercase section label (used as a visual divider within the form)
  const sectionHeader = text =>
    React.createElement('div', {
      style: { fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.goldDark, marginBottom: 12, marginTop: 20, fontWeight: 500 },
    }, text);

  return React.createElement('div', { style: { padding: 16 } },
    field('Project Name',    'projectName', 'e.g. Walter Addition'),
    field('Client Name',     'clientName',  'e.g. Walter Family'),
    field('Project Address', 'address',     'e.g. 123 Main St, Nashville, TN'),
    field('Prepared Date',   'date',        'e.g. April 2026'),
    field('Prepared By',     'preparedBy',  'e.g. ClearPath Construction'),

    React.createElement('div', { style: { marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` } },
      sectionHeader('Project Description'),
      textarea('Description', 'description', "A brief overview of the project — what we're building, key features, and goals…", 5),

      sectionHeader('Preliminary Estimate'),
      field('Total Estimate', 'estimate',     '$997,972'),
      field('Low Range',      'estimateLow',  '$948,000'),
      field('High Range',     'estimateHigh', '$1,048,000'),

      sectionHeader('Design Deposit'),
      field('Deposit Amount', 'deposit',     '$15,000'),
      field('Deposit Memo',   'depositMemo', 'e.g. Walter Addition Design Fee'),

      sectionHeader('Schedule'),
      field('Estimated Start',      'startDate',     'e.g. June 2026'),
      field('Estimated Completion', 'endDate',        'e.g. February 2027'),
      field('Total Duration',       'duration',       'e.g. 8 months'),
      textarea('Schedule Notes',    'scheduleNotes',  'Optional notes on phasing, milestones, or scheduling considerations…', 3),
    )
  );
}


// ── AddOnsPanel ───────────────────────────────────────────────────────────────
// Optional add-on items that appear beneath the preliminary price in the printed
// document. Each add-on has a title, dollar amount, and description. Examples:
// "Pool & Spa — $120,000" or "Finished Basement — $85,000".
function AddOnsPanel({ addOns, onChange }) {
  return React.createElement('div', { style: { padding: 16, borderTop: `1px solid ${C.border}` } },
    React.createElement('div', { style: { fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.goldDark, marginBottom: 4, fontWeight: 500 } }, 'Optional Add-Ons'),
    React.createElement('div', { style: { fontFamily: "'Figtree', sans-serif", fontSize: 10, color: C.goldDark, marginBottom: 14, fontStyle: 'italic' } }, 'Shown beneath the preliminary price'),
    addOns.map((a, i) =>
      React.createElement('div', { key: i, style: { background: C.bgLight, padding: 12, marginBottom: 10, borderLeft: `3px solid ${C.gold}` } },
        // Title and price on one row, with an X to remove the add-on
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 8 } },
          React.createElement('input', {
            value: a.title || '', placeholder: 'Add-on title (e.g. Pool & Spa)',
            onChange: e => { const n = [...addOns]; n[i] = { ...n[i], title: e.target.value }; onChange(n); },
            style: { flex: 2, fontFamily: "'Figtree', sans-serif", fontSize: 11, border: 'none', borderBottom: `1px solid ${C.border}`, padding: '4px 0', background: 'transparent', outline: 'none', color: C.slate, fontWeight: 500 },
          }),
          React.createElement('input', {
            value: a.amount || '', placeholder: '$0',
            onChange: e => { const n = [...addOns]; n[i] = { ...n[i], amount: e.target.value }; onChange(n); },
            style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 11, border: 'none', borderBottom: `1px solid ${C.border}`, padding: '4px 0', background: 'transparent', outline: 'none', color: C.magnolia, fontWeight: 500, textAlign: 'right' },
          }),
          React.createElement('button', {
            onClick: () => onChange(addOns.filter((_, j) => j !== i)),
            style: { background: 'none', border: 'none', cursor: 'pointer', color: C.goldDark, fontSize: 13, padding: '0 2px' },
          }, '✕')
        ),
        // Description text area
        React.createElement('textarea', {
          value: a.desc || '', placeholder: "Description of this add-on, what's included, and any caveats…",
          rows: 3,
          onChange: e => { const n = [...addOns]; n[i] = { ...n[i], desc: e.target.value }; onChange(n); },
          style: { width: '100%', fontFamily: "'Figtree', sans-serif", fontSize: 11, lineHeight: 1.5, color: C.slate, border: `1px solid ${C.border}`, padding: '6px 8px', background: 'white', outline: 'none', resize: 'vertical' },
        })
      )
    ),
    React.createElement('button', {
      onClick: () => onChange([...addOns, { id: Date.now(), title: '', amount: '', desc: '' }]),
      style: { ...btnSmall(C.bgLight, C.slate), marginTop: 4, width: '100%', textAlign: 'center' },
    }, '+ Add Optional Add-On')
  );
}


// ── AllowancesPanel ───────────────────────────────────────────────────────────
// Editable line items for dollar allowances included in the estimate.
// Allowances cover items where the exact cost depends on client selections —
// for example "Plumbing Fixtures — $20,000" means the client has that budget
// to select their own fixtures within the project.
function AllowancesPanel({ allowances, onChange }) {
  return React.createElement('div', { style: { padding: 16, borderTop: `1px solid ${C.border}` } },
    React.createElement('div', { style: { fontFamily: "'Figtree', sans-serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.goldDark, marginBottom: 12, fontWeight: 500 } }, 'Allowances'),
    allowances.map((a, i) =>
      React.createElement('div', { key: i, style: { display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' } },
        // Label field (e.g. "Plumbing Fixtures")
        React.createElement('input', {
          value: a.label,
          onChange: e => { const n = [...allowances]; n[i] = { ...n[i], label: e.target.value }; onChange(n); },
          style: { flex: 2, fontFamily: "'Figtree', sans-serif", fontSize: 11, border: 'none', borderBottom: `1px solid ${C.border}`, padding: '4px 0', background: 'transparent', outline: 'none', color: C.slate },
        }),
        // Amount field (e.g. "$20,000")
        React.createElement('input', {
          value: a.amount,
          onChange: e => { const n = [...allowances]; n[i] = { ...n[i], amount: e.target.value }; onChange(n); },
          style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 11, border: 'none', borderBottom: `1px solid ${C.border}`, padding: '4px 0', background: 'transparent', outline: 'none', color: C.magnolia, fontWeight: 500, textAlign: 'right' },
        }),
        React.createElement('button', {
          onClick: () => onChange(allowances.filter((_, j) => j !== i)),
          style: { background: 'none', border: 'none', cursor: 'pointer', color: C.goldDark, fontSize: 13, padding: '0 2px' },
        }, '✕')
      )
    ),
    React.createElement('button', {
      onClick: () => onChange([...allowances, { id: Date.now(), label: 'New Allowance', amount: '$0', desc: '' }]),
      style: { ...btnSmall(C.bgLight, C.slate), marginTop: 4, width: '100%', textAlign: 'center' },
    }, '+ Add Allowance')
  );
}


// ── Exports ───────────────────────────────────────────────────────────────────
// Make everything available to index.html and app.jsx via the window object.
// This is the browser-compatible equivalent of ES module exports.
Object.assign(window, { SectionAccordion, ExclusionsPanel, ProjectInfo, AllowancesPanel, AddOnsPanel, C, btnSmall });
