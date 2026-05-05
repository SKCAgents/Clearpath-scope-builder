// ─── Scope Builder Components ────────────────────────────────────────────────

const C = {
  slate:    '#3F4E5A',
  offwhite: '#EFECE8',
  magnolia: '#83443D',
  gold:     '#C3BDB1',
  goldDark: '#a8a09a',
  border:   '#dedad5',
  bgLight:  '#F5F2EF',
};

// ─── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size=16, color='currentColor', stroke=1.5 }) =>
  React.createElement('svg', { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:stroke, strokeLinecap:'round', strokeLinejoin:'round' },
    React.createElement('path', { d }));

const ChevronDown = ({ open }) => React.createElement(Icon, {
  d: open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6', size:14, color:C.goldDark });

// ─── Single scope line item ──────────────────────────────────────────────────
function LineItem({ text, included, onToggle, onEdit, onDelete, isCustom }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(text);
  const inputRef = React.useRef();

  function saveEdit() {
    onEdit(val.trim() || text);
    setEditing(false);
  }

  const liStyles = {
    display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0',
    borderBottom: `1px solid ${C.border}`, opacity: included ? 1 : 0.4,
    transition: 'opacity 0.15s',
  };

  return React.createElement('div', { style: liStyles },
    // Checkbox
    React.createElement('button', {
      onClick: onToggle,
      style: {
        width: 16, height: 16, marginTop: 2, flexShrink: 0, border: `1.5px solid ${included ? C.magnolia : C.goldDark}`,
        background: included ? C.magnolia : 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }
    },
      included && React.createElement('svg', { width:10, height:10, viewBox:'0 0 10 10', fill:'none' },
        React.createElement('polyline', { points:'1.5,5 4,7.5 8.5,2', stroke:'white', strokeWidth:1.5, strokeLinecap:'round', strokeLinejoin:'round' }))
    ),
    // Text / edit field
    editing
      ? React.createElement('div', { style: { flex: 1, display:'flex', gap:6 } },
          React.createElement('textarea', {
            ref: inputRef,
            value: val,
            onChange: e => setVal(e.target.value),
            onKeyDown: e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === 'Escape') { setEditing(false); setVal(text); } },
            style: {
              flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 12,
              border: `1px solid ${C.magnolia}`, padding: '4px 6px', resize: 'vertical',
              minHeight: 56, color: C.slate, outline: 'none',
            },
            autoFocus: true,
          }),
          React.createElement('div', { style: { display:'flex', flexDirection:'column', gap:4 } },
            React.createElement('button', { onClick: saveEdit, style: btnSmall(C.magnolia, 'white') }, 'Save'),
            React.createElement('button', { onClick: () => { setEditing(false); setVal(text); }, style: btnSmall('#ccc', C.slate) }, 'Cancel')
          )
        )
      : React.createElement('span', {
          style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 12, lineHeight: 1.6, color: C.slate, cursor: 'pointer' },
          onClick: () => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 50); }
        }, text),
    // Actions
    !editing && React.createElement('div', { style: { display:'flex', gap:4, flexShrink:0 } },
      React.createElement('button', {
        onClick: () => setEditing(true),
        title: 'Edit',
        style: { background:'none', border:'none', cursor:'pointer', padding:'2px 4px', color: C.goldDark, fontSize:11 }
      }, '✏️'),
      React.createElement('button', {
        onClick: onDelete,
        title: 'Remove',
        style: { background:'none', border:'none', cursor:'pointer', padding:'2px 4px', color: C.goldDark, fontSize:11 }
      }, '✕')
    )
  );
}

function btnSmall(bg, color) {
  return { background: bg, color, border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontFamily: "'Figtree', sans-serif", fontWeight: 500 };
}

// ─── Section Accordion ──────────────────────────────────────────────────────
function SectionAccordion({ section, onUpdateItems, onToggleAll, onMoveUp, onMoveDown, onDelete, isFirst, isLast, dragHandleProps }) {
  const [open, setOpen] = React.useState(section.defaultOpen || false);
  const [newLine, setNewLine] = React.useState('');
  const includedCount = section.items.filter(i => i.included).length;

  function updateItem(idx, patch) {
    const items = section.items.map((it, i) => i === idx ? { ...it, ...patch } : it);
    onUpdateItems(section.id, items);
  }

  function deleteItem(idx) {
    const items = section.items.filter((_, i) => i !== idx);
    onUpdateItems(section.id, items);
  }

  function addItem() {
    if (!newLine.trim()) return;
    const items = [...section.items, { id: Date.now(), text: newLine.trim(), included: true, custom: true }];
    onUpdateItems(section.id, items);
    setNewLine('');
  }

  return React.createElement('div', { style: { marginBottom: 2 } },
    // Header
    React.createElement('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: 0,
        background: open ? C.bgLight : 'white',
        borderLeft: `3px solid ${includedCount > 0 ? C.magnolia : C.border}`,
        transition: 'background 0.15s',
      },
    },
      // Drag handle
      React.createElement('div', {
        ...dragHandleProps,
        style: { padding: '10px 8px', cursor: 'grab', color: C.goldDark, fontSize: 14, userSelect: 'none', flexShrink: 0 },
        title: 'Drag to reorder',
      }, '⠿'),
      // Expand toggle
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '10px 10px 10px 2px', cursor: 'pointer' },
        onClick: () => setOpen(o => !o),
      },
        React.createElement(ChevronDown, { open }),
        React.createElement('span', {
          style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.slate }
        }, section.title),
        React.createElement('span', {
          style: { fontFamily: "'Figtree', sans-serif", fontSize: 11, color: includedCount > 0 ? C.magnolia : C.goldDark, fontWeight: includedCount > 0 ? 500 : 300 }
        }, `${includedCount}/${section.items.length}`),
      ),
      // Controls
      React.createElement('div', { style: { display:'flex', gap:0, flexShrink:0, paddingRight:6 } },
        React.createElement('button', {
          onClick: e => { e.stopPropagation(); onToggleAll(section.id); },
          title: 'Toggle all', style: { ...btnSmall(C.border, C.slate), fontSize: 10, marginRight: 4 }
        }, includedCount === section.items.length ? 'None' : 'All'),
        React.createElement('button', { onClick: onMoveUp, disabled: isFirst, title: 'Move up',
          style: { background:'none', border:'none', cursor: isFirst ? 'default' : 'pointer', color: isFirst ? C.border : C.goldDark, fontSize:14, padding:'0 3px' } }, '↑'),
        React.createElement('button', { onClick: onMoveDown, disabled: isLast, title: 'Move down',
          style: { background:'none', border:'none', cursor: isLast ? 'default' : 'pointer', color: isLast ? C.border : C.goldDark, fontSize:14, padding:'0 3px' } }, '↓'),
        React.createElement('button', { onClick: () => { if (window.confirm(`Remove section "${section.title}"?`)) onDelete(); }, title: 'Delete section',
          style: { background:'none', border:'none', cursor:'pointer', color: C.goldDark, fontSize:13, padding:'0 3px', opacity:0.5 } }, '✕'),
      )
    ),
    // Body
    open && React.createElement('div', { style: { padding: '4px 14px 12px 14px', background: C.bgLight, borderLeft: `3px solid ${C.magnolia}` } },
      section.items.map((item, idx) =>
        React.createElement(LineItem, {
          key: item.id,
          text: item.text,
          included: item.included,
          isCustom: item.custom,
          onToggle: () => updateItem(idx, { included: !item.included }),
          onEdit: text => updateItem(idx, { text }),
          onDelete: () => deleteItem(idx),
        })
      ),
      React.createElement('div', { style: { display:'flex', gap:6, marginTop:10 } },
        React.createElement('input', {
          placeholder: 'Add custom scope line…',
          value: newLine,
          onChange: e => setNewLine(e.target.value),
          onKeyDown: e => e.key === 'Enter' && addItem(),
          style: { flex: 1, fontFamily: "'Figtree', sans-serif", fontSize: 12, padding: '6px 10px', border: `1px solid ${C.border}`, background: 'white', color: C.slate, outline: 'none' }
        }),
        React.createElement('button', { onClick: addItem, style: btnSmall(C.slate, 'white') }, '+ Add')
      )
    )
  );
}

// ─── Exclusions panel ────────────────────────────────────────────────────────
function ExclusionsPanel({ exclusions, onUpdate }) {
  const [open, setOpen] = React.useState(false);
  const [newLine, setNewLine] = React.useState('');

  function toggle(idx) {
    onUpdate(exclusions.map((e, i) => i === idx ? { ...e, included: !e.included } : e));
  }
  function del(idx) { onUpdate(exclusions.filter((_, i) => i !== idx)); }
  function add() {
    if (!newLine.trim()) return;
    onUpdate([...exclusions, { id: Date.now(), text: newLine.trim(), included: true }]);
    setNewLine('');
  }
  const count = exclusions.filter(e => e.included).length;

  return React.createElement('div', { style: { marginBottom: 2 } },
    React.createElement('div', {
      style: {
        display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
        background: open ? '#FFF5F4' : 'white', cursor:'pointer',
        borderLeft: `3px solid ${count > 0 ? C.magnolia : C.border}`,
      },
      onClick: () => setOpen(o=>!o),
    },
      React.createElement(ChevronDown, { open }),
      React.createElement('span', { style:{ flex:1, fontFamily:"'Figtree', sans-serif", fontWeight:500, fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', color: C.magnolia } }, 'Standard Exclusions'),
      React.createElement('span', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:11, color: C.magnolia } }, `${count} included`)
    ),
    open && React.createElement('div', { style:{ padding:'4px 14px 12px 14px', background:'#FFF5F4', borderLeft:`3px solid ${C.magnolia}` } },
      exclusions.map((item, idx) =>
        React.createElement(LineItem, { key:item.id, text:item.text, included:item.included,
          onToggle: ()=>toggle(idx), onEdit: t=>onUpdate(exclusions.map((e,i)=>i===idx?{...e,text:t}:e)), onDelete:()=>del(idx) })
      ),
      React.createElement('div', { style:{display:'flex',gap:6,marginTop:10} },
        React.createElement('input', {
          placeholder:'Add exclusion line…', value:newLine, onChange:e=>setNewLine(e.target.value),
          onKeyDown:e=>e.key==='Enter'&&add(),
          style:{flex:1,fontFamily:"'Figtree', sans-serif",fontSize:12,padding:'6px 10px',border:`1px solid ${C.border}`,background:'white',color:C.slate,outline:'none'}
        }),
        React.createElement('button', { onClick:add, style:btnSmall(C.magnolia,'white') },'+ Add')
      )
    )
  );
}

// ─── Project Info Form ────────────────────────────────────────────────────────
function ProjectInfo({ info, onChange }) {
  const field = (label, key, placeholder, type='text') =>
    React.createElement('div', { style:{ marginBottom:14 } },
      React.createElement('label', { style:{ display:'block', fontFamily:"'Figtree', sans-serif", fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:C.goldDark, marginBottom:4, fontWeight:500 } }, label),
      React.createElement('input', {
        type, value: info[key] || '', placeholder,
        onChange: e => onChange({ ...info, [key]: e.target.value }),
        style: { width:'100%', fontFamily:"'Figtree', sans-serif", fontSize:12, color:C.slate, border:'none', borderBottom:`1px solid ${C.border}`, padding:'5px 0', background:'transparent', outline:'none' }
      })
    );

  const textarea = (label, key, placeholder, rows=4) =>
    React.createElement('div', { style:{ marginBottom:14 } },
      React.createElement('label', { style:{ display:'block', fontFamily:"'Figtree', sans-serif", fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:C.goldDark, marginBottom:4, fontWeight:500 } }, label),
      React.createElement('textarea', {
        value: info[key] || '', placeholder, rows,
        onChange: e => onChange({ ...info, [key]: e.target.value }),
        style: { width:'100%', fontFamily:"'Figtree', sans-serif", fontSize:12, color:C.slate, border:`1px solid ${C.border}`, padding:'8px 10px', background:'white', outline:'none', resize:'vertical', lineHeight:1.5 }
      })
    );

  const sectionHeader = text => React.createElement('div', {
    style:{ fontFamily:"'Figtree', sans-serif", fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:C.goldDark, marginBottom:12, marginTop:20, fontWeight:500 }
  }, text);

  return React.createElement('div', { style:{ padding:16 } },
    field('Project Name', 'projectName', 'e.g. Walter Addition'),
    field('Client Name', 'clientName', 'e.g. Walter Family'),
    field('Project Address', 'address', 'e.g. 123 Main St, Nashville, TN'),
    field('Prepared Date', 'date', 'e.g. April 2026'),
    field('Prepared By', 'preparedBy', 'e.g. ClearPath Construction'),

    React.createElement('div', { style:{ marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}` } },
      sectionHeader('Project Description'),
      textarea('Description', 'description', 'A brief overview of the project — what we\'re building, key features, and goals…', 5),

      sectionHeader('Preliminary Estimate'),
      field('Total Estimate', 'estimate', '$997,972'),
      field('Low Range', 'estimateLow', '$948,000'),
      field('High Range', 'estimateHigh', '$1,048,000'),

      sectionHeader('Design Deposit'),
      field('Deposit Amount', 'deposit', '$15,000'),
      field('Deposit Memo', 'depositMemo', 'e.g. Walter Addition Design Fee'),

      sectionHeader('Schedule'),
      field('Estimated Start', 'startDate', 'e.g. June 2026'),
      field('Estimated Completion', 'endDate', 'e.g. February 2027'),
      field('Total Duration', 'duration', 'e.g. 8 months'),
      textarea('Schedule Notes', 'scheduleNotes', 'Optional notes on phasing, milestones, or scheduling considerations…', 3),
    )
  );
}

// ─── Add-Ons Panel ────────────────────────────────────────────────────────────
function AddOnsPanel({ addOns, onChange }) {
  return React.createElement('div', { style:{ padding:16, borderTop:`1px solid ${C.border}` } },
    React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:C.goldDark, marginBottom:4, fontWeight:500 } }, 'Optional Add-Ons'),
    React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:10, color:C.goldDark, marginBottom:14, fontStyle:'italic' } }, 'Shown beneath the preliminary price'),
    addOns.map((a, i) =>
      React.createElement('div', { key:i, style:{ background:C.bgLight, padding:12, marginBottom:10, borderLeft:`3px solid ${C.gold}` } },
        React.createElement('div', { style:{ display:'flex', gap:8, marginBottom:8 } },
          React.createElement('input', {
            value: a.title || '', placeholder:'Add-on title (e.g. Pool & Spa)',
            onChange: e => { const n=[...addOns]; n[i]={...n[i],title:e.target.value}; onChange(n); },
            style:{ flex:2, fontFamily:"'Figtree', sans-serif", fontSize:11, border:'none', borderBottom:`1px solid ${C.border}`, padding:'4px 0', background:'transparent', outline:'none', color:C.slate, fontWeight:500 }
          }),
          React.createElement('input', {
            value: a.amount || '', placeholder:'$0',
            onChange: e => { const n=[...addOns]; n[i]={...n[i],amount:e.target.value}; onChange(n); },
            style:{ flex:1, fontFamily:"'Figtree', sans-serif", fontSize:11, border:'none', borderBottom:`1px solid ${C.border}`, padding:'4px 0', background:'transparent', outline:'none', color:C.magnolia, fontWeight:500, textAlign:'right' }
          }),
          React.createElement('button', {
            onClick: () => onChange(addOns.filter((_,j)=>j!==i)),
            style:{ background:'none', border:'none', cursor:'pointer', color:C.goldDark, fontSize:13, padding:'0 2px' }
          }, '✕')
        ),
        React.createElement('textarea', {
          value: a.desc || '', placeholder:'Description of this add-on, what\'s included, and any caveats…',
          rows: 3,
          onChange: e => { const n=[...addOns]; n[i]={...n[i],desc:e.target.value}; onChange(n); },
          style:{ width:'100%', fontFamily:"'Figtree', sans-serif", fontSize:11, lineHeight:1.5, color:C.slate, border:`1px solid ${C.border}`, padding:'6px 8px', background:'white', outline:'none', resize:'vertical' }
        })
      )
    ),
    React.createElement('button', {
      onClick: () => onChange([...addOns, { id:Date.now(), title:'', amount:'', desc:'' }]),
      style:{ ...btnSmall(C.bgLight, C.slate), marginTop:4, width:'100%', textAlign:'center' }
    }, '+ Add Optional Add-On')
  );
}

// ─── Allowances Panel ─────────────────────────────────────────────────────────
function AllowancesPanel({ allowances, onChange }) {
  return React.createElement('div', { style:{ padding:16, borderTop:`1px solid ${C.border}` } },
    React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:C.goldDark, marginBottom:12, fontWeight:500 } }, 'Allowances'),
    allowances.map((a, i) =>
      React.createElement('div', { key:i, style:{ display:'flex', gap:8, marginBottom:10, alignItems:'center' } },
        React.createElement('input', {
          value: a.label, onChange: e => { const n=[...allowances]; n[i]={...n[i],label:e.target.value}; onChange(n); },
          style:{ flex:2, fontFamily:"'Figtree', sans-serif", fontSize:11, border:'none', borderBottom:`1px solid ${C.border}`, padding:'4px 0', background:'transparent', outline:'none', color:C.slate }
        }),
        React.createElement('input', {
          value: a.amount, onChange: e => { const n=[...allowances]; n[i]={...n[i],amount:e.target.value}; onChange(n); },
          style:{ flex:1, fontFamily:"'Figtree', sans-serif", fontSize:11, border:'none', borderBottom:`1px solid ${C.border}`, padding:'4px 0', background:'transparent', outline:'none', color:C.magnolia, fontWeight:500, textAlign:'right' }
        }),
        React.createElement('button', {
          onClick: () => onChange(allowances.filter((_,j)=>j!==i)),
          style:{ background:'none', border:'none', cursor:'pointer', color:C.goldDark, fontSize:13, padding:'0 2px' }
        }, '✕')
      )
    ),
    React.createElement('button', {
      onClick: () => onChange([...allowances, { id:Date.now(), label:'New Allowance', amount:'$0', desc:'' }]),
      style:{ ...btnSmall(C.bgLight, C.slate), marginTop:4, width:'100%', textAlign:'center' }
    }, '+ Add Allowance')
  );
}

// Export
Object.assign(window, { SectionAccordion, ExclusionsPanel, ProjectInfo, AllowancesPanel, AddOnsPanel, C, btnSmall });
