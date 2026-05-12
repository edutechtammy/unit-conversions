/* ================================================================
   UNIT CONVERSIONS — PROBLEM DATA
   ================================================================
   Schema for each problem object:
   {
     id:          string   — unique identifier
     level:       1|2|3|4  — 1=one-step, 2=multi-step,
                             3=double-unit, 4=squared/cubed
     dept:        'physics'|'chemistry'|'both'
     context:     string   — optional real-world framing sentence
     question:    string   — the question to answer
     given: {
       value:     number   — the starting quantity
       unit:      string   — the starting unit (display string)
     },
     factors: [           — ALL factors shown in the bank
       {
         id:      string
         numVal:  number   — numerical part of numerator
         numUnit: string   — unit part of numerator  ('' if pure number)
         denVal:  number   — numerical part of denominator
         denUnit: string   — unit part of denominator
         label:   string   — accessible label, e.g. "1 km per 1000 m"
       }
     ],
     solution: [          — ORDERED correct factor ids (canonical path)
       string
     ],
     answer: {
       value:     number   — expected numerical result
       unit:      string   — expected unit string
       tolerance: number   — fractional tolerance (0.01 = ±1 %)
     },
     hints: [string]      — up to 3 progressive hints
   }
================================================================ */

'use strict';

const PROBLEMS = [

    /* ==============================================================
       LEVEL 1 — ONE-STEP
    ============================================================== */

    // ── Physics ───────────────────────────────────────────────────

    {
        id: 'p1-01',
        level: 1,
        dept: 'physics',
        context: 'Distance measurements in science are usually expressed in SI units.',
        question: 'A road sign says a town is 4.5 km away. How many metres is that?',
        given: { value: 4.5, unit: 'km' },
        factors: [
            {
                id: 'f-km-m', numVal: 1000, numUnit: 'm', denVal: 1, denUnit: 'km',
                label: '1000 metres per 1 kilometre'
            },
            {
                id: 'f-m-cm', numVal: 100, numUnit: 'cm', denVal: 1, denUnit: 'm',
                label: '100 centimetres per 1 metre'
            },
            {
                id: 'f-km-cm', numVal: 100000, numUnit: 'cm', denVal: 1, denUnit: 'km',
                label: '100 000 centimetres per 1 kilometre — distractor'
            },
        ],
        solution: ['f-km-m'],
        answer: { value: 4500, unit: 'm', tolerance: 0.01 },
        hints: [
            'You are starting with km and need to end with m. Look for a factor that has km in the denominator.',
            'The factor "1000 m / 1 km" will cancel km and leave m.',
            '4.5 km × (1000 m / 1 km) = 4500 m',
        ],
    },

    {
        id: 'p1-02',
        level: 1,
        dept: 'physics',
        context: 'Time conversions are needed when working with rates.',
        question: 'An experiment lasts 2.5 hours. How many seconds is that?',
        given: { value: 2.5, unit: 'hr' },
        factors: [
            {
                id: 'f-hr-min', numVal: 60, numUnit: 'min', denVal: 1, denUnit: 'hr',
                label: '60 minutes per 1 hour'
            },
            {
                id: 'f-min-s', numVal: 60, numUnit: 's', denVal: 1, denUnit: 'min',
                label: '60 seconds per 1 minute'
            },
            {
                id: 'f-hr-s', numVal: 3600, numUnit: 's', denVal: 1, denUnit: 'hr',
                label: '3600 seconds per 1 hour'
            },
        ],
        solution: ['f-hr-s'],
        answer: { value: 9000, unit: 's', tolerance: 0.01 },
        hints: [
            'You need hr → s. Is there a single factor that does this directly?',
            'Yes: 3600 s / 1 hr.',
            '2.5 hr × (3600 s / 1 hr) = 9000 s',
        ],
    },

    {
        id: 'p1-03',
        level: 1,
        dept: 'physics',
        context: 'Mass is commonly measured in grams in the lab but kilograms in SI.',
        question: 'A sample has a mass of 350 g. What is its mass in kilograms?',
        given: { value: 350, unit: 'g' },
        factors: [
            {
                id: 'f-g-kg', numVal: 1, numUnit: 'kg', denVal: 1000, denUnit: 'g',
                label: '1 kilogram per 1000 grams'
            },
            {
                id: 'f-g-mg', numVal: 1000, numUnit: 'mg', denVal: 1, denUnit: 'g',
                label: '1000 milligrams per 1 gram — distractor'
            },
            {
                id: 'f-kg-lb', numVal: 2.205, numUnit: 'lb', denVal: 1, denUnit: 'kg',
                label: '2.205 pounds per 1 kilogram — distractor'
            },
        ],
        solution: ['f-g-kg'],
        answer: { value: 0.35, unit: 'kg', tolerance: 0.01 },
        hints: [
            'You have grams and need kilograms. Find the factor with g in the denominator and kg in the numerator.',
            'Use: 1 kg / 1000 g',
            '350 g × (1 kg / 1000 g) = 0.35 kg',
        ],
    },

    // ── Chemistry ─────────────────────────────────────────────────

    {
        id: 'p1-04',
        level: 1,
        dept: 'chemistry',
        context: 'Chemists often need to convert between mass units.',
        question: 'A reagent bottle contains 0.750 kg of sodium chloride. How many grams is that?',
        given: { value: 0.750, unit: 'kg' },
        factors: [
            {
                id: 'f-kg-g', numVal: 1000, numUnit: 'g', denVal: 1, denUnit: 'kg',
                label: '1000 grams per 1 kilogram'
            },
            {
                id: 'f-kg-mg', numVal: 1e6, numUnit: 'mg', denVal: 1, denUnit: 'kg',
                label: '1 000 000 milligrams per kilogram — distractor'
            },
            {
                id: 'f-g-mg', numVal: 1000, numUnit: 'mg', denVal: 1, denUnit: 'g',
                label: '1000 milligrams per gram — distractor'
            },
        ],
        solution: ['f-kg-g'],
        answer: { value: 750, unit: 'g', tolerance: 0.01 },
        hints: [
            'Start with kg, need g. The factor needs kg in the denominator.',
            '1000 g / 1 kg cancels kg and gives g.',
            '0.750 kg × (1000 g / 1 kg) = 750 g',
        ],
    },

    {
        id: 'p1-05',
        level: 1,
        dept: 'chemistry',
        context: 'Volume units appear in solution chemistry and titrations.',
        question: 'A graduated cylinder holds 250 mL of solution. Convert this to litres.',
        given: { value: 250, unit: 'mL' },
        factors: [
            {
                id: 'f-mL-L', numVal: 1, numUnit: 'L', denVal: 1000, denUnit: 'mL',
                label: '1 litre per 1000 millilitres'
            },
            {
                id: 'f-L-mL', numVal: 1000, numUnit: 'mL', denVal: 1, denUnit: 'L',
                label: '1000 millilitres per litre — distractor (wrong direction)'
            },
            {
                id: 'f-mL-cm3', numVal: 1, numUnit: 'cm³', denVal: 1, denUnit: 'mL',
                label: '1 cubic centimetre per millilitre — distractor'
            },
        ],
        solution: ['f-mL-L'],
        answer: { value: 0.250, unit: 'L', tolerance: 0.01 },
        hints: [
            'You have mL and need L. The factor must cancel mL.',
            'Use 1 L / 1000 mL.',
            '250 mL × (1 L / 1000 mL) = 0.250 L',
        ],
    },

    {
        id: 'p1-06',
        level: 1,
        dept: 'chemistry',
        context: 'Molar mass links grams to moles.',
        question: 'How many moles are in 36 g of water? (Molar mass of H₂O = 18 g/mol)',
        given: { value: 36, unit: 'g' },
        factors: [
            {
                id: 'f-g-mol-H2O', numVal: 1, numUnit: 'mol', denVal: 18, denUnit: 'g',
                label: '1 mole per 18 grams of water'
            },
            {
                id: 'f-mol-g-H2O', numVal: 18, numUnit: 'g', denVal: 1, denUnit: 'mol',
                label: '18 grams per 1 mole of water — distractor (wrong direction)'
            },
            {
                id: 'f-g-mol-NaCl', numVal: 1, numUnit: 'mol', denVal: 58.44, denUnit: 'g',
                label: '1 mole per 58.44 grams — distractor (NaCl molar mass)'
            },
        ],
        solution: ['f-g-mol-H2O'],
        answer: { value: 2, unit: 'mol', tolerance: 0.02 },
        hints: [
            'Molar mass acts as a conversion factor between grams and moles.',
            'To cancel "g", put g in the denominator: 1 mol / 18 g.',
            '36 g × (1 mol / 18 g) = 2 mol',
        ],
    },

    /* ==============================================================
       LEVEL 2 — MULTI-STEP
    ============================================================== */

    // ── Physics ───────────────────────────────────────────────────

    {
        id: 'p2-01',
        level: 2,
        dept: 'physics',
        context: 'The classic Weebly example — extended.',
        question: 'How many grams are in 18 lbs? (1 lb = 454 g, 1 kg = 1000 g)',
        given: { value: 18, unit: 'lbs' },
        factors: [
            {
                id: 'f-lb-g', numVal: 454, numUnit: 'g', denVal: 1, denUnit: 'lb',
                label: '454 grams per 1 pound'
            },
            {
                id: 'f-lb-kg', numVal: 0.454, numUnit: 'kg', denVal: 1, denUnit: 'lb',
                label: '0.454 kilograms per pound — distractor'
            },
            {
                id: 'f-kg-g', numVal: 1000, numUnit: 'g', denVal: 1, denUnit: 'kg',
                label: '1000 grams per kilogram'
            },
            {
                id: 'f-g-kg', numVal: 1, numUnit: 'kg', denVal: 1000, denUnit: 'g',
                label: '1 kilogram per 1000 grams — distractor (wrong direction for this path)'
            },
        ],
        solution: ['f-lb-g'],
        answer: { value: 8172, unit: 'g', tolerance: 0.01 },
        hints: [
            'You need lbs → g. Look for a factor that has lbs in the denominator.',
            '454 g / 1 lb cancels lbs and leaves g — that is all you need for this particular path.',
            '18 lbs × (454 g / 1 lb) = 8172 g',
        ],
    },

    {
        id: 'p2-02',
        level: 2,
        dept: 'physics',
        context: 'SI prefix chain — very common in physics problems.',
        question: 'Convert 5.2 km to centimetres.',
        given: { value: 5.2, unit: 'km' },
        factors: [
            {
                id: 'f-km-m', numVal: 1000, numUnit: 'm', denVal: 1, denUnit: 'km',
                label: '1000 metres per kilometre'
            },
            {
                id: 'f-m-cm', numVal: 100, numUnit: 'cm', denVal: 1, denUnit: 'm',
                label: '100 centimetres per metre'
            },
            {
                id: 'f-cm-mm', numVal: 10, numUnit: 'mm', denVal: 1, denUnit: 'cm',
                label: '10 millimetres per centimetre — distractor'
            },
            {
                id: 'f-m-mm', numVal: 1000, numUnit: 'mm', denVal: 1, denUnit: 'm',
                label: '1000 millimetres per metre — distractor'
            },
        ],
        solution: ['f-km-m', 'f-m-cm'],
        answer: { value: 520000, unit: 'cm', tolerance: 0.01 },
        hints: [
            'There is no single factor from km to cm. You will need two steps.',
            'Step 1: convert km → m using 1000 m / 1 km.',
            'Step 2: convert m → cm using 100 cm / 1 m. Then multiply: 5.2 × 1000 × 100 = 520 000 cm.',
        ],
    },

    {
        id: 'p2-03',
        level: 2,
        dept: 'physics',
        context: 'Energy unit conversions appear throughout thermodynamics.',
        question: 'A light bulb uses 60 W of power for 2 hours. Convert the energy 432 kJ to calories. (1 cal = 4.184 J, 1 kJ = 1000 J)',
        given: { value: 432, unit: 'kJ' },
        factors: [
            {
                id: 'f-kJ-J', numVal: 1000, numUnit: 'J', denVal: 1, denUnit: 'kJ',
                label: '1000 joules per kilojoule'
            },
            {
                id: 'f-J-cal', numVal: 1, numUnit: 'cal', denVal: 4.184, denUnit: 'J',
                label: '1 calorie per 4.184 joules'
            },
            {
                id: 'f-cal-kcal', numVal: 1, numUnit: 'kcal', denVal: 1000, denUnit: 'cal',
                label: '1 kilocalorie per 1000 calories — distractor'
            },
            {
                id: 'f-J-kJ', numVal: 1, numUnit: 'kJ', denVal: 1000, denUnit: 'J',
                label: '1 kilojoule per 1000 joules — distractor (wrong direction)'
            },
        ],
        solution: ['f-kJ-J', 'f-J-cal'],
        answer: { value: 103253, unit: 'cal', tolerance: 0.02 },
        hints: [
            'You need kJ → cal. There is no direct factor, so plan two steps.',
            'First convert kJ → J: multiply by (1000 J / 1 kJ).',
            'Then convert J → cal: multiply by (1 cal / 4.184 J). 432 000 J ÷ 4.184 ≈ 103 253 cal.',
        ],
    },

    // ── Chemistry ─────────────────────────────────────────────────

    {
        id: 'p2-04',
        level: 2,
        dept: 'chemistry',
        context: 'Stoichiometry often involves converting between mass and moles, then moles of one substance to moles of another.',
        question: 'How many moles of CO₂ are produced when 88 g of CO₂ form? (M = 44 g/mol)',
        given: { value: 88, unit: 'g CO₂' },
        factors: [
            {
                id: 'f-gCO2-mol', numVal: 1, numUnit: 'mol CO₂', denVal: 44, denUnit: 'g CO₂',
                label: '1 mole CO₂ per 44 grams CO₂'
            },
            {
                id: 'f-mol-gCO2', numVal: 44, numUnit: 'g CO₂', denVal: 1, denUnit: 'mol CO₂',
                label: '44 grams CO₂ per mole — distractor'
            },
            {
                id: 'f-mol-mol', numVal: 1, numUnit: 'mol C', denVal: 1, denUnit: 'mol CO₂',
                label: '1 mol C per mol CO₂ — distractor'
            },
        ],
        solution: ['f-gCO2-mol'],
        answer: { value: 2, unit: 'mol CO₂', tolerance: 0.02 },
        hints: [
            'Molar mass is your conversion factor: 44 g/mol for CO₂.',
            'Put g CO₂ in the denominator to cancel: 1 mol CO₂ / 44 g CO₂.',
            '88 g CO₂ × (1 mol CO₂ / 44 g CO₂) = 2 mol CO₂',
        ],
    },

    {
        id: 'p2-05',
        level: 2,
        dept: 'chemistry',
        context: 'Concentration conversions link moles, volume, and mass.',
        question: 'A solution is 2.0 mol/L. How many millimoles are in 500 mL? (1 mol = 1000 mmol, 1 L = 1000 mL)',
        given: { value: 2.0, unit: 'mol/L' },
        factors: [
            {
                id: 'f-molL-mmolmL', numVal: 2.0, numUnit: 'mmol', denVal: 1, denUnit: 'mL',
                label: 'Direct: 2.0 mmol per mL — distractor (uses answer)'
            },
            {
                id: 'f-mol-mmol', numVal: 1000, numUnit: 'mmol', denVal: 1, denUnit: 'mol',
                label: '1000 millimoles per mole'
            },
            {
                id: 'f-L-mL', numVal: 1000, numUnit: 'mL', denVal: 1, denUnit: 'L',
                label: '1000 millilitres per litre'
            },
            {
                id: 'f-mL-L', numVal: 1, numUnit: 'L', denVal: 1000, denUnit: 'mL',
                label: '1 litre per 1000 mL — distractor'
            },
        ],
        solution: ['f-mol-mmol'],
        answer: { value: 1000, unit: 'mmol', tolerance: 0.02 },
        hints: [
            'At 2.0 mol/L × 0.500 L = 1.0 mol. You can treat the 500 mL separately.',
            'Alternatively, convert the concentration: 2.0 mol/L × (1000 mmol/mol) = 2000 mmol/L, then × 0.500 L = 1000 mmol.',
            '2.0 mol/L × (1000 mmol / 1 mol) = 2000 mmol/L; 2000 mmol/L × 0.500 L = 1000 mmol',
        ],
    },

    {
        id: 'p2-06',
        level: 2,
        dept: 'chemistry',
        context: 'Pressure units appear in gas law calculations.',
        question: 'Convert 2.5 atm to Pascals. (1 atm = 101 325 Pa, 1 kPa = 1000 Pa)',
        given: { value: 2.5, unit: 'atm' },
        factors: [
            {
                id: 'f-atm-Pa', numVal: 101325, numUnit: 'Pa', denVal: 1, denUnit: 'atm',
                label: '101 325 pascals per atmosphere'
            },
            {
                id: 'f-atm-kPa', numVal: 101.325, numUnit: 'kPa', denVal: 1, denUnit: 'atm',
                label: '101.325 kilopascals per atmosphere — distractor'
            },
            {
                id: 'f-Pa-kPa', numVal: 1, numUnit: 'kPa', denVal: 1000, denUnit: 'Pa',
                label: '1 kilopascal per 1000 pascals — distractor'
            },
        ],
        solution: ['f-atm-Pa'],
        answer: { value: 253312.5, unit: 'Pa', tolerance: 0.01 },
        hints: [
            'One conversion factor handles this directly.',
            'Use 101 325 Pa / 1 atm to cancel atm and get Pa.',
            '2.5 atm × (101 325 Pa / 1 atm) = 253 312.5 Pa',
        ],
    },

    /* ==============================================================
       LEVEL 3 — DOUBLE UNITS (compound)
    ============================================================== */

    // ── Physics ───────────────────────────────────────────────────

    {
        id: 'p3-01',
        level: 3,
        dept: 'physics',
        context: 'Speed is a compound unit — distance per time. Both parts must convert.',
        question: 'A car travels at 90 km/h. What is its speed in metres per second?',
        given: { value: 90, unit: 'km/h' },
        factors: [
            {
                id: 'f-km-m', numVal: 1000, numUnit: 'm', denVal: 1, denUnit: 'km',
                label: '1000 metres per kilometre'
            },
            {
                id: 'f-h-s', numVal: 1, numUnit: 'h', denVal: 3600, denUnit: 's',
                label: '1 hour per 3600 seconds'
            },
            {
                id: 'f-h-min', numVal: 1, numUnit: 'h', denVal: 60, denUnit: 'min',
                label: '1 hour per 60 minutes — distractor'
            },
            {
                id: 'f-min-s', numVal: 1, numUnit: 'min', denVal: 60, denUnit: 's',
                label: '1 minute per 60 seconds — distractor'
            },
        ],
        solution: ['f-km-m', 'f-h-s'],
        answer: { value: 25, unit: 'm/s', tolerance: 0.01 },
        hints: [
            'km/h has two units to convert: km → m and h → s.',
            'For km → m: multiply by (1000 m / 1 km). This stays in the numerator.',
            'For h → s: the h is in the denominator of km/h, so use (1 h / 3600 s) which flips h back to the numerator temporarily to cancel it. 90 × 1000 / 3600 = 25 m/s.',
        ],
    },

    {
        id: 'p3-02',
        level: 3,
        dept: 'physics',
        context: 'Density links mass and volume.',
        question: 'Iron has a density of 7.87 g/cm³. Convert this to kg/m³.',
        given: { value: 7.87, unit: 'g/cm³' },
        factors: [
            {
                id: 'f-g-kg', numVal: 1, numUnit: 'kg', denVal: 1000, denUnit: 'g',
                label: '1 kilogram per 1000 grams'
            },
            {
                id: 'f-cm3-m3', numVal: 1, numUnit: 'm³', denVal: 1e6, denUnit: 'cm³',
                label: '1 cubic metre per 1 000 000 cubic centimetres'
            },
            {
                id: 'f-m3-cm3', numVal: 1e6, numUnit: 'cm³', denVal: 1, denUnit: 'm³',
                label: '1 000 000 cubic centimetres per cubic metre — check orientation'
            },
            {
                id: 'f-cm-m', numVal: 1, numUnit: 'm', denVal: 100, denUnit: 'cm',
                label: '1 metre per 100 cm — distractor (not cubed yet)'
            },
        ],
        solution: ['f-g-kg', 'f-cm3-m3'],
        answer: { value: 7870, unit: 'kg/m³', tolerance: 0.01 },
        hints: [
            'Density is g/cm³. You need to convert the numerator (g → kg) AND the denominator (cm³ → m³) separately.',
            'g → kg: 1 kg / 1000 g. Since g is in the numerator of density, this factor goes in normally.',
            'cm³ → m³: 1 m³ = 1 000 000 cm³, so use (1 000 000 cm³ / 1 m³) flipped: (1 m³ / 1 000 000 cm³). 7.87 × (1/1000) / (1/1 000 000) = 7870 kg/m³.',
        ],
    },

    // ── Chemistry ─────────────────────────────────────────────────

    {
        id: 'p3-03',
        level: 3,
        dept: 'chemistry',
        context: 'Molarity links moles per litre, but volumes are often measured in mL.',
        question: 'A solution is 0.500 mol/L. Express this concentration in mmol/mL.',
        given: { value: 0.500, unit: 'mol/L' },
        factors: [
            {
                id: 'f-mol-mmol', numVal: 1000, numUnit: 'mmol', denVal: 1, denUnit: 'mol',
                label: '1000 millimoles per mole'
            },
            {
                id: 'f-L-mL', numVal: 1000, numUnit: 'mL', denVal: 1, denUnit: 'L',
                label: '1000 millilitres per litre'
            },
            {
                id: 'f-mL-L', numVal: 1, numUnit: 'L', denVal: 1000, denUnit: 'mL',
                label: '1 litre per 1000 mL — distractor'
            },
        ],
        solution: ['f-mol-mmol', 'f-L-mL'],
        answer: { value: 0.500, unit: 'mmol/mL', tolerance: 0.02 },
        hints: [
            'Notice this is a compound unit: mol/L. Both numerator and denominator need converting.',
            'Numerator: mol → mmol using 1000 mmol / 1 mol.',
            'Denominator: L → mL using 1000 mL / 1 L (put in denominator of your chain). The factors of 1000 cancel: result stays 0.500 mmol/mL.',
        ],
    },

    {
        id: 'p3-04',
        level: 3,
        dept: 'chemistry',
        context: 'Reaction rates are expressed as concentration change per time.',
        question: 'A reaction rate is 0.024 mol/(L·s). Convert it to mmol/(L·min).',
        given: { value: 0.024, unit: 'mol/(L·s)' },
        factors: [
            {
                id: 'f-mol-mmol', numVal: 1000, numUnit: 'mmol', denVal: 1, denUnit: 'mol',
                label: '1000 millimoles per mole'
            },
            {
                id: 'f-s-min', numVal: 60, numUnit: 's', denVal: 1, denUnit: 'min',
                label: '60 seconds per minute'
            },
            {
                id: 'f-min-s', numVal: 1, numUnit: 'min', denVal: 60, denUnit: 's',
                label: '1 minute per 60 seconds — distractor'
            },
        ],
        solution: ['f-mol-mmol', 'f-s-min'],
        answer: { value: 1.44, unit: 'mmol/(L·min)', tolerance: 0.02 },
        hints: [
            'The rate unit is mol/(L·s). You need mmol in the numerator and min in the denominator.',
            'Convert mol → mmol: × (1000 mmol / 1 mol).',
            'Convert s → min in the denominator: × (60 s / 1 min). 0.024 × 1000 × 60 = 1440 … wait, check: 0.024 mol/L·s × 1000 mmol/mol × 60 s/min = 1.44 mmol/(L·min).',
        ],
    },

    /* ==============================================================
       LEVEL 4 — SQUARED & CUBED UNITS
    ============================================================== */

    // ── Physics ───────────────────────────────────────────────────

    {
        id: 'p4-01',
        level: 4,
        dept: 'physics',
        context: 'Area conversions require applying the length factor twice.',
        question: 'A room has an area of 24 m². Convert this to cm².',
        given: { value: 24, unit: 'm²' },
        factors: [
            {
                id: 'f-m2-cm2', numVal: 10000, numUnit: 'cm²', denVal: 1, denUnit: 'm²',
                label: '10 000 square centimetres per square metre'
            },
            {
                id: 'f-m-cm', numVal: 100, numUnit: 'cm', denVal: 1, denUnit: 'm',
                label: '100 cm per m — distractor (not squared)'
            },
            {
                id: 'f-cm2-mm2', numVal: 100, numUnit: 'mm²', denVal: 1, denUnit: 'cm²',
                label: '100 mm² per cm² — distractor'
            },
        ],
        solution: ['f-m2-cm2'],
        answer: { value: 240000, unit: 'cm²', tolerance: 0.01 },
        hints: [
            'Area is m². Because it is squared, the linear factor (100 cm/m) must be applied twice: 100² = 10 000.',
            'The combined factor is 10 000 cm² / 1 m².',
            '24 m² × (10 000 cm² / 1 m²) = 240 000 cm²',
        ],
    },

    {
        id: 'p4-02',
        level: 4,
        dept: 'physics',
        context: 'Volume conversions require applying the length factor three times.',
        question: 'Convert 2.5 m³ to cm³.',
        given: { value: 2.5, unit: 'm³' },
        factors: [
            {
                id: 'f-m3-cm3', numVal: 1e6, numUnit: 'cm³', denVal: 1, denUnit: 'm³',
                label: '1 000 000 cubic centimetres per cubic metre'
            },
            {
                id: 'f-m-cm', numVal: 100, numUnit: 'cm', denVal: 1, denUnit: 'm',
                label: '100 cm per m — distractor (not cubed)'
            },
            {
                id: 'f-m3-L', numVal: 1000, numUnit: 'L', denVal: 1, denUnit: 'm³',
                label: '1000 litres per cubic metre — distractor'
            },
        ],
        solution: ['f-m3-cm3'],
        answer: { value: 2500000, unit: 'cm³', tolerance: 0.01 },
        hints: [
            'Volume is m³. The linear factor 100 cm/m must be cubed: 100³ = 1 000 000.',
            'The combined factor is 1 000 000 cm³ / 1 m³.',
            '2.5 m³ × (1 000 000 cm³ / 1 m³) = 2 500 000 cm³',
        ],
    },

    {
        id: 'p4-03',
        level: 4,
        dept: 'physics',
        context: 'Land area is often given in hectares in science contexts.',
        question: 'A field covers 3.2 km². Convert this to m².',
        given: { value: 3.2, unit: 'km²' },
        factors: [
            {
                id: 'f-km2-m2', numVal: 1e6, numUnit: 'm²', denVal: 1, denUnit: 'km²',
                label: '1 000 000 square metres per square kilometre'
            },
            {
                id: 'f-km-m', numVal: 1000, numUnit: 'm', denVal: 1, denUnit: 'km',
                label: '1000 m per km — distractor (not squared)'
            },
            {
                id: 'f-m2-ha', numVal: 1, numUnit: 'ha', denVal: 10000, denUnit: 'm²',
                label: '1 hectare per 10 000 m² — distractor'
            },
        ],
        solution: ['f-km2-m2'],
        answer: { value: 3200000, unit: 'm²', tolerance: 0.01 },
        hints: [
            '1 km = 1000 m, so 1 km² = (1000)² m² = 1 000 000 m².',
            'Use the factor 1 000 000 m² / 1 km².',
            '3.2 km² × (1 000 000 m² / 1 km²) = 3 200 000 m²',
        ],
    },

    // ── Chemistry ─────────────────────────────────────────────────

    {
        id: 'p4-04',
        level: 4,
        dept: 'chemistry',
        context: 'Molar volume requires converting cubic units.',
        question: 'The molar volume of an ideal gas at STP is 22.4 L/mol. Convert this to cm³/mol.',
        given: { value: 22.4, unit: 'L/mol' },
        factors: [
            {
                id: 'f-L-cm3', numVal: 1000, numUnit: 'cm³', denVal: 1, denUnit: 'L',
                label: '1000 cubic centimetres per litre'
            },
            {
                id: 'f-L-mL', numVal: 1000, numUnit: 'mL', denVal: 1, denUnit: 'L',
                label: '1000 mL per litre — distractor (mL ≠ cm³ in this context label)'
            },
            {
                id: 'f-cm3-mL', numVal: 1, numUnit: 'mL', denVal: 1, denUnit: 'cm³',
                label: '1 mL per cm³ — distractor'
            },
        ],
        solution: ['f-L-cm3'],
        answer: { value: 22400, unit: 'cm³/mol', tolerance: 0.01 },
        hints: [
            '1 L = 1000 cm³ (this is exact — no squaring needed here because L is already a volume unit).',
            'Use 1000 cm³ / 1 L in the numerator of your chain.',
            '22.4 L/mol × (1000 cm³ / 1 L) = 22 400 cm³/mol',
        ],
    },

    {
        id: 'p4-05',
        level: 4,
        dept: 'chemistry',
        context: 'Surface area calculations in catalysis use squared units.',
        question: 'A catalyst particle has a surface area of 45 mm². Convert to m².',
        given: { value: 45, unit: 'mm²' },
        factors: [
            {
                id: 'f-mm2-m2', numVal: 1, numUnit: 'm²', denVal: 1e6, denUnit: 'mm²',
                label: '1 square metre per 1 000 000 square millimetres'
            },
            {
                id: 'f-mm-m', numVal: 1, numUnit: 'm', denVal: 1000, denUnit: 'mm',
                label: '1 m per 1000 mm — distractor (not squared)'
            },
            {
                id: 'f-mm2-cm2', numVal: 1, numUnit: 'cm²', denVal: 100, denUnit: 'mm²',
                label: '1 cm² per 100 mm² — distractor'
            },
        ],
        solution: ['f-mm2-m2'],
        answer: { value: 4.5e-5, unit: 'm²', tolerance: 0.02 },
        hints: [
            '1 mm = 0.001 m, so 1 mm² = (0.001)² m² = 1 × 10⁻⁶ m².',
            'Equivalently, 1 m² = 1 000 000 mm², so the factor is 1 m² / 1 000 000 mm².',
            '45 mm² × (1 m² / 1 000 000 mm²) = 4.5 × 10⁻⁵ m²',
        ],
    },

    {
        id: 'p4-06',
        level: 4,
        dept: 'chemistry',
        context: 'Concentration can be expressed as mass per volume in various unit systems.',
        question: 'A solution has a concentration of 8.0 g/L. Convert to mg/mL.',
        given: { value: 8.0, unit: 'g/L' },
        factors: [
            {
                id: 'f-g-mg', numVal: 1000, numUnit: 'mg', denVal: 1, denUnit: 'g',
                label: '1000 milligrams per gram'
            },
            {
                id: 'f-L-mL', numVal: 1000, numUnit: 'mL', denVal: 1, denUnit: 'L',
                label: '1000 millilitres per litre'
            },
            {
                id: 'f-mL-L', numVal: 1, numUnit: 'L', denVal: 1000, denUnit: 'mL',
                label: '1 litre per 1000 mL — distractor'
            },
            {
                id: 'f-mg-g', numVal: 1, numUnit: 'g', denVal: 1000, denUnit: 'mg',
                label: '1 gram per 1000 mg — distractor'
            },
        ],
        solution: ['f-g-mg', 'f-L-mL'],
        answer: { value: 8.0, unit: 'mg/mL', tolerance: 0.02 },
        hints: [
            'g/L is a compound unit. Convert numerator and denominator separately.',
            'g → mg: × (1000 mg / 1 g). L → mL: the L is in the denominator, so use (1000 mL / 1 L) also in the denominator.',
            'The 1000s cancel: 8.0 g/L × (1000 mg/g) / (1000 mL/L) = 8.0 mg/mL',
        ],
    },

];

/* ================================================================
   HELPER — look up a problem by id
================================================================ */
function getProblemById(id) {
    return PROBLEMS.find(p => p.id === id) || null;
}

/* ================================================================
   HELPER — filter problems by level and/or department
   dept: 'all' | 'physics' | 'chemistry'
================================================================ */
function filterProblems({ level = null, dept = 'all' } = {}) {
    return PROBLEMS.filter(p => {
        const levelOk = level === null || p.level === level;
        const deptOk = dept === 'all' || p.dept === dept || p.dept === 'both';
        return levelOk && deptOk;
    });
}

/* ================================================================
   HELPER — shuffle an array (Fisher-Yates) for randomised order
================================================================ */
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
