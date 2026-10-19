/**
 * LUMINA // DepEd Academic Standards Data Model & Transmutation Matrix
 * Official Department of Education Philippines — Adjusted Transmutation Protocol (Table 4)
 */

window.LuminaDepEd = (function () {
  'use strict';

  // 1. Official DepEd Senior High School Curriculum Catalog
  const CURRICULUM_CATALOG = [
    // Core Curriculum Subjects (15)
    {
      id: 'core-oral-comm',
      name: 'Oral Communication in Context',
      classification: 'Core',
      category: 'Language / Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'core-reading-writing',
      name: 'Reading and Writing Skills',
      classification: 'Core',
      category: 'Language / Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'core-komunikasyon',
      name: 'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
      classification: 'Core',
      category: 'Language / Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'core-pagbasa',
      name: "Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik",
      classification: 'Core',
      category: 'Language / Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'core-21st-century-lit',
      name: '21st Century Literature from the Philippines and the World',
      classification: 'Core',
      category: 'Language / Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'core-contemporary-arts',
      name: "Contemporary Philippine Arts from the Regions",
      classification: 'Core',
      category: 'Arts / PE',
      defaultPreset: 'arts_pe'
    },
    {
      id: 'core-media-info-lit',
      name: 'Media and Information Literacy',
      classification: 'Core',
      category: 'Core',
      defaultPreset: 'core_language'
    },
    {
      id: 'core-general-math',
      name: 'General Mathematics',
      classification: 'Core',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'core-stats-prob',
      name: 'Statistics and Probability',
      classification: 'Core',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'core-earth-life-sci',
      name: 'Earth and Life Science',
      classification: 'Core',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'core-physical-sci',
      name: 'Physical Science',
      classification: 'Core',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'core-intro-philosophy',
      name: 'Introduction to the Philosophy of the Human Person',
      classification: 'Core',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },
    {
      id: 'core-pe-health',
      name: 'Physical Education and Health',
      classification: 'Core',
      category: 'Arts / PE',
      defaultPreset: 'arts_pe'
    },
    {
      id: 'core-personal-dev',
      name: 'Personal Development',
      classification: 'Core',
      category: 'Core',
      defaultPreset: 'core_language'
    },
    {
      id: 'core-ucsp',
      name: 'Understanding Culture, Society and Politics',
      classification: 'Core',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },

    // Applied Track Subjects (7)
    {
      id: 'applied-eapp',
      name: 'English for Academic and Professional Purposes (EAPP)',
      classification: 'Applied',
      category: 'Language / Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'applied-pr1',
      name: 'Practical Research 1 (Qualitative)',
      classification: 'Applied',
      category: 'Research / Science',
      defaultPreset: 'core_language'
    },
    {
      id: 'applied-pr2',
      name: 'Practical Research 2 (Quantitative)',
      classification: 'Applied',
      category: 'Research / Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'applied-filipino-larang',
      name: 'Filipino sa Piling Larang (Akademik, Isports, Sining, o Tech-Voc)',
      classification: 'Applied',
      category: 'Language / Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'applied-etech',
      name: 'Empowerment Technologies (E-Tech)',
      classification: 'Applied',
      category: 'Tech-Voc',
      defaultPreset: 'arts_pe'
    },
    {
      id: 'applied-entrep',
      name: 'Entrepreneurship',
      classification: 'Applied',
      category: 'Business',
      defaultPreset: 'core_language'
    },
    {
      id: 'applied-3is',
      name: 'Inquiries, Investigations, and Immersion (3Is)',
      classification: 'Applied',
      category: 'Research / Capstone',
      defaultPreset: 'math_science'
    },

    // Specialized Subjects — STEM
    {
      id: 'stem-pre-calculus',
      name: 'Pre-Calculus',
      classification: 'Specialized',
      strand: 'STEM',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'stem-basic-calculus',
      name: 'Basic Calculus',
      classification: 'Specialized',
      strand: 'STEM',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'stem-gen-biology-1',
      name: 'General Biology 1',
      classification: 'Specialized',
      strand: 'STEM',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'stem-gen-biology-2',
      name: 'General Biology 2',
      classification: 'Specialized',
      strand: 'STEM',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'stem-gen-physics-1',
      name: 'General Physics 1',
      classification: 'Specialized',
      strand: 'STEM',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'stem-gen-physics-2',
      name: 'General Physics 2',
      classification: 'Specialized',
      strand: 'STEM',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'stem-gen-chem-1',
      name: 'General Chemistry 1',
      classification: 'Specialized',
      strand: 'STEM',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'stem-gen-chem-2',
      name: 'General Chemistry 2',
      classification: 'Specialized',
      strand: 'STEM',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'stem-work-immersion',
      name: 'Work Immersion / Research Capstone',
      classification: 'Specialized',
      strand: 'STEM',
      category: 'Capstone',
      defaultPreset: 'math_science'
    },

    // Specialized Subjects — ABM
    {
      id: 'abm-applied-economics',
      name: 'Applied Economics',
      classification: 'Specialized',
      strand: 'ABM',
      category: 'Business',
      defaultPreset: 'core_language'
    },
    {
      id: 'abm-business-ethics',
      name: 'Business Ethics and Social Responsibility',
      classification: 'Specialized',
      strand: 'ABM',
      category: 'Business',
      defaultPreset: 'core_language'
    },
    {
      id: 'abm-fabm-1',
      name: 'Fundamentals of Accountancy, Business and Management 1',
      classification: 'Specialized',
      strand: 'ABM',
      category: 'Math & Business',
      defaultPreset: 'math_science'
    },
    {
      id: 'abm-fabm-2',
      name: 'Fundamentals of Accountancy, Business and Management 2',
      classification: 'Specialized',
      strand: 'ABM',
      category: 'Math & Business',
      defaultPreset: 'math_science'
    },
    {
      id: 'abm-business-math',
      name: 'Business Math',
      classification: 'Specialized',
      strand: 'ABM',
      category: 'Math & Science',
      defaultPreset: 'math_science'
    },
    {
      id: 'abm-business-finance',
      name: 'Business Finance',
      classification: 'Specialized',
      strand: 'ABM',
      category: 'Math & Business',
      defaultPreset: 'math_science'
    },
    {
      id: 'abm-org-mgmt',
      name: 'Organization and Management',
      classification: 'Specialized',
      strand: 'ABM',
      category: 'Business',
      defaultPreset: 'core_language'
    },

    // Specialized Subjects — HUMSS
    {
      id: 'humss-creative-writing',
      name: 'Creative Writing',
      classification: 'Specialized',
      strand: 'HUMSS',
      category: 'Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'humss-creative-nonfiction',
      name: 'Creative Nonfiction',
      classification: 'Specialized',
      strand: 'HUMSS',
      category: 'Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'humss-world-religions',
      name: 'World Religions and Belief Systems',
      classification: 'Specialized',
      strand: 'HUMSS',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },
    {
      id: 'humss-trends-networks',
      name: 'Trends, Networks, and Critical Thinking in the 21st Century',
      classification: 'Specialized',
      strand: 'HUMSS',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },
    {
      id: 'humss-ph-politics',
      name: 'Philippine Politics and Governance',
      classification: 'Specialized',
      strand: 'HUMSS',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },
    {
      id: 'humss-comm-engagement',
      name: 'Community Engagement, Solidarity and Citizenship',
      classification: 'Specialized',
      strand: 'HUMSS',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },
    {
      id: 'humss-diss',
      name: 'Disciplines and Ideas in the Social Sciences (DISS)',
      classification: 'Specialized',
      strand: 'HUMSS',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },
    {
      id: 'humss-diass',
      name: 'Disciplines and Ideas in the Applied Social Sciences (DIASS)',
      classification: 'Specialized',
      strand: 'HUMSS',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },

    // Specialized Subjects — GAS
    {
      id: 'gas-humanities-1',
      name: 'Humanities 1',
      classification: 'Specialized',
      strand: 'GAS',
      category: 'Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'gas-humanities-2',
      name: 'Humanities 2',
      classification: 'Specialized',
      strand: 'GAS',
      category: 'Humanities',
      defaultPreset: 'core_language'
    },
    {
      id: 'gas-social-sci-1',
      name: 'Social Science 1',
      classification: 'Specialized',
      strand: 'GAS',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },
    {
      id: 'gas-social-sci-2',
      name: 'Social Science 2',
      classification: 'Specialized',
      strand: 'GAS',
      category: 'Social Science',
      defaultPreset: 'core_language'
    },
    {
      id: 'gas-drrr',
      name: 'Disaster Readiness and Risk Reduction',
      classification: 'Specialized',
      strand: 'GAS',
      category: 'Science',
      defaultPreset: 'math_science'
    },

    // Specialized Subjects — TVL / ICT / Home Economics
    {
      id: 'tvl-css',
      name: 'Computer Systems Servicing',
      classification: 'Specialized',
      strand: 'TVL',
      category: 'Tech-Voc',
      defaultPreset: 'arts_pe'
    },
    {
      id: 'tvl-animation',
      name: 'Animation',
      classification: 'Specialized',
      strand: 'TVL',
      category: 'Tech-Voc',
      defaultPreset: 'arts_pe'
    },
    {
      id: 'tvl-programming',
      name: 'Computer Programming',
      classification: 'Specialized',
      strand: 'TVL',
      category: 'Tech-Voc',
      defaultPreset: 'arts_pe'
    },
    {
      id: 'tvl-cookery',
      name: 'Cookery',
      classification: 'Specialized',
      strand: 'TVL',
      category: 'Home Economics',
      defaultPreset: 'arts_pe'
    },
    {
      id: 'tvl-bread-pastry',
      name: 'Bread and Pastry Production',
      classification: 'Specialized',
      strand: 'TVL',
      category: 'Home Economics',
      defaultPreset: 'arts_pe'
    },
    {
      id: 'tvl-smaw',
      name: 'Shielded Metal Arc Welding',
      classification: 'Specialized',
      strand: 'TVL',
      category: 'Industrial Arts',
      defaultPreset: 'arts_pe'
    },
    {
      id: 'tvl-tourism',
      name: 'Tourism Promotion Services',
      classification: 'Specialized',
      strand: 'TVL',
      category: 'Tech-Voc',
      defaultPreset: 'arts_pe'
    }
  ];

  // 2. Official DepEd Standard Component Weights
  const WEIGHT_PRESETS = {
    math_science: {
      name: 'Math & Science (Specialized/STEM)',
      ww: 0.35,
      pt: 0.40,
      qa: 0.25,
      wwLabel: '35%',
      ptLabel: '40%',
      qaLabel: '25%'
    },
    core_language: {
      name: 'Languages / Social Sciences / Core',
      ww: 0.25,
      pt: 0.50,
      qa: 0.25,
      wwLabel: '25%',
      ptLabel: '50%',
      qaLabel: '25%'
    },
    arts_pe: {
      name: 'Tech-Voc / Arts / Physical Education',
      ww: 0.20,
      pt: 0.60,
      qa: 0.20,
      wwLabel: '20%',
      ptLabel: '60%',
      qaLabel: '20%'
    }
  };

  // 3. Official DepEd Adjusted Transmutation Protocol (Table 4)
  // Ordered descending from Transmuted Grade 100 to 60.
  const TRANSMUTATION_TABLE = [
    { transmuted: 100, min: 99.50, max: 100.00, remarks: 'Passed - With Highest Honors' },
    { transmuted: 99,  min: 98.32, max: 99.49,  remarks: 'Passed - With Highest Honors' },
    { transmuted: 98,  min: 97.14, max: 98.31,  remarks: 'Passed - With Highest Honors' },
    { transmuted: 97,  min: 95.96, max: 97.13,  remarks: 'Passed - With High Honors' },
    { transmuted: 96,  min: 94.78, max: 95.95,  remarks: 'Passed - With High Honors' },
    { transmuted: 95,  min: 93.60, max: 94.77,  remarks: 'Passed - With High Honors' },
    { transmuted: 94,  min: 92.42, max: 93.59,  remarks: 'Passed - With Honors' },
    { transmuted: 93,  min: 91.24, max: 92.41,  remarks: 'Passed - With Honors' },
    { transmuted: 92,  min: 90.06, max: 91.23,  remarks: 'Passed - With Honors' },
    { transmuted: 91,  min: 88.88, max: 90.05,  remarks: 'Passed - With Honors' },
    { transmuted: 90,  min: 87.70, max: 88.87,  remarks: 'Passed - With Honors' },
    { transmuted: 89,  min: 86.52, max: 87.69,  remarks: 'Passed' },
    { transmuted: 88,  min: 85.34, max: 86.51,  remarks: 'Passed' },
    { transmuted: 87,  min: 84.16, max: 85.33,  remarks: 'Passed' },
    { transmuted: 86,  min: 82.98, max: 84.15,  remarks: 'Passed' },
    { transmuted: 85,  min: 81.80, max: 82.97,  remarks: 'Passed' },
    { transmuted: 84,  min: 80.62, max: 81.79,  remarks: 'Passed' },
    { transmuted: 83,  min: 79.44, max: 80.61,  remarks: 'Passed' },
    { transmuted: 82,  min: 78.26, max: 79.43,  remarks: 'Passed' },
    { transmuted: 81,  min: 77.08, max: 78.25,  remarks: 'Passed' },
    { transmuted: 80,  min: 75.90, max: 77.07,  remarks: 'Passed' },
    { transmuted: 79,  min: 74.72, max: 75.89,  remarks: 'Passed' },
    { transmuted: 78,  min: 73.54, max: 74.71,  remarks: 'Passed' },
    { transmuted: 77,  min: 72.36, max: 73.53,  remarks: 'Passed' },
    { transmuted: 76,  min: 71.18, max: 72.35,  remarks: 'Passed' },
    { transmuted: 75,  min: 70.00, max: 71.17,  remarks: 'Passed - Standard Benchmark' },
    { transmuted: 74,  min: 65.34, max: 69.99,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 73,  min: 60.67, max: 65.33,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 72,  min: 56.01, max: 60.66,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 71,  min: 51.34, max: 56.00,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 70,  min: 46.67, max: 51.33,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 69,  min: 42.01, max: 46.66,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 68,  min: 37.34, max: 42.00,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 67,  min: 32.68, max: 37.33,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 66,  min: 28.01, max: 32.67,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 65,  min: 23.35, max: 28.00,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 64,  min: 18.68, max: 23.34,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 63,  min: 14.01, max: 18.67,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 62,  min: 9.35,  max: 14.00,  remarks: 'Did Not Meet Expectations' },
    { transmuted: 61,  min: 4.68,  max: 9.34,   remarks: 'Did Not Meet Expectations' },
    { transmuted: 60,  min: 0.00,  max: 4.67,   remarks: 'Did Not Meet Expectations' }
  ];

  /**
   * Look up transmuted grade from raw initial grade (0.00 - 100.00+).
   * @param {number} initialGrade
   * @returns {number} Transmuted Grade (60 - 100)
   */
  function initialToTransmuted(initialGrade) {
    if (typeof initialGrade !== 'number' || isNaN(initialGrade)) return 60;
    if (initialGrade >= 99.50) return 100;
    if (initialGrade <= 0) return 60;

    // Numerical precision safety (round to 2 decimals for boundary comparison)
    const ig = Math.round(initialGrade * 100) / 100;

    for (const entry of TRANSMUTATION_TABLE) {
      if (ig >= entry.min && ig <= entry.max + 0.0001) {
        return entry.transmuted;
      }
    }

    // Fallback based on boundaries
    if (ig > 100) return 100;
    return 60;
  }

  /**
   * Look up the minimum Initial Grade percentage required to achieve target Transmuted Grade.
   * @param {number} targetTransmuted (60 - 100)
   * @returns {number} Minimum Initial Grade required
   */
  function transmutedToMinInitial(targetTransmuted) {
    const target = Math.min(100, Math.max(60, Math.round(targetTransmuted)));
    const entry = TRANSMUTATION_TABLE.find(row => row.transmuted === target);
    return entry ? entry.min : 70.00;
  }

  /**
   * Look up row details for an initial grade.
   * @param {number} initialGrade
   */
  function getTransmutationRow(initialGrade) {
    const tg = initialToTransmuted(initialGrade);
    const entry = TRANSMUTATION_TABLE.find(row => row.transmuted === tg);
    return entry || TRANSMUTATION_TABLE[TRANSMUTATION_TABLE.length - 1];
  }

  /**
   * Evaluate Honors Tier for an overall General Average.
   * DepEd SHS Policy:
   * 98.00 - 100.00: With Highest Honors
   * 95.00 - 97.99:  With High Honors
   * 90.00 - 94.99:  With Honors
   * Below 90.00:   Academic Good Standing
   * Passing benchmark is 75.00.
   */
  function getHonorsTier(generalAverage) {
    const avg = Number(generalAverage) || 0;
    if (avg >= 98.00) {
      return {
        tier: 'highest',
        title: 'With Highest Honors',
        badgeClass: 'badge-highest-honors',
        shimmer: 'prismatic',
        color: '#c084fc',
        glow: 'rgba(192, 132, 252, 0.4)',
        nextTier: null,
        deltaNeeded: 0
      };
    } else if (avg >= 95.00) {
      return {
        tier: 'high',
        title: 'With High Honors',
        badgeClass: 'badge-high-honors',
        shimmer: 'amber',
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.4)',
        nextTier: 'With Highest Honors',
        deltaNeeded: Math.max(0, +(98.00 - avg).toFixed(2))
      };
    } else if (avg >= 90.00) {
      return {
        tier: 'honors',
        title: 'With Honors',
        badgeClass: 'badge-honors',
        shimmer: 'emerald',
        color: '#34d399',
        glow: 'rgba(52, 211, 153, 0.4)',
        nextTier: 'With High Honors',
        deltaNeeded: Math.max(0, +(95.00 - avg).toFixed(2))
      };
    } else {
      return {
        tier: 'good-standing',
        title: 'Academic Good Standing',
        badgeClass: 'badge-standing',
        shimmer: 'slate',
        color: '#a1a1aa',
        glow: 'rgba(161, 161, 170, 0.2)',
        nextTier: 'With Honors',
        deltaNeeded: Math.max(0, +(90.00 - avg).toFixed(2))
      };
    }
  }

  return {
    CURRICULUM_CATALOG,
    WEIGHT_PRESETS,
    TRANSMUTATION_TABLE,
    initialToTransmuted,
    transmutedToMinInitial,
    getTransmutationRow,
    getHonorsTier
  };
})();
