// ============================================================
//  English / Español switch.
//  - DICT: exact English text -> Spanish
//  - RULES: patterns for text with numbers (product names, prices, sizes)
//  - PHRASES: word/phrase swaps for spec values that mix numbers and words
//  Model numbers and prices are never changed. Order messages sent to the
//  owner stay in English (with a note that the customer prefers Spanish).
// ============================================================
(function () {
  const DICT = {
    // ---- Top bars, header, navigation
    "WHOLESALE": "MAYOREO",
    "Buying in volume or using your own freight carrier?": "¿Compra en volumen o usa su propio transportista?",
    "Get wholesale pricing, well below our listed prices.": "Obtenga precios de mayoreo, muy por debajo de los precios publicados.",
    "Get wholesale pricing →": "Precios de mayoreo →",
    "Preview: business name, phone and email are placeholders. Update them in": "Vista previa: el nombre, teléfono y correo son de ejemplo. Actualícelos en",
    "Free nationwide shipping": "Envío gratis a todo el país",
    "off local pickup (DFW)": "de descuento al recoger en DFW",
    "Ships in": "Se envía en",
    "3–5 business days": "3–5 días hábiles",
    "Shipping & Pickup": "Envío y recogida",
    "FAQ": "Preguntas",
    "Contact": "Contacto",
    "HEATING & COOLING EQUIPMENT": "EQUIPO DE CALEFACCIÓN Y AIRE",
    "Contractor Pricing": "Precios para contratistas",
    "Call us": "Llámenos",
    "Order": "Pedido",
    "All Equipment": "Todo el equipo",
    "Electric & AC Systems": "Sistemas eléctricos y de A/C",
    "Gas Systems": "Sistemas a gas",
    "Heat Pumps": "Bombas de calor",
    "Condensers": "Condensadoras",
    "Air Handlers": "Manejadoras de aire",
    "Furnaces": "Hornos",
    "Coils": "Serpentines",
    "Heat Kits": "Kits de calefacción",
    "Home /": "Inicio /",
    "Residential Equipment": "Equipo residencial",
    "Carrier, Trane, Goodman and Bryant equipment with free nationwide shipping, or pick up in DFW and save $650 per system.":
      "Equipo Carrier, Trane, Goodman y Bryant con envío gratis a todo el país, o recójalo en DFW y ahorre $650 por sistema.",
    "Built into every price. Curbside LTL.": "Incluido en cada precio. Entrega en la acera (LTL).",
    "Save $": "Ahorre $",
    "per system": "por sistema",
    "With local pickup in": "Recogiendo en",
    "Dallas–Fort Worth": "Dallas–Fort Worth",
    "New R-454B & R-32 equipment": "Equipo nuevo R-454B y R-32",
    "Carrier, Trane, Goodman & Bryant · full specs on every product": "Carrier, Trane, Goodman y Bryant · especificaciones completas",

    // ---- Home: showcase, offers, featured, categories, pro, brands
    "TOP BRANDS · NEW EQUIPMENT": "MARCAS LÍDERES · EQUIPO NUEVO",
    "Carrier, Trane & Goodman systems, shipped free nationwide": "Sistemas Carrier, Trane y Goodman, con envío gratis a todo el país",
    "Complete electric, gas and heat pump systems from 1.5 to 5 ton, plus individual parts. Full specs on every unit, priced below supply houses.":
      "Sistemas completos eléctricos, a gas y de bomba de calor de 1.5 a 5 toneladas, además de piezas individuales. Especificaciones completas y precios por debajo de las casas de suministro.",
    "Shop systems": "Ver sistemas",
    "Get contractor pricing": "Precios para contratistas",
    "Shop Carrier →": "Ver Carrier →",
    "Shop Goodman →": "Ver Goodman →",
    "Off every system with DFW pickup": "De descuento en cada sistema al recoger en DFW",
    "Order online, pick up in": "Pida en línea, recoja en",
    ", pay cash if you like.": ", pague en efectivo si prefiere.",
    "PRO": "PRO",
    "Contractors: trade accounts": "Contratistas: cuentas comerciales",
    "Open a trade account": "Abrir una cuenta comercial",
    "Trade accounts": "Cuentas comerciales",
    "TRADE ACCOUNT": "CUENTA COMERCIAL",
    "Monthly payments": "Pagos mensuales",
    "Pay over time with Klarna at checkout, subject to approval.": "Pague a plazos con Klarna al pagar, sujeto a aprobación.",
    "Save $": "Ahorre $", " with DFW pickup": " al recoger en DFW",
    "Account pricing on every system and part": "Precios de cuenta en cada sistema y pieza",
    "For HVAC contractors and businesses. No license required. Apply below and we'll call you to set up your account.":
      "Para contratistas y negocios de HVAC. No se requiere licencia. Solicítela abajo y le llamaremos para abrir su cuenta.",
    "We'll contact you to activate your account. Approved accounts sign in here to see their pricing.":
      "Le contactaremos para activar su cuenta. Las cuentas aprobadas inician sesión aquí para ver sus precios.",
    "Homeowner? You don't need an account; just order online. Near DFW and want a quote? ":
      "¿Dueño de casa? No necesita cuenta; pida en línea. ¿Cerca de DFW y quiere una cotización? ",
    "Text us": "Envíenos un mensaje", " or ": " o ", "call us": "llámenos",
    "Do you have trade accounts?": "¿Tienen cuentas comerciales?",
    "Yes, for HVAC contractors and businesses. No license required. Apply online, we'll call you, and your account is set up with your salesperson. ":
      "Sí, para contratistas y negocios de HVAC. No se requiere licencia. Solicítela en línea, le llamaremos y su cuenta queda con su vendedor. ",
    "I'm near DFW. Can I get a quote?": "Estoy cerca de DFW. ¿Me pueden cotizar?",
    "Yes. Delivery within about 2 hours of DFW already comes off automatically at checkout, and picking up saves even more. For a quote on several units or a specific job, ":
      "Sí. La entrega a unas 2 horas de DFW ya se descuenta automáticamente al pagar, y recoger ahorra aún más. Para cotizar varias unidades o un trabajo específico, ",
    "text us": "envíenos un mensaje",
    ". Trade accounts are for HVAC contractors and businesses.": ". Las cuentas comerciales son para contratistas y negocios de HVAC.",
    "Contractor accounts": "Cuentas para contratistas",
    "Contractors get lower account pricing. No license needed. Apply in 2 minutes.": "Los contratistas obtienen precios más bajos. No se necesita licencia. Solicítelo en 2 minutos.",
    "Wholesale & volume pricing": "Precios de mayoreo y volumen",
    "Buying 5+ systems or using your own freight? Get a quote.": "¿Compra 5+ sistemas o usa su propio flete? Pida una cotización.",
    "Featured systems": "Sistemas destacados",
    "Complete matched systems with free nationwide shipping.": "Sistemas completos y compatibles con envío gratis a todo el país.",
    "Best sellers": "Más vendidos",
    "Heat pumps": "Bombas de calor",
    "View all systems & parts →": "Ver todos los sistemas y piezas →",
    "Shop by category": "Comprar por categoría",
    "Systems, outdoor units, indoor units and parts.": "Sistemas, unidades exteriores, unidades interiores y piezas.",
    "Built for HVAC contractors": "Hecho para contratistas de HVAC",
    "Order online or by text, pick up in DFW or get it shipped free, and talk to a real person who knows the equipment.":
      "Pida en línea o por mensaje de texto, recoja en DFW o reciba envío gratis, y hable con una persona real que conoce el equipo.",
    "Apply for contractor pricing": "Solicitar precios de contratista",
    "$650 off DFW pickup": "$650 menos al recoger en DFW",
    "Contractor pricing": "Precios para contratistas",
    "Wholesale 5+ systems": "Mayoreo 5+ sistemas",
    "Ships in 3–5 days": "Se envía en 3–5 días",
    "Full spec sheets": "Fichas técnicas completas",
    "Text to order": "Pida por mensaje de texto",
    "FAQ & returns": "Preguntas y devoluciones",
    "Brands we carry": "Marcas que manejamos",
    "New equipment from trusted manufacturers, with full manufacturer specs on every product.":
      "Equipo nuevo de fabricantes confiables, con especificaciones completas del fabricante en cada producto.",
    "More brands coming soon": "Más marcas muy pronto",

    // ---- Catalog: sidebar, toolbar, pills, cards
    "Category": "Categoría",
    "Tonnage": "Tonelaje",
    "Brand": "Marca",
    "Clear all filters": "Borrar todos los filtros",
    "Wholesale buyer?": "¿Comprador de mayoreo?",
    "Ordering 5+ systems, or have your own freight carrier? We'll price it for you.": "¿Pide 5+ sistemas o tiene su propio transportista? Le cotizamos.",
    "Request wholesale pricing": "Solicitar precios de mayoreo",
    "Need a different size?": "¿Necesita otro tamaño?",
    "Text us the model or tonnage and we'll check availability.": "Envíenos el modelo o tonelaje por mensaje y revisamos disponibilidad.",
    "Text us": "Escríbanos",
    "Filters": "Filtros",
    "Sort by": "Ordenar por",
    "Featured": "Destacados",
    "Tonnage: low to high": "Tonelaje: menor a mayor",
    "Price: low to high": "Precio: menor a mayor",
    "Price: high to low": "Precio: mayor a menor",
    "All": "Todos",
    "Electric systems": "Sistemas eléctricos",
    "Gas systems": "Sistemas a gas",
    "Heat pump systems": "Sistemas de bomba de calor",
    "AC systems": "Sistemas de A/C",
    "AC condensers": "Condensadoras de A/C",
    "Heat pump condensers": "Condensadoras de bomba de calor",
    "Straight cool (AC)": "Solo frío (A/C)",
    "Heat pump": "Bomba de calor",
    "Air handlers": "Manejadoras de aire",
    "Coils": "Serpentines",
    "Heat kits": "Kits de calefacción",
    "Available": "Disponible",
    "/ system": "/ sistema",
    "/ each": "/ c/u",
    "Free shipping nationwide · ships in 3–5 business days": "Envío gratis a todo el país · se envía en 3–5 días hábiles",
    "Local pickup in DFW:": "Recogiendo en DFW:",
    "Add To Order": "Agregar al pedido",
    "Added ✓": "Agregado ✓",
    "View Specs": "Ver especificaciones",
    "Review": "Revisar",
    "Call for price": "Llame para precio",
    "Text us for price": "Pida el precio por mensaje",
    "See system": "Ver sistema",
    "Save money with a complete system": "Ahorre con un sistema completo",
    "Shop complete systems": "Ver sistemas completos",
    "Heat kit NOT included · add a 10, 15 or 20 kW kit": "Kit de calefacción NO incluido · agregue uno de 10, 15 o 20 kW",
    "Cooling only · no heat kit included": "Solo frío · sin kit de calefacción",
    "Clear filters": "Borrar filtros",

    // ---- Product page
    "Individual part ·": "Pieza individual ·",
    "Delivery": "Entrega",
    "Ship it": "Enviar",
    "Free nationwide shipping ": "Envío gratis a todo el país",
    "Pick up in DFW": "Recoger en DFW",
    "Cash accepted at pickup": "Se acepta efectivo al recoger",
    "Electric heat kit": "Kit de calefacción eléctrica",
    "Furnace size": "Tamaño del horno",
    "Backup (auxiliary) heat kit": "Kit de calefacción de respaldo (auxiliar)",
    "Backup (auxiliary) heat kit (optional)": "Kit de calefacción de respaldo (opcional)",
    "Add a heat kit (not included)": "Agregar kit de calefacción (no incluido)",
    "Add a heat kit (optional)": "Agregar kit de calefacción (opcional)",
    "Options": "Opciones",
    "Standard": "Estándar",
    "Base price": "Precio base",
    "Price coming soon": "Precio próximamente",
    "No heat kit": "Sin kit de calefacción",
    "No backup kit": "Sin kit de respaldo",
    "Questions about this": "¿Preguntas sobre este",
    "system": "sistema",
    "part": "producto",
    "call": "llámenos",
    "What's Included": "Qué incluye",
    "Condenser Specs": "Especificaciones de condensadora",
    "Air Handler Specs": "Especificaciones de manejadora",
    "Heat Kit Specs": "Especificaciones del kit",
    "Coil Specs": "Especificaciones del serpentín",
    "Furnace Specs": "Especificaciones del horno",
    "Heat Pump Specs": "Especificaciones de bomba de calor",
    "Included": "Incluido",
    "Model": "Modelo",
    "Description": "Descripción",
    "Specifications": "Especificaciones",
    "Size note:": "Nota de tamaño:",
    "Cooling": "Enfriamiento",
    "Heat": "Calefacción",
    "Refrigerant": "Refrigerante",
    "Voltage": "Voltaje",
    "Heating input": "Entrada de calor",
    "Width": "Ancho",
    "Airflow": "Flujo de aire",
    "Amps": "Amperios",
    "Fits": "Compatible con",
    "Heating": "Calefacción",
    "Not included": "No incluido",
    "None (cooling only)": "Ninguna (solo frío)",
    "Heat pump (no backup kit)": "Bomba de calor (sin kit de respaldo)",

    // ---- Component roles
    "Condenser": "Condensadora", "Condenser:": "Condensadora:",
    "Air Handler": "Manejadora de aire", "Air Handler:": "Manejadora de aire:",
    "Heat Kit": "Kit de calefacción", "Heat Kit:": "Kit de calefacción:",
    "Coil": "Serpentín", "Coil:": "Serpentín:",
    "Furnace": "Horno", "Furnace:": "Horno:",
    "Heat Pump": "Bomba de calor", "Heat Pump:": "Bomba de calor:",
    "Model:": "Modelo:",
    "Electric AC System": "Sistema de A/C eléctrico",
    "Gas AC System": "Sistema de A/C con horno de gas",
    "Heat Pump System": "Sistema de bomba de calor",
    "Split AC System": "Sistema de A/C dividido",
    "Heat Pump Condenser": "Condensadora de bomba de calor",

    // ---- Spec labels
    "Dimensions (L × W × H)": "Dimensiones (L × A × H)",
    "Dimensions (W × D × H)": "Dimensiones (A × P × H)",
    "Weight": "Peso", "Ship weight": "Peso de envío",
    "Cooling capacity": "Capacidad de enfriamiento", "Capacity": "Capacidad",
    "SEER2": "SEER2", "EER2": "EER2", "HSPF2": "HSPF2", "SEER2 / HSPF2": "SEER2 / HSPF2", "AFUE": "AFUE",
    "Compressor": "Compresor", "Stages": "Etapas",
    "Voltage / Phase": "Voltaje / Fase",
    "Rated load amps (RLA)": "Amperaje de carga nominal (RLA)",
    "Locked rotor amps (LRA)": "Amperaje de rotor bloqueado (LRA)",
    "Fan motor full load amps": "Amperaje a plena carga del ventilador",
    "Max overcurrent protection (MOCP)": "Protección máx. contra sobrecorriente (MOCP)",
    "Minimum circuit ampacity (MCA)": "Ampacidad mínima del circuito (MCA)",
    "Liquid line": "Línea de líquido", "Suction line": "Línea de succión",
    "Max piping length": "Longitud máx. de tubería",
    "Metering device": "Dispositivo de medición",
    "Condenser fan": "Ventilador de condensadora",
    "Coil fins per inch": "Aletas por pulgada",
    "Sound level": "Nivel de sonido",
    "Protection": "Protección", "Approvals": "Certificaciones", "Color": "Color",
    "Country of origin": "País de origen", "Warranty": "Garantía",
    "Cabinet width": "Ancho del gabinete", "Cabinet": "Gabinete",
    "Coil": "Serpentín", "Blower motor": "Motor del soplador", "Blower": "Soplador",
    "Blower wheel": "Rueda del soplador", "Blower full load amps": "Amperaje a plena carga del soplador",
    "Air flow direction": "Dirección del flujo de aire",
    "Drain connection": "Conexión de drenaje", "Drain connections": "Conexiones de drenaje",
    "Filter": "Filtro", "Insulation": "Aislamiento", "Electric heat": "Calefacción eléctrica",
    "Airflow range": "Rango de flujo de aire", "Burst pressure": "Presión de ruptura",
    "Heating output": "Salida de calor", "Heating stages": "Etapas de calefacción",
    "Fuel": "Combustible", "Gas connection": "Conexión de gas", "Ignition": "Encendido",
    "Full load amps": "Amperaje a plena carga", "Cabinet leakage": "Fuga del gabinete",
    "Heating capacity": "Capacidad de calefacción", "Elements": "Resistencias",
    "Disconnect": "Desconexión", "Circuits": "Circuitos",
    "Heater amps (208V/240V)": "Amperaje del calentador (208V/240V)",
    "Factory charge": "Carga de fábrica",

    // ---- Spec values (text)
    "Scroll, single-stage": "Scroll, una etapa", "Rotary, single-stage": "Rotativo, una etapa",
    "R-454B (Puron Advance™)": "R-454B (Puron Advance™)",
    "TXV": "TXV", "TXV, factory installed": "TXV, instalada de fábrica",
    "Gray": "Gris", "Mexico": "México", "USA": "EE. UU.",
    "UL Listed": "Certificado UL", "UL Listed · ENERGY STAR®": "Certificado UL · ENERGY STAR®",
    "ENERGY STAR®": "ENERGY STAR®",
    "AHRI certified, ETL listed": "Certificado AHRI, listado ETL",
    "AHRI certified, ETL listed, UL 60335-2-40": "Certificado AHRI, listado ETL, UL 60335-2-40",
    "Internal pressure relief valve, internal thermal overload, filter drier, dense wire coil guard":
      "Válvula de alivio de presión interna, protección térmica interna, filtro deshidratador, rejilla de alambre densa",
    "Loss-of-charge switch, internal pressure relief valve, internal thermal overload, filter drier, dense wire coil guard":
      "Interruptor por pérdida de carga, válvula de alivio de presión interna, protección térmica interna, filtro deshidratador, rejilla de alambre densa",
    "Aluminum, grooved tube, louvered fin": "Aluminio, tubo ranurado, aleta persiana",
    "Aluminum tube, aluminum fin, V-coil": "Tubo y aleta de aluminio, serpentín en V",
    "Aluminum tube, aluminum fin, A-coil": "Tubo y aleta de aluminio, serpentín en A",
    "Multipoise (up, down, horizontal)": "Multiposición (arriba, abajo, horizontal)",
    "Multipoise (upflow, downflow, horizontal)": "Multiposición (flujo ascendente, descendente, horizontal)",
    "Multipoise (upflow, downflow, horizontal left/right)": "Multiposición (ascendente, descendente, horizontal izq./der.)",
    "Multi-position (vertical or horizontal)": "Multiposición (vertical u horizontal)",
    "Upflow / downflow": "Flujo ascendente / descendente",
    "Pre-painted galvanized steel (taupe metallic)": "Acero galvanizado prepintado (gris topo metálico)",
    "24-gauge pre-painted steel (taupe metallic), R-2.1 foil-faced insulation": "Acero prepintado calibre 24 (gris topo metálico), aislamiento R-2.1 con lámina",
    "Architectural Gray powder paint, 500-hr salt-spray rated": "Pintura en polvo gris arquitectónico, resistente a 500 h de niebla salina",
    "Heavy-gauge galvanized steel, Architectural Gray powder paint": "Acero galvanizado de alto calibre, pintura en polvo gris arquitectónico",
    "1 (single stage)": "1 (una etapa)", "1 cooling / 1 heating": "1 enfriamiento / 1 calefacción",
    "Natural gas or LP (conversion kit)": "Gas natural o LP (kit de conversión)",
    "Hot surface (Power Heat™ igniter)": "Superficie caliente (encendedor Power Heat™)",
    "Circuit breaker": "Interruptor (breaker)", "None (field-supplied)": "Ninguna (suministrada en campo)",
    "R-32": "R-32", "R-32 (factory R-32 sensor)": "R-32 (sensor R-32 de fábrica)",
    "3 – 30 kW accessory heaters, plug-in": "Calentadores accesorios de 3 – 30 kW, enchufables",
    "Field-installed 3 to 25 kW heat kits available (not included)": "Kits de calefacción de 3 a 25 kW instalables en campo (no incluidos)",
    "10-year parts (incl. compressor & coil) when registered within 90 days; 5-year otherwise":
      "10 años en piezas (incl. compresor y serpentín) si se registra en 90 días; de lo contrario 5 años",
    "10-year parts when registered within 90 days; 5-year otherwise": "10 años en piezas si se registra en 90 días; de lo contrario 5 años",
    "10-year parts limited warranty with online registration within 60 days of install":
      "Garantía limitada de 10 años en piezas con registro en línea dentro de 60 días de la instalación",
    "3/4\" FPT, with secondary drain": "3/4\" FPT, con drenaje secundario",
    "All AMST air handlers": "Todas las manejadoras AMST",
    "AMST 5-ton (D cabinet)": "AMST de 5 toneladas (gabinete D)",
    "2 (or single-point kit)": "2 (o kit de un solo punto)",
    "208/240V, 1-phase": "208/240V, monofásico",

    // ---- Highlights
    "Single-stage scroll compressor": "Compresor scroll de una etapa",
    "Puron Advance™ R-454B refrigerant (low GWP)": "Refrigerante Puron Advance™ R-454B (bajo GWP)",
    "Long-line capable up to 250 ft total equivalent length": "Apto para líneas largas hasta 250 pies de longitud equivalente",
    "Low ambient cooling down to 0°F with approved kit": "Enfriamiento en clima frío hasta 0°F con kit aprobado",
    "ENERGY STAR® rated": "Certificado ENERGY STAR®",
    "Multipoise: upflow, downflow or horizontal": "Multiposición: flujo ascendente, descendente u horizontal",
    "Multi-tap ECM blower motor, 5 speed taps": "Motor de soplador ECM de múltiples velocidades, 5 derivaciones",
    "Built-in refrigerant leak detection & dissipation system": "Sistema integrado de detección y disipación de fugas de refrigerante",
    "Factory-installed R-454B TXV": "TXV R-454B instalada de fábrica",
    "Low-leak cabinet (<2% at 0.5\" W.C.)": "Gabinete de baja fuga (<2% a 0.5\" W.C.)",
    "Accepts 3 – 30 kW plug-in heaters": "Acepta calentadores enchufables de 3 – 30 kW",
    "Built-in circuit breaker": "Interruptor (breaker) integrado",
    "Plug-in install on the fan coil": "Se instala enchufado en el fan coil",
    "Heats and cools: single-stage scroll compressor": "Calienta y enfría: compresor scroll de una etapa",
    "Loss-of-charge switch, internal pressure relief, filter drier": "Interruptor por pérdida de carga, alivio de presión interno, filtro deshidratador",
    "Cased V-coil, upflow or downflow": "Serpentín en V con gabinete, flujo ascendente o descendente",
    "Refrigerant leak detection & dissipation system": "Sistema de detección y disipación de fugas de refrigerante",
    "Factory-installed R-454B TXV (pre-set ~10° superheat)": "TXV R-454B de fábrica (ajustada a ~10° de sobrecalentamiento)",
    "Corrosion-resistant PBT drain pan, 3 drain plugs included": "Bandeja de drenaje PBT anticorrosiva, incluye 3 tapones",
    "Factory UV-light knockouts, easy-access service door": "Perforaciones de fábrica para luz UV, puerta de servicio de fácil acceso",
    "Multipoise: upflow, downflow or horizontal (one coil for any install)": "Multiposición: ascendente, descendente u horizontal (un serpentín para cualquier instalación)",
    "Two corrosion-resistant FRTP drain pans (vertical + horizontal)": "Dos bandejas de drenaje FRTP anticorrosivas (vertical + horizontal)",
    "Low pressure-drop A-coil design": "Diseño de serpentín en A de baja caída de presión",
    "80% AFUE, single-stage gas valve": "80% AFUE, válvula de gas de una etapa",
    "18-speed constant-torque ECM blower": "Soplador ECM de par constante de 18 velocidades",
    "4-way multipoise, 13 vent options": "Multiposición de 4 vías, 13 opciones de ventilación",
    "QuieTech™ noise reduction system": "Sistema de reducción de ruido QuieTech™",
    "3-digit status display + NFC setup with the Carrier tech app": "Pantalla de estado de 3 dígitos + configuración NFC con la app de técnicos de Carrier",
    "Natural gas or LP (with conversion kit); Hybrid Heat® dual-fuel compatible": "Gas natural o LP (con kit de conversión); compatible con Hybrid Heat® de combustible dual",
    "R-32 refrigerant, factory charged for 15 ft of line": "Refrigerante R-32, cargado de fábrica para 15 pies de línea",
    "Removable grille-style top, steel louver coil guard": "Tapa tipo rejilla desmontable, protector de serpentín de acero",
    "Meets 2023 Florida Building Code hurricane-wind integrity when anchored": "Cumple el Código de Construcción de Florida 2023 contra huracanes al anclarse",
    "Multi-speed ECM blower (9 speed taps)": "Soplador ECM multivelocidad (9 derivaciones)",
    "Factory-installed TXV and R-32 leak sensor": "TXV y sensor de fugas R-32 instalados de fábrica",
    "All-aluminum evaporator coil, 21\" depth for attic installs": "Serpentín evaporador de aluminio, 21\" de fondo para áticos",
    "Tool-less filter access, low-leak cabinet (<2% at 1.0\" H2O)": "Acceso al filtro sin herramientas, gabinete de baja fuga (<2% a 1.0\" H2O)",
    "Accepts field-installed 3 to 25 kW heat kits (sold separately)": "Acepta kits de calefacción de 3 a 25 kW instalados en campo (se venden por separado)",
    "SmartShift® quiet, reliable defrost": "Descongelamiento silencioso y confiable SmartShift®",
    "Suction-line accumulator, bi-flow filter drier, high & low pressure switches": "Acumulador en línea de succión, filtro deshidratador bidireccional, presostatos de alta y baja",
    "Single-stage rotary compressor": "Compresor rotativo de una etapa",
    "Single-stage scroll compressor with crankcase heater": "Compresor scroll de una etapa con calentador de cárter",
    "Single-stage rotary compressor with crankcase heater": "Compresor rotativo de una etapa con calentador de cárter",
    "No breaker: field-supplied disconnect required": "Sin breaker: requiere desconexión suministrada en campo",
    "Built-in circuit breaker (service disconnect)": "Breaker integrado (desconexión de servicio)",

    // ---- Info panels, FAQ, contact, footer
    "Shipping is built into every price. No freight quotes, no surprises.": "El envío está incluido en cada precio. Sin cotizaciones de flete ni sorpresas.",
    "Free curbside delivery": "Entrega gratis en la acera",
    "LTL freight to homes, shops and job sites": "Flete LTL a casas, talleres y obras",
    ". Inside delivery isn't included.": ". No incluye entrega al interior.",
    "Counted from when your payment clears. Don't schedule the install until the unit arrives.": "Desde que se confirma su pago. No programe la instalación hasta que llegue la unidad.",
    "Pick up & save $": "Recoja y ahorre $",
    "per unit": "por unidad",
    "Order online, then pick up in": "Pida en línea y recoja en",
    ". Pay ahead, or": ". Pague por adelantado o",
    "pay cash when you pick up": "pague en efectivo al recoger",
    ". We confirm the address and pickup time by call or text.": ". Confirmamos la dirección y la hora por llamada o mensaje.",
    "Liftgate:": "Plataforma elevadora (liftgate):",
    "Add it at checkout if there's no loading dock or forklift where it's delivered.": "Agréguela al pagar si no hay andén de carga ni montacargas donde se entrega.",
    "Inspect before you sign": "Inspeccione antes de firmar",
    "Count every box and check for damage in front of the driver. Note anything wrong on the delivery receipt.": "Cuente cada caja y revise daños frente al chofer. Anote cualquier problema en el recibo de entrega.",
    "Report problems fast": "Reporte problemas rápido",
    "Missing items within": "Artículos faltantes en",
    "hours, damage within": "horas, daños en",
    "business days, with photos.": "días hábiles, con fotos.",
    "Returns": "Devoluciones",
    "Unopened units can be returned within 30 days, minus original shipping and a 15% restocking fee. Buyer pays return shipping.":
      "Las unidades sin abrir se pueden devolver en 30 días, menos el envío original y un cargo de reposición del 15%. El comprador paga el envío de devolución.",
    "How Ordering Works": "Cómo hacer un pedido",
    "No account needed. Build your order here and we'll take it from there.": "No necesita cuenta. Arme su pedido aquí y nosotros nos encargamos.",
    "Build your order": "Arme su pedido",
    "Add systems, then choose free shipping to your ZIP code, or local pickup in DFW to save $650 per system.":
      "Agregue sistemas y elija envío gratis a su código postal, o recogida local en DFW para ahorrar $650 por sistema.",
    "Home delivery with liftgate (no dock or forklift)": "Entrega a domicilio con plataforma elevadora (sin andén ni montacargas)",
    "Send it to us": "Envíenoslo",
    "Text or email the order from checkout. We confirm stock, usually the same day.": "Envíe el pedido por mensaje o correo. Confirmamos existencias, normalmente el mismo día.",
    "Pay the invoice": "Pague la factura",
    "Pay online by card, bank transfer (ACH), Apple Pay / Google Pay, or monthly with Klarna. Prefer an invoice? Pay by ACH or Zelle. We ship once payment clears. Picking up in DFW? You can also pay cash at pickup.":
      "Pague en línea con tarjeta, transferencia bancaria (ACH), Apple Pay / Google Pay, o en pagos mensuales con Klarna. ¿Prefiere factura? Pague por ACH o Zelle. Enviamos cuando se acredita el pago. ¿Recoge en DFW? También puede pagar en efectivo al recoger.",
    "Ship or pick up": "Envío o recogida",
    "You get tracking for freight, or the pickup address and time. Inspect freight before signing for it.": "Recibe el rastreo del flete, o la dirección y hora de recogida. Inspeccione antes de firmar.",
    "Frequently Asked Questions": "Preguntas frecuentes",
    "Still have a question? Call or text us.": "¿Tiene otra pregunta? Llámenos o envíenos un mensaje.",
    "What is a contractor account?": "¿Qué es una cuenta de contratista?",
    "HVAC contractors, installers and businesses can apply for an account with pricing below what's listed on the site. No license required. Apply online, we call you, and your account is set up with your salesperson.":
      "Contratistas de HVAC, instaladores y empresas pueden solicitar una cuenta con precios más bajos que los publicados. No se requiere licencia. Solicítela en línea, le llamamos y su cuenta queda lista con su vendedor.",
    "Do you offer wholesale or volume pricing?": "¿Ofrecen precios de mayoreo o por volumen?",
    "Yes. If you're buying several systems at a time, ordering regularly, or want to send your own freight carrier to pick up in":
      "Sí. Si compra varios sistemas a la vez, pide con regularidad o quiere enviar su propio transportista a recoger en",
    ", we'll quote you wholesale pricing well below the prices listed here.": ", le cotizamos precios de mayoreo muy por debajo de los publicados.",
    "Who can buy?": "¿Quién puede comprar?",
    "We sell to HVAC contractors. Have your state license number ready when you order.": "Vendemos a contratistas de HVAC. Tenga a la mano su número de licencia estatal al pedir.",
    "Is the equipment new?": "¿El equipo es nuevo?",
    "New in box. Confirm warranty terms for your install when you order.": "Nuevo en caja. Confirme los términos de garantía para su instalación al pedir.",
    "Is shipping really free?": "¿El envío es realmente gratis?",
    "Yes. Curbside LTL freight": "Sí. El flete LTL a la acera",
    "is included in every price. The only extra is a liftgate, if you need one.": "está incluido en cada precio. El único extra es la plataforma elevadora, si la necesita.",
    "anywhere in the US (Alaska & Hawaii quoted separately)": "a cualquier parte de EE. UU. (Alaska y Hawái se cotizan aparte)",
    "Can I pick up?": "¿Puedo recoger?",
    "Yes, and you save $": "Sí, y ahorra $",
    "on every system, condenser, air handler, furnace, coil and heat kit. Place your order online, choose local pickup in":
      "en cada sistema, condensadora, manejadora, horno, serpentín y kit de calefacción. Haga su pedido en línea, elija recogida local en",
    "at checkout, and we'll call or text to confirm the address and pickup time. You can pay ahead, or pay cash when you pick up.":
      "al pagar, y le llamamos o escribimos para confirmar la dirección y la hora. Puede pagar por adelantado o en efectivo al recoger.",
    "What if freight arrives damaged?": "¿Y si el flete llega dañado?",
    "Inspect every unit before you sign. Write any damage on the delivery receipt and take photos, then text us right away. Signing \"clean\" makes a freight claim very hard to win.":
      "Inspeccione cada unidad antes de firmar. Anote cualquier daño en el recibo de entrega, tome fotos y escríbanos de inmediato. Firmar \"sin daños\" hace muy difícil ganar un reclamo de flete.",
    "Can I return a unit?": "¿Puedo devolver una unidad?",
    "How do I pay?": "¿Cómo pago?",
    "Do efficiency rules affect what I can buy?": "¿Las normas de eficiencia afectan lo que puedo comprar?",
    "Yes. In the Southeast and Southwest (including TX, OK, FL, GA, AZ and CA), new split AC systems must meet a higher SEER2 minimum. Checkout checks your ZIP code against each unit and warns you if one doesn't qualify.":
      "Sí. En el Sureste y Suroeste (incluidos TX, OK, FL, GA, AZ y CA), los sistemas de A/C divididos nuevos deben cumplir un SEER2 mínimo más alto. Al pagar revisamos su código postal y le avisamos si alguna unidad no califica.",
    "Contact Us": "Contáctenos",
    "Call, text or email. We answer fast.": "Llame, escriba o envíe un correo. Respondemos rápido.",
    "Call": "Llamar", "Text": "Mensaje", "Email": "Correo",
    "New HVAC equipment for contractors, shipped free nationwide from Dallas, TX, or picked up locally in":
      "Equipo nuevo de HVAC para contratistas, con envío gratis desde Dallas, TX, o para recoger en",
    "Shop": "Comprar", "Help": "Ayuda", "Wholesale Pricing": "Precios de mayoreo",
    ". All rights reserved.": ". Todos los derechos reservados.",

    // ---- Order drawer
    "Your Order": "Su pedido", "Items": "Artículos",
    "No items yet. Add some from the catalog.": "Aún no hay artículos. Agregue desde el catálogo.",
    "Free shipping nationwide": "Envío gratis a todo el país",
    "Curbside LTL freight · ships in": "Flete LTL a la acera · se envía en",
    "Local pickup in": "Recogida local en",
    "per system or major part · pay cash at pickup if you like": "por sistema o pieza mayor · pague en efectivo al recoger si prefiere",
    "Cash at pickup": "Efectivo al recoger", "Pay when you pick up": "Pague al recoger",
    "Pay ahead": "Pagar por adelantado", "ACH, Zelle or card": "ACH, Zelle o tarjeta",
    "Enter the ZIP code so we can check shipping and efficiency rules.": "Ingrese el código postal para revisar el envío y las normas de eficiencia.",
    "Alaska, Hawaii and territories aren't included in free shipping. We'll quote freight on your invoice.":
      "Alaska, Hawái y los territorios no incluyen envío gratis. Cotizaremos el flete en su factura.",
    "Liftgate (no dock or forklift)": "Plataforma elevadora (sin andén ni montacargas)",
    "Your info": "Sus datos", "Equipment": "Equipo", "Shipping": "Envío",
    "Shipping + liftgate": "Envío + plataforma elevadora", "Local pickup (DFW)": "Recogida local (DFW)",
    "Local pickup discount": "Descuento por recoger", "Total": "Total", "FREE": "GRATIS", "Quote": "Cotizar",
    "Text Order": "Enviar por mensaje", "Email Order": "Enviar por correo",
    "Nothing is charged here. We confirm stock, then send your invoice or pickup details.": "Aquí no se cobra nada. Confirmamos existencias y le enviamos la factura o los datos de recogida.",
    "Review Order": "Revisar pedido",
    "Transition needed at install (furnace wider than coil)": "Se necesita transición al instalar (horno más ancho que el serpentín)",

    // ---- Wholesale form
    "WHOLESALE PROGRAM": "PROGRAMA DE MAYOREO", "Get wholesale pricing": "Obtenga precios de mayoreo",
    "For contractors and dealers buying in volume. Tell us what you need and we'll send a quote, usually the same day.":
      "Para contratistas y distribuidores que compran en volumen. Díganos qué necesita y le enviamos una cotización, normalmente el mismo día.",
    "Volume pricing on 5+ systems": "Precios por volumen en 5+ sistemas",
    "Use your own freight carrier: pick up in DFW and skip our shipping cost": "Use su propio transportista: recoja en DFW y evite nuestro costo de envío",
    "Mix and match tonnages and heat kits on one order": "Combine tonelajes y kits de calefacción en un mismo pedido",
    "Company": "Empresa", "Your name": "Su nombre", "Systems per order": "Sistemas por pedido", "How often?": "¿Con qué frecuencia?",
    "Not sure yet": "Aún no sé", "One-time order": "Pedido único", "Monthly": "Mensual", "Weekly": "Semanal",
    "Project / new construction": "Proyecto / construcción nueva",
    "I'll use my own freight carrier": "Usaré mi propio transportista", "Your truck or carrier picks up in": "Su camión o transportista recoge en",
    "Ship it for me": "Envíenmelo", "We ship to your ZIP code.": "Enviamos a su código postal.",
    "Delivery ZIP / state": "Código postal / estado de entrega", "License # (optional)": "Licencia # (opcional)",
    "What do you need?": "¿Qué necesita?", "Text my request": "Enviar por mensaje", "Email my request": "Enviar por correo",
    "Or call us at": "O llámenos al", ". Nothing is charged; we'll reply with a quote.": ". No se cobra nada; le respondemos con una cotización.",

    // ---- Contractor account form
    "NORTHGATE ACCOUNT": "CUENTA NORTHGATE",
    "HVAC contractors and businesses get account pricing below what's listed on the site. No license required. Apply below, we'll call you and set up your account.":
      "Los contratistas de HVAC y empresas obtienen precios de cuenta más bajos que los publicados. No se requiere licencia. Solicite abajo, le llamamos y configuramos su cuenta.",
    "Lower prices on every system and part": "Precios más bajos en cada sistema y pieza",
    "Priority on stock and orders held for your jobs": "Prioridad en existencias y pedidos apartados para sus trabajos",
    "A direct line to your salesperson: quotes by text, same day": "Línea directa con su vendedor: cotizaciones por mensaje el mismo día",
    "Mobile phone": "Celular", "HVAC license # (optional)": "Licencia HVAC # (opcional)", "License state (optional)": "Estado de la licencia (opcional)",
    "Systems you install per month": "Sistemas que instala al mes", "Mostly": "Principalmente",
    "Residential replacement": "Reemplazo residencial", "New construction": "Construcción nueva", "Both": "Ambos", "Commercial": "Comercial",
    "Text my application": "Enviar solicitud por mensaje", "Email my application": "Enviar solicitud por correo",
    "We'll contact you to activate your account. Approved contractors will sign in here to see their pricing.":
      "Le contactaremos para activar su cuenta. Los contratistas aprobados iniciarán sesión aquí para ver sus precios.",

    // ---- Attributes (placeholders / labels)
    "Search by model number, tonnage or product": "Busque por modelo, tonelaje o producto",
    "Search products": "Buscar productos", "Search": "Buscar", "Close": "Cerrar", "Quantity": "Cantidad",
    "Less": "Menos", "More": "Más", "Company name": "Nombre de la empresa",
    "Contractor license # (optional)": "Licencia de contratista # (opcional)",
    "ZIP code where it's going": "Código postal de entrega", "ZIP code where it'll be installed": "Código postal de instalación",
    "First and last name": "Nombre y apellido", "e.g. 33634 or Florida": "ej. 33634 o Florida",
    "e.g. 6 × 2.5-ton electric systems with 15 kW heat, 4 × 3-ton": "ej. 6 sistemas eléctricos de 2.5 toneladas con 15 kW, 4 de 3 toneladas",
    "e.g. TACLA12345C": "ej. TACLA12345C", "e.g. TX": "ej. TX",
    "Product categories": "Categorías de productos", "Product type": "Tipo de producto",
    "Brands and offers": "Marcas y ofertas", "Wholesale announcement": "Anuncio de mayoreo",
    "Your order": "Su pedido", "Shop Carrier": "Ver Carrier", "Shop Goodman": "Ver Goodman",
    "Commercial Rooftop Units": "Unidades comerciales de techo", "Commercial Packaged Rooftop Units": "Unidades comerciales paquete de techo",
    "Commercial": "Comercial", "Gas / electric": "Gas / eléctrico", "Heat pump": "Bomba de calor", "Straight cool": "Solo enfriamiento",
    "Packaged Unit": "Unidad paquete", "Packaged Unit:": "Unidad paquete:", "Packaged Unit Specs": "Especificaciones de la unidad paquete",
    "Carrier and Bryant packaged rooftop units, 3 to 25 tons, with LTL freight built into every price. Pick up in DFW and the freight comes off.":
      "Unidades paquete de techo Carrier y Bryant, de 3 a 25 toneladas, con el flete LTL incluido en cada precio. Recójalas en DFW y le descontamos el flete.",
    "LTL freight built into every price.": "Flete LTL incluido en cada precio.",
    "$450 to $1,300 off with local pickup in": "$450 a $1,300 menos al recoger en", "Pick up and skip the freight": "Recoja y ahórrese el flete",
    "Gas/electric, heat pump & straight cool": "Gas/eléctrico, bomba de calor y solo enfriamiento",
    "208/230V and 460V · full specs on every unit": "208/230V y 460V · especificaciones completas en cada unidad",
    "NEW · COMMERCIAL EQUIPMENT": "NUEVO · EQUIPO COMERCIAL", "Commercial rooftop units, 3 to 25 tons": "Unidades comerciales de techo, de 3 a 25 toneladas",
    "Carrier WeatherMaker and Bryant Legacy packaged units for restaurants, retail, offices and warehouses. Freight to your job site is built into every price, or pick up in DFW and the freight comes off.":
      "Unidades paquete Carrier WeatherMaker y Bryant Legacy para restaurantes, tiendas, oficinas y bodegas. El flete a su obra está incluido en cada precio, o recójalas en DFW y le quitamos el flete.",
    "Ships to your job site by freight truck. Have a forklift on site to unload, or we can arrange unloading for an extra charge.":
      "Se envían a su obra en camión de carga. Tenga un montacargas en el sitio para descargar, o podemos coordinar la descarga con un cargo extra.",
    "Shop commercial units →": "Ver unidades comerciales →", "Get a project quote": "Pida una cotización de proyecto",
    "HOME SYSTEMS · FREE SHIPPING": "SISTEMAS RESIDENCIALES · ENVÍO GRATIS",
    "Complete home AC & heating systems, 1.5 to 5 tons": "Sistemas completos de A/C y calefacción para el hogar, de 1.5 a 5 toneladas",
    "Matched Carrier, Trane and Goodman systems: electric, gas furnace and heat pump. Free shipping nationwide is built into every price, or pick up in DFW and save.":
      "Sistemas combinados Carrier, Trane y Goodman: eléctricos, con horno de gas y bomba de calor. El envío gratis a todo el país está incluido en cada precio, o recójalos en DFW y ahorre.",
    "Ships in 3–5 business days by freight truck to your curb. Monthly payments available with Klarna.":
      "Se envían en 3 a 5 días hábiles en camión de carga hasta su banqueta. Pagos mensuales disponibles con Klarna.",
    "Shop home systems →": "Ver sistemas residenciales →", "Save with DFW pickup": "Ahorre recogiendo en DFW",
    "systems to choose from": "sistemas para elegir",
    "NEW · INSTALLATION": "NUEVO · INSTALACIÓN", "Need it installed?": "¿Necesita instalación?",
    "Get an installed price for your home in about a minute.": "Obtenga un precio con instalación para su casa en un minuto.",
    "Get my installed price →": "Ver mi precio con instalación →", "Installation": "Instalación",
    "New: we install, too": "Nuevo: también instalamos",
    "Equipment, installation, materials and labor warranty in one price. Enter your address and get an estimate in about a minute.":
      "Equipo, instalación, materiales y garantía de mano de obra en un solo precio. Ingrese su dirección y obtenga un estimado en un minuto.",
    "Get an installed price": "Precio con instalación",
    "Equipment, installation, materials and labor warranty in one price. Tell us where the job is and what you need; your estimate updates as you go.":
      "Equipo, instalación, materiales y garantía de mano de obra en un solo precio. Díganos dónde es el trabajo y qué necesita; su estimado se actualiza al instante.",
    "Where's the job?": "¿Dónde es el trabajo?", "Street address": "Dirección", "City": "Ciudad", "State": "Estado", "ZIP": "Código postal",
    "What do you need?": "¿Qué necesita?", "Type it or pick below": "Escríbalo o elija abajo", "System type": "Tipo de sistema",
    "Gas furnace + AC": "Horno de gas + A/C", "Electric AC + air handler": "A/C eléctrico + manejadora", "Heat pump": "Bomba de calor",
    "Size": "Tamaño", "Brand": "Marca", "Compare all brands": "Comparar todas las marcas", "Not sure": "No estoy seguro",
    "Home size (square feet)": "Tamaño de la casa (pies cuadrados)", "The job": "El trabajo", "Job type": "Tipo de trabajo",
    "Full system change-out (indoor + outdoor)": "Cambio de sistema completo (interior + exterior)",
    "Outdoor unit swap only (AC or heat pump)": "Solo cambio de unidad exterior (A/C o bomba de calor)",
    "New install (no existing system or ductwork)": "Instalación nueva (sin sistema ni ductos)",
    "New supply & return plenums": "Plenums nuevos de suministro y retorno", "New refrigerant line set": "Líneas de refrigerante nuevas",
    "New smart thermostat": "Termostato inteligente nuevo", "New outdoor equipment pad": "Base nueva para la unidad exterior",
    "Your estimate": "Su estimado", "BEST VALUE": "MEJOR PRECIO", "Equipment": "Equipo", "Installation labor": "Mano de obra de instalación",
    "Materials": "Materiales", "installed estimate": "estimado instalado", "Custom quote": "Cotización a medida", "we'll call you": "le llamamos",
    "Book it or ask questions": "Resérvelo o haga preguntas", "Your name": "Su nombre", "Mobile phone": "Celular", "Email": "Correo",
    "Anything we should know? (optional)": "¿Algo que debamos saber? (opcional)",
    "Text my install request": "Enviar mi solicitud por texto", "Email my install request": "Enviar mi solicitud por correo",
    "This is an estimate. We confirm the final price after a quick review of photos of your current system (or a site visit) before anything is scheduled. Permits and major duct or electrical work are quoted separately if needed.":
      "Esto es un estimado. Confirmamos el precio final después de revisar fotos de su sistema actual (o una visita) antes de agendar. Permisos y trabajos mayores de ductos o electricidad se cotizan aparte si se necesitan.",
    "Your installed estimate": "Su estimado instalado", "Every system change-out includes": "Cada cambio de sistema incluye",
    "Every outdoor unit swap includes": "Cada cambio de unidad exterior incluye",
    "New drain pan with a flood (float) sensor": "Charola de drenaje nueva con sensor de inundación (flotador)",
    "New gas flex connector for the furnace hookup": "Conector flexible de gas nuevo para el horno",
    "Plenum connections resealed with tape and mastic": "Conexiones del plenum reselladas con cinta y mastique",
    "New electrical disconnect box and disconnect whip": "Caja de desconexión eléctrica y cable (whip) nuevos",
    "New outdoor condenser pad": "Base nueva para la condensadora",
    "1-year labor warranty, plus the manufacturer's parts warranty": "Garantía de mano de obra de 1 año, más la garantía de piezas del fabricante",
    "Continue with this price →": "Continuar con este precio →",
    "nationally": "a nivel nacional",
    "Check out": "Pagar", "Pay today": "Pague hoy", "Pay after your install": "Pague después de la instalación",
    "Your equipment. Card, bank transfer, Apple Pay / Google Pay, or monthly payments with Klarna.": "Su equipo. Tarjeta, transferencia bancaria, Apple Pay / Google Pay o pagos mensuales con Klarna.",
    "How it works": "Cómo funciona",
    "Check out and pay for your system.": "Pague su sistema.", "Pay in full or choose monthly payments.": "Pague completo o elija pagos mensuales.",
    "Sign your installation agreement.": "Firme su contrato de instalación.", "We email it to you right after checkout.": "Se lo enviamos por correo justo después de pagar.",
    "We ship your system.": "Enviamos su sistema.", "It arrives in 1–3 business days.": "Llega en 1 a 3 días hábiles.",
    "We install it 1–2 days after it arrives.": "Lo instalamos 1 a 2 días después de que llegue.", "We call or text you to set the time.": "Le llamamos o enviamos texto para fijar la hora.",
    "Pay for the installation online": "Pague la instalación en línea", "once the job is finished.": "cuando termine el trabajo.",
    "Anything we should know about the job? (optional)": "¿Algo que debamos saber del trabajo? (opcional)",
    "Rather talk to someone first?": "¿Prefiere hablar con alguien primero?", "Text us this quote": "Envíenos esta cotización por texto", "email it": "por correo",
    "Buy the system only (no install)": "Comprar solo el sistema (sin instalación)", "Continue with this system →": "Continuar con este sistema →",
    "Want it installed?": "¿Lo quiere instalado?", "Get an installed price for this system →": "Ver precio con instalación de este sistema →",
    "Electric AC systems": "Sistemas de A/C eléctricos", "Gas furnace systems": "Sistemas con horno de gas",
    "Heat pump systems": "Sistemas de bomba de calor", "Condensers & parts": "Condensadoras y piezas",
    "Brands we carry": "Marcas que vendemos",
    "Terms of Sale": "Términos de venta", "Privacy Policy": "Política de privacidad", "Terms": "Términos", "Privacy": "Privacidad",
    "By placing an order you agree to our": "Al hacer un pedido acepta nuestros", "and": "y",
    "Account login": "Iniciar sesión", "Create an account": "Crear una cuenta", "Create one": "Cree una", "Your account": "Su cuenta",
    "Online login turns on when the site goes live. Until then, create your account request on the next tab and we'll set you up.":
      "El inicio de sesión en línea se activa cuando el sitio esté en vivo. Mientras tanto, envíe su solicitud en la otra pestaña y le configuramos la cuenta.",
    "Don't have an account?": "¿No tiene cuenta?",
    ". Contractors, technicians and local customers get account pricing.": ". Contratistas, técnicos y clientes locales obtienen precios de cuenta.", "Rep dashboard": "Panel de vendedor", "Email (your login)": "Correo (su usuario)",
    "Your role": "Su puesto", "Contractor / company owner": "Contratista / dueño de empresa", "HVAC technician": "Técnico de HVAC",
    "Installer": "Instalador", "Salesperson": "Vendedor", "Property manager / business": "Administrador de propiedades / empresa", "Homeowner": "Propietario de vivienda",
    "City": "Ciudad", "State": "Estado", "Areas you serve": "Áreas que atiende",
    "Open my rep dashboard": "Abrir mi panel de vendedor", "Your sign-up link:": "Su enlace de registro:",
    "Contractor or business": "Contratista o empresa", "Account pricing on every system and part": "Precios de cuenta en cada sistema y pieza",
    "Local customer": "Cliente local", "Within 2 hours of DFW? Apply for local customer pricing": "¿A menos de 2 horas de DFW? Solicite precios de cliente local",
    "Your ZIP code": "Su código postal",
    "✓ Within our local area (about 2 hours of DFW)": "✓ Dentro de nuestra zona local (unas 2 horas de DFW)",
    "Outside our local area, but apply as a contractor or text us": "Fuera de nuestra zona local, pero puede solicitar como contratista o escribirnos",
    "Anyone can buy: contractors, businesses and homeowners. A contractor license isn't required. If you have one, you can add it to your order.":
      "Cualquiera puede comprar: contratistas, empresas y propietarios. No se requiere licencia de contratista. Si tiene una, puede agregarla a su pedido.",
    "Full name *": "Nombre completo *", "Phone *": "Teléfono *", "Email *": "Correo electrónico *", "Street address *": "Dirección *",
    "Apt / suite (optional)": "Apto / suite (opcional)", "City *": "Ciudad *", "State *": "Estado *", "ZIP (above)": "Código postal (arriba)",
    "Company name (optional)": "Nombre de la empresa (opcional)",
    "Warranty registration:": "Registro de garantía:",
    "Northgate registers all manufacturer warranties under our dealer account and handles any warranty claims for you. Just contact us if something goes wrong.":
      "Northgate registra todas las garantías del fabricante en nuestra cuenta de distribuidor y se encarga de cualquier reclamo de garantía. Solo contáctenos si algo falla.",
    "I understand and agree.": "Entiendo y acepto.",
    "Near-DFW delivery discount": "Descuento por entrega cerca de DFW",
    "Check the warranty box to continue.": "Marque la casilla de garantía para continuar.",
    "CONTRACTORS & BULK BUYERS": "CONTRATISTAS Y COMPRAS AL MAYOREO",
    "HVAC contractor or buying in bulk?": "¿Es contratista de HVAC o compra al mayoreo?",
    "Get your own": "Obtenga sus propios", "contractor pricing": "precios de contratista",
    ", lower than our listed prices on every system and part. Apply in 2 minutes or contact us for a quote.":
      ", más bajos que nuestros precios publicados en cada sistema y pieza. Solicite en 2 minutos o contáctenos para una cotización.",
    "Apply now": "Solicitar ahora", "Contact us": "Contáctenos",
    // ---- Online checkout + contractor accounts (account.js)
    "Pay online": "Pagar en línea", "or order by message": "o pida por mensaje",
    "Card, bank transfer (ACH), Apple Pay / Google Pay, or": "Tarjeta, transferencia bancaria (ACH), Apple Pay / Google Pay, o",
    "monthly payments": "pagos mensuales", "with Klarna.": "con Klarna.",
    "Text or email: nothing is charged; we confirm stock, then send your invoice or pickup details. Paying online is processed securely by Stripe.":
      "Por mensaje o correo: no se cobra nada; confirmamos inventario y le enviamos su factura o detalles de recogida. El pago en línea lo procesa Stripe de forma segura.",
    "Online payment isn't switched on yet. Please send your order by text or email below and we'll invoice you.":
      "El pago en línea todavía no está activado. Envíe su pedido por mensaje o correo abajo y le enviaremos la factura.",
    "Enter the ZIP code where it's going, then tap Pay online.": "Ingrese el código postal de entrega y toque Pagar en línea.",
    "Add something to your order first.": "Primero agregue algo a su pedido.",
    "Something in your order needs a price quote. Please text or email your order.": "Algo en su pedido necesita cotización. Envíe su pedido por mensaje o correo.",
    "Alaska, Hawaii and territories need a freight quote. Please text or email your order.": "Alaska, Hawái y territorios necesitan cotización de flete. Envíe su pedido por mensaje o correo.",
    "Couldn't reach the payment page. Check your connection, or text/email your order.": "No se pudo abrir la página de pago. Revise su conexión o envíe su pedido por mensaje o correo.",
    "Or": "O", "pay monthly": "pague mensualmente", "with Klarna. Pick it at checkout.": "con Klarna. Elíjalo al pagar.",
    "Your price": "Su precio", "Your contractor price": "Su precio de contratista",
    "Apply for an account": "Solicitar una cuenta", "Sign in": "Iniciar sesión", "Contractor sign in": "Acceso para contratistas",
    "Create a password": "Cree una contraseña", "Create account & apply": "Crear cuenta y solicitar",
    "or send your application by message": "o envíe su solicitud por mensaje", "Password": "Contraseña",
    "Forgot password? Email me a link": "¿Olvidó su contraseña? Envíenme un enlace",
    "Your contractor account": "Su cuenta de contratista", "Recent orders": "Pedidos recientes", "Sign out": "Cerrar sesión",
    "No online orders yet.": "Todavía no hay pedidos en línea.", "My account": "Mi cuenta",
    "Waiting for approval": "En espera de aprobación", "Approved: your contractor prices are on": "Aprobada: sus precios de contratista están activos",
    "Your contractor account is waiting for approval. You'll see your prices as soon as we approve it.":
      "Su cuenta de contratista está en espera de aprobación. Verá sus precios en cuanto la aprobemos.",
    "Wrong email or password.": "Correo o contraseña incorrectos.", "Enter your email first.": "Primero ingrese su correo.",
    "Check your email for a link to reset your password.": "Revise su correo: le enviamos un enlace para cambiar su contraseña.",
    "Enter your name, email and a password of at least 8 characters.": "Ingrese su nombre, correo y una contraseña de al menos 8 caracteres.",
    "Thank you, your order is in!": "¡Gracias, recibimos su pedido!", "Payment not finished": "El pago no se completó",
    "No charge was made. Your order is still saved; you can pay again or send it by text or email.":
      "No se hizo ningún cargo. Su pedido sigue guardado; puede pagar de nuevo o enviarlo por mensaje o correo.",
    "Paid by bank transfer? It takes 3–5 business days to clear; we ship once it does.":
      "¿Pagó por transferencia bancaria? Tarda de 3 a 5 días hábiles en acreditarse; enviamos cuando se acredite.",
 "from": "desde", "Home systems": "Sistemas residenciales", "Home systems · parts": "Sistemas residenciales · piezas",
    "Home systems · parts · commercial rooftop": "Sistemas residenciales · piezas · techo comercial", "Home systems · commercial rooftop": "Sistemas residenciales · techo comercial",
    "Commercial rooftop": "Unidades comerciales de techo",
    "units to choose from": "unidades para elegir", "TONS": "TONELADAS", "tons": "toneladas", "starting price": "precio desde",
    "Gas / electric rooftop units": "Unidades de techo gas / eléctricas", "Heat pump rooftop units": "Unidades de techo con bomba de calor",
    "Straight cool rooftop units": "Unidades de techo solo enfriamiento",
    "Free freight to your job site": "Flete gratis a su obra", "Have a forklift on site to unload. Unloading help is extra.": "Tenga un montacargas para descargar. La ayuda con la descarga es extra.",
    "Freight comes off with local pickup in": "Le quitamos el flete si recoge en",
    "Free freight to your job site · forklift needed to unload": "Flete gratis a su obra · se necesita montacargas para descargar",
    "How commercial units are delivered": "Cómo se entregan las unidades comerciales",
    "We recommend shipping straight to the job site. Freight is included in the price.": "Recomendamos enviarlas directo a la obra. El flete está incluido en el precio.",
    "The truck driver does not unload. Have a forklift and operator on site (or a crane to set it on the roof).": "El chofer no descarga. Tenga un montacargas y operador en el sitio (o una grúa para subirla al techo).",
    "Need us to handle unloading or the crane? We can arrange it for an extra charge, quoted with your order.": "¿Necesita que nosotros nos encarguemos de la descarga o la grúa? Lo coordinamos con un cargo extra, cotizado con su pedido.",
    "Picking up in DFW instead takes the whole freight charge off. Bring a trailer rated for the unit's weight.": "Si la recoge en DFW le quitamos todo el flete. Traiga un remolque con capacidad para el peso de la unidad.",
    "Commercial units:": "Unidades comerciales:",
    "ship them to the job site. The driver does not unload, so have a forklift and operator there (or a crane for the roof).": "envíelas a la obra. El chofer no descarga, así que tenga un montacargas y operador (o una grúa para el techo).",
    "I need unloading help (forklift or crane)": "Necesito ayuda para descargar (montacargas o grúa)", "Quoted extra": "Se cotiza aparte",
    "How are commercial rooftop units delivered?": "¿Cómo se entregan las unidades comerciales de techo?",
    "Curbs, economizers and accessories quoted separately": "Bases (curbs), economizadores y accesorios se cotizan aparte",
  };

  // Product-type names used inside other strings
  const TYPE_ES = {
    "Electric AC System": "Sistema de A/C eléctrico", "Gas AC System": "Sistema de A/C con horno de gas",
    "Heat Pump System": "Sistema de bomba de calor", "Split AC System": "Sistema de A/C dividido",
    "Condenser": "Condensadora", "Heat Pump Condenser": "Condensadora de bomba de calor", "Air Handler": "Manejadora de aire",
    "Furnace": "Horno", "Coil": "Serpentín", "Heat Kit": "Kit de calefacción",
    "Gas/Electric Rooftop": "Unidad de techo gas/eléctrica", "Heat Pump Rooftop": "Unidad de techo con bomba de calor",
    "Cooling Only Rooftop": "Unidad de techo solo enfriamiento",
  };
  const plural = (n, one, many) => (+n === 1 ? one : many);

  // Patterns (applied in order). Replacement may be a string or function.
  const RULES = [
    [/^Referred by (.+?) \(Northgate sales rep\)\. Your account will be set up with them\.$/, "Recomendado por $1 (vendedor de Northgate). Su cuenta quedará con esa persona."],
    [/^Signed in as Northgate sales rep \((.+)\)\.$/, "Sesión iniciada como vendedor de Northgate ($1)."],
    [/\bGoodman ([\d.]+)-Ton ([\d.]+) SEER2 Gas Furnace System/g, "Sistema de A/C con horno de gas Goodman de $1 toneladas, $2 SEER2"],
    [/^Goodman GR9S80 80% AFUE ([\d,]+) BTU Single-Stage Multi-Speed ECM Gas Furnace, ([\d.]+)" Wide \(Upflow\/Horizontal\)$/, "Horno de gas Goodman GR9S80 80% AFUE de $1 BTU, una etapa, ECM multivelocidad, $2\" de ancho (flujo ascendente/horizontal)"],
    [/^Goodman CAPTA ([\d.–]+) Ton R-32 Cased Evaporator Coil, ([\d.]+)" Wide \(Upflow\/Downflow\)$/, "Serpentín evaporador encapsulado Goodman CAPTA de $1 toneladas R-32, $2\" de ancho (flujo ascendente/descendente)"],
    [/^Please fill in your (.+)\.( Check the warranty box to continue\.)?$/, (m, list, w) => `Por favor complete: ${list.replace("full name", "nombre completo").replace("phone", "teléfono").replace("a valid email", "un correo válido").replace("email", "correo").replace("street address", "dirección").replace("city", "ciudad").replace("state", "estado").replace("ZIP code", "código postal")}.${w ? " Marque la casilla de garantía para continuar." : ""}`],
    [/^Near DFW: lower delivery price to (\d+) · ships in (.*)$/, (m, z, d) => `Cerca de DFW: precio de entrega más bajo a ${z} · se envía en ${d.replace("business days", "días hábiles")}`],
    [/^(\d+) items? · near-DFW delivery, (\$[\d,]+) off$/, "$1 artículo(s) · entrega cerca de DFW, $2 menos"],
    [/(\d+) kW heat kit\b/g, "kit de calefacción de $1 kW"],
    // Commercial rooftop unit titles
    [/\b(Carrier|Bryant) ([\d.]+)-Ton (?:(\S+) )?(Gas Heat \/ Electric Cool|Heat Pump|Cooling Only) Packaged Rooftop Unit(?:, (\S+) BTU Gas Heat)?/g,
      (m, b, t, series, k, heat) => `Unidad paquete de techo ${{ "Gas Heat / Electric Cool": "gas/eléctrica", "Heat Pump": "con bomba de calor", "Cooling Only": "solo enfriamiento" }[k]} ${b}${series ? " " + series : ""} de ${t} toneladas${heat ? `, calefacción a gas de ${heat} BTU` : ""}`],
    // Product titles
    [/\b(Carrier|Goodman) ([\d.]+)-Ton Electric AC System/g, "Sistema de A/C eléctrico $1 de $2 toneladas"],
    [/\bTrane ([\d.]+)-Ton (XR1\d) Gas AC System/g, "Sistema de A/C con horno de gas Trane $2 de $1 toneladas"],
    [/\bTrane ([\d.]+)-Ton (XR1\d) Electric AC System/g, "Sistema de A/C eléctrico Trane $2 de $1 toneladas"],
    [/^Trane (XR1\d) ([\d.]+) Ton ([\d.]+) SEER2 Single-Stage AC Condenser \(R-454B\)$/, "Condensadora de A/C Trane $1 de $2 toneladas, $3 SEER2, una etapa (R-454B)"],
    [/^Trane 5TEM4 ([\d.–]+) Ton Multi-Speed Convertible Air Handler, ([\d.]+)" Wide \(R-454B\)$/, "Manejadora de aire convertible Trane 5TEM4 de $1 toneladas, $2\" de ancho (R-454B)"],
    [/^Trane (\d+) kW Electric Heat Kit with Circuit Breakers \((\w+)\)$/, "Kit de calefacción eléctrica Trane de $1 kW con breakers ($2)"],
    [/^208\/230V condenser · (\d+)V furnace$/, "Condensadora 208/230V · horno $1V"],
    [/\b(Carrier|Goodman) ([\d.]+)-Ton Gas AC System/g, "Sistema de A/C con horno de gas $1 de $2 toneladas"],
    [/\b(Carrier|Goodman) ([\d.]+)-Ton ([\d.]+) SEER2 Split AC System/g, "Sistema de A/C dividido $1 de $2 toneladas, $3 SEER2"],
    [/\b(Carrier|Goodman) ([\d.]+)-Ton ([\d.]+) SEER2 Heat Pump System/g, "Sistema de bomba de calor $1 de $2 toneladas, $3 SEER2"],
    [/\b(Carrier|Goodman) ([\d.]+)-Ton Heat Pump System/g, "Sistema de bomba de calor $1 de $2 toneladas"],
    [/\b(Carrier|Goodman) ([\d.]+)-Ton AC Condenser/g, "Condensadora de A/C $1 de $2 toneladas"],
    [/\b(Carrier|Goodman) ([\d.]+)-Ton Heat Pump Condenser/g, "Condensadora de bomba de calor $1 de $2 toneladas"],
    [/\b(Carrier|Goodman) ([\d.]+)-Ton Multipoise Air Handler/g, "Manejadora de aire multiposición $1 de $2 toneladas"],
    [/\b(Carrier|Goodman) ([\d.]+)-Ton Cased Evaporator Coil/g, "Serpentín evaporador con gabinete $1 de $2 toneladas"],
    [/\b(Carrier|Goodman) (\d+)k BTU 80% Gas Furnace/g, "Horno de gas 80% $1 de $2k BTU"],
    [/\b(Carrier|Goodman) (\d+) kW Electric Heat Kit/g, "Kit de calefacción eléctrica $1 de $2 kW"],
    // Component full names
    [/^([\d.]+) Ton Up to ([\d.]+) SEER2 Air Conditioner Condensing Unit \(R-454B\)$/, "Unidad condensadora de A/C de $1 toneladas, hasta $2 SEER2 (R-454B)"],
    [/^([\d.]+) Ton 14\.3 SEER2 Residential Heat Pump Condensing Unit \(R-454B\)$/, "Condensadora de bomba de calor residencial de $1 toneladas, 14.3 SEER2 (R-454B)"],
    [/^([\d.]+) Ton Residential Fan Coil, Multipoise, R-454B \(Aluminum Coil\)$/, "Manejadora (fan coil) residencial de $1 toneladas, multiposición, R-454B (serpentín de aluminio)"],
    [/^([\d.]+) Ton Evaporator Coil, Cased Upflow\/Downflow, Painted ([\d.]+)" Width \(R-454B\)$/, "Serpentín evaporador de $1 toneladas, con gabinete, ascendente/descendente, pintado, $2\" de ancho (R-454B)"],
    [/^([\d.]+) Ton Multipoise Cased Evaporator A-Coil, ([\d.]+)" Wide \(R-454B\)$/, "Serpentín evaporador en A multiposición con gabinete de $1 toneladas, $2\" de ancho (R-454B)"],
    [/^(\d+) kW Electric Heater Kit with Circuit Breaker, 230V 1-Phase$/, "Kit de calefacción eléctrica de $1 kW con breaker, 230V monofásico"],
    [/^Carrier® Comfort™ 80% AFUE ([\d,]+) BTU Multi-Speed ECM Multipoise Gas Furnace$/, "Horno de gas Carrier® Comfort™ 80% AFUE de $1 BTU, ECM multivelocidad, multiposición"],
    [/^Goodman ([\d.]+) Ton Up to 15\.2 SEER2 R-32 Cooling Only Condenser$/, "Condensadora Goodman solo frío de $1 toneladas, hasta 15.2 SEER2, R-32"],
    [/^Goodman ([\d.]+) Ton Up to 15\.2 SEER2 R-32 Heat Pump Condenser$/, "Condensadora de bomba de calor Goodman de $1 toneladas, hasta 15.2 SEER2, R-32"],
    [/^Goodman ([\d.]+) Ton R-32 Multi-Position ECM Air Handler with Internal TXV$/, "Manejadora de aire Goodman de $1 toneladas, R-32, multiposición, ECM, con TXV interna"],
    [/^Goodman (\d+) kW Electric Heat Kit with Circuit Breaker \((\w+)\)$/, "Kit de calefacción eléctrica Goodman de $1 kW con breaker ($2)"],
    [/^Goodman (\d+) kW Electric Heat Kit without Breaker \((\w+)\)$/, "Kit de calefacción eléctrica Goodman de $1 kW sin breaker ($2)"],
    // Counts, prices, sizes
    [/^(\d+) products? · from (\$[\d,]+)$/, (m, n, p) => `${n} ${plural(n, "producto", "productos")} · desde ${p}`],
    [/^(\d+) products?$/, (m, n) => `${n} ${plural(n, "producto", "productos")}`],
    [/^(\d+) match(?:es)?$/, (m, n) => `${n} ${plural(n, "resultado", "resultados")}`],
    [/^See all (\d+) results? for "(.*)" →$/, 'Ver los $1 resultados de "$2" →'],
    [/^No matches for "(.*)"\. Try a tonnage like "3 ton" or a model number, or$/, 'Sin resultados para "$1". Pruebe un tonelaje como "3 ton" o un número de modelo, o'],
    [/^From (\$[\d,]+)$/, "Desde $1"],
    [/^(\d+) items?\b/, (m, n) => `${n} ${plural(n, "artículo", "artículos")}`],
    [/^Save (\$[\d,]+) → (\$[\d,]+)$/, "Ahorre $1 → $2"],
    [/^Free curbside shipping to (\d+) · ships in (.*)$/, (m, z, d) => `Envío gratis a la acera a ${z} · se envía en ${d.replace("business days", "días hábiles")}`],
    [/^Installing in (\d+)$/, "Instalación en $1"],
    [/^Complete ([\d.]+)-ton system from$/, "Sistema completo de $1 toneladas desde"],
    [/^(\d+) (.+) systems$/, (m, n, kinds) => `${n} sistemas de ${kinds.replace(/\bAC\b/g, "A/C").replace(/heat pump/g, "bomba de calor").replace(/, (?=[^,]*$)/, " y ").replace(/, /g, ", ")}`],
    [/^([\d.]+) to ([\d.]+) ton · (R-\w+)$/, "$1 a $2 toneladas · $3"],
    [/^([\d.]+) to ([\d.]+) ton · (R-[\w-]+) \/ (R-[\w-]+)$/, "$1 a $2 toneladas · $3 / $4"],
    [/^(\d+) commercial rooftop units$/, "$1 unidades comerciales de techo"],
    [/^(\d+) units · ([\d.]+) to ([\d.]+) ton$/, "$1 unidades · $2 a $3 toneladas"],
    [/^(\d+) systems · ([\d.]+) to ([\d.]+) ton$/, "$1 sistemas · $2 a $3 toneladas"],
    [/^Show (\d+) more$/, "Ver $1 más"],
    [/^Check out · pay (\$[\d,]+) for your system →$/, "Pagar · $1 por su sistema →"],
    [/^([\d.]+) ton$/, "$1 toneladas"],
    [/^Labor warranty \((\d+) yr\)$/, "Garantía de mano de obra ($1 años)"],
    [/^Below the typical price (in .+|nationally)$/, (m, w) => `Por debajo del precio típico ${w.replace(/^in /, "en ").replace("nationally", "a nivel nacional")}`],
    [/^In the lower half of the typical price range (in .+|nationally)$/, (m, w) => `En la mitad baja del rango de precio típico ${w.replace(/^in /, "en ").replace("nationally", "a nivel nacional")}`],
    [/^ · up to (\$[\d,]+) less$/, " · hasta $1 menos"],
    [/^Typical installed price (in .+|nationally): (\$[\d,]+) – (\$[\d,]+) · Source: 2026 published HVAC cost guides$/, (m, w, a, b) => `Precio típico instalado ${w.replace(/^in /, "en ").replace("nationally", "a nivel nacional")}: ${a} – ${b} · Fuente: guías de costos de HVAC publicadas en 2026`],
    [/^Showing (\d+) of (\d+)$/, "Mostrando $1 de $2"],
    [/^Shop (\w+) →$/, "Ver $1 →"],
    [/^from (\$[\d,]+)$/, "desde $1"],
    [/^([\d.]+) Ton$/, "$1 toneladas"],
    [/^(\d+) kW heat standard$/, "Calefacción de $1 kW incluida"],
    [/^(\d+)k BTU furnace standard$/, "Horno de $1k BTU incluido"],
    [/^· (.+) available$/, (m, list) => `· también ${list.replace(/ or /g, " o ")}`],
    [/^· (.+) available · 80% AFUE$/, (m, list) => `· también ${list.replace(/ or /g, " o ")} · 80% AFUE`],
    [/^Heat kit optional · add (\d+) to (\d+) kW$/, "Kit de calefacción opcional · agregue de $1 a $2 kW"],
    [/^Heat kit optional · add ([\d, ]+) or (\d+) kW$/, "Kit de calefacción opcional · agregue $1 o $2 kW"],
    [/^Backup heat kit optional · add (\d+) to (\d+) kW$/, "Kit de respaldo opcional · agregue de $1 a $2 kW"],
    [/^Heat pump \+ (\d+) kW electric backup$/, "Bomba de calor + $1 kW eléctrica de respaldo"],
    [/^(\d+) kW electric backup$/, "$1 kW eléctrica de respaldo"],
    [/^(\d+) kW electric$/, "$1 kW eléctrica"],
    [/^(\d+) kW heat kit added$/, "Kit de $1 kW agregado"],
    [/^([\d,]+) BTU gas · 80% AFUE$/, "$1 BTU a gas · 80% AFUE"],
    [/· (\d+) kW heat\b/g, "· calefacción de $1 kW"],
    [/· (\d+) kW heat kit\b/g, "· kit de calefacción de $1 kW"],
    [/· (\d+)k BTU furnace\b/g, "· horno de $1k BTU"],
    [/^Local pickup in DFW · you save (\$[\d,]+)$/, "Recogida local en DFW · ahorra $1"],
    [/^(\$[\d,]+) extra$/, "$1 adicional"],
    [/^Up to ([\d.]+)$/, "Hasta $1"],
    [/· (\$[\d,]+) each$/, "· $1 c/u"],
    [/^Individual part · (.+)$/, (m, t) => `Pieza individual · ${TYPE_ES[t] || t}`],
    [/^No (.+) match your filters$/, "No hay resultados con sus filtros"],
    [/^Active filters: /, "Filtros activos: "],
    [/^(.+): coming soon$/, "$1: muy pronto"],
    [/^Buying (?:a|an) (condenser|air handler|furnace|coil|heat kit) plus the rest of the parts separately costs more than a matched system\. Complete systems \(outdoor unit \+ indoor unit \+ heat\) start at (\$[\d,]+) with free shipping, and save (\$[\d,]+) each with local pickup\.$/,
      (m, part, from, save) => `Comprar ${({ condenser: "una condensadora", "air handler": "una manejadora", furnace: "un horno", coil: "un serpentín", "heat kit": "un kit de calefacción" })[part]} y el resto de las piezas por separado cuesta más que un sistema completo. Los sistemas completos (unidad exterior + interior + calefacción) empiezan en ${from} con envío gratis, y ahorra ${save} c/u al recogerlos.`],
    [/^The (\S+) BTU furnace is ([\d.]+)" wide and the coil is ([\d.]+)" wide\. They connect with a standard transition at install, a small, common adjustment\.$/,
      'El horno de $1 BTU mide $2" de ancho y el serpentín $3". Se conectan con una transición estándar al instalar, un ajuste pequeño y común.'],
    [/^Heads up: (.+) doesn't meet the (\w+) efficiency minimum for new AC installs\. Pick a higher-SEER2 unit, or text us\.$/,
      "Aviso: $1 no cumple el mínimo de eficiencia de la región $2 para instalaciones nuevas de A/C. Elija una unidad con más SEER2 o escríbanos."],
    [/^Fits ([\d.]+) – ([\d.]+) ton fan coils$/, "Para fan coils de $1 – $2 toneladas"],
    [/^Fits (.+)$/, "Compatible con $1"],
    [/^✓ (\d+) in your order ·$/, "✓ $1 en su pedido ·"],
    [/^([\d.]+) – ([\d.]+) ton fan coils$/, "Fan coils de $1 – $2 toneladas"],
    [/^(Condenser|Air Handler|Heat Kit|Coil|Furnace|Heat Pump): (.+)$/, (m, r, x) => `${DICT[r] || r}: ${x}`],
    [/local pickup, (\$[\d,]+) off/g, "recogida local, $1 de descuento"],
    [/\bfree shipping\b/g, "envío gratis"],
  ];

  // Word/phrase swaps for spec values (longest first)
  const PHRASES = [
    ["depending on matched indoor unit", "según la unidad interior"], ["depends on matched indoor unit", "según la unidad interior"],
    ["depends on indoor match", "según la unidad interior"], ["as listed by distributor", "según el distribuidor"],
    ["cooling & heating", "enfriamiento y calefacción"], ["(for 15 ft of 3/8\" liquid line)", "(para 15 pies de línea de líquido de 3/8\")"],
    ["(25 ft line set)", "(juego de líneas de 25 pies)"], ["suction valve", "válvula de succión"],
    ["condenser above evaporator", "condensadora sobre el evaporador"], ["evaporator above condenser", "evaporador sobre la condensadora"],
    ["outdoor unit above indoor", "unidad exterior sobre la interior"], ["indoor above outdoor", "interior sobre la exterior"],
    ["filter rack not included", "sin soporte de filtro"], ["filter rack included", "con soporte de filtro"],
    ["18-speed constant-torque ECM", "ECM de par constante de 18 velocidades"], ["multi-speed ECM", "ECM multivelocidad"],
    ["multi-tap ECM", "ECM de múltiples velocidades"], ["vertical discharge", "descarga vertical"],
    ["with vapor barrier", "con barrera de vapor"], ["thick", "de espesor"], ["sweat or braze", "soldadura blanda o fuerte"],
    ["PSC motor", "motor PSC"], ["blade", "aspas"], ["wheel", "rueda"], ["cabinet", "gabinete"], ["(ship ", "(envío "],
    ["1-phase", "monofásico"], [" wide", " de ancho"], ["cooling", "enfriamiento"], ["heating", "calefacción"],
    ["heating elements", "resistencias"], ["fan coils", "fan coils"], ["ton)", "toneladas)"], ["Up to", "Hasta"], ["up to", "hasta"],
    [", sweat", ", soldar"], ["nominal", "nominal"],
  ];

  const ES_ATTRS = ["placeholder", "aria-label", "title"];
  const origText = new WeakMap();   // text node -> original English
  const origAttr = new WeakMap();   // element -> {attr: original}
  let lang = "en";
  try { lang = localStorage.getItem("lang") || "en"; } catch (e) {}

  function toSpanish(en) {
    const t = en.replace(/\s+/g, " ").trim();
    if (!t || !/[a-z]/i.test(t)) return en;
    let out = DICT[t];
    if (out == null) {
      out = t;
      for (const [re, rep] of RULES) out = out.replace(re, rep);
      if (out === t) for (const [a, b] of PHRASES) out = out.split(a).join(b);
    }
    // keep the original leading/trailing spaces
    const lead = en.match(/^\s*/)[0], trail = en.match(/\s*$/)[0];
    return lead + out + trail;
  }

  function translateNode(n) {
    if (n.nodeType === 3) {
      const p = n.parentElement;
      if (!p || /SCRIPT|STYLE|TEXTAREA/.test(p.tagName) || p.closest("[data-no-i18n]")) return;
      let orig = origText.get(n);
      // text changed by the app since we last translated it -> treat as new English
      if (orig == null || (n.nodeValue !== orig && n.nodeValue !== toSpanish(orig))) { orig = n.nodeValue; origText.set(n, orig); }
      const want = lang === "es" ? toSpanish(orig) : orig;
      if (n.nodeValue !== want) n.nodeValue = want;
      return;
    }
    if (n.nodeType !== 1 || n.closest?.("[data-no-i18n]")) return;
    let saved = origAttr.get(n);
    for (const a of ES_ATTRS) {
      if (!n.hasAttribute(a)) continue;
      if (!saved) { saved = {}; origAttr.set(n, saved); }
      const cur = n.getAttribute(a);
      if (saved[a] == null || (cur !== saved[a] && cur !== toSpanish(saved[a]))) saved[a] = cur;
      const want = lang === "es" ? toSpanish(saved[a]) : saved[a];
      if (cur !== want) n.setAttribute(a, want);
    }
    for (const c of n.childNodes) translateNode(c);
  }

  let busy = false;
  const observer = new MutationObserver(muts => {
    if (busy) return;
    busy = true;
    for (const m of muts) {
      if (m.type === "characterData") translateNode(m.target);
      else if (m.type === "attributes") translateNode(m.target);
      else m.addedNodes.forEach(translateNode);
    }
    busy = false;
  });

  // ---- Floating language button + one-time invitation
  const css = document.createElement("style");
  css.textContent = `
    .lang-fab { position: fixed; left: 16px; bottom: 16px; z-index: 45; display: inline-flex; align-items: center; gap: 8px;
      background: #13335e; color: #fff; border: 2px solid #fff; border-radius: 999px; padding: 10px 16px; font: 700 14px Roboto, Arial, sans-serif;
      box-shadow: 0 6px 20px rgba(12,34,64,.35); cursor: pointer; }
    .lang-fab:hover { background: #0c2240; }
    .lang-fab svg { width: 18px; height: 18px; }
    body.has-order .lang-fab { bottom: 80px; }
    .lang-invite { position: fixed; left: 16px; bottom: 76px; z-index: 46; width: min(300px, calc(100vw - 32px)); background: #fff; border: 1px solid #d8dce2;
      border-radius: 8px; box-shadow: 0 12px 32px rgba(20,35,60,.2); padding: 14px 16px; font: 14px/1.4 Roboto, Arial, sans-serif; color: #1f2733; }
    body.has-order .lang-invite { bottom: 140px; }
    .lang-invite b { display: block; font-size: 15px; margin-bottom: 4px; }
    .lang-invite .row { display: flex; gap: 8px; margin-top: 10px; }
    .lang-invite button { flex: 1; border-radius: 4px; padding: 8px; font: 500 14px Roboto, Arial, sans-serif; cursor: pointer; border: 1px solid #d8dce2; background: #fff; }
    .lang-invite .yes { background: #2b8a3e; border-color: #2b8a3e; color: #fff; }
  `;
  document.head.appendChild(css);
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "lang-fab";
  fab.setAttribute("data-no-i18n", "");
  fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg><span></span>`;
  document.body.appendChild(fab);

  function setLang(l) {
    lang = l;
    try { localStorage.setItem("lang", l); } catch (e) {}
    document.documentElement.lang = l;
    fab.querySelector("span").textContent = l === "es" ? "English" : "Español";
    fab.setAttribute("aria-label", l === "es" ? "Switch to English" : "Ver en español");
    busy = true; translateNode(document.body); busy = false;
    document.querySelector(".lang-invite")?.remove();
  }
  fab.onclick = () => setLang(lang === "es" ? "en" : "es");

  // The order bar sits at the bottom; lift the button above it when it's showing.
  const bar = document.getElementById("orderBar");
  const syncBar = () => document.body.classList.toggle("has-order", !!bar && bar.classList.contains("show"));
  if (bar) new MutationObserver(syncBar).observe(bar, { attributes: true, attributeFilter: ["class"] });
  syncBar();

  window.I18N = { get lang() { return lang; }, setLang };
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ES_ATTRS });
  setLang(lang);

  // One-time invitation (bilingual), shown a moment after the first visit
  let seen = false;
  try { seen = !!localStorage.getItem("langInviteSeen"); } catch (e) {}
  if (!seen && lang === "en") setTimeout(() => {
    if (window.I18N.lang === "es") return;
    const box = document.createElement("div");
    box.className = "lang-invite";
    box.setAttribute("data-no-i18n", "");
    box.innerHTML = `<b>¿Prefiere español?</b>Vea todo el sitio en español: precios, especificaciones y pedidos.
      <div class="row"><button type="button" class="yes">Ver en español</button><button type="button" class="no">No, thanks</button></div>`;
    box.querySelector(".yes").onclick = () => setLang("es");
    box.querySelector(".no").onclick = () => box.remove();
    document.body.appendChild(box);
    try { localStorage.setItem("langInviteSeen", "1"); } catch (e) {}
  }, 2500);
})();
