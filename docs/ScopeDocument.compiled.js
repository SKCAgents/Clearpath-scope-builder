// ─── Document Preview Component ─────────────────────────────────────────────
// Renders a branded, print-ready scope of work from the builder state

function ScopeDocument({
  info,
  sections,
  exclusions,
  allowances,
  addOns = []
}) {
  const slate = '#3F4E5A',
    offwhite = '#EFECE8',
    magnolia = '#83443D',
    gold = '#C3BDB1',
    goldDark = '#a8a09a',
    border = '#ece8e3';
  const includedSections = sections.filter(s => s.items.some(i => i.included));
  const includedExclusions = exclusions.filter(e => e.included);
  const totalAllowances = allowances.reduce((sum, a) => {
    const n = parseFloat((a.amount || '0').replace(/[$,]/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  // Styles
  const docStyle = {
    fontFamily: "'Figtree', sans-serif",
    fontWeight: 300,
    fontSize: 11,
    color: slate,
    background: '#fff',
    width: '100%'
  };
  function SecTitle({
    text
  }) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        margin: '32px 0 14px'
      }
    }, React.createElement('div', {
      style: {
        width: 3,
        background: magnolia,
        flexShrink: 0
      }
    }), React.createElement('div', {
      style: {
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 500,
        fontSize: 20,
        color: slate,
        paddingLeft: 14,
        lineHeight: 1.1,
        letterSpacing: '-0.01em'
      }
    }, text));
  }
  function SubTitle({
    text
  }) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        margin: '16px 0 8px'
      }
    }, React.createElement('div', {
      style: {
        width: 2,
        background: gold,
        flexShrink: 0
      }
    }), React.createElement('div', {
      style: {
        fontFamily: "'Figtree', sans-serif",
        fontWeight: 500,
        fontSize: 9,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: slate,
        paddingLeft: 12,
        paddingTop: 2
      }
    }, text));
  }
  function Bullet({
    text
  }) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '4px 0',
        fontFamily: "'Figtree', sans-serif",
        fontWeight: 300,
        fontSize: 11,
        lineHeight: 1.6,
        color: slate
      }
    }, React.createElement('span', {
      style: {
        color: gold,
        flexShrink: 0
      }
    }, '—'), React.createElement('span', {}, text));
  }
  function Rule() {
    return React.createElement('div', {
      style: {
        height: 1,
        background: border,
        margin: '24px 0'
      }
    });
  }
  function AllowanceBox({
    amount,
    label,
    desc
  }) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        background: '#F5F2EF',
        borderLeft: `3px solid ${magnolia}`,
        padding: '12px 16px',
        margin: '10px 0'
      }
    }, React.createElement('div', {
      style: {
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 500,
        fontSize: 26,
        color: magnolia,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }
    }, amount), React.createElement('div', {}, React.createElement('div', {
      style: {
        fontFamily: "'Figtree', sans-serif",
        fontWeight: 500,
        fontSize: 9,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: slate,
        marginBottom: 3
      }
    }, label), desc && React.createElement('div', {
      style: {
        fontFamily: "'Figtree', sans-serif",
        fontWeight: 300,
        fontSize: 10,
        lineHeight: 1.5,
        color: slate,
        opacity: 0.8
      }
    }, desc)));
  }
  return React.createElement('div', {
    id: 'scope-document',
    style: docStyle
  },
  // Header
  React.createElement('div', {
    style: {
      background: slate,
      padding: '32px 64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, React.createElement('img', {
    src: 'assets/ClearPath-Wordmark-Limestone.png',
    alt: 'ClearPath Construction',
    style: {
      height: 88,
      width: 'auto',
      display: 'block'
    }
  }), React.createElement('div', {
    style: {
      textAlign: 'right'
    }
  }, React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 8,
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      color: gold,
      marginBottom: 6
    }
  }, 'Scope of Work'), React.createElement('div', {
    style: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 500,
      fontSize: 26,
      color: offwhite,
      lineHeight: 1.1
    }
  }, info.projectName || 'Project Name'), React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 9,
      color: 'rgba(239,236,232,0.5)',
      marginTop: 6
    }
  }, `Prepared ${info.date || 'Date'} · Preliminary`))),
  // Body
  React.createElement('div', {
    style: {
      padding: '48px 64px'
    }
  },
  // Project Description
  info.description && React.createElement('div', {
    style: {
      marginBottom: 8
    }
  }, React.createElement(SecTitle, {
    text: 'Project Overview'
  }), React.createElement('p', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontWeight: 300,
      fontSize: 12,
      lineHeight: 1.7,
      color: slate,
      whiteSpace: 'pre-wrap'
    }
  }, info.description)), info.description && React.createElement(Rule),
  // Inclusions
  includedSections.length > 0 && React.createElement('div', {}, React.createElement(SecTitle, {
    text: 'Inclusions'
  }), includedSections.map(section => {
    const activeItems = section.items.filter(i => i.included);
    if (!activeItems.length) return null;
    // Check if any allowance box matches this section
    const sectionAllowances = allowances.filter(a => a.included !== false && section.title.toLowerCase().includes(a.sectionHint || '__none__'));
    return React.createElement('div', {
      key: section.id,
      style: {
        marginBottom: 4
      }
    }, React.createElement(SubTitle, {
      text: section.title
    }), activeItems.map((item, i) => React.createElement(Bullet, {
      key: i,
      text: item.text
    })));
  }),
  // Allowances as callout boxes
  allowances.length > 0 && React.createElement('div', {
    style: {
      marginTop: 20
    }
  }, React.createElement(SubTitle, {
    text: 'Included Allowances'
  }), allowances.map((a, i) => React.createElement(AllowanceBox, {
    key: i,
    amount: a.amount,
    label: a.label,
    desc: a.desc || ''
  })))), React.createElement(Rule),
  // Exclusions
  includedExclusions.length > 0 && React.createElement('div', {}, React.createElement(SecTitle, {
    text: 'Standard Exclusions'
  }), React.createElement('p', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontWeight: 300,
      fontSize: 11,
      lineHeight: 1.75,
      marginBottom: 14,
      opacity: 0.8
    }
  }, 'The following items are excluded from this scope of work unless specifically noted. Any excluded item encountered will be addressed via written change order prior to proceeding.'), React.createElement('div', {
    style: {
      columns: 2,
      columnGap: 32
    }
  }, includedExclusions.map((e, i) => React.createElement(Bullet, {
    key: i,
    text: e.text
  })))), React.createElement(Rule),
  // Estimate
  info.estimate && React.createElement('div', {}, React.createElement(SecTitle, {
    text: 'Preliminary Estimate'
  }), React.createElement('div', {
    style: {
      background: slate,
      padding: '24px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24
    }
  }, React.createElement('div', {}, React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 9,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: gold,
      marginBottom: 8
    }
  }, 'Preliminary Estimated Total'), React.createElement('div', {
    style: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 500,
      fontSize: 42,
      color: offwhite,
      lineHeight: 1
    }
  }, info.estimate || '$—'), info.estimateLow && info.estimateHigh && React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 11,
      color: 'rgba(239,236,232,0.65)',
      marginTop: 8
    }
  }, `Range: ${info.estimateLow} — ${info.estimateHigh}  (±5%)`), React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 10,
      color: 'rgba(239,236,232,0.4)',
      marginTop: 4
    }
  }, 'Final price determined after final scope and selections are made.')), allowances.length > 0 && React.createElement('div', {
    style: {
      textAlign: 'right'
    }
  }, React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 9,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: gold,
      marginBottom: 10
    }
  }, 'Allowance Summary'), allowances.map((a, i) => React.createElement('div', {
    key: i,
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 10,
      color: 'rgba(239,236,232,0.7)',
      marginBottom: 4
    }
  }, React.createElement('span', {}, a.label + '   '), React.createElement('span', {
    style: {
      color: offwhite,
      fontWeight: 500
    }
  }, a.amount))), React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 10,
      color: gold,
      fontWeight: 500,
      marginTop: 8,
      borderTop: '1px solid rgba(239,236,232,0.2)',
      paddingTop: 8
    }
  }, `Total Allowances   $${totalAllowances.toLocaleString()}`))), React.createElement(Rule)),
  // Optional Add-Ons
  addOns.length > 0 && addOns.some(a => a.title || a.amount || a.desc) && React.createElement('div', {}, React.createElement(SecTitle, {
    text: 'Optional Add-Ons'
  }), React.createElement('p', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontWeight: 300,
      fontSize: 11,
      lineHeight: 1.7,
      marginBottom: 18,
      opacity: 0.8
    }
  }, 'Additional scope items available outside the preliminary estimate above. Pricing reflects current market estimates and is finalized at contract.'), addOns.filter(a => a.title || a.amount || a.desc).map((a, i) => React.createElement('div', {
    key: i,
    style: {
      background: '#F5F2EF',
      borderLeft: `3px solid ${gold}`,
      padding: '18px 22px',
      marginBottom: 12
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 20,
      marginBottom: a.desc ? 10 : 0
    }
  }, React.createElement('div', {
    style: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 500,
      fontSize: 20,
      color: slate,
      lineHeight: 1.2
    }
  }, a.title || 'Add-On'), a.amount && React.createElement('div', {
    style: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 500,
      fontSize: 22,
      color: magnolia,
      whiteSpace: 'nowrap'
    }
  }, a.amount)), a.desc && React.createElement('p', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontWeight: 300,
      fontSize: 11,
      lineHeight: 1.65,
      color: slate,
      whiteSpace: 'pre-wrap'
    }
  }, a.desc))), React.createElement(Rule)),
  // Schedule
  (info.startDate || info.endDate || info.duration || info.scheduleNotes) && React.createElement('div', {}, React.createElement(SecTitle, {
    text: 'Schedule'
  }), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 16,
      marginBottom: info.scheduleNotes ? 18 : 0
    }
  }, [['Estimated Start', info.startDate], ['Estimated Completion', info.endDate], ['Total Duration', info.duration]].filter(([_, v]) => v).map(([label, value], i) => React.createElement('div', {
    key: i,
    style: {
      background: '#F5F2EF',
      borderLeft: `3px solid ${magnolia}`,
      padding: '14px 18px'
    }
  }, React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 9,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: goldDark,
      marginBottom: 6,
      fontWeight: 500
    }
  }, label), React.createElement('div', {
    style: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 500,
      fontSize: 18,
      color: slate,
      lineHeight: 1.2
    }
  }, value)))), info.scheduleNotes && React.createElement('p', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontWeight: 300,
      fontSize: 11,
      lineHeight: 1.7,
      color: slate,
      whiteSpace: 'pre-wrap',
      marginTop: 6
    }
  }, info.scheduleNotes), React.createElement(Rule)),
  // Next Steps
  info.deposit && React.createElement('div', {}, React.createElement(SecTitle, {
    text: 'Next Steps'
  }), React.createElement('div', {
    style: {
      marginBottom: 24
    }
  }, [`Review and approve this scope of work.`, `Sign the Design Agreement via DocuSign.`, `Submit the Design Deposit of ${info.deposit} via USPS Certified Mail.`, `We'll schedule your design selections session with our professional designer.`].map((text, i) => React.createElement('div', {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '12px 0',
      borderBottom: `1px solid ${border}`
    }
  }, React.createElement('span', {
    style: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: 22,
      fontWeight: 500,
      color: magnolia,
      flexShrink: 0,
      width: 24,
      textAlign: 'center'
    }
  }, i + 1), React.createElement('span', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontWeight: 300,
      fontSize: 11,
      lineHeight: 1.6,
      paddingTop: 3
    }
  }, text)))), info.depositMemo && React.createElement('div', {
    style: {
      background: '#F5F2EF',
      borderLeft: `3px solid ${magnolia}`,
      padding: '16px 20px',
      marginTop: 8
    }
  }, React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 9,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: goldDark,
      marginBottom: 10,
      fontWeight: 500
    }
  }, 'Design Deposit — Payment Details'), [['Make Check Payable To', 'ClearPath Construction'], ['Amount', info.deposit], ['Memo', info.depositMemo], ['Mail To', 'ClearPath Construction  ·  416 W Main St., Lebanon, TN 37087  ·  Via USPS Certified Mail']].map(([l, v], i) => React.createElement('div', {
    key: i,
    style: {
      display: 'flex',
      gap: 20,
      marginBottom: 6
    }
  }, React.createElement('span', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontWeight: 500,
      fontSize: 10,
      width: 160,
      flexShrink: 0
    }
  }, l), React.createElement('span', {
    style: {
      fontFamily: l === 'Amount' ? "'Cormorant Garamond',Georgia,serif" : "'Figtree',sans-serif",
      fontSize: l === 'Amount' ? 16 : 10,
      fontWeight: 300,
      color: l === 'Amount' ? magnolia : slate
    }
  }, v)))),
  // Signature
  React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 40,
      marginTop: 48
    }
  }, ['Client Signature', 'ClearPath Construction'].map(label => React.createElement('div', {
    key: label
  }, React.createElement('div', {
    style: {
      borderBottom: `1px solid ${slate}`,
      height: 36,
      marginBottom: 6
    }
  }), React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 9,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: goldDark
    }
  }, label), React.createElement('div', {
    style: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: 9,
      color: goldDark,
      marginTop: 2,
      fontWeight: 300
    }
  }, 'Date: _______________'))))),
  // Footer
  React.createElement('div', {
    style: {
      borderTop: `1px solid ${border}`,
      paddingTop: 12,
      marginTop: 40,
      textAlign: 'center',
      fontFamily: "'Figtree', sans-serif",
      fontSize: 8,
      color: goldDark,
      letterSpacing: '0.04em'
    }
  }, 'ClearPath Construction  ·  416 W Main St., Lebanon, TN 37087  ·  hello@clearpath.build  ·  (615) 555-0182')));
}
Object.assign(window, {
  ScopeDocument
});