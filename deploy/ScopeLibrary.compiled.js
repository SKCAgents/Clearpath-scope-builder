// ─── Full Scope Line Library ───────────────────────────────────────────────
const SCOPE_LIBRARY = [{
  id: 'preconstruction',
  title: 'Preconstruction Planning',
  items: ['Preconstruction planning, permitting, scheduling, and coordination required to execute the project scope.', 'Site visits to document existing conditions, verify dimensions, and confirm constructability prior to and during planning.', 'Design consultation related to layout development, finish selections, materials procurement, and coordination of the defined project scope.', 'Structural engineering coordination included.', 'MEP (mechanical, electrical, plumbing) engineering coordination included.', 'Soil testing and geotechnical report coordination included.', 'Survey coordination included.']
}, {
  id: 'site_prep',
  title: 'Site Prep & General Conditions',
  items: ['Compliance with applicable HOA, municipal, and state jobsite requirements during construction, including erosion control, street and site cleanliness.', 'Regular jobsite cleanup and final construction cleaning included.', 'Dumpster(s) and haul-off of construction debris included.', 'Protection of existing adjacent finishes and structures included.', 'Temporary power and utilities during construction included.', 'Portable restroom facilities included.', 'Construction fencing and site security included.', 'Tree and landscape protection measures included.', 'Temporary weather protection (tarps, enclosures) included as needed.']
}, {
  id: 'demolition',
  title: 'Demolition',
  items: ['Selective demolition as indicated on the Demolition Plan.', 'Complete removal of the existing structure down to slab/foundation.', 'Removal of all associated framing, roofing, exterior finishes, interior finishes, and structural components.', 'All affected utilities serving the demolished areas will be capped off or otherwise made safe.', 'All demolition debris will be removed from the site and disposed of in accordance with local regulations.', 'Adjacent portions of the home to remain will be protected during demolition operations.', 'Interior demo only — walls, ceilings, flooring, fixtures, and cabinetry.', 'Removal of existing concrete flatwork as noted on plans.', 'Removal of existing deck/porch structures.', 'Pool demolition and removal included.']
}, {
  id: 'earthwork',
  title: 'Earthwork & Grading',
  items: ['Earthwork includes excavation and grading performed using standard equipment (skid steer and/or excavator) within normal operating conditions.', 'Included earthwork is limited to the time and effort reasonably anticipated for the defined scope.', 'Export or import of fill material beyond what is reasonably anticipated is excluded unless specifically noted.', 'Specialty excavation methods, including rock hammering or blasting, are excluded and will be addressed by change order if encountered.', 'Final grading and site drainage included.', 'Compaction testing included.', 'Retaining wall excavation included.']
}, {
  id: 'foundation',
  title: 'Foundation',
  items: ['Concrete footings sized per code and plans.', 'Foundation walls per plans (CMU, poured concrete, or slab).', 'Crawl-space foundation.', 'Full basement foundation.', 'Slab-on-grade foundation.', 'Pier and beam foundation.', 'Foundation waterproofing and drainage per code where applicable.', 'Radon mitigation system rough-in included.', 'Underslab plumbing rough-in included.', 'Stem wall construction included.']
}, {
  id: 'framing',
  title: 'Framing',
  items: ['Standard 2×4 construction.', '2×6 exterior wall framing for increased insulation value.', 'Floor framing including joists, beams, and subfloor installation.', 'Wall framing including interior and exterior load-bearing walls.', 'Roof framing including trusses or stick framing as specified.', 'Sheathing for floors, walls, and roof included.', 'Structural steel beams and columns per structural drawings.', 'Engineered lumber (LVL, parallam, I-joists) per plans.', 'Coffered ceiling framing included.', 'Vaulted and cathedral ceiling framing included.', 'Covered porch framing included.', 'Deck framing per plans.']
}, {
  id: 'roofing',
  title: 'Roofing',
  items: ['Roofing system installed per plans and manufacturer requirements.', 'Tamko Heritage Collection Architectural shingles.', 'Owens Corning Duration architectural shingles.', 'Standing seam metal roofing.', 'Flat/low-slope TPO roofing membrane.', 'Cedar shake or synthetic shake roofing.', 'Roof underlayment, flashing, drip edge, and penetrations included.', 'Roof ventilation per code.', 'Vinyl soffits and aluminum overhangs.', '6" seamless gutters and downspouts.', 'Ice and water shield in applicable zones.', 'Skylight installation included.']
}, {
  id: 'windows_doors',
  title: 'Windows & Exterior Doors',
  items: ['Sun Windows Patriot Clad windows in a standard color of the Client\'s choice.', 'Andersen 400 Series windows in Client\'s color choice.', 'Pella Impervia fiberglass windows.', 'Marvin Elevate windows.', 'All windows to be double-pane, low-e insulated glass.', '12/0 × 8/0 sliding glass door included.', 'Exterior entry doors per plans — fiberglass or steel.', 'Oversized pivot front door included.', 'Garage doors per plans (see Garage Doors section).', 'Window and door installation including wrapping, flashing, and caulking.']
}, {
  id: 'exterior_finishes',
  title: 'Exterior Finishes',
  items: ['Hardi lap siding on the full exterior of the home.', 'Hardi board-and-batten siding.', 'Cedar or wood siding.', 'Brick veneer exterior.', 'Centurion Stone or cultured stone veneer per plans.', 'Stucco exterior finish.', 'EIFS (Exterior Insulation and Finish System) included.', 'Porch ceiling to be stained tongue-in-groove wood.', 'Exterior caulking and sealing included.', 'Exterior trim, corner boards, and frieze boards included.', 'Soffit and fascia included.']
}, {
  id: 'insulation',
  title: 'Insulation',
  items: ['Insulation installed per code in walls, floors, and ceilings.', 'Batt insulation in walls and ceilings.', 'Blown cellulose or fiberglass in attic floor.', 'Open-cell spray foam in roof deck (conditioned attic).', 'Closed-cell spray foam in walls and crawl space.', 'Continuous exterior rigid foam insulation included.', 'Air sealing as required by code.', 'Crawl space encapsulation included.', 'Sound insulation in interior walls per plans.']
}, {
  id: 'plumbing',
  title: 'Plumbing (Rough & Final)',
  items: ['Plumbing rough-in for selected fixtures in the plumbing package.', 'Water supply and drain piping per code.', 'Venting per code.', 'PEX water supply piping throughout.', 'Connection to existing sewer/septic included.', 'New sewer lateral installation included.', 'One (1) Kitchen Sink, Faucet, and Drain.', 'Five (5) Vanity Sinks, Faucets, and Drains.', 'One (1) Laundry Sink, Faucet, and Drain.', 'Two (2) Tub Fillers, Shower Heads, Shower Arms, and Control Valves.', 'One (1) Master Shower System — head, arm, hand sprayer, and control valve.', 'Frameless glass shower enclosure in Master Bath.', 'Four (4) Toilets.', 'Water Heater (sized by licensed plumber).', 'Tankless water heater.', 'Recirculation pump included.', 'Mirrors and bath accessories.', 'Exterior hose bibs per plans.', 'Utility sink in garage or laundry.', 'Pot filler at range included.']
}, {
  id: 'electrical',
  title: 'Electrical (Rough & Final)',
  items: ['Electrical rough-in and final per code.', 'New 200-amp service panel included.', 'New 400-amp service panel included.', 'Panel upgrade from existing service.', 'Subpanel installation included.', 'Materials and installation of up to forty (40) 6" recessed lights.', 'Materials and installation of four (4) exterior flood lights.', 'Switches, outlets, and devices per code.', 'GFCI and AFCI protection per code.', 'EV charging outlet (NEMA 14-50) in garage.', 'USB outlets at specified locations.', 'Generator hookup/transfer switch included.', 'Solar-ready conduit and panel space included.', 'Whole-house surge protector included.', 'Decorative lighting allowance included (see allowances).']
}, {
  id: 'low_voltage',
  title: 'Low Voltage & Technology',
  items: ['Structured wiring — CAT6 ethernet to all bedrooms and main living areas.', 'Coax cabling for TV locations per plan.', 'Speaker wire rough-in for whole-home audio.', 'Security system rough-in included.', 'Doorbell and intercom rough-in included.', 'Smart home control system rough-in included.', 'Whole-home wifi access point rough-in included.']
}, {
  id: 'hvac',
  title: 'HVAC',
  items: ['16 SEER HVAC unit to be sized at MEP walk-through by licensed HVAC technician.', '18+ SEER high-efficiency HVAC system.', 'Ductwork, registers, and returns as required.', 'Conditioning of new spaces included where specified.', 'Four (4) gas rough-ins for water heater, range, and fireplaces.', 'ERV (Energy Recovery Ventilator) included.', 'Mini-split system for supplemental conditioning.', 'Radiant floor heating in specified areas.', 'Zoned HVAC system with multiple thermostats.', 'Smart thermostats at each zone.', 'Gas fireplace installation included.', 'Wood-burning fireplace with masonry included.']
}, {
  id: 'drywall',
  title: 'Drywall',
  items: ['Drywall installation on all new interior walls and ceilings.', 'Tape, float, and finish to Level 4 standard for smooth finish.', 'Level 5 drywall finish (skim coat) in specified rooms.', '5/8" Type-X fire-rated drywall in garage and specified areas.', 'Moisture-resistant drywall in all wet areas.', 'Soundboard in specified walls for sound attenuation.', 'Curved drywall for arched openings per plans.']
}, {
  id: 'trim',
  title: 'Interior Trim & Doors',
  items: ['Interior doors installed per plans.', 'Includes baseboard, casing, and crown to closely match the existing home.', 'Includes shoe molding in all living area spaces where applicable.', 'Paint-grade trim-built shelf and pole style shelving in closets as shown on plans.', 'Mudroom includes trim-built paint grade built-ins where shown on plans.', 'The master bedroom includes a cedar box ridge beam stained to client\'s color choice.', 'Wainscoting or board and batten in specified rooms.', 'Built-in bookshelves or entertainment center per plans.', 'Window seats with storage per plans.', 'Coffered ceiling trim details per plans.', 'Beamed ceiling treatment per plans.', 'Shiplap accent walls in specified rooms.', 'Custom stair case with hardwood treads and painted risers.', 'Custom staircase with full hardwood — treads, risers, and railings.', 'Iron or cable railing system on stairs.', 'Attic access stairs or pull-down included.']
}, {
  id: 'cabinetry',
  title: 'Cabinetry & Countertops',
  items: ['All cabinets to be custom-built paint grade with a standard overlay.', 'All cabinets to be semi-custom painted wood in Client\'s color choice.', 'Custom-built stained hardwood cabinetry.', 'Includes custom-built lower and upper cabinets where shown on plans.', 'Level B quartz countertops included on all lower cabinetry only.', 'Level A laminate countertops.', 'Full quartz countertops including island and perimeter.', 'Marble or natural stone countertops per selections.', 'Includes 4" matching quartz backsplash on all countertop-to-wall connections.', 'Full tile backsplash in kitchen included.', 'Laundry room cabinetry per plans.', 'Bathroom vanity cabinetry per plans.', 'Garage cabinetry per plans.', 'Walk-in pantry built-ins per plans.', 'Master closet custom built-ins per plans.', 'Allowance included (see allowances).']
}, {
  id: 'tile',
  title: 'Tile',
  items: ['One (1) tile selection per location unless otherwise noted.', 'Installation patterns limited to stacked, bricklay, or diagonal only.', 'Master Bath floor to be tile.', 'Secondary bath floors to be tile.', 'Powder bath floor to be tile.', 'Laundry room floor to be tile.', 'Mudroom floor to be tile.', 'Master Shower — floor and walls to ceiling.', 'Secondary baths — floor and tub/shower walls to ceiling.', 'Kitchen backsplash tile included.', 'Fireplace surround tile included.', 'All tubs/showers to include one (1) 12" × 18" wall niche.', 'Master Shower includes a bench as shown on plans.', 'Complete shower waterproofing system (Wedi®, Schluter®, or equivalent).', 'Heated floor tile system in Master Bath.']
}, {
  id: 'flooring',
  title: 'Flooring',
  items: ['Demolition of existing flooring included.', 'Realwood engineered hardwood floors in all main living areas.', 'Solid hardwood floors in all main living areas.', 'LVP (luxury vinyl plank) throughout.', 'Engineered floors in all locations except secondary bedrooms, closets, bathrooms, and laundry room.', 'Secondary bedrooms and closets to be DreamWeave carpet.', 'Whole-home carpet in specified areas.', 'Transitions and trims included.', 'Floor leveling and prep included.', 'Stair treads to match hardwood flooring.']
}, {
  id: 'painting',
  title: 'Painting',
  items: ['All new interior walls, doors, and trim to be primed and painted.', 'One ceiling color (flat finish).', 'One trim color (satin finish).', 'Up to three wall colors (flat finish).', 'Includes drywall sealer and sanding to achieve Level 4 drywall finish.', 'Exterior painting — body, trim, and doors.', 'Staining of exterior wood elements.', 'Garage interior painted.', 'Epoxy garage floor coating included.', 'Accent walls — specialty paint or wallpaper in specified rooms.']
}, {
  id: 'appliances',
  title: 'Appliances',
  items: ['Appliance allowance included (see allowances).', 'Refrigerator included.', 'Range and/or cooktop included.', 'Wall oven(s) included.', 'Dishwasher included.', 'Microwave or microwave drawer included.', 'Washer and dryer included.', 'Outdoor kitchen appliances included.', 'Wine refrigerator included.', 'Ice maker included.']
}, {
  id: 'flatwork',
  title: 'Flatwork & Concrete',
  items: ['Rear porch, mud porch, and kitchen porch to be poured concrete — broom finish.', 'Front porch concrete — broom finish.', 'Driveway — new concrete pour.', 'Driveway — asphalt.', 'Sidewalks and walkways per plan.', 'Garage floor — concrete with control joints.', 'Stamped concrete at patio/porch areas.', 'Exposed aggregate finish at specified areas.', 'Pool deck concrete or pavers.']
}, {
  id: 'landscape',
  title: 'Landscape & Hardscape',
  items: ['Final grading and seeding of disturbed areas.', 'Sod installation in rear and front yards.', 'Irrigation system installation.', 'Planting beds and shrub installation per landscape plan.', 'Retaining walls per plans.', 'Outdoor lighting — landscape and pathway.', 'Fence installation per plans.', 'Deck construction — composite or wood.', 'Covered outdoor living area — pergola or pavilion.', 'Fire pit or outdoor fireplace.']
}, {
  id: 'garage',
  title: 'Garage Doors & Openers',
  items: ['Garage doors per plans — steel raised panel.', 'Carriage-style garage doors.', 'Custom wood or wood-look garage doors.', 'Garage door openers with battery backup included.', 'Smart garage door openers included.']
}, {
  id: 'specialty',
  title: 'Specialty Items',
  items: ['Safe room or storm shelter installation.', 'Pool and spa construction (see separate scope).', 'Elevator rough-in included.', 'Elevator installation included.', 'Whole-home generator included.', 'Solar panel installation included.', 'Irrigation backflow preventer included.', 'Exterior wood burning fireplace — masonry.']
}, {
  id: 'closeout',
  title: 'Closeout',
  items: ['Final walkthrough and punch list completion.', 'Final jobsite cleaning.', 'Warranty documentation provided.', 'Owner orientation and systems training.', 'As-built drawings provided.', 'All applicable warranty registrations completed.', 'Certificate of Occupancy coordination included.']
}];
const EXCLUSION_LIBRARY = ['Driveway work and temporary construction access (including stone drives, mats, protection, repair, or replacement) unless specifically included.', 'Architectural drawings, structural engineering, or specialty consultant services unless specifically noted.', 'Permits, plan reviews, inspections, impact fees, and all municipal or HOA approvals unless specifically included.', 'Utility connections, upgrades, or relocations (water, sewer, septic, gas, electrical, data) unless specifically noted.', 'Service upgrades to electrical, plumbing, or HVAC systems unless specifically included.', 'Hazardous materials testing, abatement, or remediation (including but not limited to asbestos, lead, mold, or contaminated soils).', 'Rock hammering or specialty excavation beyond standard equipment.', 'Unforeseen code compliance requirements.', 'Exterior porch railing unless specifically included.', 'Appliances, electronics, audio/visual systems, security systems, and smart home integrations unless noted.', 'Decorative light fixtures, ceiling fans, plumbing fixtures, and accessories unless an allowance or inclusion is stated.', 'Specialty finishes, upgraded patterns, custom details, or premium materials not expressly identified in the scope.', 'Furniture, window treatments, mirrors beyond those specified, artwork, and décor.', 'Work performed by others or owner-supplied items not explicitly coordinated in this scope.', 'Modification or relocation of existing irrigation unless specifically included.', 'Work not shown on the approved plans, design drawings, or specifically listed in this scope of work.', 'Landscape, hardscape, and exterior improvements unless specifically included.', 'Pool, spa, or water feature work unless specifically included.', 'Solar panels and associated equipment unless specifically included.', 'Off-site improvements, street work, or utility main extensions.'];

// Export to window
Object.assign(window, {
  SCOPE_LIBRARY,
  EXCLUSION_LIBRARY
});