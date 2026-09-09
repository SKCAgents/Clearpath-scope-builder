// ─── Document Preview Component ─────────────────────────────────────────────
// Renders a branded, print-ready scope of work from the builder state

function ScopeDocument({ info, sections, exclusions, allowances, addOns = [], designDrawings = [] }) {
  const slate = '#3F4E5A', offwhite = '#EFECE8', magnolia = '#83443D', gold = '#C3BDB1', goldDark = '#a8a09a', border = '#ece8e3';

  const includedSections = sections.filter(s => s.items.some(i => i.included));
  const includedExclusions = exclusions.filter(e => e.included);

  // Allowances are a fixed checkbox list: { id, label, amount, included }.
  // Scopes saved by an earlier version of the app have no `included` field at
  // all, so "missing" has to read as included — only an explicit false pulls an
  // allowance out of the covered list and into the excluded sentence.
  const includedAllowances = allowances.filter(a => a.included !== false);
  const excludedAllowances = allowances.filter(a => a.included === false);

  // Price and schedule are derived rather than typed. One price is entered and
  // printed only as a ±10% band; the four schedule dates come from today plus
  // the two phase durations. All of that logic lives in ScopeSchedule.js, which
  // the script tags load before this file.
  const range = window.cpPriceRange(info.estimate);

  // Every dollar amount prints through the same normalizer the editor's money
  // fields use on blur, so projects saved before that existed still read as
  // "$ 10,000". Non-amounts ("TBD", a hand-typed range) pass through unchanged.
  const money = window.cpMoneyInput;
  const sched = window.cpComputeSchedule(info);

  // Styles
  const docStyle = { fontFamily: "'Figtree', sans-serif", fontWeight: 300, fontSize: 11, color: slate, background: '#fff', width: '100%' };

  function SecTitle({ text }) {
    return React.createElement('div', {
      style: { display:'flex', alignItems:'stretch', gap:0, margin:'32px 0 14px' }
    },
      React.createElement('div', { style: { width:3, background:magnolia, flexShrink:0 } }),
      React.createElement('div', {
        style: { fontFamily:"'Cormorant Garamond', Georgia, serif", fontWeight:500, fontSize:20, color:slate, paddingLeft:14, lineHeight:1.1, letterSpacing:'-0.01em' }
      }, text)
    );
  }

  function SubTitle({ text }) {
    return React.createElement('div', {
      style: { display:'flex', alignItems:'stretch', gap:0, margin:'16px 0 8px' }
    },
      React.createElement('div', { style:{ width:2, background:gold, flexShrink:0 } }),
      React.createElement('div', {
        style:{ fontFamily:"'Figtree', sans-serif", fontWeight:500, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:slate, paddingLeft:12, paddingTop:2 }
      }, text)
    );
  }

  function Bullet({ text }) {
    return React.createElement('div', {
      style: { display:'flex', alignItems:'flex-start', gap:10, padding:'4px 0', fontFamily:"'Figtree', sans-serif", fontWeight:300, fontSize:11, lineHeight:1.6, color:slate }
    },
      React.createElement('span', { style:{ color:gold, flexShrink:0 } }, '—'),
      React.createElement('span', {}, text)
    );
  }

  function Rule() {
    return React.createElement('div', { style:{ height:1, background:border, margin:'24px 0' } });
  }

  function AllowanceBox({ amount, label, desc }) {
    return React.createElement('div', {
      style: { display:'flex', alignItems:'center', gap:20, background:'#F5F2EF', borderLeft:`3px solid ${magnolia}`, padding:'12px 16px', margin:'10px 0' }
    },
      React.createElement('div', {
        style: { fontFamily:"'Cormorant Garamond', Georgia, serif", fontWeight:500, fontSize:26, color:magnolia, lineHeight:1, whiteSpace:'nowrap' }
      }, money(amount)),
      React.createElement('div', {},
        React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontWeight:500, fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:slate, marginBottom:3 } }, label),
        desc && React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontWeight:300, fontSize:10, lineHeight:1.5, color:slate, opacity:0.8 } }, desc)
      )
    );
  }

  return React.createElement('div', { id:'scope-document', style:docStyle },

    // Header — logo only, centered in blue band
    React.createElement('div', { style:{ background:slate, padding:'40px 64px', display:'flex', alignItems:'center', justifyContent:'center' } },
      React.createElement('img', {
        src: (typeof document!=='undefined' && (document.getElementById('__logo_wordmark')||{}).src) || 'assets/ClearPath-Wordmark-Limestone.png',
        alt: 'ClearPath Construction',
        style: { height: 80, width: 'auto', display: 'block' }
      })
    ),

    // Body
    React.createElement('div', { style:{ padding:'48px 64px' } },

      // Title block — project name + prepared date, sits above the first section
      React.createElement('div', { style:{ marginBottom: 36 } },
        React.createElement('div', {
          style:{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontWeight:500, fontSize:36, color:slate, lineHeight:1.1, letterSpacing:'-0.01em' }
        }, info.projectName || 'Project Name'),
        // Project address, directly under the name
        info.address && React.createElement('div', {
          style:{ fontFamily:"'Figtree', sans-serif", fontWeight:300, fontSize:13, color:slate, marginTop:8, letterSpacing:'0.02em' }
        }, info.address),
        React.createElement('div', {
          style:{ fontFamily:"'Figtree', sans-serif", fontSize:11, color:goldDark, marginTop:6, letterSpacing:'0.04em' }
        }, `Prepared ${info.date || 'Date'} · Preliminary`)
      ),

      // Project Description
      info.description && React.createElement('div', { style:{ marginBottom:8 } },
        React.createElement(SecTitle, { text:'Project Overview' }),
        React.createElement('p', {
          style:{ fontFamily:"'Figtree', sans-serif", fontWeight:300, fontSize:12, lineHeight:1.7, color:slate, whiteSpace:'pre-wrap' }
        }, info.description)
      ),

      info.description && React.createElement(Rule),

      // Inclusions
      includedSections.length > 0 && React.createElement('div', {},
        React.createElement(SecTitle, { text:'Inclusions' }),
        includedSections.map(section => {
          const activeItems = section.items.filter(i => i.included);
          if (!activeItems.length) return null;
          return React.createElement('div', { key:section.id, style:{ marginBottom:4 } },
            React.createElement(SubTitle, { text:section.title }),
            activeItems.map((item, i) =>
              React.createElement(Bullet, { key:i, text:item.text })
            )
          );
        })
      ),

      // Allowances — deliberately outside the Inclusions guard above. The
      // allowance figures and the excluded list are contractual either way, so
      // they still have to print on a scope where no line item happens to be
      // checked.
      (includedAllowances.length > 0 || excludedAllowances.length > 0) && React.createElement('div', { style:{ marginTop:20 } },
        includedAllowances.length > 0 && React.createElement('div', {},
          React.createElement(SubTitle, { text:'Included Allowances' }),
          includedAllowances.map((a, i) =>
            // Keyed on id where present: filtering shifts array indices, so the
            // index alone is not a stable identity across renders.
            React.createElement(AllowanceBox, { key:a.id || i, amount:a.amount, label:a.label, desc:a.desc || '' })
          )
        ),
        // Named explicitly rather than left silent, so an unchecked allowance
        // cannot later be read as an oversight.
        excludedAllowances.length > 0 && React.createElement('div', {},
          React.createElement(SubTitle, { text:'Excluded from Allowances' }),
          React.createElement(Bullet, {
            text:`The following carry no allowance and are excluded from this scope: ${excludedAllowances.map(a => a.label).join(', ')}.`
          })
        )
      ),

      React.createElement(Rule),

      // Exclusions
      includedExclusions.length > 0 && React.createElement('div', {},
        React.createElement(SecTitle, { text:'Standard Exclusions' }),
        React.createElement('p', { style:{ fontFamily:"'Figtree', sans-serif", fontWeight:300, fontSize:11, lineHeight:1.75, marginBottom:14, opacity:0.8 } },
          'The following items are excluded from this scope of work unless specifically noted. Any excluded item encountered will be addressed via written change order prior to proceeding.'
        ),
        React.createElement('div', { style:{ columns:2, columnGap:32 } },
          includedExclusions.map((e, i) => React.createElement(Bullet, { key:i, text:e.text }))
        )
      ),

      React.createElement(Rule),

      // Preliminary price. The figure that was entered is the headline: if the
      // scope and selections hold, that is what the job costs. The ±10% band
      // sits under it as a note — the room the price could still move in, not
      // the quote itself.
      //
      // The box shows for any non-empty price (so "TBD" still prints), while
      // the range note needs a figure that parses — hence the separate `range`
      // check inside.
      info.estimate && React.createElement('div', {},
        React.createElement('div', {
          style:{ background:slate, padding:'24px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }
        },
          React.createElement('div', {},
            React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:gold, marginBottom:8 } }, 'Preliminary Estimated Total'),
            React.createElement('div', { style:{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontWeight:500, fontSize:42, color:offwhite, lineHeight:1 } }, money(info.estimate)),
            range && React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:11, color:'rgba(239,236,232,0.65)', marginTop:8 } },
              `Budgetary range: ${range.rangeLabel}`
            ),
            range && React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:10, color:'rgba(239,236,232,0.4)', marginTop:4 } },
              window.CP_RANGE_DISCLAIMER
            )
          )
        )
      ),

      // Optional Add-Ons — boxes only, no header / description
      addOns.length > 0 && addOns.some(a => a.title || a.amount || a.desc) && React.createElement('div', { style:{ marginTop: 12 } },
        addOns.filter(a => a.title || a.amount || a.desc).map((a, i) =>
          React.createElement('div', {
            key: i,
            style: { background:'#F5F2EF', borderLeft:`3px solid ${gold}`, padding:'18px 22px', marginBottom:12 }
          },
            React.createElement('div', { style:{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:20, marginBottom: a.desc ? 10 : 0 } },
              React.createElement('div', {
                style:{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontWeight:500, fontSize:20, color:slate, lineHeight:1.2 }
              }, a.title || 'Add-On'),
              a.amount && React.createElement('div', {
                style:{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontWeight:500, fontSize:22, color:magnolia, whiteSpace:'nowrap' }
              }, money(a.amount))
            ),
            a.desc && React.createElement('p', {
              style:{ fontFamily:"'Figtree', sans-serif", fontWeight:300, fontSize:11, lineHeight:1.65, color:slate, whiteSpace:'pre-wrap' }
            }, a.desc)
          )
        ),
        React.createElement(Rule)
      ),

      // Schedule — four derived dates. Nothing here is typed in, so the section
      // is unconditional: cpComputeSchedule always returns a full schedule from
      // today plus the two phase durations (defaults included).
      React.createElement('div', {},
        React.createElement(SecTitle, { text:'Schedule' }),
        React.createElement('div', {
          style:{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16, marginBottom:14 }
        },
          [
            ['Design Start',          window.cpFormatDate(sched.designStart)],
            ['Design Complete',       window.cpFormatDate(sched.designComplete)],
            ['Construction Start',    window.cpFormatDate(sched.constructionStart)],
            ['Construction Complete', window.cpFormatDate(sched.constructionComplete)]
          ].map(([label, value], i) =>
            React.createElement('div', {
              key:i,
              style:{ background:'#F5F2EF', borderLeft:`3px solid ${magnolia}`, padding:'14px 18px' }
            },
              React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:goldDark, marginBottom:6, fontWeight:500 } }, label),
              React.createElement('div', { style:{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontWeight:500, fontSize:18, color:slate, lineHeight:1.2 } }, value)
            )
          )
        ),
        // Effective weeks, not the weeks that were entered — a holiday inside a
        // phase adds one, and the printed dates already reflect that.
        React.createElement('div', {
          style:{ fontFamily:"'Figtree', sans-serif", fontSize:11, color:goldDark }
        }, `Design ${sched.designWeeksEffective} weeks · Construction ${sched.constructionWeeksEffective} weeks · Total ${sched.totalWeeksEffective} weeks`),
        // Says why a phase runs longer than expected. De-duplicated via a Set:
        // a holiday can land in both phases and would otherwise be named twice.
        (sched.designHolidays.length > 0 || sched.constructionHolidays.length > 0) && React.createElement('div', {
          style:{ fontFamily:"'Figtree', sans-serif", fontSize:10, fontStyle:'italic', color:goldDark, marginTop:4 }
        }, `Includes one additional week for ${window.cpJoinNames([...new Set([...sched.designHolidays, ...sched.constructionHolidays])])}.`),
        // The dates are relative to the day this document was generated, so say
        // so — a client comparing two printings should not read a shifted date
        // as a slipped schedule.
        React.createElement('div', {
          style:{ fontFamily:"'Figtree', sans-serif", fontSize:10, fontStyle:'italic', color:goldDark, marginTop:4 }
        }, `Dates are calculated from ${window.cpFormatDate(sched.designStart)}. Regenerating this scope on a later date will shift the schedule.`),
        info.scheduleNotes && React.createElement('p', {
          style:{ fontFamily:"'Figtree', sans-serif", fontWeight:300, fontSize:11, lineHeight:1.7, color:slate, whiteSpace:'pre-wrap', marginTop:6 }
        }, info.scheduleNotes),
        React.createElement(Rule)
      ),

      // Design Drawing — uploaded floor plans / sketches, stacked full-width
      designDrawings.length > 0 && React.createElement('div', {},
        React.createElement(SecTitle, { text:'Design Drawing' }),
        designDrawings.map((d, i) =>
          React.createElement('div', {
            key:d.id || i,
            style:{ pageBreakInside:'avoid', breakInside:'avoid', textAlign:'center', marginBottom:16 }
          },
            React.createElement('img', {
              src:d.dataUrl,
              alt:d.name || ('Design drawing ' + (i + 1)),
              style:{ maxWidth:'100%', height:'auto', border:`1px solid ${border}` }
            })
          )
        ),
        React.createElement(Rule)
      ),

      // Next Steps
      info.deposit && React.createElement('div', {},
        React.createElement(SecTitle, { text:'Next Steps' }),
        React.createElement('div', { style:{ marginBottom:24 } },
          [
            `Review and approve this scope of work.`,
            `Sign the Design Agreement via DocuSign.`,
            `Submit the Design Deposit of ${money(info.deposit)} via USPS Certified Mail.`,
            `We'll schedule your design selections session with our professional designer.`
          ].map((text, i) =>
            React.createElement('div', {
              key:i,
              style:{ display:'flex', alignItems:'flex-start', gap:14, padding:'12px 0', borderBottom:`1px solid ${border}` }
            },
              React.createElement('span', { style:{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:22, fontWeight:500, color:magnolia, flexShrink:0, width:24, textAlign:'center' } }, i+1),
              React.createElement('span', { style:{ fontFamily:"'Figtree', sans-serif", fontWeight:300, fontSize:11, lineHeight:1.6, paddingTop:3 } }, text)
            )
          )
        ),
        info.depositMemo && React.createElement('div', {
          style:{ background:'#F5F2EF', borderLeft:`3px solid ${magnolia}`, padding:'16px 20px', marginTop:8 }
        },
          React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:goldDark, marginBottom:10, fontWeight:500 } }, 'Design Deposit — Payment Details'),
          [['Make Check Payable To','ClearPath Construction'],['Amount',money(info.deposit)],['Memo',info.depositMemo],['Mail To','ClearPath Construction  ·  416 W Main St., Lebanon, TN 37087  ·  Via USPS Certified Mail']].map(([l,v],i)=>
            React.createElement('div', { key:i, style:{ display:'flex', gap:20, marginBottom:6, alignItems:'center' } },
              React.createElement('span', { style:{ fontFamily:"'Figtree', sans-serif", fontWeight:500, fontSize:10, width:160, flexShrink:0 } }, l),
              React.createElement('span', { style:{ fontFamily:l==='Amount'?"'Cormorant Garamond',Georgia,serif":"'Figtree',sans-serif", fontSize:l==='Amount'?16:10, fontWeight:300, color:l==='Amount'?magnolia:slate } }, v)
            )
          )
        ),

        // Signature
        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, marginTop:48 } },
          ['Client Signature', 'ClearPath Construction'].map(label =>
            React.createElement('div', { key:label },
              React.createElement('div', { style:{ borderBottom:`1px solid ${slate}`, height:36, marginBottom:6 } }),
              React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:goldDark } }, label),
              React.createElement('div', { style:{ fontFamily:"'Figtree', sans-serif", fontSize:9, color:goldDark, marginTop:2, fontWeight:300 } }, 'Date: _______________')
            )
          )
        )
      ),

      // Footer
      React.createElement('div', { style:{ borderTop:`1px solid ${border}`, paddingTop:12, marginTop:40, textAlign:'center', fontFamily:"'Figtree', sans-serif", fontSize:8, color:goldDark, letterSpacing:'0.04em' } },
        'ClearPath Construction  ·  416 W Main St., Lebanon, TN 37087  ·  hello@clearpathcustom.com  ·  629-263-0659'
      )
    )
  );
}

Object.assign(window, { ScopeDocument });
