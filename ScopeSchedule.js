/**
 * ScopeSchedule.js — Derived schedule dates and the preliminary price range
 *
 * Pure logic, no React, no DOM. Loaded as a plain script before the React
 * files so both the editor UI and the two document renderers (ScopeDocument.jsx
 * for print/PDF, ScopeDocx.js for Word) compute the same numbers from the same
 * code.
 *
 * Two things live here:
 *
 *   1. SCHEDULE — the project schedule is not typed in by hand. It is derived
 *      from today's date plus two durations in weeks (design, construction):
 *
 *        design start         = today
 *        design complete      = design start + design duration
 *        construction start   = design complete
 *        construction complete= construction start + construction duration
 *
 *      Holiday rule: if Thanksgiving week or Christmas week lands inside a
 *      phase, that phase gets one extra week. Both can apply (+2 weeks).
 *      Nothing else pushes the schedule.
 *
 *      Because the dates are derived from "today", they are computed at render
 *      time — a scope generated in October reads differently from the same
 *      project generated in November. That is intentional.
 *
 *   2. PRICE RANGE — one price is entered; the document shows it as a
 *      ±10% budgetary range and never prints the raw midpoint.
 */


// ── Date primitives ───────────────────────────────────────────────────────────

// Local-midnight copy of a date, so day arithmetic can't be nudged by a time
// component or by a DST shift landing mid-afternoon.
function cpStartOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function cpAddDays(d, n) {
  const out = cpStartOfDay(d);
  out.setDate(out.getDate() + n);
  return out;
}

function cpAddWeeks(d, n) {
  return cpAddDays(d, n * 7);
}

// The default design start: the first Monday at least 7 days out. Gives the
// client a week to review and sign before anything is committed to, and lands
// the start on a Monday so a phase reads as whole working weeks.
function cpNextMonday(from) {
  const earliest = cpAddDays(from ? new Date(from) : new Date(), 7);
  // getDay(): Sunday 0, Monday 1. Step forward to the next Monday; already a
  // Monday stays put, since it is already 7 days out.
  return cpAddDays(earliest, (8 - earliest.getDay()) % 7);
}

// "2026-09-21" (the value an <input type="date"> holds) → local midnight.
// Deliberately not `new Date(str)`, which reads a bare date as UTC and lands on
// the previous day for anyone west of Greenwich. Returns null for blank or
// unparseable input, so callers can fall back to the derived start.
function cpParseDateInput(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || '').trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d) ? null : d;
}

// A Date back into the "2026-09-21" form an <input type="date"> expects.
function cpToDateInput(d) {
  if (!(d instanceof Date) || isNaN(d)) return '';
  const pad = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}


// ── Holidays ──────────────────────────────────────────────────────────────────
// Only two dates matter, and only because the trades effectively stand down for
// the week around them.

// US Thanksgiving — the fourth Thursday in November.
function cpThanksgiving(year) {
  const nov1 = new Date(year, 10, 1);
  // getDay(): Sunday 0 … Thursday 4. Step forward to the first Thursday, then
  // add three more weeks to reach the fourth.
  const firstThursday = 1 + ((4 - nov1.getDay() + 7) % 7);
  return new Date(year, 10, firstThursday + 21);
}

function cpChristmas(year) {
  return new Date(year, 11, 25);
}

// Every holiday landing in [start, end). A phase can span a year boundary (and,
// with long durations, more than one), so walk each year the window touches.
function cpHolidaysIn(start, end) {
  const found = [];
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    [['Thanksgiving', cpThanksgiving(y)], ['Christmas', cpChristmas(y)]].forEach(([name, date]) => {
      if (date >= start && date < end) found.push({ name, date, key: name + y });
    });
  }
  return found;
}

// Extend a phase by one week per holiday that falls inside it.
//
// The extension is applied iteratively: pushing a phase a week later can pull a
// second holiday into the window (a phase ending just short of Thanksgiving
// that gets extended into Christmas week), and that one pushes too. Each
// holiday is only ever counted once, so this converges.
function cpExtendForHolidays(start, weeks) {
  let end = cpAddWeeks(start, weeks);
  const counted = [];
  let more = true;
  while (more) {
    more = false;
    for (const h of cpHolidaysIn(start, end)) {
      if (counted.some(c => c.key === h.key)) continue;
      counted.push(h);
      end = cpAddDays(end, 7);
      more = true;
    }
  }
  return { end, holidays: counted };
}


// ── Schedule ──────────────────────────────────────────────────────────────────

const CP_DEFAULT_DESIGN_WEEKS = 12;
const CP_DEFAULT_CONSTRUCTION_WEEKS = 12;

// Read a duration out of project info, falling back to the default when the
// field is blank, non-numeric, or nonsensical. Whole weeks only.
function cpWeeks(value, fallback) {
  const n = parseFloat(String(value === 0 ? 0 : (value || '')).replace(/[^0-9.]/g, ''));
  if (!isFinite(n) || n <= 0) return fallback;
  return Math.round(n);
}

// The whole schedule, derived. `from` defaults to today and exists so the
// document renderers and any test can pin a date.
//
// Returns Date objects plus the effective (holiday-extended) week counts and
// which holidays did the extending, so the document can say why a phase is
// longer than the number that was typed in.
function cpComputeSchedule(info, from) {
  const designWeeks       = cpWeeks(info?.designWeeks,       CP_DEFAULT_DESIGN_WEEKS);
  const constructionWeeks = cpWeeks(info?.constructionWeeks, CP_DEFAULT_CONSTRUCTION_WEEKS);

  // The design start is either pinned by hand (info.designStartDate, set from
  // the date picker) or derived as the next Monday at least a week out. A
  // pinned date is fixed, so the schedule stops drifting with today's date.
  const pinned      = cpParseDateInput(info?.designStartDate);
  const designStart = pinned ? cpStartOfDay(pinned) : cpNextMonday(from);
  const design      = cpExtendForHolidays(designStart, designWeeks);

  const constructionStart = design.end;   // construction starts when design completes
  const construction      = cpExtendForHolidays(constructionStart, constructionWeeks);

  const weeksBetween = (a, b) => Math.round((b - a) / (7 * 24 * 60 * 60 * 1000));

  return {
    designStart,
    designStartPinned:    !!pinned,   // false ⇒ the dates drift with today
    designComplete:       design.end,
    constructionStart,
    constructionComplete: construction.end,

    designWeeks,                                             // as entered
    constructionWeeks,
    designWeeksEffective:       weeksBetween(designStart, design.end),
    constructionWeeksEffective: weeksBetween(constructionStart, construction.end),
    totalWeeksEffective:        weeksBetween(designStart, construction.end),

    designHolidays:       design.holidays.map(h => h.name),
    constructionHolidays: construction.holidays.map(h => h.name),
  };
}

// "September 8, 2026" — the form used for every date printed in the document.
function cpFormatDate(d) {
  if (!(d instanceof Date) || isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Human list: ['Thanksgiving', 'Christmas'] → "Thanksgiving and Christmas"
function cpJoinNames(names) {
  const list = (names || []).filter(Boolean);
  if (!list.length) return '';
  if (list.length === 1) return list[0];
  return list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
}


// ── Preliminary price range ───────────────────────────────────────────────────

const CP_RANGE_PCT = 0.10;   // ±10%

// Pull a number out of anything the user might type: "$997,972", "997972",
// "1.2" … Returns null for blanks and for text like "TBD", so callers can tell
// "no price yet" apart from "$0".
function cpParseMoney(value) {
  if (value === 0) return 0;
  if (!value) return null;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return isFinite(n) ? n : null;
}

// "$ 997,972" — no cents, and the space after the dollar sign that every
// generated document uses, so derived labels match the typed fields.
function cpFormatMoney(n) {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  return '$ ' + Math.round(n).toLocaleString('en-US');
}

// What a money input field shows once the user leaves it: "$ 10,000", the
// spaced form used throughout the generated documents. Typing is never
// reformatted mid-keystroke — this runs on blur — so the caret can't jump.
//
// Only a single plain amount is normalized. Anything else the field might
// legitimately hold ("TBD", "See allowance schedule", "$50,000 - $75,000") is
// returned untouched, so this can be wired to every dollar field safely.
// Cents are kept only when the user actually typed a non-zero fraction.
const CP_MONEY_INPUT_RE = /^\s*\$?\s*([0-9][0-9,]*)(?:\.([0-9]{0,2}))?\s*$/;

function cpMoneyInput(raw) {
  const str = String(raw == null ? '' : raw);
  if (!str.trim()) return '';

  const m = str.match(CP_MONEY_INPUT_RE);
  if (!m) return str;

  const whole = parseInt(m[1].replace(/,/g, ''), 10);
  if (!isFinite(whole)) return str;

  const cents = (m[2] || '').padEnd(2, '0');
  const frac  = cents === '00' ? '' : '.' + cents;
  return '$ ' + whole.toLocaleString('en-US') + frac;
}

// Two money strings that mean the same amount, for comparisons that must not
// care whether a value has been through cpMoneyInput yet ("$10,000" vs
// "$ 10,000"). Non-numeric text compares as its trimmed self.
function cpSameMoney(a, b) {
  const key = v => {
    const n = cpParseMoney(v);
    return n === null ? String(v == null ? '' : v).trim() : n;
  };
  return key(a) === key(b);
}

// The range that gets printed. Rounded outward — low floors, high ceilings — so
// the quoted band is never narrower than the true ±10%. Under $10,000 the
// rounding step drops to $100 so small scopes don't collapse into one number.
function cpPriceRange(price) {
  const n = cpParseMoney(price);
  if (n === null || n <= 0) return null;
  const step = n >= 10000 ? 1000 : 100;
  const low  = Math.floor((n * (1 - CP_RANGE_PCT)) / step) * step;
  const high = Math.ceil((n * (1 + CP_RANGE_PCT)) / step) * step;
  return {
    low, high,
    lowLabel:   cpFormatMoney(low),
    highLabel:  cpFormatMoney(high),
    rangeLabel: cpFormatMoney(low) + ' – ' + cpFormatMoney(high),
  };
}

// The fine print that has to accompany the range wherever it appears.
const CP_RANGE_DISCLAIMER =
  'This is a preliminary budgetary range at plus or minus 10 percent, subject to design, engineering and final selections.';


// ── Export ────────────────────────────────────────────────────────────────────
// Plain script, no modules — everything hangs off window, matching the rest of
// the app.
Object.assign(window, {
  cpStartOfDay, cpAddDays, cpAddWeeks,
  cpNextMonday, cpParseDateInput, cpToDateInput,
  cpThanksgiving, cpChristmas, cpHolidaysIn, cpExtendForHolidays,
  cpComputeSchedule, cpFormatDate, cpJoinNames, cpWeeks,
  cpParseMoney, cpFormatMoney, cpMoneyInput, cpSameMoney, cpPriceRange,
  CP_DEFAULT_DESIGN_WEEKS, CP_DEFAULT_CONSTRUCTION_WEEKS, CP_RANGE_PCT, CP_RANGE_DISCLAIMER,
});
