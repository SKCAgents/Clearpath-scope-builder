/**
 * ScopeLibrary.jsx — Master list of scope lines and standard exclusions
 *
 * This file is the single source of truth for all the pre-written scope line
 * options that appear in the builder. When a user creates a new project, these
 * are the lines they start from — they check the ones that apply and ignore the rest.
 *
 * Structure:
 *   SCOPE_LIBRARY    — an array of sections (e.g. Framing, Plumbing, Roofing),
 *                      each containing a list of scope line strings
 *   EXCLUSION_LIBRARY — an array of standard "not included" disclaimer strings
 *
 * How customization works:
 *   Users can add custom lines to a project. If they click "+ lib" on a custom
 *   line, it gets saved to the database (library_sections table). When any project
 *   is opened, those database entries are merged with this file's hardcoded list,
 *   so promoted lines show up for everyone going forward.
 *   See the initSections() function in index.html for how this merge happens.
 *
 * To edit the master defaults: just edit the arrays below and redeploy.
 * No database changes needed for modifying the hardcoded library.
 */


// ── Scope sections ────────────────────────────────────────────────────────────
// Each section has a unique 'id' (used as a database key), a 'title' (shown in
// the UI), and an 'items' array of scope line strings.
const SCOPE_LIBRARY = [
  {
    id: 'preconstruction', title: 'Preconstruction Planning',
    items: [
      'Preconstruction planning, permitting, scheduling, and coordination required to execute the project scope.',
      'Site visits as necessary to document existing conditions, verify dimensions, and confirm constructability prior to and during planning.',
      'Includes up to 16 hours of interior design consultation related to layout development, finish selections, and coordination of the defined project scope.',
      'If planning or design services extend beyond the included allowance, additional design time may be required to continue.',
      'Final pricing will be determined after all selections, layouts, and scope details have been finalized.',
    ]
  },
  {
    id: 'site_prep', title: 'Site Prep & General Conditions',
    items: [
      'Site protection, temporary barriers, and dust control during construction.',
      'Temporary power, water, and restroom facilities as required for construction.',
      'Regular jobsite cleanup and final construction cleaning included.',
      'Dumpster(s) and haul-off of construction debris included.',
      'Protection of existing adjacent finishes and structures included.',
    ]
  },
  {
    id: 'demolition', title: 'Demolition',
    items: [
      'Selective interior demolition as required to complete scope.',
      'Demolition of existing walls, ceilings, floors, cabinetry, and finishes.',
      'Removal and disposal of demolished materials included.',
      'Hazardous materials (asbestos, lead, mold) excluded unless noted.',
    ]
  },
  {
    id: 'earthwork', title: 'Earthwork & Foundations',
    items: [
      'Earthwork includes excavation and grading performed using standard equipment (skid steer and/or excavator) within normal operating conditions.',
      'Included earthwork is limited to the time and effort reasonably anticipated for the defined scope based on visible site conditions at the time of estimating.',
      'Any excavation impeded by unsuitable soils, undocumented fill, excessive groundwater, buried debris, rock, or conditions requiring specialty equipment or extended time will be considered a change in scope.',
      'Export or import of fill material beyond what is reasonably anticipated is excluded unless specifically noted.',
      'Specialty excavation methods, including rock hammering or blasting, are excluded and will be addressed by change order if encountered.',
    ]
  },
  {
    id: 'foundation', title: 'Foundation',
    items: [
      'Concrete footings sized per code and plans.',
      'Foundation walls confirmed per plans (CMU).',
      'Crawl-space foundation.',
      'Foundation waterproofing and drainage per code where applicable.',
    ]
  },
  {
    id: 'framing', title: 'Framing',
    items: [
      'Framing to be standard 2 x 4 construction.',
      'Floor framing including joists, beams, and subfloor installation.',
      'Wall framing including interior and exterior load-bearing walls.',
      'Roof framing including trusses or stick framing as specified.',
      'Sheathing for floors, walls, and roof included.',
    ]
  },
  {
    id: 'exterior_finishes', title: 'Exterior Finishes',
    items: [
      'Exterior of Master Bath and Garage Additions to be painted brick to closely match the existing home.',
      'Exterior of Kitchen and Living Room bump out to be painted Hardi lap siding.',
      'Exterior caulking and sealing included.',
    ]
  },
  {
    id: 'insulation', title: 'Insulation',
    items: [
      'Insulation installed per code in walls, floors, and ceilings.',
      'Batt, blown, or spray foam insulation per project requirements.',
      'Air sealing as required by code.',
    ]
  },
  {
    id: 'plumbing', title: 'Plumbing',
    items: [
      'Plumbing rough-in and install for the following fixtures.',
      'Kitchen Sink, faucet and drain.',
      'Airswitch.',
      'Disposal.',
      'Fridge Water Line.',
      'Three (3) Vanity Sinks, faucets, and drains.',
      'Two (2) Toilets.',
      'One (1) Shower system to include: shower head, shower arm, control valve, sliding bar handheld spray, and drain.',
      'Water supply and drain piping per code.',
      'Venting per code.',
      'Final plumbing connections for included fixtures.',
      'An allowance of $11,000 included for the fixtures listed above.',
    ]
  },
  {
    id: 'electrical', title: 'Electrical (Rough & Final)',
    items: [
      'Electrical rough-in and final per code.',
      'Allowance for up to 20 recessed lights including moving existing recessed lights.',
      'Switches, outlets, and devices per code.',
      'An allowance of $2,000 is included for the following fixtures:',
      'Up to three (3) Kitchen island pendants.',
      'Three (3) vanity lights.',
      'One (1) hanging fixture in the great room.',
    ]
  },
  {
    id: 'hvac', title: 'HVAC',
    items: [
      'HVAC rough-in and final per code for approx 824 new interior square feet.',
      'Ductwork, registers, and returns as required.',
      'HVAC equipment upgrades excluded unless noted.',
      'Conditioning of new spaces included where specified.',
    ]
  },
  {
    id: 'drywall', title: 'Drywall',
    items: [
      'Drywall installation on all new walls and ceilings.',
      'Tape, float, and finish to Level 4.',
      'Texture included if required to match existing.',
      'Drywall repairs to adjacent areas as required.',
    ]
  },
  {
    id: 'trim', title: 'Interior Trim & Doors',
    items: [
      'Includes baseboard, casing and crown in new living areas as well as interior doors.',
      'Baseboard, casing, crown and trim to match existing where applicable.',
      'Specialty trim or custom millwork excluded unless noted.',
    ]
  },
  {
    id: 'fireplace', title: 'Fireplace',
    items: [
      'Includes 42" Gas fireplace insert.',
      'Includes 72" Hand Hewn Cedar floating mantel.',
      'Includes Centurion Stone or similar fireplace surround.',
    ]
  },
  {
    id: 'cabinetry', title: 'Cabinetry',
    items: [
      'Includes 46 linear feet of custom-built paint-grade inset lower cabinets in Pantry, Butlers Pantry, Kitchen, Powder Bathroom, and Master Bathroom.',
      'Includes 48 linear feet of upper cabinets in Kitchen, Pantry, and Butlers Pantry.',
      '60" Decorative Range hood to be cabinet shop built or trim-built.',
      'Kitchen Island to be 42" x 84" painted lower cabinetry with overhang for counter height seating.',
      'Dairy Table is excluded from this scope. Countertop allowance for a 42" x 84" Dairy Table is included.',
      'Cabinetry to extend full height to the ceiling where shown, eliminating exposed soffits or gaps above cabinets.',
      'Crown molding installed at cabinetry to closely match existing trim profiles and finishes.',
      'Standard cabinet depths and heights included unless otherwise specified.',
      'Toe kicks included and finished to match cabinetry.',
      'Panels included where required to finish exposed cabinet ends.',
      'Cabinet interiors include standard organizational features typical of custom kitchens; upgraded or specialty interior accessories may increase final pricing.',
      'A $3,000 Allowance is included for cabinet hardware and organization accessories such as trash pullouts and spice organizers.',
    ]
  },
  {
    id: 'countertops', title: 'Countertops',
    items: [
      'Level B quartz countertops included on all lower cabinetry only. Installation is limited to standard horizontal surfaces with eased edges.',
      'Specialty details such as waterfall ends, decorative edge profiles, integrated sinks, full-height backsplashes, stone wrapping, or non-standard applications are excluded unless specifically noted.',
      'Master Bathroom vanity and Powder Room vanity include 4" matching quartz backsplash on all wall-to-counter connections.',
    ]
  },
  {
    id: 'appliances', title: 'Appliances',
    items: [
      'A $30,000 allowance is included for the following appliances:',
      '48" Range.',
      '48" Fridge.',
      'Range Hood Insert.',
      'Microwave Drawer.',
      'Dishwasher.',
      'Appliances or installation requirements exceeding the allowance will increase the final project price.',
    ]
  },
  {
    id: 'tile', title: 'Tile',
    items: [
      'One (1) tile selection per location unless otherwise noted. (Location defined as 1 installation area. I.E. Bathroom floor, shower floor, shower walls are 3 locations.)',
      'Installation patterns limited to stacked, bricklay, or diagonal only.',
      'Layout changes or custom patterns (e.g., herringbone, chevron, borders, or inlays) are not included.',
      'Master bath floor, powder bath floor, and shower floor and interior shower walls to be tiled.',
      'Master Shower to be floor-to-ceiling tile.',
      'Shower to include one (1) 12" x 18" wall niche.',
      'Complete shower waterproofing system using a manufacturer-approved integrated system (Wedi®, Schluter®, or equivalent), including pan, wall waterproofing, drain assembly, and one waterproof 12" x 18" niche.',
    ]
  },
  {
    id: 'flooring', title: 'Flooring',
    items: [
      'Includes new (approx.) 3\' oak hardwood flooring in new kitchen and living room areas to closely match existing flooring.',
      'Includes sand and finish of existing kitchen and living room areas as well as new wood flooring.',
      'Perfect match to existing flooring finish is not guaranteed or expected.',
    ]
  },
  {
    id: 'painting', title: 'Paint',
    items: [
      'All renovated spaces to be fully painted.',
      'One ceiling color, one trim color, wall colors per room allowed.',
      'Deep base or specialty finishes excluded unless noted.',
      'Trim to be satin finish.',
      'Walls and Ceilings to be flat finish.',
    ]
  },
  {
    id: 'closeout', title: 'Closeout',
    items: [
      'Final walkthrough and punch list completion.',
      'Final jobsite cleaning.',
      'Warranty documentation provided.',
    ]
  },
];


// ── Standard exclusions ───────────────────────────────────────────────────────
// These are items that are explicitly NOT included in the scope unless stated
// otherwise. Including them in the document sets clear expectations and protects
// against scope creep disputes. The user can check/uncheck these in the editor.
const EXCLUSION_LIBRARY = [
  'Architectural drawings, structural engineering, or specialty consultant services unless specifically noted.',
  'Permits, plan reviews, inspections, impact fees, and all municipal or HOA approvals unless specifically included.',
  'Utility connections, upgrades, or relocations (water, sewer, septic, gas, electrical, data) unless specifically noted.',
  'Service upgrades to electrical, plumbing, or HVAC systems unless specifically included.',
  'Hazardous materials testing, abatement, or remediation (including but not limited to asbestos, lead, mold, or contaminated soils).',
  'Unforeseen structural issues, concealed conditions, or code compliance requirements discovered after demolition.',
  'Repairs or modifications to existing structures outside of the defined scope area.',
  'Matching of existing materials, finishes, brick, stone, siding, roofing, or flooring is not guaranteed.',
  'Appliances, electronics, audio/visual systems, security systems, and smart home integrations unless noted.',
  'Decorative light fixtures, ceiling fans, plumbing fixtures, and accessories unless an allowance or inclusion is stated.',
  'Specialty finishes, upgraded patterns, custom details, or premium materials not expressly identified in the scope.',
  'Furniture, window treatments, mirrors beyond those specified, artwork, and décor.',
  'Work performed by others or owner-supplied items not explicitly coordinated in this scope.',
  'Work not shown on the approved plans, design drawings, or specifically listed in this scope of work.',
];


// ── Allowance categories ──────────────────────────────────────────────────────
// The fixed allowance checklist. Every project shows all of these; the user
// checks the ones that apply. Checked = included in the scope and printed in the
// allowances section. Unchecked = explicitly excluded, and printed as excluded
// rather than just left off the page.
//
// The amounts here are the DEFAULTS for a new project. They are editable per
// project, and they are editable for all future projects in one place — the
// "Allowance Defaults" card in the admin Master Template screen, which stores an
// override in the library. This array is the fallback when no override is set.
//
// Where a default below is non-zero it was taken from an allowance figure
// already written into SCOPE_LIBRARY above (plumbing fixtures, lighting,
// appliances). The $0 entries are placeholders — set them once in the admin
// screen and every new project picks them up.
const ALLOWANCE_CATEGORIES = [
  { id: 'doors_windows',        label: 'Doors & Windows',       amount: '$0' },
  { id: 'millwork',             label: 'Millwork',              amount: '$0' },
  { id: 'cabinets_countertops', label: 'Cabinets & Countertops', amount: '$0' },
  { id: 'plumbing_fixtures',    label: 'Plumbing Fixtures',     amount: '$11,000' },
  { id: 'lighting_fixtures',    label: 'Lighting Fixtures',     amount: '$2,000' },
  { id: 'appliances',           label: 'Appliances',            amount: '$30,000' },
  { id: 'tile',                 label: 'Tile',                  amount: '$0' },
  { id: 'flooring',             label: 'Flooring',              amount: '$0' },
  { id: 'paint',                label: 'Paint',                 amount: '$0' },
  { id: 'mirrors',              label: 'Mirrors',               amount: '$0' },
  { id: 'bath_hardware',        label: 'Bath Hardware',         amount: '$0' },
];

// The library row id that holds the admin override of the amounts above.
// It lives in the same table as the scope sections (no schema change needed);
// the double-underscore prefix marks it as a settings row so the section-merge
// code skips it. See cpGetAllowanceDefaults / cpSaveAllowanceDefaults.
const ALLOWANCE_DEFAULTS_ID = '__allowance_defaults';


// ── Project type templates ────────────────────────────────────────────────────
// The project type picked at creation determines which scope sections start
// switched on. Sections listed here have their lines pre-checked; every other
// section still appears in the builder, just with nothing checked, so anything
// missing can still be added by hand.
//
// Within a template's sections, the master template's own pre-selections win
// (the per-line checkboxes in the admin Master Template screen). A section with
// no pre-selections set gets all of its lines checked.
//
// Section ids must match SCOPE_LIBRARY above, and each list is kept in
// SCOPE_LIBRARY order so the printed document reads top-to-bottom naturally.
const PROJECT_TEMPLATES = [
  { id: 'kitchen', label: 'Kitchen', sections: ['preconstruction', 'site_prep', 'demolition', 'plumbing', 'electrical', 'drywall', 'trim', 'cabinetry', 'countertops', 'appliances', 'tile', 'flooring', 'painting', 'closeout'] },
  { id: 'bath_master', label: 'Bath - Master', sections: ['preconstruction', 'site_prep', 'demolition', 'plumbing', 'electrical', 'hvac', 'drywall', 'trim', 'cabinetry', 'countertops', 'tile', 'painting', 'closeout'] },
  { id: 'bath_secondary', label: 'Bath - Secondary', sections: ['preconstruction', 'site_prep', 'demolition', 'plumbing', 'electrical', 'drywall', 'trim', 'cabinetry', 'countertops', 'tile', 'painting', 'closeout'] },
  { id: 'addition', label: 'Addition', sections: ['preconstruction', 'site_prep', 'demolition', 'earthwork', 'foundation', 'framing', 'exterior_finishes', 'insulation', 'plumbing', 'electrical', 'hvac', 'drywall', 'trim', 'cabinetry', 'countertops', 'flooring', 'painting', 'closeout'] },
  { id: 'attic', label: 'Attic', sections: ['preconstruction', 'site_prep', 'demolition', 'framing', 'insulation', 'plumbing', 'electrical', 'hvac', 'drywall', 'trim', 'flooring', 'painting', 'closeout'] },
  { id: 'garage', label: 'Garage', sections: ['preconstruction', 'site_prep', 'demolition', 'earthwork', 'foundation', 'framing', 'exterior_finishes', 'insulation', 'electrical', 'drywall', 'painting', 'closeout'] },
  { id: 'porch_outdoor', label: 'Porch / Outdoor Living', sections: ['preconstruction', 'site_prep', 'demolition', 'earthwork', 'foundation', 'framing', 'exterior_finishes', 'electrical', 'fireplace', 'painting', 'closeout'] },
  { id: 'poolhouse_adu', label: 'Poolhouse / ADU', sections: ['preconstruction', 'site_prep', 'earthwork', 'foundation', 'framing', 'exterior_finishes', 'insulation', 'plumbing', 'electrical', 'hvac', 'drywall', 'trim', 'cabinetry', 'countertops', 'appliances', 'tile', 'flooring', 'painting', 'closeout'] },
  { id: 'basement', label: 'Basement', sections: ['preconstruction', 'site_prep', 'demolition', 'framing', 'insulation', 'plumbing', 'electrical', 'hvac', 'drywall', 'trim', 'cabinetry', 'countertops', 'tile', 'flooring', 'painting', 'closeout'] },
  { id: 'conversion', label: 'Conversion', sections: ['preconstruction', 'site_prep', 'demolition', 'framing', 'exterior_finishes', 'insulation', 'plumbing', 'electrical', 'hvac', 'drywall', 'trim', 'cabinetry', 'countertops', 'tile', 'flooring', 'painting', 'closeout'] },
  { id: 'whole_home', label: 'Whole Home Remodel', sections: ['preconstruction', 'site_prep', 'demolition', 'earthwork', 'foundation', 'framing', 'exterior_finishes', 'insulation', 'plumbing', 'electrical', 'hvac', 'drywall', 'trim', 'fireplace', 'cabinetry', 'countertops', 'appliances', 'tile', 'flooring', 'painting', 'closeout'] },
  { id: 'laundry', label: 'Laundry', sections: ['preconstruction', 'site_prep', 'demolition', 'plumbing', 'electrical', 'hvac', 'drywall', 'trim', 'cabinetry', 'countertops', 'appliances', 'tile', 'painting', 'closeout'] },
  { id: 'built_ins', label: 'Built-Ins', sections: ['preconstruction', 'site_prep', 'trim', 'cabinetry', 'painting', 'closeout'] },
  { id: 'pool', label: 'Pool', sections: ['preconstruction', 'site_prep', 'earthwork', 'foundation', 'plumbing', 'electrical', 'closeout'] },
  { id: 'exterior', label: 'Exterior', sections: ['preconstruction', 'site_prep', 'demolition', 'framing', 'exterior_finishes', 'painting', 'closeout'] },
];

// Look up a template by id. Returns null for '' / unknown, which means
// "no template" — every section starts unchecked, the pre-template behaviour.
function templateFor(typeId) {
  return PROJECT_TEMPLATES.find(t => t.id === typeId) || null;
}

// Label for a type id, for display in the UI and the document.
function projectTypeLabel(typeId) {
  const t = templateFor(typeId);
  return t ? t.label : '';
}


// ── Export ────────────────────────────────────────────────────────────────────
// Make the libraries available to index.html via the window object.
// This is the browser-compatible equivalent of ES module exports.
Object.assign(window, {
  SCOPE_LIBRARY, EXCLUSION_LIBRARY,
  ALLOWANCE_CATEGORIES, ALLOWANCE_DEFAULTS_ID,
  PROJECT_TEMPLATES, templateFor, projectTypeLabel,
});
