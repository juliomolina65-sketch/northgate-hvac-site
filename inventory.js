// ============================================================
//  EDIT THIS FILE to update the website.
//  1. Business info   2. Shipping rates   3. Inventory (one entry per unit)
// ============================================================

window.BUSINESS = {
  name: "Northgate",                      // <- your business name (domain ideas: northgateair.com, northgatehvac.com)
  tagline: "Carrier, Trane, Goodman and Bryant equipment with free nationwide shipping, or pick up in DFW and save $650 per system.",
  phone: "(945) 244-6670",                // <- main phone (shown on the site; calls and texts)
  sms: "+19452446670",                    // <- same number, digits only with +1
  phone2: "(945) 391-3427",               // <- second phone (shown in Contact and the footer)
  tel2: "+19453913427",                   // <- same number, digits only with +1
  email: "orders@example.com",            // <- your email
  legalName: "Northgate",                 // <- your registered business name (e.g. "Northgate HVAC LLC"), used on the Terms & Privacy pages
  mailingAddress: "4910 Kelso Lane, Garland, TX 75043", // <- your business mailing address for legal notices (not shown anywhere else)
  policiesUpdated: "September 24, 2026",  // date shown on the Terms & Privacy pages
  pickupArea: "Dallas–Fort Worth",        // exact pickup address is sent after the order is confirmed
  warrantyNote: "New in box. Confirm warranty terms for your install when you order.",
  payment: "Pay online by card, bank transfer (ACH), Apple Pay / Google Pay, or monthly with Klarna. Prefer an invoice? Pay by ACH or Zelle. We ship once payment clears. Picking up in DFW? You can also pay cash at pickup.",
  returnPolicy: "Unopened units can be returned within 30 days, minus original shipping and a 15% restocking fee. Buyer pays return shipping.",  // <- your policy
  // Set to false once the units below are your real inventory.
  sampleData: false,
};

// Shipping is FREE and built into the unit prices (like HVACDirect). Only the liftgate is extra.
window.SHIPPING = {
  shipsIn: "3–5 business days",           // time to leave the warehouse after payment
  coverage: "anywhere in the US (Alaska & Hawaii quoted separately)",
  // Freight check Sept 24, 2026 (Freightquote, Dallas 75212 -> Tampa 33634, 1 pallet 62x40x63, 535 lb, class 175):
  //   business delivery $581 (TForce) · home + appointment $675 · home + liftgate $749.
  pickupDiscount: 600,                    // $ off PER SYSTEM when picked up locally in DFW = the freight built into the price
  liftgatePrice: 175,
  // NEAR-DFW DELIVERY (within ~2 hours of DFW): lower delivery charge, taken off each unit's price.
  // ZIP3 areas: 750-753 DFW/Dallas, 754 Greenville, 756 Longview, 757 Tyler, 758 Palestine, 760-761 Fort Worth/Arlington,
  // 762 Denton/Gainesville, 763 Wichita Falls, 764 Stephenville, 765 Temple, 766-767 Waco; OK: 734 Ardmore, 747 Durant.
  nearDfwZip3: [750, 751, 752, 753, 754, 756, 757, 758, 760, 761, 762, 763, 764, 765, 766, 767, 734, 747],
  nearDfwDiscount: { system: 250, part: 150, commercial: 300 },   // $ off each unit shipped to those ZIPs                     // home delivery with liftgate (no dock / no forklift): ~$94 residential + ~$74 liftgate
  shortageHours: 24,                      // report missing items within this many hours
  damageDays: 3,                          // report damage within this many business days
  // DOE efficiency regions by ZIP3. Split AC systems sold into these must meet the minimum SEER2 below.
  // Southeast: AL AR DE FL GA KY LA MD MS NC OK SC TN TX VA DC (+HI)  ·  Southwest: AZ CA NV NM
  regions: {
    Southeast: [[197, 219], [220, 246], [270, 299], [300, 319], [320, 349], [350, 369], [370, 385],
                [386, 397], [398, 399], [400, 427], [700, 714], [716, 729], [730, 749], [750, 799], [885, 885], [967, 968]],
    Southwest: [[850, 865], [870, 884], [889, 898], [900, 961]],
  },
  minAcSeer2South: { under45k: 14.3, over45k: 13.8 },   // 45,000 BTU ≈ 3.75 tons
};

// ------------------------------------------------------------
// PARTS: every individual component, entered once, keyed by model number.
// Specs pulled from the Carrier Enterprise portal. Bundles below refer to these.
// ------------------------------------------------------------
const WARRANTY_10YR = "10-year parts (incl. compressor & coil) when registered within 90 days; 5-year otherwise";

// Carrier GA5SAN5 condensers share features; sizes, efficiency and electrical data change.
const ga5san5 = (tons, s) => ({
  role: "Condenser",
  model: s.model,
  image: "img/condenser-ga5san5.jpg",
  name: `${tons} Ton Up to ${s.seer2Max} SEER2 Air Conditioner Condensing Unit (R-454B)`,
  highlights: [
    `${s.seer2Range} SEER2 / 11.2 – 14.5 EER2 (depends on matched indoor unit)`,
    "Single-stage scroll compressor",
    "Puron Advance™ R-454B refrigerant (low GWP)",
    "Long-line capable up to 250 ft total equivalent length",
    "Low ambient cooling down to 0°F with approved kit",
    "ENERGY STAR® rated",
  ],
  specs: {
    "Dimensions (L × W × H)": s.dims,
    "Weight": s.weight,
    "Cooling capacity": `${s.btu} BTU/h (${tons} ton)`,
    "SEER2": `Up to ${s.seer2Max} (${s.seer2Range} depending on matched indoor unit)`,
    "EER2": "Up to 14.5 (11.2 – 14.5 depending on matched indoor unit)",
    "Compressor": "Scroll, single-stage",
    "Refrigerant": "R-454B (Puron Advance™)",
    "Voltage / Phase": "208/230V, 1-phase, 60 Hz",
    "Rated load amps (RLA)": s.rla,
    "Locked rotor amps (LRA)": s.lra,
    "Fan motor full load amps": s.fla,
    "Max overcurrent protection (MOCP)": s.mocp,
    "Liquid line": "3/8\" OD, sweat or braze",
    "Suction line": `${s.suction} OD, sweat or braze`,
    "Max piping length": "250 ft (up to 200 ft condenser above evaporator, 80 ft evaporator above condenser)",
    "Metering device": "TXV",
    "Condenser fan": s.fan,
    "Airflow": s.cfm,
    "Coil fins per inch": s.fpi === undefined ? "25" : s.fpi,
    "Sound level": s.sound,
    "Protection": "Internal pressure relief valve, internal thermal overload, filter drier, dense wire coil guard",
    "Approvals": s.approvals || "UL Listed · ENERGY STAR®",
    "Color": "Gray",
    "Country of origin": "Mexico",
    "Warranty": WARRANTY_10YR,
  },
});

// Carrier GH5SAN5 heat pump condensers (14.3 SEER2, R-454B).
const gh5san = (tons, s) => ({
  role: "Heat Pump",
  model: s.model,
  image: "img/hp-gh5san.jpg",
  name: `${tons} Ton 14.3 SEER2 Residential Heat Pump Condensing Unit (R-454B)`,
  highlights: [
    "14.3 SEER2 · up to 12.5 EER2 · up to 7.8 HSPF2 (depends on indoor match)",
    "Heats and cools: single-stage scroll compressor",
    "Puron Advance™ R-454B refrigerant (low GWP)",
    "Loss-of-charge switch, internal pressure relief, filter drier",
    "Long-line capable up to 250 ft total equivalent length",
    "ENERGY STAR® rated",
  ],
  specs: {
    "Dimensions (L × W × H)": s.dims,
    "Weight": s.weight,
    "Cooling capacity": `${s.btu} BTU/h (${tons} ton)`,
    "SEER2": "14.3",
    "EER2": "10.0 – 12.5 (depends on indoor match)",
    "HSPF2": "7.5 – 7.8 (depends on indoor match)",
    "Compressor": "Scroll, single-stage",
    "Stages": "1 cooling / 1 heating",
    "Refrigerant": "R-454B (Puron Advance™)",
    "Voltage / Phase": "208/230V, 1-phase, 60 Hz",
    "Rated load amps (RLA)": s.rla,
    "Locked rotor amps (LRA)": s.lra,
    "Fan motor full load amps": s.fla,
    "Max overcurrent protection (MOCP)": s.mocp,
    "Liquid line": "3/8\" OD, sweat or braze",
    "Suction line": `${s.suction} OD, sweat or braze`,
    "Max piping length": "250 ft (up to 200 ft outdoor unit above indoor, 80 ft indoor above outdoor)",
    "Condenser fan": s.fan,
    "Airflow": s.cfm,
    "Coil fins per inch": "20",
    "Sound level": s.sound,
    "Protection": "Loss-of-charge switch, internal pressure relief valve, internal thermal overload, filter drier, dense wire coil guard",
    "Approvals": "UL Listed · ENERGY STAR®",
    "Color": "Gray",
    "Country of origin": "Mexico",
    "Warranty": WARRANTY_10YR,
  },
});

// Carrier FJ5 fan coils share features; cabinet size, blower and airflow change.
const fj5 = (tons, s) => ({
  role: "Air Handler",
  model: s.model,
  image: "img/airhandler-fj5.jpg",
  name: `${tons} Ton Residential Fan Coil, Multipoise, R-454B (Aluminum Coil)`,
  highlights: [
    "Multipoise: upflow, downflow or horizontal",
    "Multi-tap ECM blower motor, 5 speed taps",
    "Built-in refrigerant leak detection & dissipation system",
    "Factory-installed R-454B TXV",
    "Low-leak cabinet (<2% at 0.5\" W.C.)",
    "Accepts 3 – 30 kW plug-in heaters",
  ],
  specs: {
    "Dimensions (L × W × H)": s.dims,
    "Weight": s.weight,
    "Cabinet width": s.cabinet,
    "Cooling capacity": `${s.btu} BTU/h (${tons} ton)`,
    "Coil": "Aluminum, grooved tube, louvered fin",
    "Refrigerant": "R-454B (Puron Advance™)",
    "Metering device": "TXV, factory installed",
    "Blower motor": `${s.hp || "1/3"} HP multi-tap ECM`,
    "Airflow": s.cfm,
    "Air flow direction": "Multipoise (up, down, horizontal)",
    "Voltage / Phase": "208/230V, 1-phase, 60 Hz",
    "Max overcurrent protection (MOCP)": s.mocp,
    "Liquid line": "3/8\" OD, sweat or braze",
    "Suction line": `${s.suction} OD, sweat or braze`,
    "Drain connection": "3/4\"",
    "Filter": `${s.filter}, filter rack included`,
    "Insulation": "1\" thick, R-4.2 with vapor barrier",
    "Electric heat": "3 – 30 kW accessory heaters, plug-in",
    "Cabinet": "Pre-painted galvanized steel (taupe metallic)",
    "Approvals": s.ul ? "UL Listed" : undefined,
    "Country of origin": s.origin,
    "Warranty": "10-year parts when registered within 90 days; 5-year otherwise",
  },
});

// KFFEH electric heater kits (all share the same 19 × 11 × 8 in chassis).
const kffeh = (kw, s) => ({
  role: "Heat Kit",
  model: s.model,
  kw,
  image: "img/heatkit-kffeh.jpg",
  name: `${kw} kW Electric Heater Kit with Circuit Breaker, 230V 1-Phase`,
  highlights: [`${kw} kW, ${s.elements} heating elements`, "Built-in circuit breaker", "Plug-in install on the fan coil", `Fits ${s.fits} fan coils`],
  specs: {
    "Dimensions (L × W × H)": "19 × 11 × 8 in",
    "Weight": s.weight,
    "Heating capacity": `${kw} kW`,
    "Elements": String(s.elements),
    "Amps": s.amps,
    "Voltage / Phase": "230V, 1-phase, 50/60 Hz",
    "Disconnect": "Circuit breaker",
    "Fits": `${s.fits} fan coils`,
    "Approvals": "UL Listed",
    "Country of origin": "Mexico",
  },
});

// Carrier CVAVA cased evaporator coils (upflow/downflow, R-454B).
const cvava = (tons, s) => ({
  role: "Coil",
  model: s.model,
  image: "img/coil-cvava.jpg",
  name: `${tons} Ton Evaporator Coil, Cased Upflow/Downflow, Painted ${s.width}" Width (R-454B)`,
  highlights: [
    "Cased V-coil, upflow or downflow",
    "Refrigerant leak detection & dissipation system",
    "Factory-installed R-454B TXV (pre-set ~10° superheat)",
    "Corrosion-resistant PBT drain pan, 3 drain plugs included",
    "Factory UV-light knockouts, easy-access service door",
  ],
  specs: {
    "Dimensions (L × W × H)": s.dims,
    "Weight": s.weight,
    "Cabinet width": `${s.width} in`,
    "Cooling capacity": `${s.btu} BTU/h (${tons} ton)`,
    "Airflow range": s.cfm,
    "Coil": "Aluminum tube, aluminum fin, V-coil",
    "Refrigerant": "R-454B (Puron Advance™)",
    "Metering device": "TXV, factory installed",
    "Air flow direction": "Upflow / downflow",
    "Liquid line": "3/8\" OD, sweat or braze",
    "Suction line": `${s.suction} OD, sweat or braze`,
    "Drain connections": "4 × 3/4\"",
    "Cabinet": "24-gauge pre-painted steel (taupe metallic), R-2.1 foil-faced insulation",
    "Burst pressure": "2,100 psi",
    "Approvals": "UL Listed",
    "Country of origin": "Mexico",
  },
});

// Carrier CAAMP multipoise cased A-coils (upflow, downflow, horizontal; R-454B).
const caamp = (tons, s) => ({
  role: "Coil",
  model: s.model,
  image: "img/coil-caamp.jpg",
  name: `${tons} Ton Multipoise Cased Evaporator A-Coil, ${s.width}" Wide (R-454B)`,
  highlights: [
    "Multipoise: upflow, downflow or horizontal (one coil for any install)",
    "Refrigerant leak detection & dissipation system",
    "Factory-installed R-454B TXV",
    "Two corrosion-resistant FRTP drain pans (vertical + horizontal)",
    "Low pressure-drop A-coil design",
  ],
  specs: {
    "Dimensions (L × W × H)": s.dims,
    "Weight": s.weight,
    "Cabinet width": `${s.width} in`,
    "Cooling capacity": `${s.btu} BTU/h (${tons} ton)`,
    "Airflow range": s.cfm,
    "Coil": "Aluminum tube, aluminum fin, A-coil",
    "Refrigerant": "R-454B (Puron Advance™)",
    "Metering device": "TXV, factory installed",
    "Air flow direction": "Multipoise (upflow, downflow, horizontal)",
    "Liquid line": "3/8\" OD, sweat or braze",
    "Suction line": "Sweat or braze",
    "Drain connections": "4 × 3/4\"",
    "Cabinet": "24-gauge pre-painted steel (taupe metallic), R-2.1 foil-faced insulation",
    "Approvals": "UL Listed",
    "Country of origin": "Mexico",
  },
});

// Carrier Comfort 58SC0B 80% single-stage gas furnaces.
const furnace58sc0b = s => ({
  role: "Furnace",
  model: s.model,
  image: "img/furnace-58sc0b.jpg",
  kbtu: parseInt(s.btuLabel, 10),
  name: `Carrier® Comfort™ 80% AFUE ${s.btuLabel} BTU Multi-Speed ECM Multipoise Gas Furnace`,
  highlights: [
    "80% AFUE, single-stage gas valve",
    "18-speed constant-torque ECM blower",
    "4-way multipoise, 13 vent options",
    "QuieTech™ noise reduction system",
    "3-digit status display + NFC setup with the Carrier tech app",
    "Natural gas or LP (with conversion kit); Hybrid Heat® dual-fuel compatible",
  ],
  specs: {
    "Dimensions (L × W × H)": s.dims,
    "Weight": s.weight,
    "Cabinet width": s.width,
    "AFUE": "80%",
    "Heating input": s.input,
    "Heating output": s.output,
    "Heating stages": "1 (single stage)",
    "Blower motor": `${s.hp || "1/3"} HP, 18-speed constant-torque ECM`,
    "Blower wheel": s.wheel || "10\" × 6\"",
    "Airflow": s.cfm,
    "Air flow direction": "Multipoise (upflow, downflow, horizontal left/right)",
    "Fuel": "Natural gas or LP (conversion kit)",
    "Gas connection": "1/2\" NPT",
    "Ignition": "Hot surface (Power Heat™ igniter)",
    "Voltage / Phase": "115V, 1-phase, 60 Hz",
    "Full load amps": s.fla,
    "Max overcurrent protection (MOCP)": s.mocp || "15 A",
    "Filter": `${s.filter} (filter rack not included)`,
    "Cabinet leakage": "<2.0% at 1.0\" w.c. (ASHRAE 193)",
    "Country of origin": "USA",
  },
});

const PARTS = {
  // ---- Condensers
  GA5SAN51800W: ga5san5(1.5, {
    model: "GA5SAN51800W", seer2Max: "17.0", seer2Range: "13.8 – 17.0", dims: "32.2 × 32.2 × 33.3 in", weight: "149 lb", btu: "18,000",
    rla: "8.3 A", lra: "41.5 A", fla: "0.5 A", mocp: "15 A", suction: "5/8\"",
    fan: "18\" blade, 1/12 HP PSC motor, 800 RPM, vertical discharge", cfm: "2,300 CFM", sound: "71 – 72 dBA",
  }),
  GA5SAN52400W: ga5san5(2, {
    model: "GA5SAN52400W", seer2Max: "17.0", seer2Range: "13.8 – 17.0", dims: "32.2 × 32.2 × 36.7 in", weight: "163 lb", btu: "24,000",
    rla: "10.3 A", lra: "60.2 A", fla: "0.7 A", mocp: "20 A", suction: "3/4\"",
    fan: "24\" blade, 1/10 HP PSC motor, 825 RPM, vertical discharge", cfm: "3,600 CFM", sound: "71 – 73 dBA",
  }),
  GA5SAN53000W: ga5san5(2.5, {
    model: "GA5SAN53000W", seer2Max: "16.5", seer2Range: "14.3 – 16.5", dims: "32.2 × 32.2 × 40.1 in", weight: "168 lb", btu: "30,000",
    rla: "12.7 A", lra: "75.6 A", fla: "0.6 A", mocp: "25 A", suction: "3/4\"",
    fan: "24\" blade, 1/10 HP PSC motor, 825 RPM, vertical discharge", cfm: "3,300 CFM", sound: "69 – 71 dBA",
  }),
  GA5SAN53602W: ga5san5(3, {
    model: "GA5SAN53602W", seer2Max: "16.5", seer2Range: "14.3 – 16.5", dims: "32.2 × 32.2 × 41.9 in", weight: "157 lb", btu: "36,000",
    rla: "13.5 A", lra: "75 A", fla: "0.7 A", mocp: "30 A", suction: "7/8\"",
    fan: "24\" blade, 1/10 HP PSC motor, 825 RPM, vertical discharge", cfm: "3,800 CFM", sound: "70 dBA",
    fpi: null, approvals: "ENERGY STAR®",   // CE doesn't list fin count or UL for this model
  }),
  GA5SAN54201W: ga5san5(3.5, {
    model: "GA5SAN54201W", seer2Max: "16.5", seer2Range: "14.3 – 16.5", dims: "32.2 × 32.2 × 40.1 in", weight: "215 lb", btu: "42,000",
    rla: "17.3 A", lra: "123 A", fla: "1.05 A", mocp: "40 A", suction: "7/8\"",
    fan: "24\" blade, 1/5 HP PSC motor, 1,100 RPM, vertical discharge", cfm: "4,900 CFM", sound: "74 dBA",
    fpi: null, approvals: "ENERGY STAR®",
  }),
  GA5SAN54800W: ga5san5(4, {
    model: "GA5SAN54800W", seer2Max: "15.5", seer2Range: "13.8 – 15.5", dims: "32.2 × 32.2 × 33.3 in", weight: "198 lb", btu: "48,000",
    rla: "22.4 A", lra: "126 A", fla: "1.05 A", mocp: "50 A", suction: "7/8\"",
    fan: "24\" blade, 1/5 HP PSC motor, 1,100 RPM, vertical discharge", cfm: "3,100 CFM", sound: "75 dBA", fpi: "20",
  }),
  GA5SAN56000W: ga5san5(5, {
    model: "GA5SAN56000W", seer2Max: "16.0", seer2Range: "13.8 – 16.0", dims: "32.2 × 32.2 × 40.1 in", weight: "215 lb", btu: "60,000",
    rla: "23.7 A", lra: "157 A", fla: "1.52 A", mocp: "50 A", suction: "1 1/8\"",
    fan: "24\" blade, 1/4 HP PSC motor, 1,100 RPM, vertical discharge", cfm: "3,900 CFM", sound: "75 dBA", fpi: "20",
  }),

  // ---- Heat pumps
  GH5SAN51800A: gh5san(1.5, { model: "GH5SAN51800A", dims: "31.19 × 31.19 × 31.69 in", weight: "147 lb", btu: "18,000", rla: "8.3 A", lra: "45.1 A", fla: "0.5 A", mocp: "15 A", suction: "5/8\"", fan: "1/12 HP PSC motor, 800 RPM, vertical discharge", cfm: "1,900 CFM", sound: "70 – 72 dBA" }),
  GH5SAN52400A: gh5san(2,   { model: "GH5SAN52400A", dims: "31.19 × 31.19 × 35.06 in", weight: "175 lb", btu: "24,000", rla: "10.3 A", lra: "64.4 A", fla: "0.6 A", mocp: "20 A", suction: "5/8\"", fan: "1/10 HP PSC motor, 825 RPM, vertical discharge", cfm: "3,500 CFM", sound: "68 – 71 dBA" }),
  GH5SAN53000A: gh5san(2.5, { model: "GH5SAN53000A", dims: "31.19 × 31.19 × 38.44 in", weight: "167 lb", btu: "30,000", rla: "12.5 A", lra: "67 A", fla: "0.7 A", mocp: "25 A", suction: "3/4\"", fan: "1/10 HP PSC motor, 825 RPM, vertical discharge", cfm: "3,000 CFM", sound: "67 – 70 dBA" }),
  GH5SAN53600A: gh5san(3,   { model: "GH5SAN53600A", dims: "31.19 × 31.19 × 31.69 in", weight: "172 lb", btu: "36,000", rla: "14.4 A", lra: "86 A", fla: "1.2 A", mocp: "30 A", suction: "3/4\"", fan: "1/4 HP PSC motor, 825 RPM, vertical discharge", cfm: "3,500 CFM", sound: "75 – 76 dBA" }),
  GH5SAN54200A: gh5san(3.5, { model: "GH5SAN54200A", dims: "31.19 × 31.19 × 31.69 in", weight: "203 lb", btu: "42,000", rla: "19 A", lra: "123 A", fla: "1.05 A", mocp: "40 A", suction: "7/8\"", fan: "1/5 HP PSC motor, 1,100 RPM, vertical discharge", cfm: "3,000 CFM", sound: "74 – 76 dBA" }),
  GH5SAN54800A: gh5san(4,   { model: "GH5SAN54800A", dims: "31.19 × 31.19 × 38.44 in", weight: "231 lb", btu: "48,000", rla: "22.4 A", lra: "126 A", fla: "1.4 A", mocp: "50 A", suction: "7/8\"", fan: "1/4 HP PSC motor, 1,110 RPM, vertical discharge", cfm: "3,800 CFM", sound: "75 – 76 dBA" }),
  GH5SAN56000A: gh5san(5,   { model: "GH5SAN56000A", dims: "35 × 35 × 35.5 in", weight: "233 lb", btu: "60,000", rla: "23.7 A", lra: "157 A", fla: "1.5 A", mocp: "50 A", suction: "1 1/8\"", fan: "1/4 HP PSC motor, 800 RPM, vertical discharge", cfm: "4,300 CFM", sound: "72 – 74 dBA" }),

  // ---- Air handlers / fan coils
  FJ5ANXA18L00: fj5(1.5, {
    model: "FJ5ANXA18L00", dims: "22.06 × 14.31 × 42.69 in", weight: "120 lb", cabinet: "14 in", btu: "18,000",
    cfm: "525 CFM", mocp: "15 A", suction: "5/8\"", filter: "13\" × 20\"", origin: "USA",
  }),
  FJ5ANXB24L00: fj5(2, {
    model: "FJ5ANXB24L00", dims: "22.06 × 17.63 × 49.63 in", weight: "128 lb", cabinet: "17 in", btu: "24,000",
    cfm: "700 CFM", mocp: "15 A", suction: "3/4\"", filter: "16\" × 20\"", origin: "Mexico", ul: true,
  }),
  FJ5ANXB30L00: fj5(2.5, {
    model: "FJ5ANXB30L00", dims: "22.06 × 17.63 × 49.63 in", weight: "148 lb", cabinet: "17 in", btu: "30,000", hp: "1/2",
    cfm: "875 CFM", mocp: "15 A", suction: "3/4\"", filter: "16\" × 20\"", origin: "USA", ul: true,
  }),
  FJ5ANXB36L00: fj5(3, {
    model: "FJ5ANXB36L00", dims: "22.06 × 17.63 × 49.63 in", weight: "148 lb", cabinet: "17 in", btu: "36,000", hp: "1/2",
    cfm: "1,050 CFM", mocp: "15 A", suction: "3/4\"", filter: "16\" × 20\"", origin: "USA", ul: true,
  }),
  FJ5ANXC42L00: fj5(3.5, {
    model: "FJ5ANXC42L00", dims: "22.06 × 21.13 × 49.63 in", weight: "166 lb", cabinet: "21 in", btu: "42,000", hp: "1/2",
    cfm: "1,225 CFM", mocp: "15 A", suction: "7/8\"", filter: "20\" × 20\"", origin: "USA", ul: true,
  }),
  FJ5ANXC48L00: fj5(4, {
    model: "FJ5ANXC48L00", dims: "22.06 × 21.13 × 53.44 in", weight: "182 lb", cabinet: "21 in", btu: "48,000", hp: "3/4",
    cfm: "1,400 CFM", mocp: "15 A", suction: "7/8\"", filter: "20\" × 20\"", origin: "USA", ul: true,
  }),
  FJ5ANXD60L00: fj5(5, {
    model: "FJ5ANXD60L00", dims: "22.06 × 24.69 × 59.19 in", weight: "210 lb", cabinet: "24 in", btu: "60,000", hp: "3/4",
    cfm: "1,750 CFM", mocp: "15 A", suction: "7/8\"", filter: "24\" × 20\"", origin: "USA", ul: true,
  }),

  // ---- Evaporator coils
  CVAVA2414XMA: cvava(2, { model: "CVAVA2414XMA", width: 14, dims: "20.63 × 14 × 14.69 in", weight: "25.6 lb", btu: "24,000", cfm: "600 – 1,000 CFM", suction: "5/8\"" }),
  CVAVA3014XMA: cvava(2.5, { model: "CVAVA3014XMA", width: 14, dims: "20.63 × 14 × 17.06 in", weight: "28.1 lb", btu: "30,000", cfm: "750 – 1,250 CFM", suction: "3/4\"" }),

  CAAMP3617AMA: caamp(3, { model: "CAAMP3617AMA", width: 17.5, dims: "20.63 × 17.5 × 29.75 in", weight: "66.4 lb", btu: "36,000", cfm: "900 – 1,500 CFM" }),
  CVAVA4217XMA: cvava(3.5, { model: "CVAVA4217XMA", width: 17.5, dims: "20.63 × 17.5 × 19.25 in", weight: "34 lb", btu: "42,000", cfm: "1,050 – 1,750 CFM", suction: "7/8\"" }),

  // ---- Gas furnaces
  CVAVA4821XMA: cvava(4, { model: "CVAVA4821XMA", width: 21, dims: "20.63 × 21 × 21.94 in", weight: "37.4 lb", btu: "48,000", cfm: "1,200 – 2,000 CFM", suction: "7/8\"" }),
  CVAVA6121XMA: cvava(5, { model: "CVAVA6121XMA", width: 21, dims: "20.63 × 21 × 35 in", weight: "50.8 lb", btu: "61,000", cfm: "1,500 – 2,500 CFM", suction: "7/8\"" }),

  "58SC0B045M14--12": furnace58sc0b({
    model: "58SC0B045M14--12", btuLabel: "45,000", dims: "29 × 14.19 × 33.33 in", weight: "108 lb", width: "14.2 in",
    input: "45,000 BTU/h nominal (42,000 – 44,000)", output: "34,000 – 36,000 BTU/h",
    cfm: "Up to 1,200 CFM cooling · 715 CFM heating", fla: "4.4 A", filter: "16\" × 25\" × 3/4\"",
  }),
  "58SC0B090M21--20": furnace58sc0b({
    model: "58SC0B090M21--20", btuLabel: "90,000", dims: "29 × 21 × 33.33 in", weight: "147 lb", width: "21 in", hp: "1",
    input: "90,000 BTU/h nominal (84,000 – 88,000)", output: "68,000 – 91,000 BTU/h (as listed by distributor)",
    cfm: "Up to 2,000 CFM cooling · 1,645 CFM heating", fla: "11.5 A", filter: "21\" × 25\" × 3/4\"", wheel: "11\" × 11\"", mocp: "20 A",
  }),
  "58SC0B110M21--20": furnace58sc0b({
    model: "58SC0B110M21--20", btuLabel: "110,000", dims: "29 × 21 × 33.33 in", weight: "150 lb", width: "21 in", hp: "1",
    input: "110,000 BTU/h nominal (105,000 – 110,000)", output: "85,000 – 90,000 BTU/h",
    cfm: "Up to 2,000 CFM cooling · 1,840 CFM heating", fla: "11.5 A", filter: "21\" × 25\" × 3/4\"", wheel: "11\" × 11\"", mocp: "20 A",
  }),
  "58SC0B070M17--12": furnace58sc0b({
    model: "58SC0B070M17--12", btuLabel: "70,000", dims: "29 × 17.5 × 33.33 in", weight: "124 lb", width: "17.5 in",
    input: "70,000 BTU/h nominal (63,000 – 66,000)", output: "51,000 – 54,000 BTU/h",
    cfm: "Up to 1,200 CFM cooling · 1,110 CFM heating", fla: "4.4 A", filter: "16\" × 25\" × 3/4\"", wheel: "10\" × 8\"",
  }),

  // ---- Heat kits
  KFFEH2501C08: kffeh(8,  { model: "KFFEH2501C08", elements: 2, amps: "28.5 – 31.5 A", weight: "6 lb", fits: "2 – 5 ton" }),
  KFFEH2601C10: kffeh(10, { model: "KFFEH2601C10", elements: 2, amps: "35.6 – 39.4 A", weight: "6 lb", fits: "2 – 5 ton" }),
  KFFEH3101C15: kffeh(15, { model: "KFFEH3101C15", elements: 3, amps: "53.4 – 59.1 A", weight: "8 lb", fits: "2 – 5 ton" }),
  KFFEH3301C20: kffeh(20, { model: "KFFEH3301C20", elements: 4, amps: "71.2 – 78.8 A", weight: "9 lb", fits: "2.5 – 5 ton" }),
};

// Drop blank spec rows (e.g. a field one size has and another doesn't).
Object.values(PARTS).forEach(p => Object.keys(p.specs).forEach(k => p.specs[k] == null && delete p.specs[k]));
window.PARTS = PARTS;

// ------------------------------------------------------------
// HEAT KIT OPTIONS for electric systems, listed smallest to largest.
// ------------------------------------------------------------
// Standard kit = add: 0 (included in the price). Others are upgrades (+) or downgrades (−).
const HEAT_10_STANDARD = [          // 1.5 – 2.5 ton
  { model: "KFFEH2601C10", add: 0 },     // standard
  { model: "KFFEH3101C15", add: 150 },
  { model: "KFFEH3301C20", add: 220 },
];
const HEAT_15_STANDARD = [          // 3 – 5 ton
  { model: "KFFEH2601C10", add: -80 },
  { model: "KFFEH3101C15", add: 0 },     // standard
  { model: "KFFEH3301C20", add: 220 },
];

// ------------------------------------------------------------
// INVENTORY: what shows on the site.
// Front of card: tons, seer2 / eer2 (use the HIGHEST rating in the range), refrigerant, voltage, price.
// parts: condenser + air handler model numbers; the heat kit comes from heatOptions.
// price: bundle price WITH shipping and the standard heat kit built in.
// ------------------------------------------------------------
const electricBundle = (tons, price, [condenser, airHandler], heatOptions, extra = {}) => ({
  id: `carrier-${tons}t-electric-${condenser.toLowerCase()}`,
  brand: "Carrier",
  name: `${tons}-Ton Electric AC System`,
  type: "Electric AC System",
  tons,
  seer2: 17.0,
  eer2: 14.5,
  hspf2: null,
  refrigerant: "R-454B",
  voltage: "208/230V 1-ph",
  price,
  msrp: null,
  inStock: null,
  image: "img/bundle-carrier-1.5t-electric.jpg",   // same look across 1.5 – 3 ton
  components: [PARTS[condenser], PARTS[airHandler]],
  optionTitle: "Electric heat kit",
  heatOptions: heatOptions.map(o => ({ ...o, part: PARTS[o.model], label: `${PARTS[o.model].kw} kW`, desc: `${PARTS[o.model].kw} kW heat`, spec: `${PARTS[o.model].kw} kW electric` })),
  ...extra,
});

// Gas systems: same condensers as electric, plus a cased coil and a gas furnace.
// price: gasPrice(tons) = electric price + GAS_PREMIUM (null shows "Call for price").
// furnaces: [standard, upgrade]; the upgrade adds FURNACE_UPGRADE.
const FURNACE_UPGRADE = 350;
const furnaceOption = (model, add) => {
  const f = PARTS[model];
  return { model, add, part: f, label: `${f.kbtu}k BTU`, desc: `${f.kbtu}k BTU furnace`, spec: `${f.btuLabel || f.kbtu + ",000"} BTU gas · 80% AFUE` };
};
const gasBundle = (tons, price, [condenser, coil], [furnace, upgrade], extra = {}) => ({
  id: `carrier-${tons}t-gas-${condenser.toLowerCase()}`,
  brand: "Carrier",
  name: `${tons}-Ton Gas AC System`,
  type: "Gas AC System",
  tons,
  seer2: 17.0,
  eer2: 14.5,
  afue: 80,
  refrigerant: "R-454B",
  voltage: "208/230V condenser · 115V furnace",
  price,
  msrp: null,
  inStock: null,
  image: "img/bundle-carrier-gas.jpg",
  components: [PARTS[condenser], PARTS[coil]],
  optionTitle: "Furnace size",
  heatOptions: [furnaceOption(furnace, 0), ...(upgrade ? [furnaceOption(upgrade, FURNACE_UPGRADE)] : [])],
  ...extra,
});

const ELECTRIC = [
  electricBundle(1.5, 2900, ["GA5SAN51800W", "FJ5ANXA18L00"], HEAT_10_STANDARD),
  electricBundle(2,   3000, ["GA5SAN52400W", "FJ5ANXB24L00"], HEAT_10_STANDARD),
  electricBundle(2.5, 3200, ["GA5SAN53000W", "FJ5ANXB30L00"], HEAT_10_STANDARD, { seer2: 16.5 }),
  electricBundle(3,   3400, ["GA5SAN53602W", "FJ5ANXB36L00"], HEAT_15_STANDARD, { seer2: 16.5 }),
  electricBundle(3.5, 3600, ["GA5SAN54201W", "FJ5ANXC42L00"], HEAT_15_STANDARD, { seer2: 16.5 }),
  electricBundle(4,   3800, ["GA5SAN54800W", "FJ5ANXC48L00"], HEAT_15_STANDARD, { seer2: 15.5 }),
  electricBundle(5,   4100, ["GA5SAN56000W", "FJ5ANXD60L00"], HEAT_15_STANDARD, { seer2: 16.0 }),
];

// Gas systems cost the electric system of the same tonnage + GAS_PREMIUM (or a per-tonnage override).
const GAS_PREMIUM = 140;
const GAS_PREMIUM_BY_TONS = { 3: 50 };
const gasPrice = tons => ELECTRIC.find(u => u.tons === tons).price + (GAS_PREMIUM_BY_TONS[tons] ?? GAS_PREMIUM);
const GAS = [
  //         tons  price          [condenser, coil]                furnace: [standard, upgrade +$350]
  gasBundle(1.5, gasPrice(1.5), ["GA5SAN51800W", "CVAVA2414XMA"], ["58SC0B045M14--12", "58SC0B070M17--12"]),   // uses the 2-ton coil
  gasBundle(2,   gasPrice(2),   ["GA5SAN52400W", "CVAVA2414XMA"], ["58SC0B045M14--12", "58SC0B070M17--12"]),
  gasBundle(2.5, gasPrice(2.5), ["GA5SAN53000W", "CVAVA3014XMA"], ["58SC0B045M14--12", "58SC0B070M17--12"], { seer2: 16.5 }),
  gasBundle(3,   gasPrice(3),   ["GA5SAN53602W", "CAAMP3617AMA"], ["58SC0B070M17--12", "58SC0B090M21--20"], { seer2: 16.5 }),
  gasBundle(3.5, gasPrice(3.5), ["GA5SAN54201W", "CVAVA4217XMA"], ["58SC0B070M17--12", "58SC0B090M21--20"], { seer2: 16.5 }),
  gasBundle(4,   gasPrice(4),   ["GA5SAN54800W", "CVAVA4821XMA"], ["58SC0B090M21--20", "58SC0B110M21--20"], { seer2: 15.5 }),
  gasBundle(5,   gasPrice(5),   ["GA5SAN56000W", "CVAVA6121XMA"], ["58SC0B090M21--20", "58SC0B110M21--20"], { seer2: 16.0 }),
];

// Heat pump systems: GH5SAN heat pump + the same fan coil and heat kit options as the electric system,
// priced at the electric system + HEAT_PUMP_PREMIUM.
const HEAT_PUMP_PREMIUM = 220;
const heatPumpBundle = (tons, heatPump) => {
  const e = ELECTRIC.find(u => u.tons === tons);
  return {
    ...e,
    id: `carrier-${tons}t-heatpump-${heatPump.toLowerCase()}`,
    name: `${tons}-Ton Heat Pump System`,
    type: "Heat Pump System",
    seer2: 14.3,
    eer2: 12.5,
    hspf2: 7.8,
    price: e.price + HEAT_PUMP_PREMIUM,
    image: "img/bundle-carrier-heatpump.jpg",
    optionTitle: "Backup (auxiliary) heat kit",
    heatOptions: e.heatOptions.map(o => ({ ...o, spec: `${o.part.kw} kW electric backup` })),
    seer2Exact: true,   // heat pumps are rated a flat 14.3 SEER2 (not a range)
    components: [PARTS[heatPump], e.components[1]],   // heat pump + same fan coil
  };
};
const HEAT_PUMPS = [
  heatPumpBundle(1.5, "GH5SAN51800A"),
  heatPumpBundle(2,   "GH5SAN52400A"),
  heatPumpBundle(2.5, "GH5SAN53000A"),
  heatPumpBundle(3,   "GH5SAN53600A"),
  heatPumpBundle(3.5, "GH5SAN54200A"),
  heatPumpBundle(4,   "GH5SAN54800A"),
  heatPumpBundle(5,   "GH5SAN56000A"),
];


// ------------------------------------------------------------
// GOODMAN (R-32): specs from Goodman spec sheets SS-GLXS4B-R32 (03/26) and SS-GAMST-R32 (01/25),
// photos from goodmanmfg.com. Priced to match AC Direct (rounded down to the dollar).
// ------------------------------------------------------------
const GOODMAN_WARRANTY = "10-year parts limited warranty with online registration within 60 days of install";
const glxs4b = (tons, s) => ({
  role: "Condenser",
  model: s.model,
  image: "img/goodman-cond-glxs4b.jpg",
  name: `Goodman ${tons} Ton Up to 15.2 SEER2 R-32 Cooling Only Condenser`,
  highlights: [
    "Up to 15.2 SEER2 (depends on matched indoor unit)",
    `Single-stage ${s.comp.toLowerCase()} compressor`,
    "R-32 refrigerant, factory charged for 15 ft of line",
    "Removable grille-style top, steel louver coil guard",
    "Meets 2023 Florida Building Code hurricane-wind integrity when anchored",
    "AHRI certified, ETL listed",
  ],
  specs: {
    "Dimensions (W × D × H)": s.dims,
    "Weight": `${s.weight} lb (ship ${s.ship} lb)`,
    "Cooling capacity": `${s.btu} BTU/h (${tons} ton)`,
    "SEER2": "Up to 15.2 (depends on matched indoor unit)",
    "Compressor": `${s.comp}, single-stage`,
    "Refrigerant": "R-32",
    "Factory charge": `${s.charge} oz (for 15 ft of 3/8" liquid line)`,
    "Voltage / Phase": "208/230V, 1-phase, 60 Hz",
    "Rated load amps (RLA)": `${s.rla} A`,
    "Locked rotor amps (LRA)": `${s.lra} A`,
    "Minimum circuit ampacity (MCA)": `${s.mca} A`,
    "Max overcurrent protection (MOCP)": `${s.mocp} A`,
    "Condenser fan": `${s.fanHp} HP PSC motor, ${s.fla} FLA`,
    "Liquid line": "3/8\" OD, sweat",
    "Suction line": `${s.suction} OD (25 ft line set); ${s.valve} suction valve`,
    "Sound level": `${s.db} dBA`,
    "Cabinet": "Architectural Gray powder paint, 500-hr salt-spray rated",
    "Approvals": "AHRI certified, ETL listed",
    "Warranty": GOODMAN_WARRANTY,
  },
});
const amst = (tons, s) => ({
  role: "Air Handler",
  model: s.model,
  image: "img/goodman-ah-amst.jpg",
  name: `Goodman ${tons} Ton R-32 Multi-Position ECM Air Handler with Internal TXV`,
  highlights: [
    "Multi-position: upflow, downflow or horizontal",
    "Multi-speed ECM blower (9 speed taps)",
    "Factory-installed TXV and R-32 leak sensor",
    "All-aluminum evaporator coil, 21\" depth for attic installs",
    "Tool-less filter access, low-leak cabinet (<2% at 1.0\" H2O)",
    "Accepts field-installed 3 to 25 kW heat kits (sold separately)",
  ],
  specs: {
    "Dimensions (W × D × H)": s.dims,
    "Ship weight": `${s.ship} lb`,
    "Cooling capacity": `${s.btu} BTU/h`,
    "Refrigerant": "R-32 (factory R-32 sensor)",
    "Metering device": "TXV, factory installed",
    "Blower": `${s.hp} HP multi-speed ECM, ${s.wheel} wheel`,
    "Blower full load amps": `${s.fla} A`,
    "Minimum circuit ampacity (MCA)": `${s.mca} A`,
    "Max overcurrent protection (MOCP)": "15 A",
    "Voltage / Phase": "208/240V, 1-phase, 60 Hz",
    "Liquid line": "3/8\"",
    "Suction line": s.suction,
    "Drain connection": "3/4\" FPT, with secondary drain",
    "Air flow direction": "Multi-position (vertical or horizontal)",
    "Electric heat": "Field-installed 3 to 25 kW heat kits available (not included)",
    "Approvals": "AHRI certified, ETL listed, UL 60335-2-40",
    "Warranty": GOODMAN_WARRANTY,
  },
});
Object.assign(PARTS, {
  GLXS4BA1810: glxs4b(1.5, { model: "GLXS4BA1810", dims: "26 × 26 × 27 in", weight: 117, ship: 132, btu: "18,000", comp: "Rotary", charge: 53, rla: 8.2, lra: 41.2, mca: 10.9, mocp: 15, fanHp: "1/8", fla: 0.7, suction: "3/4\"", valve: "3/4\"", db: 74 }),
  GLXS4BA2410: glxs4b(2,   { model: "GLXS4BA2410", dims: "26 × 26 × 27 in", weight: 117, ship: 132, btu: "24,000", comp: "Rotary", charge: 53, rla: 8.2, lra: 41.2, mca: 10.9, mocp: 15, fanHp: "1/8", fla: 0.7, suction: "3/4\"", valve: "3/4\"", db: 74 }),
  GLXS4BA3010: glxs4b(2.5, { model: "GLXS4BA3010", dims: "29 × 29 × 32 in", weight: 155, ship: 170, btu: "30,000", comp: "Rotary", charge: 63, rla: 11.2, lra: 52.5, mca: 15.0, mocp: 25, fanHp: "1/6", fla: 0.95, suction: "3/4\"", valve: "3/4\"", db: 71 }),
  GLXS4BA3610: glxs4b(3,   { model: "GLXS4BA3610", dims: "29 × 29 × 39.5 in", weight: 158, ship: 173, btu: "36,000", comp: "Scroll", charge: 69, rla: 13.4, lra: 83.3, mca: 17.8, mocp: 30, fanHp: "1/6", fla: 0.95, suction: "7/8\"", valve: "7/8\"", db: 67 }),
  GLXS4BA4210: glxs4b(3.5, { model: "GLXS4BA4210", dims: "35.5 × 35.5 × 35.75 in", weight: 210, ship: 225, btu: "42,000", comp: "Scroll", charge: 83, rla: 14.4, lra: 112.2, mca: 19.0, mocp: 30, fanHp: "1/6", fla: 0.95, suction: "1 1/8\"", valve: "7/8\"", db: 72 }),
  GLXS4BA4810: glxs4b(4,   { model: "GLXS4BA4810", dims: "35.5 × 35.5 × 35.75 in", weight: 211, ship: 226, btu: "48,000", comp: "Scroll", charge: 91, rla: 19.4, lra: 127.7, mca: 25.2, mocp: 40, fanHp: "1/6", fla: 0.95, suction: "1 1/8\"", valve: "7/8\"", db: 73 }),
  GLXS4BA6010: glxs4b(5,   { model: "GLXS4BA6010", dims: "35.5 × 35.5 × 39.5 in", weight: 224, ship: 239, btu: "60,000", comp: "Scroll", charge: 94, rla: 23.9, lra: 148.0, mca: 32.4, mocp: 50, fanHp: "1/4", fla: 1.3, suction: "1 1/8\"", valve: "7/8\"", db: 76 }),
  AMST24BU1300: amst(2,   { model: "AMST24BU1300", dims: "17.56 × 21 × 45 in", ship: 112, btu: "24,000", hp: "3/4", wheel: "10\" × 6\"", fla: 4.6, mca: 5.8, suction: "3/4\"" }),
  AMST30BU1300: amst(2.5, { model: "AMST30BU1300", dims: "17.56 × 21 × 53.44 in", ship: 129, btu: "30,000", hp: "3/4", wheel: "10\" × 6\"", fla: 4.5, mca: 5.6, suction: "3/4\"" }),
  AMST42CU1300: amst(3.5, { model: "AMST42CU1300", dims: "21.13 × 21 × 53.44 in", ship: 153, btu: "42,000", hp: "3/4", wheel: "10\" × 8\"", fla: 5.7, mca: 5.9, suction: "3/4\"" }),
  AMST48CU1300: amst(4,   { model: "AMST48CU1300", dims: "21.13 × 21 × 58 in", ship: 153, btu: "48,000", hp: "3/4", wheel: "10\" × 10\"", fla: 5.7, mca: 7.1, suction: "7/8\"" }),
  AMST60DU1300: amst(5,   { model: "AMST60DU1300", dims: "24.63 × 21 × 58 in", ship: 167, btu: "60,000", hp: "1", wheel: "11\" × 10\"", fla: 6.9, mca: 8.6, suction: "7/8\"" }),
});

// Goodman HKTS heat kits for AMST air handlers. kW is the 240V rating (derates at 208V).
const hkts = (kw, s) => ({
  role: "Heat Kit",
  model: s.model,
  kw,
  image: null,
  name: `Goodman ${kw} kW Electric Heat Kit ${s.breaker ? "with Circuit Breaker" : "without Breaker"} (${s.model})`,
  highlights: [`${s.rated} kW at 240V`, s.breaker ? "Built-in circuit breaker (service disconnect)" : "No breaker: field-supplied disconnect required", `Fits ${s.fits}`],
  specs: {
    "Heating capacity": `${s.rated} kW at 240V (×0.75 at 208V)`,
    "Heater amps (208V/240V)": s.amps,
    "Disconnect": s.breaker ? "Circuit breaker" : "None (field-supplied)",
    "Circuits": s.circuits,
    "Voltage / Phase": "208/240V, 1-phase",
    "Fits": s.fits,
  },
});
Object.assign(PARTS, {
  HKTSN05X1: hkts(5,  { model: "HKTSN05X1", rated: "4.8",  amps: "17.3 / 20.0 A", circuits: "1", fits: "All AMST air handlers" }),
  HKTSN08X1: hkts(8,  { model: "HKTSN08X1", rated: "8.0",  amps: "28.9 / 33.3 A", circuits: "1", fits: "All AMST air handlers" }),
  HKTSN10X1: hkts(10, { model: "HKTSN10X1", rated: "9.6",  amps: "34.7 / 40.0 A", circuits: "1", fits: "All AMST air handlers" }),
  HKTSD15XB: hkts(15, { model: "HKTSD15XB", rated: "14.4", amps: "34.7 / 40.0 A + 17.3 / 20.0 A", circuits: "2 (or single-point kit)", fits: "All AMST air handlers", breaker: true }),
  HKTSD20DB: hkts(20, { model: "HKTSD20DB", rated: "19.2", amps: "34.7 / 40.0 A + 34.7 / 40.0 A", circuits: "2 (or single-point kit)", fits: "AMST 5-ton (D cabinet)", breaker: true }),
});
const GOODMAN_KITS = [["HKTSN05X1", 112], ["HKTSN08X1", 138], ["HKTSN10X1", 150], ["HKTSD15XB", 280]];
const GOODMAN_KITS_5T = [...GOODMAN_KITS, ["HKTSD20DB", 319]];
const goodmanHeatOptions = kits => [
  { model: "none", add: 0, part: null, label: "No heat kit", desc: "no heat kit", spec: "None (cooling only)" },
  ...kits.map(([m, add]) => ({ model: m, add, part: PARTS[m], label: `+ ${PARTS[m].kw} kW`, desc: `${PARTS[m].kw} kW heat kit`, spec: `${PARTS[m].kw} kW electric` })),
];

const goodmanSystem = (tons, price, seer2, [condenser, airHandler]) => ({
  id: `goodman-${tons}t-ac-${condenser.toLowerCase()}`,
  brand: "Goodman",
  name: `${tons}-Ton ${seer2} SEER2 Split AC System`,
  type: "Split AC System",
  tons,
  seer2,
  seer2Exact: true,        // AHRI-matched system rating
  refrigerant: "R-32",
  voltage: "208/230V 1-ph",
  heatNote: `Heat kit optional · add 5 to ${tons === 5 ? 20 : 15} kW`,
  optionTitle: "Add a heat kit (optional)",
  heatOptions: goodmanHeatOptions(tons === 5 ? GOODMAN_KITS_5T : GOODMAN_KITS),
  price,
  msrp: null,
  inStock: null,
  image: "img/bundle-goodman-ac.jpg",
  components: [PARTS[condenser], PARTS[airHandler]],
});
const GOODMAN = [
  goodmanSystem(1.5, 2975, 15,   ["GLXS4BA1810", "AMST24BU1300"]),   // uses the 2-ton air handler
  goodmanSystem(2,   3107, 14.5, ["GLXS4BA2410", "AMST24BU1300"]),
  goodmanSystem(2.5, 3238, 14.5, ["GLXS4BA3010", "AMST30BU1300"]),
  goodmanSystem(3,   3643, 15.2, ["GLXS4BA3610", "AMST42CU1300"]),   // uses the 3.5-ton air handler
  goodmanSystem(3.5, 3913, 14.5, ["GLXS4BA4210", "AMST42CU1300"]),
  goodmanSystem(4,   4151, 14,   ["GLXS4BA4810", "AMST48CU1300"]),
  goodmanSystem(5,   4500, 14,   ["GLXS4BA6010", "AMST60DU1300"]),   // beats AC Direct ($4,719.07)
];

// Goodman GLZS4B R-32 heat pumps (specs from SS-GLZS4B-R32 08/26, photo from goodmanmfg.com).
const glzs4b = (tons, s) => ({
  role: "Heat Pump",
  model: s.model,
  image: "img/goodman-hp-glzs4b-1200.jpg",
  name: `Goodman ${tons} Ton Up to 15.2 SEER2 R-32 Heat Pump Condenser`,
  highlights: [
    "Up to 15.2 SEER2 & 7.8 HSPF2 (depends on matched indoor unit)",
    `Single-stage ${s.comp.toLowerCase()} compressor with crankcase heater`,
    "SmartShift® quiet, reliable defrost",
    "Suction-line accumulator, bi-flow filter drier, high & low pressure switches",
    "R-32 refrigerant, factory charged for 15 ft of line",
    "Meets 2023 Florida Building Code hurricane-wind integrity when anchored",
  ],
  specs: {
    "Dimensions (W × D × H)": s.dims,
    "Weight": `${s.weight} lb (ship ${s.ship} lb)`,
    "Capacity": `${s.btu} BTU/h cooling & heating (${tons} ton)`,
    "SEER2 / HSPF2": "Up to 15.2 / up to 7.8 (depends on matched indoor unit)",
    "Compressor": `${s.comp}, single-stage`,
    "Refrigerant": "R-32",
    "Factory charge": `${s.charge} oz (for 15 ft of 3/8" liquid line)`,
    "Voltage / Phase": "208/230V, 1-phase, 60 Hz",
    "Rated load amps (RLA)": `${s.rla} A`,
    "Locked rotor amps (LRA)": `${s.lra} A`,
    "Minimum circuit ampacity (MCA)": `${s.mca} A`,
    "Max overcurrent protection (MOCP)": `${s.mocp} A`,
    "Condenser fan": `${s.fanHp} HP PSC motor, ${s.fla} FLA`,
    "Liquid line": "3/8\" OD, sweat",
    "Suction line": `${s.suction} OD; ${s.valve} suction valve`,
    "Sound level": `${s.db} dBA`,
    "Cabinet": "Heavy-gauge galvanized steel, Architectural Gray powder paint",
    "Approvals": "AHRI certified, ETL listed",
    "Warranty": GOODMAN_WARRANTY,
  },
});
Object.assign(PARTS, {
  GLZS4BA2410: glzs4b(2,   { model: "GLZS4BA2410", dims: "29 × 29 × 32.5 in",      weight: 150, ship: 165, btu: "24,000", comp: "Rotary", charge: 70,  rla: 8.2,  lra: 41.2,  mca: 11.2, mocp: 15, fanHp: "1/6", fla: 0.95, suction: "3/4\"",   valve: "3/4\"", db: 74 }),
  GLZS4BA3010: glzs4b(2.5, { model: "GLZS4BA3010", dims: "29 × 29 × 39.5 in",      weight: 175, ship: 190, btu: "30,000", comp: "Rotary", charge: 81,  rla: 11.2, lra: 52.5,  mca: 15.0, mocp: 25, fanHp: "1/6", fla: 0.95, suction: "3/4\"",   valve: "3/4\"", db: 77 }),
  GLZS4BA3610: glzs4b(3,   { model: "GLZS4BA3610", dims: "35.5 × 35.5 × 35.75 in", weight: 196, ship: 211, btu: "36,000", comp: "Scroll", charge: 83,  rla: 16.4, lra: 88.0,  mca: 21.5, mocp: 35, fanHp: "1/6", fla: 0.97, suction: "7/8\"",   valve: "7/8\"", db: 75 }),
  GLZS4BA4210: glzs4b(3.5, { model: "GLZS4BA4210", dims: "35.5 × 35.5 × 35.75 in", weight: 262, ship: 277, btu: "42,000", comp: "Scroll", charge: 139, rla: 14.4, lra: 112.2, mca: 19.3, mocp: 30, fanHp: "1/4", fla: 1.30, suction: "1 1/8\"", valve: "7/8\"", db: 72 }),
  GLZS4BA4810: glzs4b(4,   { model: "GLZS4BA4810", dims: "35.5 × 35.5 × 36.5 in",  weight: 269, ship: 284, btu: "48,000", comp: "Scroll", charge: 174, rla: 19.4, lra: 127.7, mca: 25.5, mocp: 40, fanHp: "1/4", fla: 1.30, suction: "1 1/8\"", valve: "7/8\"", db: 74 }),
  GLZS4BA6010: glzs4b(5,   { model: "GLZS4BA6010", dims: "35.5 × 35.5 × 41.75 in", weight: 300, ship: 320, btu: "60,000", comp: "Scroll", charge: 194, rla: 23.9, lra: 148.0, mca: 31.1, mocp: 50, fanHp: "1/4", fla: 1.30, suction: "1 1/8\"", valve: "7/8\"", db: 75 }),
  AMST36CU1300: amst(3, { model: "AMST36CU1300", dims: "21.13 × 21 × 49 in", ship: 153, btu: "36,000", hp: "3/4", wheel: "10\" × 8\"", fla: 5.7, mca: 7.1, suction: "3/4\"" }),
});

// Priced $100 under AC Direct (their price rounded down to the dollar, minus 100).
const goodmanHeatPump = (tons, price, seer2, [heatPump, airHandler]) => ({
  id: `goodman-${tons}t-hp-${heatPump.toLowerCase()}`,
  brand: "Goodman",
  name: `${tons}-Ton ${seer2} SEER2 Heat Pump System`,
  type: "Heat Pump System",
  tons,
  seer2,
  seer2Exact: true,        // AHRI-matched system rating
  hspf2: 7.8,
  refrigerant: "R-32",
  voltage: "208/230V 1-ph",
  heatNote: `Backup heat kit optional · add 5 to ${tons === 5 ? 20 : 15} kW`,
  optionTitle: "Backup (auxiliary) heat kit (optional)",
  // a heat pump heats on its own; the kit is only electric backup
  heatOptions: goodmanHeatOptions(tons === 5 ? GOODMAN_KITS_5T : GOODMAN_KITS).map(o => o.part
    ? { ...o, spec: `Heat pump + ${o.part.kw} kW electric backup` }
    : { ...o, label: "No backup kit", spec: "Heat pump (no backup kit)" }),
  price,
  msrp: null,
  inStock: null,
  image: "img/bundle-goodman-hp.jpg",
  components: [PARTS[heatPump], PARTS[airHandler]],
});
const GOODMAN_HEAT_PUMPS = [
  goodmanHeatPump(2,   3000, 15.2, ["GLZS4BA2410", "AMST24BU1300"]),   // AC Direct $3,100.38
  goodmanHeatPump(2.5, 3345, 14.5, ["GLZS4BA3010", "AMST30BU1300"]),   // AC Direct $3,445.28
  goodmanHeatPump(3,   3775, 15,   ["GLZS4BA3610", "AMST36CU1300"]),   // AC Direct $3,875.44
  goodmanHeatPump(3.5, 4025, 15.2, ["GLZS4BA4210", "AMST42CU1300"]),   // AC Direct $4,125.00
  goodmanHeatPump(4,   4325, 15.2, ["GLZS4BA4810", "AMST48CU1300"]),   // AC Direct $4,425.90
  goodmanHeatPump(5,   5015, 14.5, ["GLZS4BA6010", "AMST60DU1300"]),   // AC Direct $5,115.00
];

// Goodman gas systems (R-32): GLXS4B condenser + CAPTA cased coil + GR9S80 80% single-stage furnace (upflow).
// Same matches AC Direct sells. Specs: Goodman SS-GR9S80_GD9S80-R32 (06/24), SS-GCoil-R32 (12/24); photos goodmanmfg.com.
// Price = AC Direct sale price (Sept 24, 2026) - $100, then the freight + insurance adders below.
const GOODMAN_FURNACE_WARRANTY = "Lifetime heat exchanger + 10-year parts limited warranty with online registration within 60 days";
const gr9s80 = (s) => ({
  role: "Furnace",
  model: s.model,
  image: "img/goodman-furnace-gr9s80.jpg",
  kbtu: s.kbtu,
  btuLabel: `${s.kbtu},000`,
  name: `Goodman GR9S80 80% AFUE ${s.kbtu},000 BTU Single-Stage Multi-Speed ECM Gas Furnace, ${s.width}" Wide (Upflow/Horizontal)`,
  highlights: [
    "80% AFUE, single-stage gas valve",
    "9-speed multi-speed ECM blower",
    "Upflow or horizontal left/right installation",
    "Aluminized-steel tubular heat exchanger, hot surface igniter",
    "Gas and electrical connect on the left or right side",
    "Lifetime heat exchanger limited warranty with registration",
  ],
  specs: {
    "Heating input": `${s.kbtu},000 BTU/h`,
    "Heating output": `${s.output} BTU/h`,
    "AFUE": "80%",
    "Heating stages": "1 (single stage)",
    "Cabinet width": `${s.width} in`,
    "Dimensions (H × W × D)": `33.4 × ${s.width} × 28 in`,
    "Shipping weight": `${s.ship} lb`,
    "Temperature rise": `${s.rise}°F`,
    "Blower": `${s.hp} HP 9-speed ECM, ${s.wheel} wheel`,
    "Nominal max airflow": `${s.cfm} CFM (for up to ${s.tons}-ton cooling)`,
    "Air flow direction": "Upflow, horizontal left/right",
    "Fuel": "Natural gas (LP with conversion kit)",
    "Gas connection": "1/2\" FPT",
    "Vent": "4\"",
    "Ignition": "Hot surface igniter",
    "Voltage / Phase": "115V, 1-phase, 60 Hz",
    "Min circuit ampacity / Max breaker": `${s.mca} A / ${s.ocp} A`,
    "Warranty": GOODMAN_FURNACE_WARRANTY,
  },
});
const capta = (s) => ({
  role: "Coil",
  model: s.model,
  image: "img/goodman-coil-capta.jpg",
  name: `Goodman CAPTA ${s.range} Ton R-32 Cased Evaporator Coil, ${s.width}" Wide (Upflow/Downflow)`,
  highlights: [
    "Cased and painted, upflow or downflow",
    "Factory-installed TXV, all-aluminum coil optimized for R-32",
    "R-32 refrigerant leak sensor",
    "UV-resistant drain pan with primary and secondary drains",
  ],
  specs: {
    "Nominal capacity": `${s.range} ton`,
    "Cabinet width": `${s.width} in`,
    "Dimensions (W × D × H)": `${s.width} × 21 × ${s.h} in`,
    "Shipping weight": `${s.ship} lb`,
    "Coil": "All-aluminum A-coil",
    "Refrigerant": "R-32 (leak sensor included)",
    "Metering device": "TXV, factory installed",
    "Air flow direction": "Upflow / downflow",
    "Liquid line": "3/8\"",
    "Suction line": `${s.suction}"`,
    "Warranty": GOODMAN_WARRANTY,
  },
});
Object.assign(PARTS, {
  GR9S800403AN: gr9s80({ model: "GR9S800403AN", kbtu: 40,  output: "32,000", width: 14,   ship: 86,  rise: "25–55", hp: "1/2", wheel: "10\" × 6\"",  cfm: 1200, tons: 3, mca: 7.7,  ocp: 15 }),
  GR9S800603BN: gr9s80({ model: "GR9S800603BN", kbtu: 60,  output: "48,000", width: 17.5, ship: 100, rise: "20–50", hp: "1/2", wheel: "10\" × 8\"",  cfm: 1200, tons: 3, mca: 7.7,  ocp: 15 }),
  GR9S800803BN: gr9s80({ model: "GR9S800803BN", kbtu: 80,  output: "64,000", width: 17.5, ship: 116, rise: "35–65", hp: "1/2", wheel: "10\" × 8\"",  cfm: 1200, tons: 3, mca: 7.7,  ocp: 15 }),
  GR9S800804CN: gr9s80({ model: "GR9S800804CN", kbtu: 80,  output: "64,000", width: 21,   ship: 132, rise: "35–65", hp: "3/4", wheel: "10\" × 10\"", cfm: 1600, tons: 4, mca: 11.3, ocp: 15 }),
  GR9S801005CN: gr9s80({ model: "GR9S801005CN", kbtu: 100, output: "80,000", width: 21,   ship: 132, rise: "35–65", hp: "3/4", wheel: "10\" × 10\"", cfm: 2000, tons: 5, mca: 11.3, ocp: 15 }),
  CAPTA1818A3: capta({ model: "CAPTA1818A3", range: "1.5",     width: 14,   h: 18, ship: 30, suction: "3/4" }),
  CAPTA3022B3: capta({ model: "CAPTA3022B3", range: "2–2.5",   width: 17.5, h: 22, ship: 40, suction: "3/4" }),
  CAPTA3626B3: capta({ model: "CAPTA3626B3", range: "2–3",     width: 17.5, h: 26, ship: 48, suction: "7/8" }),
  CAPTA3626C3: capta({ model: "CAPTA3626C3", range: "2–3",     width: 21,   h: 26, ship: 51, suction: "7/8" }),
  CAPTA4230C3: capta({ model: "CAPTA4230C3", range: "2.5–3.5", width: 21,   h: 30, ship: 66, suction: "7/8" }),
  CAPTA6030C3: capta({ model: "CAPTA6030C3", range: "3.5–5",   width: 21,   h: 30, ship: 66, suction: "7/8" }),
});
const goodmanGasSystem = (tons, acDirect, seer2, eer2, [condenser, coil, furnace]) => ({
  id: `goodman-${tons}t-gas-${condenser.toLowerCase()}`,
  brand: "Goodman",
  name: `${tons}-Ton ${seer2} SEER2 Gas Furnace System`,
  type: "Gas AC System",
  tons,
  seer2,
  seer2Exact: true,        // AHRI-matched system rating
  eer2,
  afue: 80,
  refrigerant: "R-32",
  voltage: "208/230V condenser · 115V furnace",
  price: Math.floor(acDirect) - 100,
  msrp: null,
  inStock: null,
  image: "img/bundle-goodman-gas.jpg",
  components: [PARTS[condenser], PARTS[coil]],
  optionTitle: "Furnace size",
  heatOptions: [furnaceOption(furnace, 0)],
});
const GOODMAN_GAS = [
  //               tons  AC Direct   SEER2 EER2  [condenser,     CAPTA coil,     GR9S80 furnace]
  goodmanGasSystem(1.5, 3294.22, 14.5, 12.0, ["GLXS4BA1810", "CAPTA1818A3", "GR9S800403AN"]),   // 40k
  goodmanGasSystem(2,   3650.39, 15.2, 12.0, ["GLXS4BA2410", "CAPTA3022B3", "GR9S800603BN"]),   // 60k
  goodmanGasSystem(2.5, 3782.61, 15.2, 12.5, ["GLXS4BA3010", "CAPTA3626B3", "GR9S800803BN"]),   // 80k
  goodmanGasSystem(3,   4100.63, 15.2, 12.0, ["GLXS4BA3610", "CAPTA3626C3", "GR9S800804CN"]),   // 80k
  goodmanGasSystem(3.5, 4418.73, 15.2, 12.0, ["GLXS4BA4210", "CAPTA4230C3", "GR9S800804CN"]),   // 80k
  goodmanGasSystem(4,   4832.77, 14.5, 11.7, ["GLXS4BA4810", "CAPTA6030C3", "GR9S801005CN"]),   // 100k
  goodmanGasSystem(5,   5187.96, 14.0, 11.5, ["GLXS4BA6010", "CAPTA6030C3", "GR9S801005CN"]),   // 100k
];

// ------------------------------------------------------------
// INDIVIDUAL PARTS: every part above, sold on its own.
// Price = your cost + shipping for that kind of part + commission.
// Add the cost in PART_COSTS (model -> dollars); anything without a cost shows "Call for price".
// ------------------------------------------------------------
const PART_COMMISSION = 400;
const PART_SHIPPING = {            // built-in freight per part type (single-unit pallet, business delivery)
  "Condenser": 450,
  "Heat Pump Condenser": 450,
  "Air Handler": 450,
};
const PART_COSTS = {
  GA5SAN51800W: 1300,    // 1.5-ton AC condenser
  GA5SAN52400W: 1450,    // 2-ton
  GA5SAN53000W: 1600,    // 2.5-ton
  GA5SAN53602W: 1700,    // 3-ton
  GA5SAN54201W: 1800,    // 3.5-ton
  GA5SAN54800W: 1900,    // 4-ton
  GA5SAN56000W: 2200,    // 5-ton
  // Air handlers: same size-to-size cost steps as the condensers (+150, +150, +100, +100, +100, +300)
  FJ5ANXA18L00: 950,     // 1.5-ton air handler
  FJ5ANXB24L00: 1100,    // 2-ton
  FJ5ANXB30L00: 1250,    // 2.5-ton
  FJ5ANXB36L00: 1350,    // 3-ton
  FJ5ANXC42L00: 1450,    // 3.5-ton
  FJ5ANXC48L00: 1550,    // 4-ton
  FJ5ANXD60L00: 1850,    // 5-ton
};
// Heat pump condensers cost HP_CONDENSER_EXTRA more than the AC condenser of the same size.
const HP_CONDENSER_EXTRA = 150;
Object.keys(PARTS).filter(m => m.startsWith("GH5SAN")).forEach(hp => {
  const ac = hp.replace("GH5SAN", "GA5SAN").replace(/A$/, "W");
  const acModel = Object.keys(PART_COSTS).find(m => m.slice(0, 10) === ac.slice(0, 10));   // e.g. GA5SAN5360... (3-ton is GA5SAN53602W)
  if (acModel && PART_COSTS[hp] == null) PART_COSTS[hp] = PART_COSTS[acModel] + HP_CONDENSER_EXTRA;
});
const PART_PRICES = {             // final site price, overrides the formula
  // Air handlers (owner-set Sept 23, +$150 freight update Sept 24)
  FJ5ANXB24L00: 1900,    // 2-ton
  FJ5ANXB30L00: 1950,    // 2.5-ton
  FJ5ANXB36L00: 2000,    // 3-ton
  FJ5ANXC42L00: 2100,    // 3.5-ton
  FJ5ANXC48L00: 2150,    // 4-ton
  FJ5ANXD60L00: 2350,    // 5-ton
  // Furnaces (owner-set)
  "58SC0B045M14--12": 1500,   // 45k
  "58SC0B070M17--12": 1550,   // 70k
  "58SC0B090M21--20": 1650,   // 90k
  "58SC0B110M21--20": 1780,   // 110k
  // Coils (owner-set)
  CVAVA2414XMA: 1100,    // 2-ton (also used on 1.5-ton gas)
  CVAVA3014XMA: 1250,    // 2.5-ton
  CAAMP3617AMA: 1350,    // 3-ton
  CVAVA4217XMA: 1450,    // 3.5-ton
  CVAVA4821XMA: 1550,    // 4-ton
  CVAVA6121XMA: 1600,    // 5-ton
  // Heat kits (owner-set)
  KFFEH2501C08: 500,     // 8 kW
  KFFEH2601C10: 550,     // 10 kW
  KFFEH3101C15: 750,     // 15 kW
  KFFEH3301C20: 800,     // 20 kW
};
const tonsOf = p => { const m = p.name.match(/^(\d+(?:\.\d+)?) Ton/); return m ? +m[1] : null; };
const upTo = v => { const m = String(v || "").match(/(\d+(?:\.\d+)?)/g); return m ? Math.max(...m.map(Number)) : null; };
const partItem = (model, type, extra = {}) => {
  const p = PARTS[model];
  const tons = tonsOf(p);
  return {
    id: `part-${model.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    brand: "Carrier",
    name: extra.name || p.name,
    type,
    tons,
    refrigerant: /R-454B/.test(JSON.stringify(p.specs)) ? "R-454B" : null,
    price: PART_PRICES[model] ?? (PART_COSTS[model] != null && PART_SHIPPING[type] != null
      ? PART_COSTS[model] + PART_SHIPPING[type] + PART_COMMISSION : null),
    unit: "each",
    inStock: null,
    image: p.image,
    components: [p],
    ...extra,
  };
};
const byTons = (a, b) => (a.tons || 0) - (b.tons || 0);
const models = prefix => Object.keys(PARTS).filter(m => m.startsWith(prefix));

const PART_ITEMS = [
  ...models("GA5SAN").map(m => partItem(m, "Condenser", {
    name: `${tonsOf(PARTS[m])}-Ton AC Condenser`, seer2: upTo(PARTS[m].specs.SEER2), eer2: 14.5,
  })).sort(byTons),
  ...models("GH5SAN").map(m => partItem(m, "Heat Pump Condenser", {
    name: `${tonsOf(PARTS[m])}-Ton Heat Pump Condenser`, seer2: 14.3, seer2Exact: true, eer2: 12.5, hspf2: 7.8,
  })).sort(byTons),
  ...models("FJ5").map(m => partItem(m, "Air Handler", {
    name: `${tonsOf(PARTS[m])}-Ton Multipoise Air Handler`, chips: [PARTS[m].specs["Cabinet width"] + " cabinet", PARTS[m].specs.Airflow],
  })).sort(byTons),
  ...models("58SC0B").map(m => partItem(m, "Furnace", {
    name: `${PARTS[m].kbtu}k BTU 80% Gas Furnace`, badge: `${PARTS[m].kbtu}K BTU`, afue: 80,
    chips: [PARTS[m].specs["Cabinet width"] + " wide"], keySpecsExtra: [["Heating input", PARTS[m].specs["Heating input"].split(" (")[0]], ["AFUE", "80%"], ["Width", PARTS[m].specs["Cabinet width"]]],
  })).sort((a, b) => a.components[0].kbtu - b.components[0].kbtu),
  ...[...models("CVAVA"), ...models("CAAMP")].map(m => partItem(m, "Coil", {
    name: `${tonsOf(PARTS[m])}-Ton Cased Evaporator Coil`, chips: [PARTS[m].specs["Cabinet width"] + " wide", PARTS[m].specs["Air flow direction"]],
    keySpecsExtra: [["Width", PARTS[m].specs["Cabinet width"]], ["Airflow", PARTS[m].specs["Airflow range"]]],
  })).sort(byTons),
  ...models("KFFEH").map(m => partItem(m, "Heat Kit", {
    name: `${PARTS[m].kw} kW Electric Heat Kit`, badge: `${PARTS[m].kw} KW`, tons: null,
    chips: [PARTS[m].specs.Amps, "Fits " + PARTS[m].specs.Fits], keySpecsExtra: [["Heating", `${PARTS[m].kw} kW`], ["Amps", PARTS[m].specs.Amps], ["Fits", PARTS[m].specs.Fits]],
  })).sort((a, b) => a.components[0].kw - b.components[0].kw),
];


// Air handlers are sold WITHOUT a heat kit; buyers can add one at a discounted add-on price
// (bought on its own, a heat kit costs its full part price above).
const AH_KIT_ADDON = { KFFEH2601C10: 150, KFFEH3101C15: 180, KFFEH3301C20: 280 };
PART_ITEMS.filter(u => u.type === "Air Handler").forEach(u => {
  u.optionTitle = "Add a heat kit (not included)";
  u.heatNote = "Heat kit NOT included · add a 10, 15 or 20 kW kit";
  u.heatOptions = [
    { model: "none", add: 0, part: null, label: "No heat kit", desc: "no heat kit", spec: "Not included" },
    ...["KFFEH2601C10", "KFFEH3101C15", "KFFEH3301C20"].map(m => ({
      model: m, add: AH_KIT_ADDON[m], part: PARTS[m], label: `+ ${PARTS[m].kw} kW`, desc: `${PARTS[m].kw} kW heat kit`, spec: `${PARTS[m].kw} kW heat kit added`,
    })),
  ];
});

// Local DFW pickup discount also applies to these individual parts ($ off each).
// Parts with built-in freight (PART_SHIPPING) save that amount; the rest save PART_PICKUP_DISCOUNT.
const PICKUP_PART_TYPES = ["Condenser", "Heat Pump Condenser", "Air Handler", "Furnace", "Coil", "Heat Kit"];
const PART_PICKUP_DISCOUNT = 300;
PART_ITEMS.filter(u => PICKUP_PART_TYPES.includes(u.type)).forEach(u => { u.pickupDiscount = PART_SHIPPING[u.type] ?? PART_PICKUP_DISCOUNT; });

// ------------------------------------------------------------
// TRANE systems: XR14 5TTR4 condenser (R-454B, 14.3 SEER2) with
//   - gas: 5TXC cased coil + S8X1 80% furnace
//   - electric: 5TEM4 convertible air handler + BAYHTR1517BRK 15 kW heat kit
// Specs from Trane product data 22-1998-1B-EN (5TTR4, Nov 2024), COR-PSD003A-EN (5TXC coils, Jun 2025),
// FNR-PSD003A-EN (S8X1 furnaces, Jul 2025) and AHR-PSD006C-EN (5TEM4 air handlers, Mar 2026); photos from trane.com.
// Coil and furnace are the same cabinet width in every system (no adapter needed).
// Prices: set TRANE_GAS_PRICES below (null = "Call for price").
// ------------------------------------------------------------
const TRANE_WARRANTY = "10-year limited parts warranty with registration (confirm with Trane for your install)";
const xr14 = (tons, s) => ({
  role: "Condenser",
  model: s.model,
  image: "img/trane-cond-xr.jpg",
  name: `Trane XR14 ${tons} Ton 14.3 SEER2 Single-Stage AC Condenser (R-454B)`,
  highlights: [
    "14.3 SEER2, single-stage cooling",
    "Climatuff® scroll compressor",
    "All-aluminum Spine Fin™ outdoor coil",
    "Galvanized steel cabinet with powder-paint finish (1,000-hour salt spray tested)",
    "Factory-supplied liquid line drier; low and high pressure switches",
    "Cools in outdoor temps up to 115°F",
  ],
  specs: {
    "Series": "Trane XR14 (5TTR4)",
    "Cooling capacity": `${s.btu} BTU/h (${tons} ton)`,
    "SEER2": "14.3 (AHRI rating depends on the matched indoor unit)",
    "Refrigerant": `R-454B, ${s.charge} factory charge (10 ft of line)`,
    "Compressor": "Climatuff® scroll",
    "Compressor RLA / LRA": s.amps,
    "Outdoor fan": `${s.fanHp} HP, ${s.fanDia}" diameter, ${s.fanFla} FLA`,
    "Outdoor coil": "Spine Fin™ (all aluminum)",
    "Voltage / Phase": "208/230V, 1-phase, 60 Hz",
    "Minimum circuit ampacity (MCA)": `${s.mca} A`,
    "Max breaker (MOCP)": `${s.mocp} A (HACR)`,
    "Suction line": `${s.suction}" OD (valve ${s.valve}")`,
    "Liquid line": "5/16\" OD",
    "Charge spec": "10°F subcooling",
    "Dimensions (H × W × D, crated)": `${s.dims} in`,
    "Weight (shipping / net)": `${s.ship} / ${s.net} lb`,
    "Sound power": `${s.db} dB(A)`,
    "Warranty": TRANE_WARRANTY,
  },
});
const txc = (s) => ({
  role: "Coil",
  model: s.model,
  image: "img/trane-coil-5txc.jpg",
  name: `Trane 5TXC ${s.range} Ton Cased Multi-Position Evaporator Coil, ${s.width}" Wide (R-454B)`,
  highlights: [
    "Multi-position: upflow, downflow or horizontal left/right",
    "Factory-installed non-bleed TXV with internal check valve",
    "Aluminum tube, aluminum plate-fin coil",
    "Vertical and horizontal drain pans, primary + secondary drains",
    `Matches a ${s.width}" furnace with no adapter`,
  ],
  specs: {
    "Cooling capacity": `${s.range} ton`,
    "Cabinet width": `${s.width} in`,
    "Dimensions (H × W × D)": `${s.dims} in`,
    "Weight (shipping / net)": `${s.ship} / ${s.net} lb`,
    "Rows / fins per inch": s.rows,
    "Face area": `${s.face} sq ft`,
    "Coil": "3/8\" aluminum tube, aluminum plate fin",
    "Refrigerant": "R-454B",
    "Metering device": "Non-bleed TXV, factory installed",
    "Air flow direction": "Upflow, downflow, horizontal left/right",
    "Suction line": `${s.suction}" (brazed)`,
    "Liquid line": "3/8\" (brazed)",
    "Drain connections": "3/4\" NPT",
    "Approvals": "AHRI certified",
  },
});
const s8x1 = (s) => ({
  role: "Furnace",
  model: s.model,
  image: "img/trane-furnace-s8x1.jpg",
  kbtu: s.kbtu,
  btuLabel: `${s.kbtu},000`,
  name: `Trane S8X1 80% AFUE ${s.kbtu},000 BTU Single-Stage Multi-Position Gas Furnace, ${s.width}" Wide`,
  highlights: [
    "80% AFUE, single-stage gas valve",
    "9-speed constant-torque ECM blower",
    "4-way multi-position: upflow, downflow, horizontal left/right",
    "34\" tall cabinet fits tight closets and short basements",
    "Aluminized steel tubular heat exchanger, silicon nitride hot surface igniter",
    "Air-Tite™ cabinet (<1% leakage); natural gas or propane (conversion kit)",
  ],
  specs: {
    "Heating input": `${s.kbtu},000 BTU/h`,
    "Heating output": `${s.output} BTU/h`,
    "AFUE": "80%",
    "Heating stages": "1 (single stage)",
    "Cabinet width": `${s.width} in`,
    "Dimensions (H × W × D)": `34 × ${s.width} × 28.75 in`,
    "Weight (shipping / net)": `${s.ship} / ${s.net} lb`,
    "Temperature rise": `${s.rise}°F`,
    "Blower": `${s.hp} HP, 9-speed constant-torque ECM, ${s.wheel} wheel`,
    "Blower full load amps": `${s.fla} A`,
    "Air flow direction": "Upflow, downflow, horizontal left/right",
    "Fuel": "Natural gas or LP (conversion kit)",
    "Gas connection": "1/2\"",
    "Vent": "4\" round (min.)",
    "Ignition": "120V silicon nitride hot surface",
    "Voltage / Phase": "120V, 1-phase, 60 Hz",
    "Ampacity / Max breaker": `${s.amp} A / 15 A`,
    "Filter (not included)": `${s.filter} × 1 in, high velocity`,
    "Warranty": TRANE_WARRANTY,
  },
});
Object.assign(PARTS, {
  "5TTR4018A1000A": xr14(1.5, { model: "5TTR4018A1000A", btu: "18,000", charge: "3 lb 12 oz", amps: "6.9 / 45 A", fanHp: "1/8", fanDia: 23, fanFla: 0.71, mca: 9, mocp: 20, suction: "3/4", valve: "3/4", dims: "42 × 30 × 33", ship: 220, net: 184, db: 73 }),
  "5TTR4024A1000A": xr14(2,   { model: "5TTR4024A1000A", btu: "24,000", charge: "3 lb 10 oz", amps: "10.3 / 60 A", fanHp: "1/8", fanDia: 23, fanFla: 0.71, mca: 14, mocp: 25, suction: "3/4", valve: "3/4", dims: "38 × 30 × 33", ship: 183, net: 156, db: 71 }),
  "5TTR4030A1000A": xr14(2.5, { model: "5TTR4030A1000A", btu: "30,000", charge: "3 lb 8 oz", amps: "12.5 / 67 A", fanHp: "1/8", fanDia: 23, fanFla: 0.64, mca: 15, mocp: 25, suction: "3/4", valve: "3/4", dims: "42 × 30 × 33", ship: 220, net: 184, db: 73 }),
  "5TTR4036A1000A": xr14(3,   { model: "5TTR4036A1000A", btu: "36,000", charge: "3 lb 8 oz", amps: "13.5 / 75 A", fanHp: "1/8", fanDia: 23, fanFla: 0.64, mca: 18, mocp: 30, suction: "7/8", valve: "3/4", dims: "38 × 30 × 33", ship: 183, net: 156, db: 71 }),
  "5TTR4042A1000A": xr14(3.5, { model: "5TTR4042A1000A", btu: "42,000", charge: "5 lb 1 oz", amps: "14.7 / 109 A", fanHp: "1/5", fanDia: 27.5, fanFla: 1.05, mca: 21, mocp: 30, suction: "7/8", valve: "7/8", dims: "42.5 × 35 × 38", ship: 246, net: 212, db: 71 }),
  "5TTR4048A1000A": xr14(4,   { model: "5TTR4048A1000A", btu: "48,000", charge: "6 lb 10 oz", amps: "17.3 / 126 A", fanHp: "1/5", fanDia: 27.5, fanFla: 0.93, mca: 23, mocp: 35, suction: "7/8", valve: "7/8", dims: "50.5 × 35 × 38", ship: 307, net: 257, db: 71 }),
  "5TTR4060A1000A": xr14(5,   { model: "5TTR4060A1000A", btu: "60,000", charge: "5 lb 15 oz", amps: "21.8 / 143 A", fanHp: "1/5", fanDia: 27.5, fanFla: 0.93, mca: 28, mocp: 50, suction: "7/8", valve: "7/8", dims: "50.5 × 35 × 38", ship: 302, net: 252, db: 71 }),
  "5TXCB003AS3HCA": txc({ model: "5TXCB003AS3HCA", range: "1.5–3", width: 17.5, dims: "17.5 × 17.5 × 21.5", ship: 50, net: 42, rows: "3 / 14", face: "3.5", suction: "3/4" }),
  "5TXCB004AS3HCA": txc({ model: "5TXCB004AS3HCA", range: "2–3.5", width: 17.5, dims: "22.5 × 17.5 × 21.5", ship: 58, net: 50, rows: "3 / 12", face: "5.0", suction: "7/8" }),
  "5TXCB006AS3HCA": txc({ model: "5TXCB006AS3HCA", range: "2–5", width: 17.5, dims: "26.75 × 17.5 × 21.5", ship: 63, net: 55, rows: "3 / 14", face: "6.0", suction: "7/8" }),
  "5TXCC007AS3HCA": txc({ model: "5TXCC007AS3HCA", range: "3–5", width: 21, dims: "26.75 × 21 × 21.5", ship: 69, net: 61, rows: "3 / 14", face: "6.0", suction: "7/8" }),
  "5TXCC009AS3HCA": txc({ model: "5TXCC009AS3HCA", range: "3–5", width: 21, dims: "30.75 × 21 × 21.5", ship: 78, net: 70, rows: "3 / 16", face: "7.0", suction: "7/8" }),
  "S8X1B040M2PSC": s8x1({ model: "S8X1B040M2PSC", kbtu: 40, output: "32,500", width: 17.5, ship: 128, net: 120, rise: "30–60", hp: "1/3", wheel: "11\" × 8\"", fla: 4.1, amp: 5.6, filter: "16 × 25" }),
  "S8X1B060M4PSC": s8x1({ model: "S8X1B060M4PSC", kbtu: 60, output: "48,700", width: 17.5, ship: 128, net: 120, rise: "30–60", hp: "3/4", wheel: "11\" × 8\"", fla: 9.2, amp: 13.1, filter: "16 × 25" }),
  "S8X1B080M4PSC": s8x1({ model: "S8X1B080M4PSC", kbtu: 80, output: "65,100", width: 17.5, ship: 137, net: 129, rise: "30–60", hp: "3/4", wheel: "11\" × 8\"", fla: 9.2, amp: 13.1, filter: "16 × 25" }),
  "S8X1C100M5PSC": s8x1({ model: "S8X1C100M5PSC", kbtu: 100, output: "80,700", width: 21, ship: 144, net: 136, rise: "30–60", hp: "1", wheel: "11\" × 11\"", fla: 10.9, amp: 14.4, filter: "20 × 25" }),
});

// Price per complete system (condenser + coil + furnace): the 5-ton price, then TRANE_STEP less for each size down.
const TRANE_5T_PRICE = 4850;
const TRANE_STEP = 160;
const TRANE_SIZES = [5, 4, 3.5, 3, 2.5, 2, 1.5];
const TRANE_GAS_PRICES = Object.fromEntries(TRANE_SIZES.map((t, i) => [t, TRANE_5T_PRICE - i * TRANE_STEP]));
const traneGasSystem = (tons, [condenser, coil, furnace]) => ({
  id: `trane-${tons}t-gas-${condenser.toLowerCase()}`,
  brand: "Trane",
  name: `${tons}-Ton XR14 Gas AC System`,
  type: "Gas AC System",
  tons,
  seer2: 14.3,
  seer2Exact: true,
  afue: 80,
  refrigerant: "R-454B",
  voltage: "208/230V condenser · 120V furnace",
  price: TRANE_GAS_PRICES[tons],
  msrp: null,
  inStock: null,
  image: "img/bundle-trane-gas.jpg",
  components: [PARTS[condenser], PARTS[coil]],
  optionTitle: "Furnace size",
  heatOptions: [furnaceOption(furnace, 0)],
});
const TRANE_GAS = [
  //              tons  [XR14 condenser,   5TXC coil,         S8X1 furnace]
  traneGasSystem(1.5, ["5TTR4018A1000A", "5TXCB003AS3HCA", "S8X1B040M2PSC"]),
  traneGasSystem(2,   ["5TTR4024A1000A", "5TXCB003AS3HCA", "S8X1B060M4PSC"]),
  traneGasSystem(2.5, ["5TTR4030A1000A", "5TXCB004AS3HCA", "S8X1B060M4PSC"]),
  traneGasSystem(3,   ["5TTR4036A1000A", "5TXCB004AS3HCA", "S8X1B080M4PSC"]),
  traneGasSystem(3.5, ["5TTR4042A1000A", "5TXCB006AS3HCA", "S8X1B080M4PSC"]),   // same coil + furnace as the unit in storage
  traneGasSystem(4,   ["5TTR4048A1000A", "5TXCC007AS3HCA", "S8X1C100M5PSC"]),
  traneGasSystem(5,   ["5TTR4060A1000A", "5TXCC009AS3HCA", "S8X1C100M5PSC"]),
];

// Trane 5TEM4 convertible air handlers (R-454B). Heat kits install inside (sold with the system).
const tem4 = (s) => ({
  role: "Air Handler",
  model: s.model,
  image: "img/trane-ah-tem4.jpg",
  name: `Trane 5TEM4 ${s.range} Ton Multi-Speed Convertible Air Handler, ${s.width}" Wide (R-454B)`,
  highlights: [
    "4-way multi-position: upflow, downflow, horizontal left/right",
    "Constant-torque ECM blower motor",
    "All-aluminum plate-fin coil with factory R-454B TXV",
    "Galvanized cabinet, foil-faced insulation (R-4.2), 2% or less air leakage",
    "Plug-in electric heat kits (polarized connector)",
    "Comfort-R™ humidity control (slower blower at start-up)",
  ],
  specs: {
    "Rated capacity": `${s.capacity} BTU/h (${s.range} ton)`,
    "Nominal airflow": `${s.cfm} CFM`,
    "Cabinet width": `${s.width} in`,
    "Dimensions (H × W × D)": `${s.dims} in`,
    "Weight (shipping / net)": `${s.ship} / ${s.net} lb`,
    "Coil": "All-aluminum plate fin",
    "Refrigerant": "R-454B",
    "Metering device": "TXV, factory installed",
    "Blower": `Direct-drive centrifugal, 11" × 8" wheel, constant-torque ECM`,
    "Blower full load amps": `${s.fla} A`,
    "Voltage / Phase": "208/230V, 1-phase, 60 Hz",
    "Max breaker, no heat / with heat": "15 A / 60 A",
    "Suction line": `${s.suction}" (brazed)`,
    "Liquid line": "3/8\" (brazed)",
    "Supply / return opening": `${s.supply} / ${s.ret} in`,
    "Drain connection": "3/4\" NPT",
    "Filter": "Field supplied (no internal filter rack)",
    "Warranty": "5-year parts limited warranty (extended available with registration)",
  },
});
const bayhtr = (s) => ({
  role: "Heat Kit",
  model: s.model,
  kw: s.kw,
  image: null,
  name: `Trane ${s.kw} kW Electric Heat Kit with Circuit Breakers (${s.model})`,
  highlights: [`${s.rated} kW at 240V (${s.btu} BTU/h)`, "Built-in circuit breakers (service disconnect)", "Plug-in connection to 5TEM4 air handlers"],
  specs: {
    "Heating capacity": `${s.rated} kW / ${s.btu} BTU/h at 240V; ${s.rated208} kW at 208V`,
    "Circuits": s.circuits,
    "Disconnect": "Circuit breakers",
    "Voltage / Phase": "208/240V, 1-phase",
    "Fits": s.fits || "Trane 5TEM4 / TEM air handlers, 18.5\" and 23.5\" cabinets",
  },
});
Object.assign(PARTS, {
  "5TEM4B03AC31SA": tem4({ model: "5TEM4B03AC31SA", range: "1.5–2.5", capacity: "18,000–30,000", cfm: 800, width: 18.5, dims: "46.75 × 18.5 × 21.1", ship: 126, net: 117, fla: 3.9, suction: "3/4", supply: "12.15 × 16.5", ret: "18.75 × 16.75" }),
  "5TEM4B04AC31SA": tem4({ model: "5TEM4B04AC31SA", range: "2–3", capacity: "24,000–36,000", cfm: 1200, width: 18.5, dims: "51.75 × 18.5 × 21.1", ship: 138, net: 132, fla: 3.9, suction: "7/8", supply: "12.15 × 16.5", ret: "18.75 × 16.75" }),
  "5TEM4D05AC41SA": tem4({ model: "5TEM4D05AC41SA", range: "3–4", capacity: "36,000–48,000", cfm: 1400, width: 23.5, dims: "51.4 × 23.5 × 21.1", ship: 145, net: 138, fla: 3.9, suction: "7/8", supply: "12.15 × 21.5", ret: "18.75 × 21.75" }),
  "5TEM4D06AC41SA": tem4({ model: "5TEM4D06AC41SA", range: "3–4", capacity: "36,000–48,000", cfm: 1600, width: 23.5, dims: "51.4 × 23.5 × 21.1", ship: 155, net: 144, fla: 6.0, suction: "7/8", supply: "12.15 × 21.5", ret: "18.75 × 21.75" }),
  "5TEM4D07AC51SA": tem4({ model: "5TEM4D07AC51SA", range: "3.5–5", capacity: "42,000–60,000", cfm: 2000, width: 23.5, dims: "57.4 × 23.5 × 21.1", ship: 185, net: 174, fla: 6.0, suction: "7/8", supply: "12.15 × 21.5", ret: "18.75 × 21.75" }),
  BAYHTR1510BRK: bayhtr({ model: "BAYHTR1510BRK", kw: 10, rated: "9.6", rated208: "7.2", btu: "32,800", circuits: "1" }),
  BAYHTR1517BRK: bayhtr({ model: "BAYHTR1517BRK", kw: 15, rated: "14.4", rated208: "10.8", btu: "49,100", circuits: "2 (9.6 kW + 4.8 kW); single-point kit BAYSPEKT201A available" }),
  BAYHTR1523BRK: bayhtr({ model: "BAYHTR1523BRK", kw: 20, rated: "19.2", rated208: "14.4", btu: "65,600", circuits: "2 (9.6 kW + 9.6 kW); single-point kit BAYSPEKT201A available", fits: "Trane 5TEM4 B04 and D cabinets (3 ton and up)" }),
});

// Trane electric systems: XR14 condenser + 5TEM4 air handler. Heat kit is an optional add-on at the same
// prices as the Carrier air handler add-ons (TRANE_KIT_ADDON). Trane is sold as bundles only (no single parts).
// 1.5–2.5 ton use the 5TEM4B03 (rated 18–30k; takes 10 or 15 kW, not 20). 3 ton and up take 10, 15 or 20 kW.
// Price (without heat kit): the gas system of the same size + TRANE_ELECTRIC_PREMIUM.
const TRANE_ELECTRIC_PREMIUM = 50;
const TRANE_ELECTRIC_PRICES = Object.fromEntries(TRANE_SIZES.map(t => [t, TRANE_GAS_PRICES[t] + TRANE_ELECTRIC_PREMIUM]));
const TRANE_KIT_ADDON = { BAYHTR1510BRK: 150, BAYHTR1517BRK: 180, BAYHTR1523BRK: 280 };
const traneKitOptions = kits => [
  { model: "none", add: 0, part: null, label: "No heat kit", desc: "no heat kit", spec: "None (cooling only)" },
  ...kits.map(m => ({ model: m, add: TRANE_KIT_ADDON[m], part: PARTS[m], label: `+ ${PARTS[m].kw} kW`, desc: `${PARTS[m].kw} kW heat kit`, spec: `${PARTS[m].kw} kW electric (${m})` })),
];
const traneElectricSystem = (tons, [condenser, airHandler], kits) => ({
  id: `trane-${tons}t-electric-${condenser.toLowerCase()}`,
  brand: "Trane",
  name: `${tons}-Ton XR14 Electric AC System`,
  type: "Electric AC System",
  tons,
  seer2: 14.3,
  seer2Exact: true,
  refrigerant: "R-454B",
  voltage: "208/230V 1-ph",
  price: TRANE_ELECTRIC_PRICES[tons],
  msrp: null,
  inStock: null,
  image: "img/bundle-trane-electric.jpg",
  components: [PARTS[condenser], PARTS[airHandler]],
  optionTitle: "Add a heat kit (optional)",
  heatNote: `Heat kit optional · add ${kits.map(m => PARTS[m].kw).join(", ").replace(/, (?=[^,]*$)/, " or ")} kW`,
  heatOptions: traneKitOptions(kits),
});
const KITS_SMALL = ["BAYHTR1510BRK", "BAYHTR1517BRK"];                    // 5TEM4B03 cabinet
const KITS_ALL = ["BAYHTR1510BRK", "BAYHTR1517BRK", "BAYHTR1523BRK"];     // 5TEM4B04 and D cabinets
const TRANE_ELECTRIC = [
  //                   tons  [XR14 condenser,   5TEM4 air handler]   heat kits offered
  traneElectricSystem(1.5, ["5TTR4018A1000A", "5TEM4B03AC31SA"], KITS_SMALL),
  traneElectricSystem(2,   ["5TTR4024A1000A", "5TEM4B03AC31SA"], KITS_SMALL),
  traneElectricSystem(2.5, ["5TTR4030A1000A", "5TEM4B03AC31SA"], KITS_SMALL),
  traneElectricSystem(3,   ["5TTR4036A1000A", "5TEM4B04AC31SA"], KITS_ALL),
  traneElectricSystem(3.5, ["5TTR4042A1000A", "5TEM4D05AC41SA"], KITS_ALL),
  traneElectricSystem(4,   ["5TTR4048A1000A", "5TEM4D06AC41SA"], KITS_ALL),
  traneElectricSystem(5,   ["5TTR4060A1000A", "5TEM4D07AC51SA"], KITS_ALL),   // your 5-ton: 5TEM4D07AC51S (+ BAYHTR1517 15 kW)
];

// ------------------------------------------------------------
// COMMERCIAL packaged rooftop units (Carrier + Bryant), from commercial-data.js
// (generated by commercial/build_commercial.py from the Carrier Enterprise export).
// Site price = CE cost + commission + LTL freight estimate by operating weight. No sales tax in the
// price (tax goes on the invoice). Local DFW pickup takes the freight back off (capped at $900).
// ------------------------------------------------------------
const COMMERCIAL_COMMISSION = 1500;
// [max operating weight (lb), freight $]. Checked Sept 24, 2026 with R+L guest (list) quotes, Dallas -> Tampa,
// business delivery, converted to real broker rates with R+L's own discount (Freightquote R+L price $632 vs
// R+L list $2,936 for the same pallet = ~21.5% of list):
//   5-ton RTU, 600 lb, 75x47x38, class 125:  list $3,018 -> ~$650
//   20-ton RTU, 1,950 lb, 142x87x54, class 175: list $8,114 -> ~$1,750 + over-10-ft fee ($150–300) -> ~$2,000
// Get a real quote on big units before booking (oversize units can need special handling).
const COMMERCIAL_FREIGHT = [
  [600, 650],                     // 3–6 ton
  [900, 900],                     // 6–10 ton
  [1500, 1500],                   // 7.5–15 ton
  [2200, 2200],                   // 20–25 ton, ~86 x 141 in (over 10 ft)
  [Infinity, 3400],               // 25 ton, 3,199 lb, ~88 x 165 in
];
const COMMERCIAL_FREIGHT_BY_TONS = t => t >= 20 ? 2200 : t >= 12.5 ? 1500 : t >= 7.5 ? 900 : 650;   // when CE has no weight
const commercialFreight = u => u.weight ? COMMERCIAL_FREIGHT.find(([max]) => u.weight <= max)[1] : COMMERCIAL_FREIGHT_BY_TONS(u.tons);
const COMMERCIAL_HIGHLIGHTS = {
  gas: "Natural gas heat with electric cooling in one rooftop cabinet",
  hp: "All-electric heat pump heating and cooling in one rooftop cabinet",
  cool: "Electric cooling; add a field-installed electric heat kit if needed",
};
const COMMERCIAL = (window.COMMERCIAL_DATA || []).map(d => {
  const freight = commercialFreight(d);
  const [eff] = d.eff;
  return {
    id: `rtu-${d.model.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    brand: d.brand,
    commercial: true,
    name: d.name + (d.heat ? `, ${d.heat} BTU Gas Heat` : ""),
    type: d.type,
    tons: d.tons,
    refrigerant: d.refrigerant || null,
    voltage: d.voltage,
    chips: [eff && `${eff[1]} ${eff[0]}`, d.voltage, d.heat && `${d.heat} BTU heat`],
    keySpecsExtra: [["Series", d.series], ...d.eff.map(([k, v]) => [k, String(v)]), ["Gas heat input", d.heat && d.heat + " BTU/h"], ["Weight", d.weight && d.weight.toLocaleString() + " lb"]].filter(([, v]) => v),
    cost: d.cost == null ? null : Math.round(d.cost),
    freight,
    price: d.cost == null ? null : Math.round(d.cost) + COMMERCIAL_COMMISSION + freight,
    pickupDiscount: freight,                 // DFW pickup takes the whole freight estimate off (owner decision Sept 24)
    unit: "unit",
    inStock: null,
    image: d.image,
    components: [{
      role: "Packaged Unit",
      model: d.model,
      image: d.image,
      name: `${d.brand} ${d.name}${d.heat ? ` (${d.heat} BTU/h gas input)` : ""}, ${d.voltage}`,
      highlights: [
        COMMERCIAL_HIGHLIGHTS[d.kind],
        `${d.series ? d.series + " series, " : ""}${d.refrigerant || ""} refrigerant`,
        `Ships LTL freight${d.weight ? ` (${d.weight.toLocaleString()} lb unit)` : ""}; crane or forklift needed to set on the roof`,
        "Curbs, economizers and accessories quoted separately",
      ],
      specs: d.specs,
    }],
  };
});

// FREIGHT UPDATE (Sept 24, 2026): real LTL quotes came in ~$300 above what was built into system prices,
// so every home system (not parts, not commercial) goes up SYSTEM_FREIGHT_INCREASE. DFW pickup price is unchanged
// because SHIPPING.pickupDiscount went up by the same amount.
const SYSTEM_FREIGHT_INCREASE = 300;
[...ELECTRIC, ...TRANE_ELECTRIC, ...GAS, ...TRANE_GAS, ...HEAT_PUMPS, ...GOODMAN, ...GOODMAN_HEAT_PUMPS, ...GOODMAN_GAS]
  .forEach(u => { if (u.price != null) u.price += SYSTEM_FREIGHT_INCREASE; });

// FREIGHT INSURANCE (Sept 24, 2026): cargo insurance on each LTL shipment (~$30–60). Added to every unit that
// ships by truck; the DFW pickup discount goes up by the same amount so pickup prices don't change.
// Heat kits sold on their own are left out (small, cheap to ship).
const SHIPPING_INSURANCE = 50;
window.SHIPPING.pickupDiscount += SHIPPING_INSURANCE;
[...ELECTRIC, ...TRANE_ELECTRIC, ...GAS, ...TRANE_GAS, ...HEAT_PUMPS, ...GOODMAN, ...GOODMAN_HEAT_PUMPS, ...GOODMAN_GAS, ...PART_ITEMS, ...COMMERCIAL]
  .filter(u => u.price != null && u.type !== "Heat Kit")
  .forEach(u => {
    u.price += SHIPPING_INSURANCE;
    if (u.pickupDiscount != null) u.pickupDiscount += SHIPPING_INSURANCE;   // parts + commercial carry their own
  });

// FINAL PRICE OVERRIDES: exact site price for a specific item (after freight + insurance).
// Heat kit / furnace add-ons still add on top. Pickup still takes its discount off this price.
const FINAL_PRICES = {
  // (empty) e.g. "trane-5t-electric-5ttr4060a1000a": 4950,
  // Goodman gas (owner-set Sept 24, 2026; 1.5-ton stays at its formula price)
  "goodman-5t-gas-glxs4ba6010": 4550,
  "goodman-4t-gas-glxs4ba4810": 4350,
  "goodman-3.5t-gas-glxs4ba4210": 4100,
  "goodman-3t-gas-glxs4ba3610": 3950,
  "goodman-2.5t-gas-glxs4ba3010": 3850,
  "goodman-2t-gas-glxs4ba2410": 3750,
};
[...TRANE_ELECTRIC, ...TRANE_GAS, ...ELECTRIC, ...GAS, ...HEAT_PUMPS, ...GOODMAN, ...GOODMAN_HEAT_PUMPS, ...GOODMAN_GAS, ...PART_ITEMS, ...COMMERCIAL]
  .forEach(u => { if (FINAL_PRICES[u.id] != null) u.price = FINAL_PRICES[u.id]; });

// ------------------------------------------------------------
// PAYNE split systems (sourced through Sibi Pro, Robert Madden Industries McKinney).
// Site price = Sibi cost of every component + PAYNE_SHIPPING (same freight + insurance built into the other
// brands' systems, so DFW pickup takes it back off) + PAYNE_MARGIN. Costs pulled Sept 28, 2026
// (full list, private: sibi/payne-sibi.json). Heat kits: the same KFFEH kits as the Carrier systems.
// ------------------------------------------------------------
// Sibi handles the shipping on Payne, so Payne carries $500 less built-in freight than the other brands
// (owner decision Sept 28, 2026). DFW pickup takes only this amount off (pickupDiscount below).
const PAYNE_SHIPPING = 150;
const PAYNE_MARGIN = 800;
const PAYNE_IMG = "img/payne-system.svg";   // placeholder until Payne product photos are added
const payneCondenser = (tons, model, cost, hp) => ({
  role: hp ? "Heat Pump" : "Condenser", model, cost, image: PAYNE_IMG,
  name: `Payne ${tons} Ton 14.3 SEER2 ${hp ? "Heat Pump" : "Air Conditioner"} Condensing Unit (R-454B)`,
  highlights: ["14.3 SEER2 (rating depends on the matched indoor unit)", "R-454B refrigerant (low GWP)", "Not compatible with R-410A coils or air handlers", hp ? "Heats and cools" : "Cooling only"],
  specs: { "Cooling capacity": `${tons} ton`, "SEER2": "14.3", "Refrigerant": "R-454B", "Voltage / Phase": "208/230V, 1-phase" },
});
const payneAirHandler = (tons, model, cost, width) => ({
  role: "Air Handler", model, cost, image: PAYNE_IMG,
  name: `Payne ${tons} Ton Multi-Position Air Handler, ${width}" Wide (R-454B)`,
  highlights: ["Multi-position: upflow, downflow or horizontal", "R-454B refrigerant", `${width}" cabinet width`],
  specs: { "Capacity": `${tons} ton`, "Width": `${width}"`, "Configuration": "Multi-position", "Refrigerant": "R-454B" },
});
const payneCoil = (tons, model, cost, width, kind) => ({
  role: "Coil", model, cost, image: "img/coil-cvava.jpg",
  name: `${tons} Ton Multi-Position Cased ${kind}-Coil, ${width}" Wide (R-454B)`,
  highlights: ["Cased, multi-position", "R-454B refrigerant", `${width}" wide`], width,
  specs: { "Capacity": `${tons} ton`, "Width": `${width}"`, "Type": `Cased ${kind}-coil`, "Refrigerant": "R-454B" },
});
const payneFurnace = (model, cost, kbtu, cfm, width) => ({
  role: "Furnace", model, cost, kbtu, btuLabel: `${kbtu},000`, width, image: PAYNE_IMG,
  name: `Payne 80% AFUE ${kbtu},000 BTU Single-Stage Gas Furnace, ${cfm} CFM, ${width}" Wide`,
  highlights: ["80% AFUE", `${kbtu},000 BTU/h input`, `${cfm} CFM blower`, "Single-stage"],
  specs: { "AFUE": "80%", "Heating input": `${kbtu},000 BTU/h`, "Airflow": `${cfm} CFM`, "Width": `${width}"`, "Stages": "Single" },
});
const KIT_COST = { KFFEH8601C10: 166, KFFEH2601C10: 157, KFFEH3101C15: 240 };
const KFFEH8601C10 = { ...kffeh(10, { model: "KFFEH8601C10", elements: 2, amps: "", weight: "", fits: "1.5 ton" }) };
const payneHeatOptions = (tons, hp) => {
  const opts = tons <= 1.5 ? [{ model: "KFFEH8601C10", add: 0, part: KFFEH8601C10 }]
    : (tons <= 2.5 ? HEAT_10_STANDARD : HEAT_15_STANDARD).map(o => ({ ...o, part: PARTS[o.model] }));
  return opts.map(o => ({ ...o, label: `${o.part.kw} kW`, desc: `${o.part.kw} kW heat`, spec: `${o.part.kw} kW electric${hp ? " backup" : ""}` }));
};
const payneStdKitCost = tons => tons <= 1.5 ? KIT_COST.KFFEH8601C10 : tons <= 2.5 ? KIT_COST.KFFEH2601C10 : KIT_COST.KFFEH3101C15;
const paynePrice = parts => parts.reduce((s, p) => s + p.cost, 0) + PAYNE_SHIPPING + PAYNE_MARGIN;
const PAYNE_AH = {
  1.5: payneAirHandler(1.5, "PF5MNXA18L00", 653, 14.5), 2: payneAirHandler(2, "PF5MNXB24L00", 653, 17.5), 2.5: payneAirHandler(2.5, "PF5MNXB30L00", 687, 17.5),
  3: payneAirHandler(3, "PF5MNXB36L00", 714, 17.5), 3.5: payneAirHandler(3.5, "PF5MNXC42L00", 741, 21), 4: payneAirHandler(4, "PF5MNXC48L00", 809, 21), 5: payneAirHandler(5, "PF5MNXD60L00", 809, 24.5),
};
const PAYNE_AC = {
  1.5: payneCondenser(1.5, "PA5SAN51800W", 952), 2: payneCondenser(2, "PA5SAN52400W", 952), 2.5: payneCondenser(2.5, "PA5SAN53000W", 975),
  3: payneCondenser(3, "PA5SAN53602W", 1062), 3.5: payneCondenser(3.5, "PA5SAN54201W", 1336), 4: payneCondenser(4, "PA5SAN54801W", 1392), 5: payneCondenser(5, "PA5SAN56000W", 1606),
};
const PAYNE_HP = {
  1.5: payneCondenser(1.5, "PH5SAN51800A", 1137, true), 2: payneCondenser(2, "PH5SAN52400A", 1174, true), 2.5: payneCondenser(2.5, "PH5SAN53000A", 1324, true),
  3: payneCondenser(3, "PH5SAN53600A", 1533, true), 3.5: payneCondenser(3.5, "PH5SAN54200A", 1685, true), 4: payneCondenser(4, "PH5SAN54801A", 1687, true), 5: payneCondenser(5, "PH5SAN56000A", 2053, true),
};
const PAYNE_GAS_PARTS = {   // coil + furnace per size (in stock at Sibi McKinney, widths matched)
  1.5: [payneCoil(1.5, "CAAMP1814AMA", 341, 14, "A"), payneFurnace("PG80MSAA36045A", 616, 45, 1200, 14.2)],
  2:   [payneCoil(2, "CAAMP2414AMA", 387, 14, "A"),   payneFurnace("PG80MSAA36045A", 616, 45, 1200, 14.2)],
  2.5: [payneCoil(2.5, "CAAMP3014AMA", 406, 14, "A"), payneFurnace("PG80MSAA36045A", 616, 45, 1200, 14.2)],
  3:   [payneCoil(3, "CAAMP3617AMA", 437, 17.5, "A"), payneFurnace("PG80MSAA42045B", 622, 45, 1400, 17.5)],
  3.5: [payneCoil(3.5, "CVAMA4221XMA", 386, 21, "V"), payneFurnace("PG80MSAA48070C", 652, 70, 1600, 21)],
  4:   [payneCoil(4, "CAAMP4821AMA", 501, 21, "A"),   payneFurnace("PG80MSAA48090C", 636, 90, 1600, 21)],
  5:   [payneCoil(5, "CVAMA6021XMA", 589, 21, "V"),   payneFurnace("PG80MSAA60090C", 644, 90, 2000, 21)],
};
const PAYNE_TONS = [1.5, 2, 2.5, 3, 3.5, 4, 5];
const payneBase = (tons, type, kind) => ({
  brand: "Payne", tons, type, seer2: 14.3, refrigerant: "R-454B", msrp: null, inStock: null, image: PAYNE_IMG,
  pickupDiscount: PAYNE_SHIPPING,
  id: `payne-${tons}t-${kind}`,
});
const PAYNE_ELECTRIC = PAYNE_TONS.map(t => ({
  ...payneBase(t, "Electric AC System", "electric"),
  name: `${t}-Ton Electric AC System`, voltage: "208/230V 1-ph",
  price: paynePrice([PAYNE_AC[t], PAYNE_AH[t], { cost: payneStdKitCost(t) }]),
  components: [PAYNE_AC[t], PAYNE_AH[t]],
  optionTitle: "Electric heat kit", heatOptions: payneHeatOptions(t, false),
}));
const PAYNE_HEAT_PUMPS = PAYNE_TONS.map(t => ({
  ...payneBase(t, "Heat Pump System", "heatpump"),
  name: `${t}-Ton Heat Pump System`, voltage: "208/230V 1-ph",
  price: paynePrice([PAYNE_HP[t], PAYNE_AH[t], { cost: payneStdKitCost(t) }]),
  components: [PAYNE_HP[t], PAYNE_AH[t]],
  optionTitle: "Backup (auxiliary) heat kit", heatOptions: payneHeatOptions(t, true),
}));
const PAYNE_GAS = PAYNE_TONS.map(t => {
  const [coil, furnace] = PAYNE_GAS_PARTS[t];
  return {
    ...payneBase(t, "Gas AC System", "gas"),
    name: `${t}-Ton Gas AC System`, afue: 80, voltage: "208/230V condenser · 115V furnace",
    price: paynePrice([PAYNE_AC[t], coil, furnace]),
    components: [PAYNE_AC[t], coil],
    optionTitle: "Furnace size",
    heatOptions: [{ model: furnace.model, add: 0, part: furnace, label: `${furnace.kbtu}k BTU`, desc: `${furnace.kbtu}k BTU furnace`, spec: `${furnace.btuLabel} BTU gas · 80% AFUE` }],
  };
});

window.INVENTORY = [...ELECTRIC, ...TRANE_ELECTRIC, ...GAS, ...TRANE_GAS, ...GOODMAN_GAS, ...HEAT_PUMPS, ...GOODMAN, ...GOODMAN_HEAT_PUMPS, ...PAYNE_ELECTRIC, ...PAYNE_GAS, ...PAYNE_HEAT_PUMPS, ...PART_ITEMS, ...COMMERCIAL];


// ============================================================
//  INSTALLATION QUOTES (the "Get an installed price" tool)
//  Installed estimate = equipment price + job price for the area + add-ons.
//  Area tier comes from the job's state: "high", "mid", or "standard" (everything else).
// ============================================================
window.INSTALL = {
  jobs: [
    { key: "changeout", label: "Full system change-out (indoor + outdoor)", equip: "system",  price: { standard: 3800, mid: 4050, high: 4300 } },   // +$300 covers Klarna's higher fee vs cards (same price for everyone)
    { key: "outdoor",   label: "Outdoor unit swap only (AC or heat pump)",  equip: "outdoor", price: { standard: 1800, mid: 2000, high: 2200 } },
    { key: "new",       label: "New install (no existing system or ductwork)", equip: "system", custom: true },
  ],
  tiers: {
    high: ["AK", "CA", "CT", "DC", "HI", "MA", "NJ", "NY", "OR", "WA"],
    mid:  ["AZ", "CO", "DE", "FL", "IL", "MD", "MN", "NH", "NV", "PA", "RI", "VA", "VT"],
  },
  laborWarrantyYears: 1,
  // Card / bank buyers pay this share of the installed package at checkout, the rest after the install.
  cardDeposit: 0.75,
  // Shown as "What's included" with every installed estimate. gasOnly lines show for gas furnace systems.
  included: [
    { text: "New drain pan with a flood (float) sensor" },
    { text: "New gas flex connector for the furnace hookup", gasOnly: true },
    { text: "Electric heat kit for the air handler, sized for your system", airHandlerOnly: true },
    { text: "Plenum connections resealed with tape and mastic" },
    { text: "New electrical disconnect box and disconnect whip" },
    { text: "New outdoor condenser pad" },
    { text: "1-year labor warranty, plus the manufacturer's parts warranty" },
  ],
  addons: [
    { key: "plenums",    label: "New supply & return plenums", price: 850 },
    { key: "lineset",    label: "New refrigerant line set",    price: 650 },
    { key: "thermostat", label: "New smart thermostat",        price: 250 },
  ],
  // "Typical local installed price" shown next to each estimate (same area tiers as above).
  // Ranges are for a 3-ton full change-out and scale by size (perTon). Source: 2026 published cost guides
  // (hvacreviewhub.org 3-ton AC + furnace: national $6,500-$14,500, Northeast/West Coast $8,500-$16,500,
  // Midwest/South $6,000-$12,000; Angi and hvacprojectcost.com New York pages agree). Update if you find better data.
  compare: {
    ranges: { standard: [6000, 12000], mid: [6500, 14500], high: [8500, 16500] },
    perTon: 0.08,
    source: "2026 published HVAC cost guides",
  },
  // "Not sure what size?" helper: home square footage -> tons (rule of thumb, confirmed before install)
  sizeBySqft: [[1000, 1.5], [1300, 2], [1600, 2.5], [1900, 3], [2200, 3.5], [2600, 4], [Infinity, 5]],
};