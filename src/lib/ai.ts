import type { AIAnalysis, Priority } from './types';

interface KeywordRule {
  keywords: string[];
  category: string;
  department: string;
  priority: Priority;
  confidence: number;
}

const RULES: KeywordRule[] = [
  {
    keywords: ['garbage', 'waste', 'trash', 'dustbin', 'rubbish', 'litter', 'bin', 'sweeper'],
    category: 'Waste Management',
    department: 'Solid Waste Management',
    priority: 'High',
    confidence: 94,
  },
  {
    keywords: ['pothole', 'road', 'broken road', 'crack', 'asphalt', 'pavement', 'footpath'],
    category: 'Road Damage',
    department: 'Public Works Department',
    priority: 'High',
    confidence: 91,
  },
  {
    keywords: ['street light', 'light not working', 'lamp', 'streetlight', 'dark', 'illumination'],
    category: 'Street Lighting',
    department: 'Electrical Department',
    priority: 'Medium',
    confidence: 93,
  },
  {
    keywords: ['water leakage', 'water pipe', 'water supply', 'tap', 'drainage', 'sewage', 'overflow', 'leak'],
    category: 'Water Supply',
    department: 'Water Supply Department',
    priority: 'High',
    confidence: 95,
  },
  {
    keywords: ['sewage', 'drain', 'gutter', 'sanitation', 'toilet', 'unclean', 'foul', 'smell'],
    category: 'Sanitation',
    department: 'Sanitation Department',
    priority: 'High',
    confidence: 90,
  },
  {
    keywords: ['tree', 'branch', 'fallen', 'garden', 'park', 'uprooted'],
    category: 'Tree & Garden',
    department: 'Garden Department',
    priority: 'Medium',
    confidence: 88,
  },
  {
    keywords: ['encroachment', 'illegal', 'hawker', 'vendor', 'occupation'],
    category: 'Encroachment',
    department: 'Encroachment Department',
    priority: 'Medium',
    confidence: 86,
  },
  {
    keywords: ['dog', 'animal', 'stray', 'monkey', 'snake'],
    category: 'Animal Nuisance',
    department: 'Animal Control',
    priority: 'Low',
    confidence: 82,
  },
];

const DEFAULT_ANALYSIS: AIAnalysis = {
  category: 'General Civic Issue',
  department: 'General Administration',
  priority: 'Medium',
  confidence: 72,
};

export function analyzeComplaint(text: string): AIAnalysis {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      const jitter = Math.floor(Math.random() * 4) - 2;
      return {
        category: rule.category,
        department: rule.department,
        priority: rule.priority,
        confidence: Math.max(80, Math.min(99, rule.confidence + jitter)),
      };
    }
  }
  return { ...DEFAULT_ANALYSIS };
}

export const CATEGORY_LIST = [
  'Waste Management',
  'Road Damage',
  'Street Lighting',
  'Water Supply',
  'Sanitation',
  'Tree & Garden',
  'Encroachment',
  'Animal Nuisance',
  'General Civic Issue',
];
