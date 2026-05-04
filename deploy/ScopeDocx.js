// ─── DOCX Generator ──────────────────────────────────────────────────────────
// Generates a .docx version of the scope of work using the `docx` library
// loaded from CDN. Letter portrait, Cormorant headings + Calibri body, mirrors
// the PDF content in a Google-Docs-friendly layout.
//
// Loads docx from CDN on first use; subsequent calls reuse it.

let __docxLibPromise = null;
function loadDocxLib() {
  if (__docxLibPromise) return __docxLibPromise;
  __docxLibPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/docx@8.5.0/build/index.umd.js';
    s.onload = () => resolve(window.docx);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return __docxLibPromise;
}

// Convert a relative image URL to an ArrayBuffer (for embedding in docx)
async function fetchImageBuffer(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch (e) {
    return null;
  }
}

// Brand colors (hex without #)
const C_SLATE = '3F4E5A';
const C_MAGNOLIA = '83443D';
const C_LIMESTONE = 'C3BDB1';
const C_BG_LIGHT = 'F5F2EF';
const C_BORDER = 'ECE8E3';

async function generateScopeDocx({ info, sections, exclusions, allowances, addOns = [] }) {
  const D = await loadDocxLib();
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
    ImageRun, PageBreak, TabStopType, TabStopPosition,
  } = D;

  // Try to embed the wordmark
  const logoSrc = (typeof document!=='undefined' && (document.getElementById('__logo_wordmark_blue')||{}).src) || 'assets/ClearPath-Wordmark-Blue.png';
  const logoBuffer = await fetchImageBuffer(logoSrc);

  const includedSections = sections.filter(s => s.items.some(i => i.included));
  const includedExclusions = exclusions.filter(e => e.included);
  const totalAllowances = allowances.reduce((sum, a) => {
    const n = parseFloat((a.amount || '0').replace(/[$,]/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const FONT_HEAD = 'Cormorant Garamond';
  const FONT_BODY = 'Calibri';

  // Body paragraph
  const p = (text, opts = {}) => new Paragraph({
    spacing: { after: opts.after ?? 80, before: opts.before ?? 0, line: 300 },
    alignment: opts.align,
    children: [new TextRun({
      text: text || '',
      font: opts.font || FONT_BODY,
      size: opts.size ?? 22, // half-points (22 = 11pt)
      color: opts.color || '333333',
      bold: opts.bold,
      italics: opts.italics,
    })],
  });

  // Section heading (Cormorant, 20pt, slate, with magnolia bottom rule)
  const sectionHeading = (text) => new Paragraph({
    spacing: { before: 320, after: 100 },
    border: { bottom: { color: C_MAGNOLIA, style: BorderStyle.SINGLE, size: 12 } },
    children: [new TextRun({
      text, font: FONT_HEAD, size: 36, color: C_SLATE, bold: false,
    })],
  });

  // Subheading (small uppercase)
  const subheading = (text) => new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({
      text: text.toUpperCase(),
      font: FONT_BODY, size: 18, color: C_SLATE, bold: true,
      characterSpacing: 30,
    })],
  });

  // Bullet
  const bullet = (text) => new Paragraph({
    spacing: { after: 40, line: 280 },
    indent: { left: 360, hanging: 240 },
    children: [
      new TextRun({ text: '— ', font: FONT_BODY, size: 22, color: C_LIMESTONE }),
      new TextRun({ text, font: FONT_BODY, size: 22, color: '333333' }),
    ],
  });

  // Numbered step
  const numStep = (n, text) => new Paragraph({
    spacing: { after: 100, line: 280 },
    indent: { left: 480, hanging: 360 },
    children: [
      new TextRun({ text: `${n}.  `, font: FONT_HEAD, size: 28, color: C_MAGNOLIA, bold: false }),
      new TextRun({ text, font: FONT_BODY, size: 22, color: '333333' }),
    ],
  });

  // Single-cell shaded box (for callouts) — full-width table with explicit column width
  const shadedBox = (children, accent = C_MAGNOLIA, fill = C_BG_LIGHT) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [10080], // ~7" usable width on letter w/ 0.75" margins, in twips
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.SINGLE, size: 24, color: accent },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 10080, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: fill, fill },
        margins: { top: 200, bottom: 200, left: 280, right: 280 },
        children,
      })],
    })],
  });

  // ── Header (logo + title) ────────────────────────────────────────────────
  const headerChildren = [];
  if (logoBuffer) {
    headerChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new ImageRun({
        data: logoBuffer,
        transformation: { width: 280, height: 88 },
      })],
    }));
  }
  headerChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({
      text: 'SCOPE OF WORK',
      font: FONT_BODY, size: 20, color: C_LIMESTONE, bold: true,
      characterSpacing: 80,
    })],
  }));
  headerChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({
      text: info.projectName || 'Project Name',
      font: FONT_HEAD, size: 56, color: C_SLATE,
    })],
  }));
  headerChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({
      text: `Prepared ${info.date || 'Date'}  ·  Preliminary`,
      font: FONT_BODY, size: 20, color: '888888',
    })],
  }));

  // ── Project Overview ─────────────────────────────────────────────────────
  const sectionsContent = [];
  if (info.description) {
    sectionsContent.push(sectionHeading('Project Overview'));
    info.description.split(/\n+/).forEach(para => {
      if (para.trim()) sectionsContent.push(p(para, { size: 24 }));
    });
  }

  // ── Inclusions ───────────────────────────────────────────────────────────
  if (includedSections.length > 0) {
    sectionsContent.push(sectionHeading('Inclusions'));
    includedSections.forEach(section => {
      const activeItems = section.items.filter(i => i.included);
      if (!activeItems.length) return;
      sectionsContent.push(subheading(section.title));
      activeItems.forEach(item => sectionsContent.push(bullet(item.text)));
    });

    // Allowances
    if (allowances.length > 0) {
      sectionsContent.push(subheading('Included Allowances'));
      allowances.forEach(a => {
        sectionsContent.push(shadedBox([
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: a.amount || '$—', font: FONT_HEAD, size: 36, color: C_MAGNOLIA }),
              new TextRun({ text: '   ' + (a.label || '').toUpperCase(), font: FONT_BODY, size: 18, color: C_SLATE, bold: true, characterSpacing: 30 }),
            ],
          }),
          ...(a.desc ? [new Paragraph({
            children: [new TextRun({ text: a.desc, font: FONT_BODY, size: 20, color: '666666' })],
          })] : []),
        ]));
        sectionsContent.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
      });
    }
  }

  // ── Exclusions ───────────────────────────────────────────────────────────
  if (includedExclusions.length > 0) {
    sectionsContent.push(sectionHeading('Standard Exclusions'));
    sectionsContent.push(p('The following items are excluded from this scope of work unless specifically noted. Any excluded item encountered will be addressed via written change order prior to proceeding.', { italics: true, color: '666666', after: 160 }));
    includedExclusions.forEach(e => sectionsContent.push(bullet(e.text)));
  }

  // ── Estimate ─────────────────────────────────────────────────────────────
  if (info.estimate) {
    sectionsContent.push(sectionHeading('Preliminary Estimate'));
    sectionsContent.push(shadedBox([
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({
          text: 'PRELIMINARY ESTIMATED TOTAL',
          font: FONT_BODY, size: 18, color: C_LIMESTONE, bold: true, characterSpacing: 60,
        })],
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({
          text: info.estimate, font: FONT_HEAD, size: 72, color: C_SLATE,
        })],
      }),
      ...(info.estimateLow && info.estimateHigh ? [new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({
          text: `Range: ${info.estimateLow} — ${info.estimateHigh}  (±5%)`,
          font: FONT_BODY, size: 22, color: '555555',
        })],
      })] : []),
      new Paragraph({
        children: [new TextRun({
          text: 'Final price determined after final scope and selections are made.',
          font: FONT_BODY, size: 20, color: '888888', italics: true,
        })],
      }),
    ], C_SLATE, C_BG_LIGHT));

    // Allowance summary
    if (allowances.length > 0) {
      sectionsContent.push(new Paragraph({ spacing: { before: 200, after: 80 }, children: [
        new TextRun({ text: 'ALLOWANCE SUMMARY', font: FONT_BODY, size: 18, color: C_SLATE, bold: true, characterSpacing: 60 }),
      ]}));
      allowances.forEach(a => {
        sectionsContent.push(new Paragraph({
          spacing: { after: 60 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: a.label || '', font: FONT_BODY, size: 22, color: '333333' }),
            new TextRun({ text: '\t' + (a.amount || ''), font: FONT_BODY, size: 22, color: C_SLATE, bold: true }),
          ],
        }));
      });
      sectionsContent.push(new Paragraph({
        spacing: { before: 80, after: 80 },
        border: { top: { style: BorderStyle.SINGLE, color: C_BORDER, size: 8 } },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: 'Total Allowances', font: FONT_BODY, size: 22, color: C_MAGNOLIA, bold: true }),
          new TextRun({ text: '\t$' + totalAllowances.toLocaleString(), font: FONT_BODY, size: 22, color: C_MAGNOLIA, bold: true }),
        ],
      }));
    }
  }

  // ── Optional Add-Ons ─────────────────────────────────────────────────────
  const realAddOns = (addOns || []).filter(a => a.title || a.amount || a.desc);
  if (realAddOns.length > 0) {
    sectionsContent.push(sectionHeading('Optional Add-Ons'));
    sectionsContent.push(p('Additional scope items available outside the preliminary estimate above. Pricing reflects current market estimates and is finalized at contract.', { italics: true, color: '666666', after: 160 }));
    realAddOns.forEach(a => {
      sectionsContent.push(shadedBox([
        new Paragraph({
          spacing: { after: a.desc ? 100 : 0 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: a.title || 'Add-On', font: FONT_HEAD, size: 32, color: C_SLATE }),
            ...(a.amount ? [new TextRun({ text: '\t' + a.amount, font: FONT_HEAD, size: 32, color: C_MAGNOLIA })] : []),
          ],
        }),
        ...(a.desc ? [new Paragraph({
          children: [new TextRun({ text: a.desc, font: FONT_BODY, size: 22, color: '333333' })],
        })] : []),
      ], C_LIMESTONE, C_BG_LIGHT));
      sectionsContent.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    });
  }

  // ── Schedule ─────────────────────────────────────────────────────────────
  if (info.startDate || info.endDate || info.duration || info.scheduleNotes) {
    sectionsContent.push(sectionHeading('Schedule'));
    [['Estimated Start', info.startDate], ['Estimated Completion', info.endDate], ['Total Duration', info.duration]]
      .filter(([_, v]) => v)
      .forEach(([label, value]) => {
        sectionsContent.push(new Paragraph({
          spacing: { after: 60 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: label.toUpperCase(), font: FONT_BODY, size: 18, color: C_LIMESTONE, bold: true, characterSpacing: 40 }),
            new TextRun({ text: '\t' + value, font: FONT_HEAD, size: 28, color: C_SLATE }),
          ],
        }));
      });
    if (info.scheduleNotes) {
      sectionsContent.push(p(info.scheduleNotes, { before: 100 }));
    }
  }

  // ── Next Steps ───────────────────────────────────────────────────────────
  if (info.deposit) {
    sectionsContent.push(sectionHeading('Next Steps'));
    [
      'Review and approve this scope of work.',
      'Sign the Design Agreement via DocuSign.',
      `Submit the Design Deposit of ${info.deposit} via USPS Certified Mail.`,
      `We'll schedule your design selections session with our professional designer.`,
    ].forEach((t, i) => sectionsContent.push(numStep(i+1, t)));

    if (info.depositMemo) {
      sectionsContent.push(new Paragraph({ spacing: { before: 200 }, children: [] }));
      sectionsContent.push(shadedBox([
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({
            text: 'DESIGN DEPOSIT — PAYMENT DETAILS',
            font: FONT_BODY, size: 18, color: C_SLATE, bold: true, characterSpacing: 60,
          })],
        }),
        ...[
          ['Make Check Payable To', 'ClearPath Construction'],
          ['Amount', info.deposit],
          ['Memo', info.depositMemo],
          ['Mail To', 'ClearPath Construction · 416 W Main St., Lebanon, TN 37087 · Via USPS Certified Mail'],
        ].map(([l, v]) => new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: l + ': ', font: FONT_BODY, size: 20, color: C_SLATE, bold: true }),
            new TextRun({
              text: v,
              font: l === 'Amount' ? FONT_HEAD : FONT_BODY,
              size: l === 'Amount' ? 28 : 20,
              color: l === 'Amount' ? C_MAGNOLIA : '333333',
            }),
          ],
        })),
      ]));
    }

    // Signature lines
    sectionsContent.push(new Paragraph({ spacing: { before: 600 }, children: [] }));
    sectionsContent.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [5040, 5040],
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
      rows: [new TableRow({
        children: ['Client Signature', 'ClearPath Construction'].map(label => new TableCell({
          width: { size: 5040, type: WidthType.DXA },
          margins: { left: 100, right: 200 },
          children: [
            new Paragraph({
              spacing: { before: 200, after: 0 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C_SLATE } },
              children: [new TextRun({ text: ' ', size: 32 })],
            }),
            new Paragraph({
              spacing: { before: 80 },
              children: [new TextRun({ text: label.toUpperCase(), font: FONT_BODY, size: 16, color: '666666', bold: true, characterSpacing: 30 })],
            }),
            new Paragraph({
              children: [new TextRun({ text: 'Date: ____________________', font: FONT_BODY, size: 18, color: '888888' })],
            }),
          ],
        })),
      })],
    }));
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  sectionsContent.push(new Paragraph({
    spacing: { before: 600 },
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: C_BORDER } },
    children: [],
  }));
  sectionsContent.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100 },
    children: [new TextRun({
      text: 'ClearPath Construction  ·  416 W Main St., Lebanon, TN 37087  ·  hello@clearpath.build  ·  (615) 555-0182',
      font: FONT_BODY, size: 16, color: '888888',
    })],
  }));

  // ── Build document ───────────────────────────────────────────────────────
  const doc = new Document({
    creator: 'ClearPath Construction',
    title: (info.projectName || 'Scope of Work') + ' — Scope of Work',
    styles: {
      default: {
        document: { run: { font: FONT_BODY, size: 22 } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // letter portrait, twentieths of a point
          margin: { top: 1080, bottom: 1080, left: 1440, right: 1440 },
        },
      },
      children: [...headerChildren, ...sectionsContent],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const filename = ((info.projectName || 'Scope of Work').replace(/[^\w\s—-]/g, '').trim() || 'Scope of Work') + ' — Scope of Work.docx';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

window.generateScopeDocx = generateScopeDocx;
