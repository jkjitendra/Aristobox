import { Kit } from '../lib/database';

export const defaultKits: Kit[] = [
  {
    id: 'bizwhiz_001',
    kitName: 'BizWhiz',
    description: 'Complete Commerce Kit for Classes 11-12',
    targetClasses: [11, 12],
    subjects: ['Business Studies', 'Economics', 'Accountancy'],
    contents: [
      'Business Case Study Templates',
      'Economic Graphs & Charts',
      'Financial Calculator',
      'Balance Sheet Formats',
      'Market Research Tools',
      'Company Law Reference Guide'
    ],
    price: 650,
    category: 'commerce',
    ageGroup: 'senior',
    isActive: true
  },
  {
    id: 'mathultra_002',
    kitName: 'MathUltra',
    description: 'Advanced Mathematics Tools & References',
    targetClasses: [9, 10, 11, 12],
    subjects: ['Mathematics', 'Statistics'],
    contents: [
      'Scientific Calculator',
      'Geometric Instruments Set',
      'Trigonometric Tables',
      'Formula Reference Cards',
      'Graph Papers & Protractors',
      'Statistical Tables'
    ],
    price: 480,
    category: 'stem',
    ageGroup: 'secondary',
    isActive: true
  },
  {
    id: 'physiowound_003',
    kitName: 'PhysioWound',
    description: 'Physics Laboratory Equipment Kit',
    targetClasses: [8, 9, 10, 11, 12],
    subjects: ['Physics'],
    contents: [
      'Digital Multimeter',
      'Spring Balance Set',
      'Measuring Cylinders',
      'Magnifying Glass',
      'Physics Formula Sheets',
      'Laboratory Manual'
    ],
    price: 520,
    category: 'stem',
    ageGroup: 'secondary',
    isActive: true
  },
  {
    id: 'chemdraw_004',
    kitName: 'ChemDraw',
    description: 'Chemistry Laboratory & Reference Kit',
    targetClasses: [8, 9, 10, 11, 12],
    subjects: ['Chemistry'],
    contents: [
      'Periodic Table (Laminated)',
      'Test Tube Set (12 pieces)',
      'Litmus Paper Strips',
      'Chemical Formula Cards',
      'Safety Goggles',
      'Lab Manual & Instructions'
    ],
    price: 550,
    category: 'stem',
    ageGroup: 'secondary',
    isActive: true
  },
  {
    id: 'imagoclay_005',
    kitName: 'ImagoClay',
    description: 'Arts & Crafts Creative Kit',
    targetClasses: [1, 2, 3, 4, 5, 6],
    subjects: ['Arts', 'Crafts'],
    contents: [
      'Colored Clay Set',
      'Drawing Papers',
      'Crayons & Markers',
      'Craft Scissors',
      'Glue Sticks',
      'Creative Project Ideas'
    ],
    price: 380,
    category: 'arts',
    ageGroup: 'primary',
    isActive: true
  },
  {
    id: 'kidsplay_006',
    kitName: 'KidsPlay',
    description: 'Primary Learning Fun Kit',
    targetClasses: [1, 2, 3, 4, 5],
    subjects: ['General Learning'],
    contents: [
      'Alphabet & Number Charts',
      'Educational Games',
      'Coloring Books',
      'Story Books',
      'Learning Toys',
      'Activity Worksheets'
    ],
    price: 320,
    category: 'primary',
    ageGroup: 'primary',
    isActive: true
  }
];
